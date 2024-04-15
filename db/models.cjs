require('dotenv').config()
const sb = require("@supabase/supabase-js");
const supabase = sb.createClient(process.env.sb_client_id, process.env.sb_secret);
const db = {};

db.getPlaylist = async (path) => {
  const { data } = await supabase.from("playlists")
    .select(`
      id,
      path,
      name,
      tracks ( id, track_id, votes )
      `)
    .eq('path', path)
  return data;
}
db.addPlaylist = async (path, playlistName, songLimit) => {
  const { data, error } = await supabase.from('playlists')
    .insert([{ path, name: playlistName, song_limit: songLimit }]);
  if (error) {
    console.error('Error adding playlist:', error);
    return;
  }
  return data;

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
  const data = await supabase
    .from('tracks')
    .insert([{ playlist_id: playlistData[0].id, track_id: newTrack }])
    .select();

  if (data.status === 201) {
    return data;
  } else {
    console.error('Error adding track:', data.status);
  }
}

db.deleteTrack = async (anonify_index, track_id) => {
  const data = await supabase
    .from('tracks')
    .delete()
    .eq('id', Number(anonify_index))
    // .eq('track_id', track_id)
    .select();
  if (String(data.status).charAt(0) === '2') {
    console.log('Track deleted successfully!', 'Data:', data.data);
    return data.data;
  } else {
    console.error('Error deleting track:', data.status);
  }
}

db.upvoteTrack = async (anonify_index) => {
  // Fetch the current number of votes
  const { data: currentData, error: fetchError } = await supabase
    .from('tracks')
    .select('votes')
    .eq('id', Number(anonify_index));

  if (fetchError) {
    console.error('Error fetching track:', fetchError);
    return;
  }

  // Increment the number of votes
  const newVotes = currentData[0].votes + 1;

  // Update the number of votes
  const data = await supabase
    .from('tracks')
    .update({ votes: newVotes })
    .eq('id', Number(anonify_index));

  if (data.error !== null) {
    console.error('Error upvoting track:', data);
    return;
  }

  console.log('Track upvoted successfully!', 'Data:', data);
  return newVotes;
}

db.downvoteTrack = async (anonify_index) => {
  // Fetch the current number of votes
  const { data: currentData, error: fetchError } = await supabase
    .from('tracks')
    .select('votes')
    .eq('id', Number(anonify_index));

  if (fetchError) {
    console.error('Error fetching track:', fetchError);
    return;
  }

  // Increment the number of votes
  const newVotes = currentData[0].votes - 1;

  // Update the number of votes
  const data = await supabase
    .from('tracks')
    .update({ votes: newVotes })
    .eq('id', Number(anonify_index))
    .select();
  if (data.error) {
    console.error('Error upvoting track:', data);
    return;
  }

  console.log('Track upvoted successfully!', 'Data:', data);
  return newVotes;
}

module.exports = db;
