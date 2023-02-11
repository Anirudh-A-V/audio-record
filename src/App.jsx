import React, { useState, useRef } from "react";
import "./App.css";

const App = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();

    const chunks = [];
    mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
      chunks.push(event.data);
    });

    mediaRecorderRef.current.addEventListener("stop", () => {
      setAudioBlob(new Blob(chunks));
    });

    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);

  };

  const recordedAudio = localStorage.getItem("recordedAudio");

  return (
    <main className="container">
      <h1>React Media Recorder</h1>
      <div className="record-audio">
        {recording ? (
          <button className="record-stop" onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button className="record-start" onClick={startRecording}>Start Recording</button>
        )}
        {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} />}
      </div>
    </main>
  );
};

export default App;


{/* <div>
      {recording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}
      {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} />}
    </div> */}