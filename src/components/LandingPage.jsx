import React from "react";
import { useState } from "react";
import axios from "axios";

function LandingPage() {
  //const [songLimit, setSongLimit] = useState('');
  const [formInfo, setFormInfo] = useState({
    playlistName: "",
    songLimit: "0",
  });
  const [generatedURL, setGeneratedURL] = useState("");
  const handleFormChange = (e) => {
    let nextFormInfo = { ...formInfo, [e.target.name]: e.target.value };
    console.log(nextFormInfo);
    setFormInfo(nextFormInfo);
  };
  const generateURL = () => {
    //set generatedURL to window.location.href/ {random string of 10 characters}
    let randomString = Math.random().toString(36).substring(2, 12);
    let result = window.location.href + randomString;

    axios
      .post("/", {
        path: "/" + randomString,
        playlistName: formInfo.playlistName,
        songLimit: formInfo.songLimit,
        trackIds: [],
      })
      .then((response) => {
        setGeneratedURL(result);
        navigator.clipboard.writeText(result);
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className='bg-landingbg bg-cover hue-rotate-270'>
      <div className='flex items-center justify-center min-h-screen backdrop-blur-md'>
        <div className='px-10 py-8 flex flex-col justify-center bg-white  bg-opacity-50 rounded-xl border-solid border-white border-2'>
          <h1 className='text-black text-6xl font-bold text-center pb-4'>
            Anonify
          </h1>
          <span className='text-black'>Enter playlist name:</span>
          <input
            type='text'
            name='playlistName'
            value={formInfo.playlistName}
            onChange={(e) => handleFormChange(e)}
            className='border border-gray-400 p-2 rounded-lg text-center'
            placeholder='Enter playlist name'
          />
          <span className='text-black'>Song limit (0 = None):</span>
          <input
            type='number'
            name='songLimit'
            value={formInfo.songLimit || 0}
            onChange={(e) => handleFormChange(e)}
            className='border border-gray-400 p-2 rounded-lg text-center'
            placeholder='Enter song limit, 0 = None'
          />
          <button
            onClick={() => {
              generateURL();
            }}
            className='mt-4 bg-black text-white p-2 rounded-lg'
          >
            Generate URL
          </button>
          <br />
          <input
            disabled={true}
            value={generatedURL}
            className='border border-gray-400 p-2 bg-white bg-opacity-60 rounded-lg text-center'
            placeholder='URL here'
          />
          {generatedURL !== "" && (
            <h1 className='copiedText text-center'>Copied to clipboard!</h1>
          )}
        </div>
      </div>
    </div>
  );
}
export default LandingPage;
