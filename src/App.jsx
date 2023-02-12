import React, { useState, useRef, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { addDoc, collection, doc, deleteDoc } from "firebase/firestore";
import { FaTrash } from 'react-icons/fa';

import "./App.css";
import { storage, db, timestamp } from './firebase/config';
import useFirestore from "./hooks/useFirestore";

const App = () => {
  const [recording, setRecording] = useState(false);
  const [pause, setPause] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [uploaded, setUploaded] = useState(false);

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
    setUploaded(false);
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

    const filename = uploadAudio.snapshot.ref.name;

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
        // console.log('File available at', downloadURL);
        const data = {
          url: downloadURL,
          createdAt: timestamp,
          name: filename
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
    setUploaded(true);
  };

  const { docs } = useFirestore('recordings');

  useEffect(() => {
    setRecordings(docs.map(doc => ({ ...doc, id: doc.id })));
  }, [docs]);

  const deleteRecording = (id) => {
    deleteDoc(doc(db, "recordings", id))
      .then(() => {
        console.log("Document successfully deleted!");
      }).catch((error) => {
        console.error("Error removing document: ", error);
      });

    const deleteRec = recordings.find(rec => rec.id === id);
    // console.log(deleteRec.name)
    const deleteRef = ref(storage, 'recordings/' + deleteRec.name);
    deleteObject(deleteRef)
  };

  return (
    <>
      <main className="container">
        <h1>React Media Recorder</h1>
        <div className="record-audio">
          {recording && pause && <button className="record-resume" onClick={resumeRecording}>Resume Recording</button>}
          {recording && !pause && <button className="record-pause" onClick={pauseRecording}>Pause Recording</button>}
          {recording ? (
            <>
              <button className="record-stop" onClick={stopRecording}>Stop Recording</button>
            </>
          ) : (
            <button className="record-start" onClick={startRecording}>Start Recording</button>
          )}
          {audioBlob && !recording && !uploaded && <button className="record-upload" onClick={uploadAudio}>Upload Audio</button>}
          {audioBlob && !recording && !uploaded && <audio controls src={URL.createObjectURL(audioBlob)} />}
        </div>
      </main>
      {recordings.length > 0 &&
        <div className="recorded-audios">
          <h2>Recorded Audios</h2>
          <div className="recorded-audios-list">
            {recordings.map(recording => (
              <div className="recorded-audio" key={recording.id}>
                <audio controls src={recording.url} />
                <FaTrash className="record-delete" onClick={() => deleteRecording(recording.id)}/>
              </div>
            ))}
          </div>
        </div>
      }
    </>
  );
};

export default App;
