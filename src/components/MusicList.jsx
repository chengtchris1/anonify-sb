import React from "react";
import MusicListElement from "./MusicListElement";
import AnimateIn from "./plugins/AnimateIn";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
const MusicList = ({ songs, songsAddedByUser, handleDelete, currentSort }) => {
  // An array of song objects
  return (
    <ul>
      <AnimatePresence>
        {songs
          .sort((a, b) => {
            if (currentSort === "votes") {
              return b.votes - a.votes;
            } else if (currentSort === "title") {
              return a.name.localeCompare(b.name);
            } else if (currentSort === "orderadded") {
              return a.anonify_index - b.anonify_index;
            }
          })
          .map((song, index) => (
            <LayoutGroup>
              <motion.li
                key={song.id} // Make sure to add a unique key
                layout // This prop animates the item when its layout changes
                initial={{ opacity: 0 }} // Start position
                animate={{ opacity: 1 }} // End position
                exit={{ opacity: 0 }} // Animation when the item is removed
                transition={{ duration: 0.5 }} // Controls the animation speed
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
                  votes={song?.votes}
                  enableDelete={
                    songsAddedByUser?.includes(String(song?.anonify_index)) ||
                    false
                  }
                  //enableDelete={true}
                  handleDelete={handleDelete}
                />
              </motion.li>
            </LayoutGroup>
          ))}
      </AnimatePresence>
    </ul>
  );
};

export default MusicList;
