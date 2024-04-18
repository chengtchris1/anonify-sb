import react from "react";
import LandingPage from "./components/LandingPage";
import MusicPage from "./components/MusicPage";
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

function App() {
  const themesList = [
    "dark",
    "light",
    "cupcake",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset",
  ];
  const [playlistInfo, setPlaylistInfo] = useState(window.location.pathname);
  const [theme, setTheme] = useState(() => {
    const localTheme = localStorage.getItem("theme");
    return localTheme
      ? JSON.parse(localTheme)
      : themesList.reduce((acc, item) => {
          acc[item] = false;
          return acc;
        }, {});
  });
  useEffect(() => {
    let currentTheme = Object.keys(theme).find((key) => theme[key]);
    document.querySelector("html").setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", JSON.stringify(theme));
  }, [theme]);

  const handleThemeChange = (themeName) => {
    let nextTheme = Object.keys(theme).reduce((acc, key) => {
      acc[key] = key === themeName;
      return acc;
    }, {});

    setTheme(nextTheme);
  };

  const path = useQuery({
    queryKey: ["path"],
    queryFn: () =>
      axios.get("/playlist", { params: { path: window.location.pathname } }),
    enabled: window.location.pathname !== "/",
  });

  return window.location.pathname === "/" ? (
    <LandingPage theme={theme} handleThemeChange={handleThemeChange} />
  ) : (
    <>
      {path.isLoading ? <div>Loading...</div> : null}
      {path.error ? <div>Error: {path.error}</div> : null}
      {path.isSuccess ? (
        <>
          <MusicPage
            playlistInfo={path.data.data}
            theme={theme}
            handleThemeChange={handleThemeChange}
          />
        </>
      ) : null}
    </>
  );
}
export default App;
