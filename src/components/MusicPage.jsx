import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import MusicList from "./MusicList";
import { useCookies } from "react-cookie";
import { createClient } from "@supabase/supabase-js";
let token;
const supabase = createClient(
  "https://mbrefcgxduvrtayfrchk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icmVmY2d4ZHV2cnRheWZyY2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMwMzQ2MDYsImV4cCI6MjAyODYxMDYwNn0.cK4-JJZQ-vNXg3ahWJwPzqu4c_aGCWpAn1ZRESu4R2I"
);

function MusicPage({ playlistInfo }) {
  const [addSongField, setAddSongField] = useState();
  const [cookies, setCookie, removeCookie] = useCookies(["songsAddedByUser"]);
  const [currentSort, setCurrentSort] = useState("votes");
  const [isAdding, setIsAdding] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const qc = useQueryClient();
  async function handleDBChange(payload) {
    console.log("DB change", payload);
    await qc.cancelQueries(["play"]);
    await qc.invalidateQueries(["play"]);
  }
  async function handleResponsiveDelete(payload) {
    //check if the song has already been optmisically deleted in the playlist
    //if it has, don't do anything.
    // else, remove the song from the playlist.

    console.log("payload", payload);
    qc.setQueryData(["play"], (oldData) => {
      const newTracks = oldData.tracks.filter((song) => {
        return song.anonify_index !== payload.old.id;
      });
      return { ...oldData, tracks: newTracks };
    });
  }

  async function insert(payload) {
    //check if the song has already been optmisically added in the playlist
    //if it has, don't do anything.
    // else, add the song to the playlist.

    //we no longer need to check if the song is already in the playlist because we are now filtering out duplicates in MusicList.jsx
    setIsAdding(true);
    console.log("payload from insert()", payload);
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/tracks?market=US&ids=${payload.new.track_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("response", response.data);
      const newTrack = {
        ...response.data.tracks[0],
        anonify_index: payload.new.id,
        votes: 0,
      };
      console.log("newTrackInInsert", newTrack);
      qc.setQueryData(["play"], (currentData) => {
        console.log("currentData2", currentData);
        return {
          ...currentData,
          tracks: [...currentData.tracks, newTrack],
        };
      });
    } catch (error) {
      console.error("Failed to insert track:", error);
    } finally {
      setIsAdding(false);
    }
  }

  const activeUsers = supabase.channel(window.location.pathname);
  activeUsers
    .on("presence", { event: "sync" }, () => {
      const newState = activeUsers.presenceState();
      console.log("sync", newState);
    })
    .on("presence", { event: "join" }, ({ key, newPresences }) => {
      console.log("join", key, newPresences);
    })
    .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      console.log("leave", key, leftPresences);
    })
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "tracks" },
      (p) => {
        qc.invalidateQueries({ queryKey: ["play"] });
        qc.invalidateQueries({ queryKey: ["path"] });
        qc.prefetchQuery({ queryKey: ["path"] })
          .then(() => qc.prefetchQuery({ queryKey: ["play"] }))
          .then(() => insert(p));
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "tracks" },
      handleRatingChange
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "tracks" },
      (p) => {
        handleResponsiveDelete(p);
      }
    )
    .subscribe();

  const getToken = async () => {
    let token = await axios.get("/auth");
    return token.data;
  };
  const getStoredSongs = async () => {
    let songArray = playlistInfo.tracks.map((song) => song.track_id);
    console.log(songArray);
    let songString = songArray.join(",");
    token = await axios.get("/auth");
    token = token.data;
    if (playlistInfo.tracks.length === 0) {
      return { tracks: [] };
    }
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
        votes: playlistInfo.tracks[index].votes,
      };
    });
    console.log(songs.data);
    return songs.data;
  };

  const bearerToken = useQuery({
    queryKey: ["auth"],
    queryFn: getToken,
    enabled: !!playlistInfo,
  });
  const playlists = useQuery({
    queryKey: ["play"],
    queryFn: getStoredSongs,
    enabled: !!playlistInfo,
  });

  function handleRatingChange(payload) {
    console.log("DB change", payload);
    console.log(payload.new.id);
    console.log(payload.new.votes);
    console.log(playlists.data);
    const newTracks = playlists.data.tracks.map((song) => {
      if (song.anonify_index === payload.new.id) {
        return { ...song, votes: payload.new.votes };
      }
      return song;
    });
    console.log("nextdata", { ...playlists.data, tracks: newTracks });
    console.log("test", qc.getQueryData(["play"]));
    qc.setQueryData(["play"], { ...playlists.data, tracks: newTracks });
  }

  const addToPlaylist = async () => {
    setIsAdding(true);
    let post = await axios.put(`${playlistInfo.path}`, {
      trackId: addSongField,
    });
    console.log("Post", post);
    await qc.invalidateQueries(["path"]);
    await qc.invalidateQueries(["play"]);
    await qc.prefetchQuery(["path"]);
    await qc.prefetchQuery(["play"]);
    let response;
    try {
      response = await axios.get(
        `https://api.spotify.com/v1/tracks?market=US&ids=${addSongField}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      throw err;
    }
    try {
      console.log("response", response.data);
      const newTrack = {
        ...response.data.tracks[0],
        anonify_index: post.data.id,
        votes: 0,
      };

      qc.setQueryData(["play"], (currentData) => {
        console.log("currentData1", currentData);

        return {
          ...currentData,
          tracks: [...currentData.tracks, newTrack],
        };
      });

      return post;
    } catch (err) {
      throw err;
    } finally {
      setIsAdding(false);
    }
  };
  const deleteSong = async (trackId, anonify_index) => {
    console.log("Deleting", trackId, anonify_index);
    console.log("path", playlistInfo.path);
    let patch = await axios.patch(
      `${playlistInfo.path}/${trackId}/${anonify_index}`
    );
    //Update the playlist and remove the song from the list.
    let nextPlaylist = playlists.data.tracks.filter((song) => {
      return song.anonify_index !== anonify_index;
    });
    qc.setQueryData(["play"], (currentData) => {
      return { ...currentData, tracks: nextPlaylist };
    });
    return patch.data;
  };
  //On mutate, get spotify info.
  //Mutation function is adding to DB.
  //Add songfield
  const addSongToPlaylist = useMutation({
    mutationKey: ["addSong"],
    mutationFn: addToPlaylist,
    onSuccess: (data) => {
      console.log("thedata", data);
      let nextSongs = cookies.songsAddedByUser || [];
      nextSongs = [...nextSongs, `${data.data.id}`];
      setCookie("songsAddedByUser", nextSongs, { path: "/" });
    },
  });
  const deleteSongFromPlaylist = useMutation({
    mutationKey: ["delete"],
    mutationFn: ({ id, anonify_index }) => {
      deleteSong(id, anonify_index);
    },
    onSuccess: (data) => {
      console.log("Delete song res", data);

      let nextSongs = cookies.songsAddedByUser || [];
      nextSongs = nextSongs.filter((song) => song !== data);
      setCookie("songsAddedByUser", nextSongs, { path: "/" });
    },
  });
  const handleDelete = (id, anonify_index) => {
    deleteSongFromPlaylist.mutate({ id, anonify_index });
  };
  return playlistInfo ? (
    <>
      <div className='flex flex-wrap justify-around'>
        <h1 className='text-6xl font-bold text-center m-5'>
          <a href='/'>Anonify</a>
        </h1>
        <div className='bg-black overflow-auto flex-grow h-screen max-w-[85vh]'>
          {playlists.isSuccess && playlists.data?.tracks.length > 0 && (
            <>
              <h2 className='text-white text-3xl font-bold text-center'>
                {playlistInfo.playlistName}
              </h2>
              <MusicList
                songs={playlists.data.tracks}
                songsAddedByUser={cookies?.songsAddedByUser}
                handleDelete={handleDelete}
                currentSort={currentSort}
              />
            </>
          )}
          {/*Source for loading icon: https://tailwindflex.com/tag/loading*/}
          {playlists.data?.tracks.length === 0 && (
            <div className='w-full h-screen flex flex-grow justify-center items-center flex-col'>
              <div>
                <h2 className='text-white text-2xl font-bold text-center p-3 m-5'>
                  Waiting for you to add music to:
                  <br />
                  {playlistInfo.name}
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
          )}
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
        <div className='flex grow-1 min-w-fit justify-center'>
          <div className='mx-5 my-10'>
            <label className='font-bold' htmlFor='songURI'>
              Enter Track ID or Spotify URL:
              <br />
              <input
                className='border border-gray-400 p-2 rounded-lg text-center mx-auto w-96 my-1'
                name='songURI'
                value={addSongField}
                onChange={(e) => {
                  console.log(e.target.value);
                  setAddSongField(e.target.value);
                }}
              />
              {addSongToPlaylist.isLoading && (
                <div className='justify-center flex bg-emerald-700 text-white text-bold rounded-lg p-3 w-full mx-auto text-center my-1'>
                  Loading...
                </div>
              )}
              <br />
              <div className='flex justify-end'>
                <button
                  disabled={isAdding}
                  className='bg-black text-white rounded-lg py-2 px-3 my-1 border-black border-2 hover:bg-white hover:text-black transition duration-500 ease-in-out w-full disabled:bg-gray-500 disabled:text-black disabled:border-black'
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
              </div>
              <div className='flex justify-end'>
                <button
                  className='bg-black text-white rounded-lg py-2 px-3 my-1 border-black border-2 hover:bg-white hover:text-black transition duration-500 ease-in-out w-full'
                  onClick={() => {
                    if (currentSort === "votes") {
                      setCurrentSort("orderadded");
                    } else {
                      setCurrentSort("votes");
                    }
                  }}
                >
                  {currentSort === "votes" && "Change sort to order added"}
                  {currentSort === "orderadded" && "Change sort to votes"}
                </button>
              </div>
              <div className='flex justify-end'>
                <button
                  className='bg-black text-white rounded-lg py-2 px-3 my-1 border-black border-2 hover:bg-white hover:text-black transition duration-500 ease-in-out w-full'
                  onClick={() => {
                    window.open(
                      `https://accounts.spotify.com/authorize?client_id=df9fb6c9d7794a2f8da08629c16768cd&response_type=code&redirect_uri=${window.location.origin}/callback&scope=playlist-modify-public&state=${window.location.href}`
                    );
                  }}
                >
                  Auth Spotify + Create Playlist
                </button>
              </div>
              {
                <div className='flex justify-end'>
                  <button
                    className='bg-black text-white rounded-lg py-2 px-3 my-1 border-black border-2 hover:bg-white hover:text-black transition duration-500 ease-in-out w-96'
                    onClick={() => {
                      console.log(playlistInfo);
                      console.log(playlists.data);
                      console.log(cookies.songsAddedByUser);
                    }}
                  >
                    Debug
                  </button>
                </div>
              }
              {addSongToPlaylist.isError && (
                <div className='justify-center flex bg-red-500 text-white text-bold rounded-lg p-3 w-full mx-auto text-center my-1'>
                  <h2>Error...</h2>
                  {<h4>{addSongToPlaylist.error.message}</h4>}
                </div>
              )}
              {addSongToPlaylist.isSuccess && (
                <div className='justify-center flex bg-emerald-700 text-white text-bold rounded-lg p-3 w-full mx-auto text-center my-1'>
                  Added song!
                </div>
              )}
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
        </div>
      </div>
    </>
  ) : (
    <div>404</div>
  );
}
export default MusicPage;
