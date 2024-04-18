import React from "react";
import { useState } from "react";
import axios from "axios";
import ThemeSelector from "./ThemeSelector";
import { FaCopy, FaCheckCircle } from "react-icons/fa";

function LandingPage({ theme, handleThemeChange }) {
  //const [songLimit, setSongLimit] = useState('');
  const [generatingURL, setGeneratingURL] = useState(false);
  const [copyClicked, setCopyClicked] = useState(false);
  const [copyCompleted, setCopyCompleted] = useState(false);
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
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setGeneratingURL(false);
      });
  };
  const contextClass = {};

  return (
    <div className='bg-neutral bg-cover hue-rotate-270 h-[96vh] flex items-center justify-center overflow-x-clip'>
      <div className='flex items-center'>
        <div className='px-10 pt-6 pb-8 flex flex-col justify-center bg-base-200  bg-opacity-100 rounded-box border-solid border-neutral-content'>
          <div className='flex'>
            <ThemeSelector theme={theme} setTheme={handleThemeChange} />
          </div>
          <h1 className='text-primary text-6xl font-bold text-center pb-4'>
            Anonify
          </h1>
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
            disabled={generatingURL}
            onClick={() => {
              setGeneratingURL(true);
              generateURL();
            }}
            className='btn btn-primary text-xl py-2 px-3 my-1 duration-500 ease-in-out w-full'
          >
            {generatingURL && <span class='loading loading-spinner'></span>}
            <span>Generate URL</span>
          </button>
          <div className='join radius-button '>
            <input
              value={generatedURL}
              className='join-item input input-bordered input-primary flex-grow-3 p-2 text-center w-full mx-auto my-1'
              placeholder='URL here'
            />
            <button
              enabled={!copyClicked}
              onClick={() => {
                navigator.clipboard.writeText(generatedURL);
                setCopyClicked(true);
              }}
              onMouseLeave={() => {
                setCopyClicked(false);
              }}
              className='join-item btn btn-primary text-xl py-2 px-3 my-1 duration-500 ease-in-out rounded-btn'
            >
              <label className='swap swap-rotate'>
                <input type='checkbox' />
                <div className={copyClicked ? "swap-off" : "swap-on"}>
                  <FaCheckCircle />
                </div>
                <div className={copyClicked ? "swap-on" : "swap-off"}>
                  <FaCopy />
                </div>
              </label>
            </button>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
}
export default LandingPage;
