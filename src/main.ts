// import { bootstrapCameraKit } from "@snap/camera-kit";

// (async function main() {
//     const apiToken = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzAyMzgwNTkyLCJzdWIiOiJmYTNhYmJhMy00OGE3LTQ0ODctOWJjYi0yNmFlMTJjM2FkZjV-U1RBR0lOR34zODFkNDhkOC01ZDUxLTQ1ODUtOTUzMi0wNWJhNTM3NDlhOTEifQ.JvkHO7xLNwzOTLXTPZVxuA6i-SQRmgjWwpXKDnNcVfE";
//     const cameraKit = await bootstrapCameraKit({ apiToken });

//     const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;

//     const session = await cameraKit.createSession({liveRenderTarget});

//     const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: true
//     });

//     await session.setSource(mediaStream);

//     await session.play();

//     const lens = await cameraKit.lensRepository.loadLens('b23ada81-3e99-4e0c-bbd9-b4a7054aad26', '70c4c381-68a4-44ce-bfa2-1fe0e8236e6e');

//     await session.applyLens(lens);
// })();

import { bootstrapCameraKit, createMediaStreamSource } from '@snap/camera-kit';

const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
const videoContainer = document.getElementById(
  'video-container'
) as HTMLElement;
const videoTarget = document.getElementById('video') as HTMLVideoElement;
const startRecordingButton = document.getElementById(
  'start'
) as HTMLButtonElement;
const stopRecordingButton = document.getElementById(
  'stop'
) as HTMLButtonElement;
const downloadButton = document.getElementById('download') as HTMLButtonElement;

let mediaRecorder: MediaRecorder;
let downloadUrl: string;

async function init() {
  const cameraKit = await bootstrapCameraKit({
    apiToken: "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzAyMzgwNTkyLCJzdWIiOiJmYTNhYmJhMy00OGE3LTQ0ODctOWJjYi0yNmFlMTJjM2FkZjV-U1RBR0lOR34zODFkNDhkOC01ZDUxLTQ1ODUtOTUzMi0wNWJhNTM3NDlhOTEifQ.JvkHO7xLNwzOTLXTPZVxuA6i-SQRmgjWwpXKDnNcVfE",
  });

  const session = await cameraKit.createSession({ liveRenderTarget });

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  const source = createMediaStreamSource(mediaStream);

  await session.setSource(source);
  await session.play();

  const { lenses } = await cameraKit.lensRepository.loadLensGroups([
    '70c4c381-68a4-44ce-bfa2-1fe0e8236e6e',
  ]);

  session.applyLens(lenses[0]);

  bindRecorder();
}

function bindRecorder() {
  startRecordingButton.addEventListener('click', () => {
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
    downloadButton.disabled = true;
    videoContainer.style.display = 'none';

    const mediaStream = liveRenderTarget.captureStream(30);

    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (!event.data.size) {
        console.warn('No recorded data available');
        return;
      }

      const blob = new Blob([event.data]);

      downloadUrl = window.URL.createObjectURL(blob);
      downloadButton.disabled = false;

      videoTarget.src = downloadUrl;
      videoContainer.style.display = 'block';
    });

    mediaRecorder.start();
  });

  stopRecordingButton.addEventListener('click', () => {
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;

    mediaRecorder?.stop();

    const link = document.createElement('a');
    link.setAttribute('style', 'display: none');
    link.href = downloadUrl;
    link.download = 'camera-kit-web-recording.mp4';
    link.click();
    link.remove();
  });

//   downloadButton.addEventListener('click', () => {
//     const link = document.createElement('a');

//     link.setAttribute('style', 'display: none');
//     link.href = downloadUrl;
//     link.download = 'camera-kit-web-recording.mp4';
//     link.click();
//     link.remove();
//   });
}

init();