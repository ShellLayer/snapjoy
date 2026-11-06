# Bundled on-device face detector

Runtime: @mediapipe/tasks-vision 1.2.2, from the npm registry, pinned by package-lock.json.
Upstream: https://github.com/google-ai-edge/mediapipe
Runtime license: Apache-2.0, see LICENSE.txt (the upstream license includes additional third-party notices).
The runtime and all WASM files are copied verbatim from the pinned npm package.

Model: Google MediaPipe BlazeFace short-range, float16, version 1.
Model SHA-256: B4578F35940BF5A1A655214A1CCE5CAB13EBA73C1297CD78E1A04C2380B0152F
Downloaded from the model linked by the official Face Detector documentation:
https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite
Model documentation: https://developers.google.com/edge/mediapipe/solutions/vision/face_detector
Model card: https://storage.googleapis.com/mediapipe-assets/MediaPipe%20BlazeFace%20Model%20Card%20%28Short%20Range%29.pdf

The app loads these files from its local lumi://app/ origin. There is no CDN fallback or remote model request. Detection runs in a local worker only while the camera is on and a sticker is set to follow the face. Output consists of a bounding box and facial keypoints, used transiently to position stickers; no identity or face template is stored.

The test-only portrait at tests/fixtures/portrait.jpg comes from https://storage.googleapis.com/mediapipe-assets/portrait.jpg and is excluded from the distributed app.
