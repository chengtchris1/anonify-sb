import React from "react";
import MusicListElement from "./MusicListElement";
import AnimateIn from "./plugins/AnimateIn";
const MusicList = ({ songs, songsAddedByUser, handleDelete }) => {
  // An array of song objects
  return (
    <div>
      {songs.map((song, index) => (
        <>
          <AnimateIn
            from='opacity-0 scale-105'
            to='opacity-100 scale-100'
            duration={300}
            style={{
              transitionTimingFunction: "cubic-bezier(0.25, 0.4, 0.55, 1.4)",
            }}
          >
            <MusicListElement
              key={song?.anonify_index}
              anonify_index={song?.anonify_index}
              id={song?.id}
              title={song?.name}
              artist={song?.artists
                .map((artist) => {
                  return artist?.name;
                })
                .join(", ")}
              album={song?.album?.name || "No album"}
              albumArt={song?.album?.images[1].url}
              previewUrl={song?.preview_url}
              enableDelete={songsAddedByUser?.includes(song?.id) || false}
              //enableDelete={true}
              handleDelete={handleDelete}
            />
          </AnimateIn>
        </>
      ))}
    </div>
  );
};

export default MusicList;
