import React, { useState,useEffect } from 'react';
import './App.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function App() {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [inputText, setInputText] = useState("");

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const toggle=()=>{
    if(listening){
      SpeechRecognition.stopListening();
    }
    else{
      SpeechRecognition.startListening();
    }
  }

  const handleInputChange=(e)=>{
    setInputText(e.target.value);
  }

 const handleSubmit=(e)=>{
  e.preventDefault();

 }

  return (
    <div className="App" style={{
      marginTop: "5vh"
    }}>
      <div><h1>Welcome to your personalised Chat App</h1></div>
      <div className='input-div'>
        <button 
          onClick={toggle}
          
          style={{
            padding: "1vh 2vh",
            fontSize: "3vh",
            cursor: "pointer",
            marginBottom: "2vh"
          }}
        >
          🎙️ {listening ? "Listening (Double-click to stop)" : "Start Listening"}
        </button>
        <input
          type="text"
          value={transcript || inputText} // Bind input value to transcript
          onChange={handleInputChange}
          placeholder="Write here to search"
          style={{
            height: "10vh",
            width: "50vw",
            borderRadius: "5vh",
            marginTop: "10vh",
            fontSize: "4vh",
            
          }}
          
        />
      </div>
      <button type='submit' onSubmit={handleSubmit}>Submit </button>
       
      
    </div>
  );
}

export default App;


 {/* <p>Microphone: {listening ? 'on' : 'off'}</p>
        <button onClick={resetTranscript}>Reset</button>
        <p>{transcript}</p> */}
