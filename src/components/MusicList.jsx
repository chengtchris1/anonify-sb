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
            <motion.li
              key={song.anonify_index} // Make sure to add a unique key
              layout // This prop animates the item when its layout changes
              layoutScroll
            >
              <MusicListElement
                key={song.anonify_index}
                anonify_index={song.anonify_index}
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
          ))}
      </AnimatePresence>
    </ul>
  );
};

export default MusicList;
