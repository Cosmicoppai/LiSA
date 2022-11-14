import { Link } from "react-router-dom";
import VideoPlayer from "../components/video-player";

export default function SettingScreen() {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Setting</h2>
        <Link to="/">BACK</Link>

      </main>
    );
  }