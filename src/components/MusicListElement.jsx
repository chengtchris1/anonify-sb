import AnimateIn from "./plugins/AnimateIn";
import Axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
  const [loading, setLoading] = useState(false);

  return (
    <div className='card card-side bg-base-100 shadow-xl max-h-56 my-5'>
      <figure>
        <img className='h-56' src={albumArt} alt={album} />
      </figure>
      <div className='card-body'>
        <h2 className='card-title text-primary'>{title}</h2>
        <p className='text-secondary'>{artist}</p>
        <p className='text-secondary'>{album}</p>
        <div className='card-actions justify'>
          <div>
            <button
              onClick={() => {
                setLoading(true);
                Axios.patch(`/${anonify_index}/downvote`).then(() => {
                  setLoading(false);
                });
              }}
              className='btn btn-outline btn-primary text-2xl'
            >
              -
            </button>
            <span className='p-5 text-2xl'>{votes}</span>
            <button
              onClick={() => {
                Axios.patch(`/${anonify_index}/upvote`).then(() => {
                  setLoading(false);
                });
              }}
              className='btn btn-outline btn-primary text-2xl'
            >
              +
            </button>
          </div>
          <div>
            {previewUrl !== null ? (
              <>
                <span className='card-actions justify-end'>
                  <audio
                    className='w-60'
                    src={previewUrl}
                    controls
                    controlsList='nodownload'
                  />
                </span>
              </>
            ) : (
              <span className='text-gray-500'>No preview available</span>
            )}
          </div>
        </div>
      </div>
      {enableDelete && (
        <div className='card-actions justify-end flex'>
          <button
            onClick={() => {
              console.log(anonify_index);
              console.log(id);
              handleDelete(id, anonify_index);
            }}
            className='btn btn-square btn-outline btn-sm bg-transparent
            hover:bg-opacity-50'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 text-accent'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicListElement;
