import AnimateIn from "./plugins/AnimateIn";
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
}) => {
  return (
    <div className='flex items-center m-5'>
      <img src={albumArt} alt={album} className='w-36 h-36 rounded-full' />
      <div className='flex-grow ml-4'>
        <h2 className='text-lg font-medium text-white'>{title}</h2>
        <p className='text-white'>{artist}</p>
        <p className='text-white'>{id}</p>
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
          Delete @ index: {anonify_index}
        </button>
      )}
    </div>
  );
};

export default MusicListElement;
