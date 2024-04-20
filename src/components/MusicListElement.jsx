import AnimateIn from "./plugins/AnimateIn";
import Axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  const [ratingStatus, setRatingStatus] = useState({
    upvoted: false,
    downvoted: false,
  });
  useEffect(() => {
    const songsRatedByUser =
      JSON.parse(localStorage.getItem("songsRatedByUser")) || {};
    setRatingStatus(
      songsRatedByUser[anonify_index] || { upvoted: false, downvoted: false },
    );
  }, []);
  useEffect(() => {
    if (ratingStatus.upvoted && ratingStatus.downvoted) {
      let nextRating = { upvoted: false, downvoted: false };
      let updatedSongsRating = {
        ...(JSON.parse(localStorage.getItem("songsRatedByUser")) || {}),
        [anonify_index]: nextRating,
      };
      localStorage.setItem(
        "songsRatedByUser",
        JSON.stringify(updatedSongsRating),
      );
      /*
      setRatingStatus((old) => {
        return { old, ...nextRating };
      });*/
      setRatingStatus({ upvoted: false, downvoted: false });
    }
  }, [ratingStatus.upvoted, ratingStatus.downvoted]);
  const handleUpvote = () => {
    setLoading(true);
    Axios.patch(`/${anonify_index}/upvote`).then(() => {
      setLoading(false);
    });
    const nextRating = { ...ratingStatus, upvoted: true };
    const updatedSongsRatedByUser = {
      ...(JSON.parse(localStorage.getItem("songsRatedByUser")) || {}),
      [anonify_index]: nextRating,
    };
    localStorage.setItem(
      "songsRatedByUser",
      JSON.stringify(updatedSongsRatedByUser),
    );
    setRatingStatus(updatedSongsRatedByUser[anonify_index]);
  };

  const handleDownvote = () => {
    setLoading(true);
    Axios.patch(`/${anonify_index}/downvote`).then(() => {
      setLoading(false);
    });
    const nextRating = { ...ratingStatus, downvoted: true };
    const updatedSongsRatedByUser = {
      ...(JSON.parse(localStorage.getItem("songsRatedByUser")) || {}),
      [anonify_index]: nextRating,
    };
    localStorage.setItem(
      "songsRatedByUser",
      JSON.stringify(updatedSongsRatedByUser),
    );
    setRatingStatus(updatedSongsRatedByUser[anonify_index]);
  };
  return (
    <div className="card card-side my-3 flex flex-row items-center  overflow-clip bg-base-100 shadow-xl sm:my-5">
      <div className="">
        <figure className="flex h-fit flex-1 justify-center object-cover">
          <img
            className="h-20 w-20 overflow-hidden object-cover sm:h-auto sm:w-56 "
            src={albumArt}
            alt={album}
          />
        </figure>
      </div>

      <div className="flex-4 card-body m-1 p-0">
        <h2 className="card-title text-primary ">
          <span className="m-0 whitespace-normal break-words"> {title}</span>
        </h2>
        <p className="max--fit m-0 text-ellipsis break-words">{artist}</p>
        <p className="max--fit m-0 text-ellipsis break-words">{album}</p>
        <div className="flex items-center justify-between">
          {previewUrl !== null ? (
            <>
              <span className="card-actions justify-end">
                <audio
                  className="w-24 sm:w-60 "
                  src={previewUrl}
                  controls
                  controlsList="nodownload"
                />
              </span>
            </>
          ) : (
            <div className="text-gray-500">No preview available</div>
          )}
          <div className="m-0 flex flex-row items-center">
            <button
              disabled={
                (ratingStatus.downvoted && !ratingStatus.upvoted) || loading
              }
              onClick={() => {
                setLoading(true);
                handleDownvote();
              }}
              className="btn btn-square btn-outline btn-primary btn-sm text-lg"
            >
              -
            </button>
            <span className="mx-2 text-lg">{votes}</span>
            <button
              disabled={
                (ratingStatus.upvoted && !ratingStatus.downvoted) || loading
              }
              onClick={() => {
                setLoading(true);
                handleUpvote();
              }}
              className="btn btn-square btn-outline btn-primary btn-sm text-lg"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between">
        <div className="absolute right-0 top-0">
          {enableDelete && (
            <div className="card-actions flex justify-end">
              <button
                onClick={() => {
                  console.log(anonify_index);
                  console.log(id);
                  handleDelete(id, anonify_index);
                }}
                className="btn btn-square btn-outline btn-sm m-1
            bg-primary hover:bg-opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-secondary-content hover:text-primary-content"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="flex" />
        <div className="justify card-actions flex items-center"></div>
      </div>
    </div>
  );
};

export default MusicListElement;
