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
    <div className='card card-side bg-base-100 shadow-xl flex flex-row  items-center my-3 sm:my-5'>
      <div className='flex-1 h-fit flex justify-center'>
        <figure>
          <img
            className='w-20 h-20 sm:w-56 sm:h-auto object-cover rounded-lg'
            src={albumArt}
            alt={album}
          />
        </figure>
      </div>

      <div className='card-body flex-4 m-1 p-0'>
        <h2 className='card-title text-primary '>
          <span className='m-0 whitespace-normal break-words'> {title}</span>
        </h2>
        <p className='m-0 text-ellipsis max--fit break-words'>{artist}</p>
        <p className='m-0 text-ellipsis max--fit break-words'>{album}</p>
        <div className='flex items-center'>
          {previewUrl !== null ? (
            <>
              <span className='card-actions justify-end'>
                <audio
                  className='w-36 sm:w-60 '
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

      <div className='flex flex-col justify-between items-center'>
        <div className='absolute top-0 right-0'>
          {enableDelete && (
            <div className='card-actions justify-end flex'>
              <button
                onClick={() => {
                  console.log(anonify_index);
                  console.log(id);
                  handleDelete(id, anonify_index);
                }}
                className='btn btn-square btn-outline btn-sm bg-primary
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
        <div className='flex' />
        <div className='card-actions justify flex items-center'>
          <div className='flex flex-col-reverse items-center '>
            <button
              onClick={() => {
                setLoading(true);
                Axios.patch(`/${anonify_index}/downvote`).then(() => {
                  setLoading(false);
                });
              }}
              className='btn btn-square btn-sm btn-outline btn-primary text-lg mb-4 sm:mb-0'
            >
              -
            </button>
            <span className='text-lg mx-2 mb-4 sm:mb-0'>{votes}</span>
            <button
              onClick={() => {
                Axios.patch(`/${anonify_index}/upvote`).then(() => {
                  setLoading(false);
                });
              }}
              className='btn btn-square btn-sm btn-outline btn-primary text-lg mb-4 sm:mb-0'
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicListElement;
