import react from "react";
import LandingPage from "./components/LandingPage";
import MusicPage from "./components/MusicPage";
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

function App() {
  const [playlistInfo, setPlaylistInfo] = useState(window.location.pathname);
  const path = useQuery({
    queryKey: ["path"],
    queryFn: () =>
      axios.get("/playlist", { params: { path: window.location.pathname } }),
    enabled: window.location.pathname !== "/",
  });

  return window.location.pathname === "/" ? (
    <LandingPage />
  ) : (
    <>
      {path.isLoading ? <div>Loading...</div> : null}
      {path.error ? <div>Error: {path.error}</div> : null}
      {path.isSuccess ? (
        <>
          <MusicPage playlistInfo={path.data.data} />
        </>
      ) : null}
    </>
  );
}
export default App;
