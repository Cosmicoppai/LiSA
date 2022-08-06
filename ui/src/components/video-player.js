import { Box, Image } from "@chakra-ui/react";
import JoLPlayer from "jol-player";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
function getWindowSize() {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
}
const VideoPlayer = ({ url, epDetails }) => {
  const [windowSize, setWindowSize] = useState(getWindowSize());

  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return (
    <Box p={3}>
      {url ? (
        <JoLPlayer
          option={{
            videoSrc: url,
            width: windowSize.innerWidth - 130,
            height:
              (windowSize.innerHeight / windowSize.innerWidth) *
                windowSize.innerWidth -
              130,
            language: "en",
            isShowScreenshot: false,
            pausePlacement: "center",
            isShowSet: false,
          }}
        />
      ) : (
        <Image
          src={epDetails.details.snapshot}
          w={windowSize.innerWidth - 130}
          h={
            (windowSize.innerHeight / windowSize.innerWidth) *
              windowSize.innerWidth -
            130
          }
        />
      )}
    </Box>
  );
};

export default VideoPlayer;
