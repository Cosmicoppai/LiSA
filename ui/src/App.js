import React from "react";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnimeDetailsScreen from "./screens/animeDetailsScreen";
import SettingScreen from "./screens/settingScreen";
import { HomeScreen } from "./screens/homeScreen";
import Navbar from "./components/navbar";
import DownloadScreen from "./screens/downloadsScreen";
import InbuiltPlayerScreen from "./screens/inbuiltPlayerScreen";

const { app } = window.require('@electron/remote')


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="anime-details" element={<AnimeDetailsScreen />} />
        <Route path="setting" element={<SettingScreen />} />
        <Route path="download" element={<DownloadScreen />} />
        <Route path="play" element={<InbuiltPlayerScreen />} />
      </Routes>
    </BrowserRouter> 
  );
}

export default App;
