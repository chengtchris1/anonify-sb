const sb = require("@supabase/supabase-js");
require('dotenv').config()

const supabase = sb.createClient(process.env.sb_client_id, process.env.sb_secret);

const db = {};

db.getPlaylist = async (path) => {
  const { data } = await supabase.from("playlists")
    .select(`
      id,
      path,
      name,
      tracks ( track_id )
      `)
    .eq('path', path)
  const transformedData = data.map(item => ({
    ...item,
    tracks: item.tracks.map(track => track.track_id)
  }));
  return transformedData;
}

db.addTrack = async (path, newTrack) => {
  // First, get the playlist with the matching path
  const { data: playlistData, error: playlistError } = await supabase
    .from('playlists')
    .select('id')
    .eq('path', path);

  if (playlistError) {
    console.error('Error fetching playlist:', playlistError);
    return;
  }

  // Then, insert the new track into the tracks table with the playlist's id
  const { status } = await supabase
    .from('tracks')
    .insert([{ playlist_id: playlistData[0].id, track_id: newTrack }]);

  if (status === 201) {
    console.log('Track added successfully!');
  } else {
    console.error('Error adding track:', status);
  }
}

module.exports = db;
