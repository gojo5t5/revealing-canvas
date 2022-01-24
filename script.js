const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
ctx.fillStyle = '#000000'
ctx.fillRect(0,0,canvas.width, canvas.height)
ctx.globalCompositeOperation = 'destination-out'
let mediaRecorder;
window.onload = init;

function init() {
    const apikey = prompt("Enter DeepGram Api Key")

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    console.log({ stream });
    if (!MediaRecorder.isTypeSupported("audio/webm"))
      return alert("Browser not supported");
    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      const socket = new WebSocket("wss://api.deepgram.com/v1/listen", [
        "token",
        apikey,
      ]);

      socket.onopen = () => {
        console.log({ event: "onopen" });
        mediaRecorder.addEventListener("dataavailable", async (event) => {
          if (event.data.size > 0 && socket.readyState == 1) {
            socket.send(event.data);
          }
        });
        mediaRecorder.start(100);
      };

      socket.onmessage = (message) => {
        console.log({ event: "onmessage", message });
        const received = JSON.parse(message.data);
        const transcript = received.channel.alternatives[0].transcript;
        if (transcript && received.is_final) {
          let transcript_split = transcript.split(" ")
          display(transcript_split);
        }
      };

      socket.onclose = () => {
        console.log({ event: "onclose" });
      };

      socket.onerror = (error) => {
        console.log({ event: "onerror", error });
      };
  });
}

function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}
async function display(transcript_split) {
    for (let word of transcript_split) {
        ctx.font = Math.floor((Math.random() * 20) + 20)+'px sans-serif'
        ctx.fontweight = 'bold'
        ctx.fillText(
          word,
          Math.random() * canvas.clientWidth,
          Math.random() * canvas.clientHeight
        );
        await sleep(500);
      }
}
