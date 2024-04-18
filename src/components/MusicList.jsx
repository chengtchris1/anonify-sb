import React from "react";
import MusicListElement from "./MusicListElement";
import AnimateIn from "./plugins/AnimateIn";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
const MusicList = ({
  songs,
  songsAddedByUser,
  handleDelete,
  currentSort,
  handleDataChange,
}) => {
  // An array of song objects
  let seen = new Set();
  return (
    <AnimatePresence>
      <ul>
        {songs
          .filter((song) => {
            if (seen.has(song.anonify_index)) {
              return false;
            } else {
              seen.add(song.anonify_index);
              return true;
            }
          })
          .sort((a, b) => {
            if (currentSort === "votes") {
              if (b.votes === a.votes) {
                // If votes are equal, sort by anonify index (least to greatest)
                return a.anonify_index - b.anonify_index;
              }
              // Otherwise, sort by votes (greatest to least)
              return b.votes - a.votes;
            } else if (currentSort === "title") {
              return a.name.localeCompare(b.name);
            } else if (currentSort === "orderadded") {
              return a.anonify_index - b.anonify_index;
            }
          })
          .map((song, index) => (
            <motion.li
              key={song.anonify_index} // Make sure to add a unique key
              layout // This prop animates the item when its layout changes
              layoutScroll
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 900, damping: 40 }}
            >
              <MusicListElement
                key={song.anonify_index}
                anonify_index={song.anonify_index}
                id={song?.id}
                title={song?.name}
                artist={song?.artists
                  ?.map((artist) => {
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
          ))}
      </ul>
    </AnimatePresence>
  );
};

export default MusicList;
