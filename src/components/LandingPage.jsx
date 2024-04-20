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
    <div className="hue-rotate-270 flex h-[100vh] items-center justify-center overflow-x-clip bg-neutral bg-cover">
      <div className="flex items-center">
        <div className="flex flex-col justify-center rounded-box border-solid border-neutral-content  bg-base-200 bg-opacity-100 px-12 pb-12">
          <div className="flex">
            <ThemeSelector theme={theme} setTheme={handleThemeChange} />
          </div>
          <h1 className="mb-0 mt-0 text-center text-[88px] font-bold text-primary">
            Anonify
          </h1>
          <input
            type="text"
            name="playlistName"
            value={formInfo.playlistName}
            onChange={(e) => handleFormChange(e)}
            className="flex-grow-3 input input-bordered input-primary mx-auto my-1 w-full py-2 text-left"
            placeholder="Enter playlist name"
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

          <div className="radius-button join ">
            <input
              value={generatedURL}
              className="flex-grow-3 input join-item input-bordered input-primary mx-auto my-10 w-full py-2 text-left"
              placeholder="URL will appear here..."
            />
            <button
              enabled={!copyClicked}
              onClick={() => {
                setCopyClicked(true);
                navigator.clipboard.writeText(generatedURL);
              }}
              onMouseLeave={() => {
                setCopyClicked(false);
              }}
              className="btn btn-primary join-item my-10 rounded-btn px-3 py-2 text-xl duration-500 ease-in-out"
            >
              <label className="swap swap-active swap-rotate">
                <div className={copyClicked ? "swap-off" : "swap-on"}>
                  <FaCopy className="mx-1" />
                </div>
                <div className={copyClicked ? "swap-on" : "swap-off"}>
                  <FaCheckCircle className="mx-1" />
                </div>
              </label>
            </button>
          </div>
          <div className="my-0">
            <button
              disabled={generatingURL}
              onClick={() => {
                setGeneratingURL(true);
                generateURL();
              }}
              className="btn btn-primary mb-0 mt-0 w-full px-3 py-2 text-xl duration-500 ease-in-out"
            >
              {generatingURL && <span class="loading loading-spinner"></span>}
              <span>Generate URL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LandingPage;
