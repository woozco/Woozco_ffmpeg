const mediasoup = require('mediasoup');
const { RtpObserver } = require('mediasoup/lib/RtpObserver');
const ffmpeg = require('fluent-ffmpeg');

async function run() {
  const worker = await mediasoup.createWorker({
    logLevel: 'debug',
  });

  await worker.start();

  const router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000,
        },
      },
    ],
  });

  const transport = await router.createWebRtcTransport({
    listenIps: [{ ip: '127.0.0.1', announcedIp: null }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  });

  const { port, ip } = transport.tuple;

  console.log(`WebRtcTransport listening on ${ip}:${port}`);

  // Start RTP Observer
  const rtpObserver = await transport.observeRecvRtp({ mediaStream: transport.consume(0).producer });

  rtpObserver.on('rtp', (event) => {
    // Handle RTP packets here
    console.log('Received RTP packet:', event);

    // Simulate encoding with ffmpeg
    ffmpeg()
      .input('pipe:0')
      .inputFormat('rtp')
      .outputOptions('-c:v', 'libx264')
      .outputOptions('-preset', 'ultrafast')
      .outputOptions('-f', 'flv')
      .output('output.flv')
      .runInput(event.packet);
  });

  // Simulate a pause and resume in the stream
  setTimeout(() => {
    console.log('Pausing RTP Observer');
    rtpObserver.pause();
  }, 5000);

  setTimeout(() => {
    console.log('Resuming RTP Observer');
    rtpObserver.resume();
  }, 10000);

  // Simulate ending the session after some time
  setTimeout(() => {
    console.log('Ending session');
    worker.close();
  }, 15000);
}

run();
