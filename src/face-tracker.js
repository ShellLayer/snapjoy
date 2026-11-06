// All inputs and model files stay on this machine. This locates facial features;
// it never creates identities or stores biometric templates.
export function estimateFace(detections,width,height,previous=null) {
  const candidates=detections.filter(d=>d.boundingBox&&d.keypoints?.length>=4);
  if(!candidates.length)return null;
  candidates.sort((a,b)=>b.boundingBox.width*b.boundingBox.height-a.boundingBox.width*a.boundingBox.height);
  let detection=candidates[0];
  if(previous){
    const px=previous.x+previous.width/2,py=previous.y+previous.height/2;
    const nearest=candidates.map(d=>({d,distance:Math.hypot((d.boundingBox.originX+d.boundingBox.width/2)/width-px,(d.boundingBox.originY+d.boundingBox.height/2)/height-py)})).sort((a,b)=>a.distance-b.distance)[0];
    if(nearest.distance<.25)detection=nearest.d;
  }
  const b=detection.boundingBox,k=detection.keypoints;
  const eyes=[k[0],k[1]].sort((a,b)=>a.x-b.x),dx=eyes[1].x-eyes[0].x,dy=(eyes[1].y-eyes[0].y)*height/width;
  return {
    x:b.originX/width,y:b.originY/height,width:b.width/width,height:b.height/height,
    eyes:{x:(eyes[0].x+eyes[1].x)/2,y:(eyes[0].y+eyes[1].y)/2},
    nose:{x:k[2].x,y:k[2].y},mouth:{x:k[3].x,y:k[3].y},
    eyeDistance:Math.hypot(dx,dy),rotation:Math.atan2(dy,dx)
  };
}
function smooth(oldFace,face) {
  if(!oldFace||Math.abs(oldFace.x-face.x)>.2)return face;
  const lerp=(a,b)=>a+(b-a)*.45;
  const result={...face};
  for(const key of ['x','y','width','height','eyeDistance','rotation'])result[key]=lerp(oldFace[key],face[key]);
  for(const key of ['eyes','nose','mouth'])result[key]={x:lerp(oldFace[key].x,face[key].x),y:lerp(oldFace[key].y,face[key].y)};
  return result;
}
export class FaceTracker {
  constructor(onFace,onStatus=()=>{}){
    this.onFace=onFace;this.onStatus=onStatus;this.status='idle';this.worker=null;this.busy=false;
    this.face=null;this.lastFound=0;this.lastSent=0;this.lastVideo=-1;this.generation=0;
    this.lastError='';
    this.canvas=document.createElement('canvas');this.canvas.width=320;this.canvas.height=240;
    this.context=this.canvas.getContext('2d',{alpha:false});
  }
  setStatus(status){if(this.status!==status){this.status=status;this.onStatus(status);}}
  ensure(){
    if(this.status!=='idle')return;
    this.lastError='';
    this.setStatus('loading');
    try{
      this.worker=new Worker(new URL('./face-worker.js',import.meta.url),{type:'module'});
      this.worker.onmessage=({data})=>{
        if(data.type==='ready'){clearTimeout(this.initTimeout);this.setStatus('ready');}
        if(data.type==='error'){clearTimeout(this.initTimeout);this.lastError=data.message||'本地人脸定位未能启动';this.busy=false;this.face=null;this.onFace(null);this.setStatus('error');this.worker.terminate();}
        if(data.type==='result'){
          this.busy=false;
          if(data.generation!==this.generation)return;
          const face=estimateFace(data.detections,data.width,data.height,this.face);
          if(face){this.face=smooth(this.face,face);this.lastFound=performance.now();}
          else if(performance.now()-this.lastFound>500)this.face=null;
          this.onFace(this.face);
        }
      };
      this.worker.onerror=(event)=>{clearTimeout(this.initTimeout);this.lastError=event.message||'本地人脸定位线程未能启动';this.busy=false;this.face=null;this.onFace(null);this.setStatus('error');this.worker?.terminate();};
      this.initTimeout=setTimeout(()=>{if(this.status==='loading'){this.lastError='首次准备人脸跟随超时，可关闭摄像头后重试。';this.worker.terminate();this.setStatus('error');}},60000);
      this.worker.postMessage({type:'init'});
    }catch(error){this.lastError=String(error.message||error);this.setStatus('error');}
  }
  async step(video,mirror,now){
    this.ensure();
    if(this.status!=='ready'||this.busy||now-this.lastSent<140||video.readyState<2||video.currentTime===this.lastVideo)return;
    this.busy=true;this.lastSent=now;this.lastVideo=video.currentTime;
    const generation=this.generation,c=this.context,w=video.videoWidth,h=video.videoHeight;
    const cw=Math.min(w,h*4/3),ch=cw*3/4;
    c.save();if(mirror){c.translate(320,0);c.scale(-1,1);}
    c.drawImage(video,(w-cw)/2,(h-ch)/2,cw,ch,0,0,320,240);c.restore();
    try{
      const bitmap=await createImageBitmap(this.canvas);
      if(generation!==this.generation||this.status!=='ready'){bitmap.close();this.busy=false;return;}
      this.worker.postMessage({type:'frame',bitmap,timestamp:now,generation},[bitmap]);
    }catch{this.busy=false;this.setStatus('error');}
  }
  reset(){this.generation++;this.face=null;this.lastVideo=-1;this.onFace(null);if(this.status==='error'){clearTimeout(this.initTimeout);this.worker?.terminate();this.worker=null;this.busy=false;this.setStatus('idle');}}
  close(){clearTimeout(this.initTimeout);this.worker?.terminate();}
}
