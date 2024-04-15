import AnimateIn from "./plugins/AnimateIn";
import Axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
const MusicListElement = ({
  id,
  title,
  artist,
  album,
  albumArt,
  previewUrl,
  enableDelete,
  anonify_index,
  handleDelete,
  votes,
}) => {
  const qc = useQueryClient();
  return (
    <motion.div className='flex items-center m-5'>
      <img src={albumArt} alt={album} className='w-36 h-36 rounded-full' />
      <div className='flex-grow ml-4'>
        <h2 className='text-lg font-medium text-white'>{title}</h2>
        <p className='text-white'>{artist}</p>
        {/*<p className='text-white'>{id}</p>*/}
        <p className='text-white'>{album}</p>
        {previewUrl !== null ? (
          <>
            <div className='flex-none'>
              <audio src={previewUrl} controls controlsList='nodownload' />
            </div>
          </>
        ) : (
          <div className='text-white'>No preview available</div>
        )}
        <button className='text-white border-solid border border-white border-spacing-1 mt-4 p-2 rounded-lg bg-black hover:bg-white hover:text-black hover:border-black h-12 transition duration-500 ease-in-out'>
          {votes} votes
        </button>
        <button
          className='text-white border-solid border border-white border-spacing-1 mt-4 p-2 rounded-lg bg-black hover:bg-white hover:text-black hover:border-black h-12 transition duration-500 ease-in-out'
          onClick={(e) => {
            Axios.patch(`/${anonify_index}/upvote`).then(() => {
              qc.invalidateQueries("play");
            });
          }}
        >
          Upvote
        </button>
        <button className='text-white border-solid border border-white border-spacing-1 mt-4 p-2 rounded-lg bg-black hover:bg-white hover:text-black hover:border-black h-12 transition duration-500 ease-in-out'>
          Downvote
        </button>
      </div>
      {enableDelete && (
        <button
          className='text-white border-solid border border-white  border-spacing-1 mt-4 p-2 rounded-lg bg-black hover:bg-white hover:text-black hover:border-black h-12 transition duration-500 ease-in-out'
          onClick={() => {
            console.log(anonify_index);
            console.log(id);
            handleDelete(id, anonify_index);
          }}
        >
          Delete
        </button>
      )}
    </motion.div>
  );
};

export default MusicListElement;
