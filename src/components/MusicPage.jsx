import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import MusicList from "./MusicList";
import { useCookies } from "react-cookie";
function MusicPage({ playlistInfo }) {
  const [addSongField, setAddSongField] = useState();
  // [addedThisSession, setAddedThisSession] = useState([]);
  const [cookies, setCookie, removeCookie] = useCookies(["songsAddedByUser"]);
  const qc = useQueryClient();
  const getToken = async () => {
    let token = await axios.get("/auth");
    return token.data;
  };
  const getStoredSongs = async () => {
    let songArray = playlistInfo.tracks.map((song) => song.track_id);
    console.log(songArray);
    let songString = songArray.join(",");
    let token = await axios.get("/auth");
    token = token.data;
    let songs = await axios.get(
      "https://api.spotify.com/v1/tracks?market=US&ids=" + songString,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    songs.data.tracks = songs.data.tracks.map((song, index) => {
      return {
        ...song,
        anonify_index: playlistInfo.tracks[index].id,
      };
    });
    return songs.data;
  };

  const bearerToken = useQuery({
    queryKey: ["auth"],
    queryFn: getToken,
    enabled: !!playlistInfo,
  });
  const playlists = useQuery({
    queryKey: ["play", playlistInfo],
    queryFn: getStoredSongs,
    enabled: !!playlistInfo && playlistInfo.tracks.length > 0,
  });

  const addToPlaylist = async () => {
    let post = await axios.put(`${playlistInfo.path}`, {
      trackId: addSongField,
    });
    return post.data;
  };
  const deleteSong = async (trackId, aa, test) => {
    let patch = await axios.patch(`${playlistInfo.path}/${trackId}/${aa}`);
    return patch.data;
  };
  const addSongToPlaylist = useMutation({
    mutationKey: ["addSong"],
    mutationFn: addToPlaylist,
    onSuccess: (data) => {
      console.log(data);
      qc.invalidateQueries("path");
      qc.invalidateQueries("play");
      let nextSongs = cookies.songsAddedByUser || [];
      nextSongs = [...nextSongs, `${addSongField}`];
      setCookie("songsAddedByUser", nextSongs, { path: "/" });
    },
  });
  const deleteSongFromPlaylist = useMutation({
    mutationKey: ["delete"],
    mutationFn: ({ id, anonify_index }) => {
      deleteSong(id, anonify_index);
    },
    onSuccess: (data) => {
      console.log(data);
      qc.invalidateQueries("path");
      qc.invalidateQueries("play");
      let nextSongs = cookies.songsAddedByUser || [];
      nextSongs = nextSongs.filter((song) => song !== data);
      setCookie("songsAddedByUser", nextSongs, { path: "/" });
    },
  });
  const handleDelete = (id, anonify_index) => {
    let aa = anonify_index;
    deleteSongFromPlaylist.mutate({ id, anonify_index });
  };
  return playlistInfo ? (
    <>
      <div className='flex flex-wrap justify-around'>
        <h1 className='text-6xl font-bold text-center'>
          <a href='/'>Anonify</a>
        </h1>
        <div className='bg-black overflow-auto flex-grow h-screen max-w-[85vh]'>
          {playlists.isSuccess && playlistInfo.tracks.length > 0 && (
            <>
              <h2 className='text-white text-3xl font-bold text-center'>
                {playlistInfo.playlistName}
              </h2>
              <MusicList
                songs={playlists.data.tracks}
                songsAddedByUser={cookies?.songsAddedByUser}
                handleDelete={handleDelete}
              />
            </>
          )}
          {/*Source for loading icon: https://tailwindflex.com/tag/loading*/}
          {!playlistInfo.tracks ||
            (playlistInfo.tracks.length === 0 && (
              <div className='w-full h-screen flex flex-grow justify-center items-center flex-col'>
                <div>
                  <h2 className='text-white text-2xl font-bold text-center m-5'>
                    Waiting for you to add music to:
                    <br />
                    {playlistInfo.playlistName}
                  </h2>
                </div>
                <br />
                <div className='flex space-x-2 justify-center items-center bg-white h-screen dark:invert'>
                  <span className='sr-only'>Loading...</span>
                  <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                  <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                  <div className='h-8 w-8 bg-black rounded-full animate-bounce'></div>
                </div>
              </div>
            ))}
          {playlists.isError ? (
            <div className='w-full h-screen flex flex-grow justify-center items-center'>
              Playlist error...
            </div>
          ) : null}
          {playlists.isLoading ? (
            <div className='flex space-x-2 justify-center items-center bg-white h-screen dark:invert'>
              <span className='sr-only'>Loading...</span>
              <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
              <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
              <div className='h-8 w-8 bg-black rounded-full animate-bounce'></div>
            </div>
          ) : null}
        </div>
        <div className='flex-grow-2 min-w-fit justify-center'>
          <div className='m-10'>
            <label className='font-bold' htmlFor='songURI'>
              Enter Track ID or Spotify URL:
              <br />
              <input
                className='border border-gray-400 p-2 rounded-lg text-center w-80 mx-auto w-full'
                name='songURI'
                value={addSongField}
                onChange={(e) => {
                  console.log(e.target.value);
                  setAddSongField(e.target.value);
                }}
              />
              {addSongToPlaylist.isLoading && (
                <div className='w-full flex justify-center'>Adding...</div>
              )}
              <br />
              <div className='flex justify-end'>
                <button
                  className='bg-black text-white rounded-lg py-1 px-3 mr-1 mt-1 border-black border-2 hover:bg-white hover:text-black transition duration-500 ease-in-out'
                  onClick={() => {
                    const spotifyUrlRegex = /\/track\/([a-zA-Z0-9]{22})/;
                    const spotifyUrlMatch = addSongField.match(spotifyUrlRegex);
                    if (spotifyUrlMatch) {
                      setAddSongField(spotifyUrlMatch[1]);
                    } else {
                      console.log("Not a valid Spotify URL");
                    }
                    addSongToPlaylist.mutate();
                    //setAddSongField("");
                  }}
                >
                  Add to list
                </button>

                <button
                  className='bg-black text-white rounded-lg py-1 px-3 ml-1 mt-1 border-black border-2 hover:bg-white hover:text-black transition duration-500 ease-in-out'
                  onClick={() => {
                    console.log(window.location.origin);
                    console.log(window.location.href);
                    window.open(
                      `https://accounts.spotify.com/authorize?client_id=df9fb6c9d7794a2f8da08629c16768cd&response_type=code&redirect_uri=${window.location.origin}/callback&scope=playlist-modify-public&state=${window.location.href}`
                    );
                  }}
                >
                  Auth Spotify + Create Playlist
                </button>

                <button
                  className='bg-black text-white rounded-lg py-1 px-3 ml-1 mt-1 border-black border-2 hover:bg-white hover:text-black transition duration-500 ease-in-out'
                  onClick={() => {
                    console.log(playlistInfo);
                    console.log(playlists.data);
                  }}
                >
                  Debug
                </button>
              </div>
            </label>
          </div>
          {/*
            <button
              className="bg-black text-white rounded-lg p-2"
              onClick={() => {
                console.log(cookies.songsAddedByUser);
                console.log(playlistInfo);
                //setAddSongField("");
              }}
            >
              Show cookies.
            </button>
            */}
          {addSongToPlaylist.isError && (
            <div className='bg-red-500 text-white text-bold p-4 rounded-lg w-80 mx-auto'>
              <h2>Error...</h2>
              <h4>{addSongToPlaylist.error.response.data}</h4>
            </div>
          )}
          {addSongToPlaylist.isSuccess && (
            <div className='bg-emerald-700 text-white text-bold rounded-lg p-3 flex justify-center w-32 mx-auto'>
              Added song!
            </div>
          )}
        </div>
      </div>
    </>
  ) : (
    <div>404</div>
  );
}
export default MusicPage;
