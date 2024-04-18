import React from "react";
import { useState } from "react";
import axios from "axios";
import ThemeSelector from "./ThemeSelector";
function LandingPage({ theme, handleThemeChange }) {
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
    <div className='bg-neutral bg-cover hue-rotate-270 h-[96vh] flex items-center justify-center overflow-x-clip'>
      <div className='flex items-center'>
        <div className='px-10 py-8 flex flex-col justify-center bg-base-200  bg-opacity-100 rounded-box border-solid border-neutral-content'>
          <div className='flex justify-end'>
            <ThemeSelector theme={theme} setTheme={handleThemeChange} />
          </div>
          <h1 className='text-primary text-6xl font-bold text-center pb-4'>
            Anonify
          </h1>

          <span className='text-primary'>Enter playlist name:</span>
          <input
            type='text'
            name='playlistName'
            value={formInfo.playlistName}
            onChange={(e) => handleFormChange(e)}
            className='input input-bordered input-neutral-content p-2 text-center mx-auto w-96 my-1'
            placeholder='Enter playlist name'
          />

          {/*
            <span className='text-primary'>
              Song limit (0 = None):
            </span> <input
            type='number'
            name='songLimit'
            value={formInfo.songLimit || 0}
            onChange={(e) => handleFormChange(e)}
            className='input input-bordered input-neutral-content p-2 text-center mx-auto w-96 my-1'
            placeholder='Enter song limit, 0 = None'
            />*/}
          <button
            onClick={() => {
              generateURL();
            }}
            className='mt-4 btn btn-primary text-xl py-2 px-3 my-1 duration-500 ease-in-out w-full'
          >
            Generate URL
          </button>
          <br />
          <input
            value={generatedURL}
            className='input input-bordered input-primary p-2 text-center mx-auto w-96 my-1 font-sans'
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
