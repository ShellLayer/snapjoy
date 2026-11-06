const fs=require('node:fs/promises');
const path=require('node:path');
const {randomUUID}=require('node:crypto');

// Only IDs cross IPC; renderer-provided file paths are never accepted.
module.exports=function setupVideos({handle,serial,directory,readLibrary,writeLibrary,publicPhoto,nativeImage}){
  const sessions=new Map();
  const folder=path.join(directory,'.recordings');
  const get=id=>{if(typeof id!=='string'||!sessions.has(id))throw new Error('录像会话无效。');return sessions.get(id);};
  handle('videos:begin',payload=>serial(async()=>{
    if(sessions.size)throw new Error('请先保存上一段录像。');
    if(!payload||!['mp4','webm'].includes(payload.extension)||![payload.width,payload.height].every(n=>Number.isInteger(n)&&n>=2&&n<=1920))throw new Error('录像格式或尺寸无效。');
    await fs.mkdir(folder,{recursive:true});
    const id=randomUUID(),extension=payload.extension;
    const item={id,kind:'video',mode:'video',extension,createdAt:new Date().toISOString(),width:payload.width,height:payload.height,audio:payload.audio===true,
      effect:typeof payload.effect==='string'?payload.effect.slice(0,40):'原片',
      stickers:Array.isArray(payload.stickers)?payload.stickers.filter(s=>typeof s==='string').slice(0,20).map(s=>s.slice(0,40)):[],
      frame:typeof payload.frame==='string'?payload.frame.slice(0,40):''};
    const temp=path.join(folder,id+'.'+extension),target=path.join(directory,id+'.'+extension);
    await fs.writeFile(temp,Buffer.alloc(0),{flag:'wx'});
    await fs.writeFile(path.join(folder,id+'.json'),JSON.stringify(item),{flag:'wx'});
    sessions.set(id,{item,temp,target,bytes:0,moved:false});return id;
  }));
  handle('videos:append',(id,bytes)=>serial(async()=>{
    const s=get(id);
    if(!(bytes instanceof ArrayBuffer)||!bytes.byteLength||bytes.byteLength>32*1024*1024||s.moved)throw new Error('录像数据无效。');
    if(s.bytes+bytes.byteLength>1024*1024*1024)throw new Error('录像已达到文件大小上限。');
    // A failed append may have written a prefix (e.g. a full disk). Roll back to
    // the last committed offset before retrying to avoid duplicated MP4 headers.
    await fs.truncate(s.temp,s.bytes);
    await fs.appendFile(s.temp,Buffer.from(bytes));s.bytes+=bytes.byteLength;return true;
  }));
  handle('videos:finish',payload=>serial(async()=>{
    const s=get(payload?.id);
    if(!s.bytes)throw new Error('录像没有有效画面。');
    if(!Number.isFinite(payload.duration)||payload.duration<0||payload.duration>660)throw new Error('录像时长无效。');
    if(typeof payload.thumbnail!=='string'||payload.thumbnail.length>12*1024*1024||!payload.thumbnail.startsWith('data:image/jpeg;base64,'))throw new Error('录像封面无效。');
    const image=nativeImage.createFromDataURL(payload.thumbnail);
    if(image.isEmpty())throw new Error('录像封面无法读取。');
    const item={...s.item,duration:Math.round(payload.duration*1000)/1000,bytes:s.bytes};
    const items=await readLibrary();
    await fs.mkdir(path.join(directory,'.thumbnails'),{recursive:true});
    await fs.writeFile(path.join(directory,'.thumbnails',item.id+'.jpg'),image.resize({width:360}).toJPEG(85));
    if(!s.moved){await fs.rename(s.temp,s.target);s.moved=true;}
    await writeLibrary([item,...items.filter(p=>p.id!==item.id)]);
    sessions.delete(item.id);
    await fs.rm(path.join(folder,item.id+'.json'),{force:true}).catch(()=>{});
    return publicPhoto(item);
  }));
  handle('videos:abort',id=>serial(async()=>{
    const s=get(id);sessions.delete(id);
    if(!s.moved)await fs.rm(s.temp,{force:true});
    await fs.rm(path.join(folder,id+'.json'),{force:true});return true;
  }));
  // A Mac window can be closed while the app remains alive. Keep interrupted
  // files on disk, but never let an abandoned session block a new window.
  return () => sessions.clear();
};
