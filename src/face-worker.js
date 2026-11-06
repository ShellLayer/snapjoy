import { FaceDetector, FilesetResolver } from './vendor/mediapipe/vision_bundle.mjs';
let detector;
self.onmessage = async (event) => {
  const message=event.data;
  if(message.type==='init'){
    try{
      const base=new URL('./vendor/mediapipe/',self.location.href).href;
      const files=await FilesetResolver.forVisionTasks(base+'wasm',true);
      detector=await FaceDetector.createFromOptions(files,{
        baseOptions:{modelAssetPath:base+'models/blaze_face_short_range.tflite',delegate:'CPU'},
        runningMode:'VIDEO',minDetectionConfidence:.55,minSuppressionThreshold:.3,
        canvas:new OffscreenCanvas(320,240)
      });
      self.postMessage({type:'ready'});
    }catch(error){self.postMessage({type:'error',message:String(error.message||error)});}
  }
  if(message.type==='frame'){
    const {bitmap,timestamp,generation}=message;
    try{
      const result=detector.detectForVideo(bitmap,timestamp);
      self.postMessage({type:'result',detections:result.detections,width:bitmap.width,height:bitmap.height,generation});
    }catch(error){self.postMessage({type:'error',message:String(error.message||error)});}
    finally{bitmap.close();}
  }
};
