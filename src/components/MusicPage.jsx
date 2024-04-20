import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import MusicList from "./MusicList";
import { useCookies } from "react-cookie";
import { createClient } from "@supabase/supabase-js";
import ThemeSelector from "./ThemeSelector";
let token;
const supabase = createClient(
  "https://mbrefcgxduvrtayfrchk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icmVmY2d4ZHV2cnRheWZyY2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMwMzQ2MDYsImV4cCI6MjAyODYxMDYwNn0.cK4-JJZQ-vNXg3ahWJwPzqu4c_aGCWpAn1ZRESu4R2I",
);

function MusicPage({ playlistInfo, theme, handleThemeChange }) {
  //const [theme, setTheme] = React.useState("synthwave");
  const [addSongField, setAddSongField] = useState();
  //const [cookies, setCookie, removeCookie] = useCookies(["songsAddedByUser"]);
  const [currentSort, setCurrentSort] = useState("votes");
  const [isAdding, setIsAdding] = useState(false);
  const [activeUsers, setActiveUsers] = useState(1);

  const songsAddedByUser =
    JSON.parse(
      localStorage.getItem(`songsAddedByUser_${window.location.pathname}`),
    ) || [];
  // Function to add song to localStorage
  const addSongToLocalStorage = (song) => {
    const updatedSongs = [...songsAddedByUser, song];
    localStorage.setItem(
      `songsAddedByUser_${window.location.pathname}`,
      JSON.stringify(updatedSongs),
    );
  };

  // Function to remove song from localStorage
  const removeSongFromLocalStorage = (song) => {
    const updatedSongs = songsAddedByUser.filter((item) => item !== song);
    localStorage.setItem(
      `songsAddedByUser_${window.location.pathname}`,
      JSON.stringify(updatedSongs),
    );
  };
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

    //Need to check if ID from playlistInfo.id is the same as the path in the payload.
    //If it is, then we can add the song to the playlist.
    //If it is not, then we should not add the song to the playlist.
    if (playlistInfo.id !== payload.new.playlist_id) {
      return;
    }
    setIsAdding(true);
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/tracks?market=US&ids=${payload.new.track_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newTrack = {
        ...response.data.tracks[0],
        anonify_index: payload.new.id,
        votes: 0,
      };
      qc.setQueryData(["play"], (currentData) => {
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
  const listenToDb = supabase.channel(window.location.pathname + "_listenToDb");
  listenToDb
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "tracks",
      },
      (p) => {
        qc.invalidateQueries({ queryKey: ["play"] });
        qc.invalidateQueries({ queryKey: ["path"] });
        qc.prefetchQuery({ queryKey: ["path"] })
          .then(() => qc.prefetchQuery({ queryKey: ["play"] }))
          .then(() => insert(p));
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "tracks" },
      handleRatingChange,
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "tracks" },
      (p) => {
        handleResponsiveDelete(p);
      },
    )
    .subscribe();
  const userStatus = {
    online_at: new Date().toISOString(),
  };
  useEffect(() => {
    const activeUsers = supabase.channel(
      window.location.pathname + "_activeUsers",
    );
    const userStatus = {
      online_at: new Date().toISOString(),
    };
    activeUsers
      .on("presence", { event: "sync" }, () => {
        const newState = activeUsers.presenceState();
        setActiveUsers(Object.keys(newState).length);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        setActiveUsers(newPresences.length);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        setActiveUsers(leftPresences.length);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }
        const presenceTrackStatus = await activeUsers.track(userStatus);
      });
    return () => {
      activeUsers.unsubscribe();
    };
  }, []);

  const getToken = async () => {
    let token = await axios.get("/auth");
    return token.data;
  };
  const getStoredSongs = async () => {
    let songArray = playlistInfo.tracks.map((song) => song.track_id);
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
      },
    );
    songs.data.tracks = songs.data.tracks.map((song, index) => {
      return {
        ...song,
        anonify_index: playlistInfo.tracks[index].id,
        votes: playlistInfo.tracks[index].votes,
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
    queryKey: ["play"],
    queryFn: getStoredSongs,
    enabled: !!playlistInfo,
  });

  function handleRatingChange(payload) {
    const test = playlists;
    const newTracks = playlists.data.tracks.map((song) => {
      if (song.anonify_index === payload.new.id) {
        return { ...song, votes: payload.new.votes };
      }
      return song;
    });
    qc.setQueryData(["play"], { ...playlists.data, tracks: newTracks });
  }

  const addToPlaylist = async () => {
    setIsAdding(true);
    let post = await axios.put(`${playlistInfo.path}`, {
      trackId: addSongField,
    });
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
        },
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
    let patch = await axios.patch(
      `${playlistInfo.path}/${trackId}/${anonify_index}`,
    );
    //Update the playlist and remove the song from the list.
    await qc.invalidateQueries(["path"]);
    await qc.prefetchQuery(["path"]);
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
      addSongToLocalStorage(data.data.id);
    },
  });
  const deleteSongFromPlaylist = useMutation({
    mutationKey: ["delete"],
    mutationFn: ({ id, anonify_index }) => {
      deleteSong(id, anonify_index);
    },
    onSuccess: async (data) => {
      removeSongFromLocalStorage(data.data.id);
    },
  });
  const handleDelete = (id, anonify_index) => {
    deleteSongFromPlaylist.mutate({ id, anonify_index });
  };
  return playlistInfo ? (
    <>
      <div className="flex min-w-[100%] flex-col justify-between bg-base-100 md:w-1/4 md:flex-row">
        <div className="m-5 mb-0 flex flex-col items-center md:w-1/3 md:max-w-52">
          <div className="flex w-full justify-start">
            <ThemeSelector theme={theme} setTheme={handleThemeChange} />
          </div>
          <h1 className="px-30 </> mb-0 text-center text-8xl font-bold md:mb-10 md:text-6xl">
            <a href="/">
              <span className="m-10 text-primary">Anonify</span>
            </a>
          </h1>
          <br />
          <h2>
            <div role="alert" className="alert bg-primary">
              <div className="flex flex-row items-center justify-evenly">
                <span className="loading loading-ring loading-md bg-primary-content"></span>
                <span className="text-primary-content">
                  {activeUsers} {activeUsers === 1 ? "user is" : "users are"}{" "}
                  viewing this page
                </span>
              </div>
            </div>
          </h2>
        </div>
        <div className="m-5 h-[96vh] flex-grow overflow-y-scroll rounded-box bg-primary-content px-10 pb-5 pt-0 md:w-1/2 md:min-w-[720px]">
          {playlists.isSuccess && playlists.data?.tracks.length > 0 && (
            <>
              <h2 className="text-center text-3xl font-bold text-primary">
                {playlistInfo.playlistName}
              </h2>
              <MusicList
                songs={playlists.data.tracks}
                playlistInfo={playlistInfo}
                handleDelete={handleDelete}
                currentSort={currentSort}
              />
            </>
          )}
          {/*Source for loading icon: https://tailwindflex.com/tag/loading*/}
          {playlists.data?.tracks.length === 0 && (
            <div className="h-fill flex w-full flex-grow flex-col items-center justify-center">
              <div>
                <h2 className="m-5 p-3 text-center text-2xl font-bold text-primary ">
                  Waiting for you to add music to:
                  <br />
                  {playlistInfo?.name}
                </h2>
              </div>
              <br />
              <div className="flex h-full flex-col items-center justify-center">
                <div className="flex h-[70vh] items-center">
                  <div className="h-fill flex items-center justify-center space-x-2 bg-transparent">
                    <span className="sr-only">Loading...</span>
                    <div className="h-8 w-8 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                    <div className="h-8 w-8 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                    <div className="h-8 w-8 animate-bounce rounded-full bg-primary"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {playlists.isError ? (
            <div className="flex h-[80vh] w-full flex-grow items-center justify-center">
              Playlist error...
            </div>
          ) : null}
          {playlists.isLoading ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="flex h-[70vh] items-center">
                <div className="h-fill flex items-center justify-center space-x-2 bg-transparent">
                  <span className="sr-only">Loading...</span>
                  <div className="h-8 w-8 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                  <div className="h-8 w-8 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                  <div className="h-8 w-8 animate-bounce rounded-full bg-primary"></div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="min-w-100 m-5 max-w-[720px] rounded-2xl px-10 pb-5 pt-0 md:w-1/3">
          <div className="sm:mx-0 sm:my-10 sm:px-8">
            <span className="font-sans text-primary">Sort by: </span>
            <div className="dropdown dropdown-hover">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-primary btn-xs m-0"
              >
                <span className="underline">
                  {currentSort === "votes" && "Votes"}
                  {currentSort === "orderadded" && "Order Added"}
                </span>
              </div>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-[1] w-52 rounded-box bg-primary-content p-2 text-primary shadow"
              >
                <li>
                  <a
                    className={`${
                      currentSort === "votes"
                        ? "bg-secondary-content text-secondary"
                        : "bg-transparent text-primary"
                    }`}
                    onClick={() => {
                      setCurrentSort("votes");
                    }}
                  >
                    Votes
                  </a>
                </li>
                <li>
                  <a
                    className={`${
                      currentSort === "orderadded"
                        ? "bg-secondary-content text-secondary"
                        : "bg-transparent text-primary"
                    }`}
                    onClick={() => {
                      setCurrentSort("orderadded");
                    }}
                  >
                    Order added
                  </a>
                </li>
              </ul>
            </div>
            <br />
            <span className="text-primary">Enter Track ID or Spotify URL:</span>
            <br />
            <input
              className="input input-bordered input-primary mx-auto my-1 w-full p-2 text-center"
              name="songURI"
              value={addSongField}
              onChange={(e) => {
                console.log(e.target.value);
                setAddSongField(e.target.value);
              }}
            />
            {addSongToPlaylist.isLoading && (
              <div className="text-bold mx-auto my-1 flex w-full justify-center rounded-lg bg-emerald-700 p-3 text-center text-primary">
                Loading...
              </div>
            )}
            <br />
            <div className="flex justify-end">
              <button
                disabled={isAdding}
                className="btn btn-primary my-1 w-full px-3 py-2 text-xl duration-500 ease-in-out"
                onClick={() => {
                  const spotifyUrlRegex = /\/track\/([a-zA-Z0-9]{22})/;
                  const spotifyUrlMatch = addSongField.match(spotifyUrlRegex);
                  if (spotifyUrlMatch) {
                    setAddSongField(spotifyUrlMatch[1]);
                  } else {
                    console.log("Not a valid Spotify URL");
                  }
                  addSongToPlaylist.mutate();
                }}
              >
                {isAdding ? (
                  <>
                    <span class="loading loading-spinner"></span>
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Add to playlist</span>
                )}
              </button>
            </div>
            {/*<div className='flex justify-end'>
              <button
                  className='btn btn-primary text-xl py-2 px-3 my-1 duration-500 ease-in-out w-full'
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
                </div>*/}
            <div className="flex justify-end">
              <button
                className="btn btn-primary my-1 h-auto w-full text-wrap px-3 py-2 text-xl duration-500 ease-in-out"
                onClick={() => {
                  window.open(
                    `https://accounts.spotify.com/authorize?client_id=df9fb6c9d7794a2f8da08629c16768cd&response_type=code&redirect_uri=${window.location.origin}/callback&scope=playlist-modify-public&state=${window.location.href}`,
                  );
                }}
              >
                Auth Spotify + Create Playlist
              </button>
            </div>
            <span className="text-xs">
              * Must be whitelisted to export to Spotify as project is in dev
              mode.
            </span>
            {/*
              <div className="flex justify-end">
                <button
                  className="btn btn-primary my-1 w-full px-3 py-2 text-xl duration-500 ease-in-out"
                  onClick={() => {
                    console.log(playlistInfo);
                    console.log(playlists.data);
                    //console.log(cookies.songsAddedByUser);
                    console.log(songsAddedByUser);
                  }}
                >
                  Debug
                </button>
              </div>
              */}
            {addSongToPlaylist.isError && (
              <div className="text-bold mx-auto my-1 flex w-full justify-center rounded-lg bg-red-500 p-3 text-center text-white">
                <h2>Error...</h2>
                {<h4>{addSongToPlaylist.error.message}</h4>}
              </div>
            )}
            {/*addSongToPlaylist.isSuccess &&
              {
                <div className='justify-center flex bg-emerald-700 text-white text-bold rounded-lg p-3 w-full mx-auto text-center my-1'>
                Added song!
            </div>
              }*/}
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
