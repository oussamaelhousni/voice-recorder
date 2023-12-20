document.addEventListener("DOMContentLoaded", () => {
  let mediaRecorder;
  let audioChunks = [];
  let audioBlob;
  const list = document.getElementById("list");
  const startRecordingButton = document.getElementById("startRecording");
  const stopRecordingButton = document.getElementById("stopRecording");
  const save = document.getElementById("save");
  const audioPlayer = document.getElementById("audioPlayer");

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = audioUrl;
        audioPlayer.controls = true;
      };
    })
    .catch((error) => {
      console.error("Error accessing microphone:", error);
    });

  startRecordingButton.addEventListener("click", () => {
    audioChunks = [];
    startRecordingButton.innerHTML = "Recording...";
    mediaRecorder.start();
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
  });

  stopRecordingButton.addEventListener("click", () => {
    startRecordingButton.innerHTML = "Record";
    mediaRecorder.stop();
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;
  });

  save.addEventListener("click", () => {
    if (audioChunks.length === 0) return;
    const formData = new FormData();
    formData.append("audio", audioBlob);
    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        const audioUint8Array = new Uint8Array(data.audio.audio.data);
        const blob = new Blob([audioUint8Array], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(blob);
        const li = document.createElement("li");
        const audioEl = document.createElement("audio");
        console.log("audio Url", audioUrl);
        audioEl.src = audioUrl;
        audioEl.controls = true;
        li.appendChild(audioEl);
        list.appendChild(li);
      });
  });
});

fetch("/audios")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    list.innerHTML = "";
    data.audios.forEach((audio) => {
      const audioUint8Array = new Uint8Array(audio.audio.data);
      const blob = new Blob([audioUint8Array], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(blob);
      const li = document.createElement("li");
      const audioEl = document.createElement("audio");
      console.log("audio Url", audioUrl);
      audioEl.src = audioUrl;
      audioEl.controls = true;
      li.appendChild(audioEl);
      list.appendChild(li);
    });
  });
