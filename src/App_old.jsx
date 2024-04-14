  import { useEffect, useState } from "react";
  import { createClient } from "@supabase/supabase-js";

  const supabase = createClient("https://mbrefcgxduvrtayfrchk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icmVmY2d4ZHV2cnRheWZyY2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMwMzQ2MDYsImV4cCI6MjAyODYxMDYwNn0.cK4-JJZQ-vNXg3ahWJwPzqu4c_aGCWpAn1ZRESu4R2I");

  function App() {
    const [playlists, setPlaylists] = useState([]);
    async function getPlaylists() {
      const { data } = await supabase.from("playlists").select(`
      id,
      path,
      name,
      tracks ( track_id )
      `)
      const transformedData = data.map(item => ({
      ...item,
      tracks: item.tracks.map(track => track.track_id)
      }));
      setPlaylists(transformedData);
    }
    async function addTrack(path, newTrack) {
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
  const {status} = await supabase
    .from('tracks')
    .insert([{ playlist_id: playlistData[0].id, track_id: newTrack }]);

    if (status === 201) {
      console.log('Track added successfully!');
    } else {
      console.error('Error adding track:', status);
    }
}
    useEffect(() => {
      getPlaylists();
    }, []);



    return (
      <><ul>
        {playlists.map((playlist) => (
          <li key={playlist.id}>{playlist.name}</li>
        ))}
      </ul>
      <button onClick={() => {
          console.log(playlists);
        }
      }>Test</button>
      <button onClick={() => {
          addTrack("/demo", "test3");
        }
      }>Test2</button>
      </>
    );
  }

  export default App;