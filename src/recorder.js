// Encode the composited canvas, never the raw camera. Write one second at a time
// to the main process so a long recording does not accumulate in renderer RAM.
export class BoothRecorder {
  constructor(api, onState, onSaved, onError) {
    this.api=api; this.onState=onState; this.onSaved=onSaved; this.onError=onError;
    this.state='idle'; this.pending=null; this.canvas=document.createElement('canvas');
    this.context=this.canvas.getContext('2d',{alpha:false}); this.queuedBytes=0;
  }
  get busy(){return this.state!=='idle';}
  get elapsed(){if(!this.startedAt)return 0;return Math.max(0,((this.state==='saving'?this.stoppedAt:this.pausedAt||performance.now())-this.startedAt-this.pausedTotal)/1000)||0;}
  notify(state=this.state){this.state=state;this.onState();}
  paint(preview,scene){
    if(!['recording','paused'].includes(this.state))return;
    this.context.drawImage(preview,0,0,this.canvas.width,this.canvas.height);
    scene.draw(this.context,this.canvas.width,this.canvas.height,false);
  }
  async start({width,height,microphone,metadata,paint}){
    if(this.busy||this.pending)return;
    this.error=null;this.writeFailed=false;this.failedChunks=[];this.totalBytes=0;this.cancelled=false;this.startedAt=0;this.pausedAt=0;this.pausedTotal=0;
    this.notify('starting');this.chain=Promise.resolve();this.queuedBytes=0;
    try{
      if(microphone){
        if(!await this.api.requestMicrophoneAccess())throw new Error('麦克风权限未开启。请允许麦克风权限，或取消「录制声音」后再试。');
        this.audio=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
      }
      if(this.cancelled)throw new Error('摄像头已断开，未开始录像。');
      this.canvas.width=width;this.canvas.height=height;
      paint(this.context,width,height);
      this.stream=this.canvas.captureStream(30);
      this.audio?.getAudioTracks().forEach(t=>this.stream.addTrack(t));
      // MP4 when supported, with WebM as a portable fallback on older encoders.
      const formats=microphone?['video/mp4;codecs=avc1.420028,mp4a.40.2','video/webm;codecs=vp8,opus']:['video/mp4;codecs=avc1.420028','video/webm;codecs=vp8'];
      const mimeType=formats.find(type=>MediaRecorder.isTypeSupported(type));
      if(!mimeType)throw new Error('这台电脑暂不支持视频编码。');
      this.media=new MediaRecorder(this.stream,{mimeType,videoBitsPerSecond:6000000,audioBitsPerSecond:128000,videoKeyFrameIntervalDuration:1000});
      this.id=await this.api.beginVideo({...metadata,width,height,audio:!!microphone,extension:mimeType.includes('mp4')?'mp4':'webm'});
      if(this.cancelled)throw new Error('摄像头已断开，未开始录像。');
      this.media.ondataavailable=event=>{
        if(!event.data.size)return;
        this.queuedBytes+=event.data.size;
        this.chain=this.chain.then(async()=>{
          if(this.writeFailed){this.failedChunks.push(event.data);return;}
          try{await this.api.appendVideo(this.id,await event.data.arrayBuffer());this.totalBytes+=event.data.size;this.queuedBytes-=event.data.size;}
          catch(error){this.error=new Error('磁盘写入曾中断。');this.writeFailed=true;this.failedChunks.push(event.data);this.stop();}
        });
        if(this.queuedBytes>64*1024*1024){this.error=new Error('磁盘写入较慢，已结束录像以保护已录制的内容。');this.stop();}
      };
      this.media.onerror=event=>{this.error=event.error||new Error('视频编码中断');this.stop();};
      this.media.onstop=()=>this.finish();
      this.startedAt=performance.now();this.pausedTotal=0;this.pausedAt=0;
      this.media.start(1000);this.notify('recording');
      this.flush=setInterval(()=>{if(this.media?.state==='recording')this.media.requestData();},1000);
      this.audio?.getTracks().forEach(t=>t.addEventListener('ended',()=>this.stop(),{once:true}));
      this.clock=setInterval(()=>{this.onState(true);if(this.elapsed>=600)this.stop();},250);
    }catch(error){
      if(this.id)await this.api.abortVideo(this.id).catch(()=>{});
      this.id=null;this.cleanup();this.notify('idle');this.onError(error.name==='NotAllowedError'?new Error('麦克风权限未开启，请在帮助中的麦克风设置里允许访问，或取消录制声音。'):error.name==='NotFoundError'?new Error('没有找到麦克风，可取消录制声音后继续。'):error);
    }
  }
  pause(){
    if(this.state==='recording'){this.media.pause();this.pausedAt=performance.now();this.notify('paused');}
    else if(this.state==='paused'){this.pausedTotal+=performance.now()-this.pausedAt;this.pausedAt=0;this.media.resume();this.notify('recording');}
  }
  stop(){
    if(this.state==='starting'){this.cancelled=true;return;}
    if(!['recording','paused'].includes(this.state))return;
    this.duration=this.elapsed;this.stoppedAt=performance.now();this.notify('saving');clearInterval(this.clock);clearInterval(this.flush);
    if(this.media.state!=='inactive')this.media.stop();
  }
  async finish(){
    this.cleanup();await this.chain;
    if(!this.totalBytes&&!this.failedChunks.length){await this.api.abortVideo(this.id).catch(()=>{});this.id=null;this.notify('idle');this.onError(new Error('这段录像太短，没有生成视频画面，请再录一次。'));return;}
    const thumbnail=this.canvas.toDataURL('image/jpeg',.85);
    this.pending={id:this.id,duration:this.duration,thumbnail};
    this.id=null;
    await this.retry();
  }
  async retry(){
    if(!this.pending)return;
    this.notify('saving');
    try{
      while(this.failedChunks.length){const blob=this.failedChunks[0];await this.api.appendVideo(this.pending.id,await blob.arrayBuffer());this.failedChunks.shift();this.queuedBytes-=blob.size;}
      const result=await this.api.finishVideo(this.pending);
      this.pending=null;this.onSaved(result);
      if(this.error)this.onError(new Error('录像提前结束，已保存可用内容。'+this.error.message));
    }catch(error){this.onError(new Error('视频未能加入相册，暂存文件已保留，请重试保存。'),true);}
    finally{this.notify('idle');}
  }
  cleanup(){
    clearInterval(this.clock);clearInterval(this.flush);
    this.stream?.getTracks().forEach(t=>t.stop());this.audio?.getTracks().forEach(t=>t.stop());
    this.audio=null;this.stream=null;this.api.releaseMicrophone().catch(()=>{});
  }
}
