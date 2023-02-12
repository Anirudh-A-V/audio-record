import React, { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from "firebase/firestore";

import "./App.css";
import { storage, db } from './firebase/config';

const App = () => {
  const [recording, setRecording] = useState(false);
  const [pause, setPause] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);

  const storageRef = ref(storage, 'recordings/' + Date.now() + '.wav');

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

  const pauseRecording = () => {
    mediaRecorderRef.current.pause();
    setPause(true);
  };

  const resumeRecording = () => {
    mediaRecorderRef.current.resume();
    setPause(false);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);

  };

  const uploadAudio = () => {
    const uploadAudio = uploadBytesResumable(storageRef, audioBlob);

    uploadAudio.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case 'paused':
          console.log('Upload is paused');
          break;
        case 'running':
          console.log('Upload is running');
          break;
      }
    }, (error) => {
      console.log(error);
    }, () => {
      getDownloadURL(uploadAudio.snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);
        const data = {
          url: URL,
          createdAt: timestamp
        }
        addDoc(collection(db, "recordings"), data)
          .then(docRef => {
            console.log("Document has been added successfully");
          })
          .catch(error => {
            console.log(error);
          })
      });
    });
  };

  return (
    <main className="container">
      <h1>React Media Recorder</h1>
      <div className="record-audio">
        {pause && <button className="record-resume" onClick={resumeRecording}>Resume Recording</button>}
        {recording && !pause && <button className="record-pause" onClick={pauseRecording}>Pause Recording</button>}
        {recording ? (
          <>
            <button className="record-stop" onClick={stopRecording}>Stop Recording</button>
          </>
        ) : (
          <button className="record-start" onClick={startRecording}>Start Recording</button>
        )}
        {audioBlob && !recording && <button className="record-upload" onClick={uploadAudio}>Upload Audio</button>}
        {audioBlob && !recording && <audio controls src={URL.createObjectURL(audioBlob)} />}
      </div>
    </main>
  );
};

export default App;
