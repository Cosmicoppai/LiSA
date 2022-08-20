import { Box, Image } from "@chakra-ui/react";
import axios from "axios";
import JoLPlayer from "jol-player";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
function getWindowSize() {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
}
const VideoPlayer = ({ url, epDetails }) => {
  const [windowSize, setWindowSize] = useState(getWindowSize());
  const [videoFilePath, setVideoFilePath] = useState("");
  const handleVideoUpload = (event) => {
    setVideoFilePath(URL.createObjectURL(event.target.files[0]));
  };

  const getManifest = async () => {
    const resd = await axios.get(
      "/get_manifest?kwik_url=https://kwik.cx/e/rw9IoaXL2XpM"
    );
    console.log(resd.data);
  };
  useEffect(() => {
    getManifest();
    // setVideoFilePath(resd.data)
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    // window.addEventListener("resize", handleWindowResize);

    // return () => {
    //   window.removeEventListener("resize", handleWindowResize);
    // };
  }, []);

  console.log(videoFilePath);

  return (
    <Box p={3}>
      {
        // true ? (
        // <JoLPlayer
        //   option={{
        //     videoSrc: url,
        //     width: windowSize.innerWidth - 130,
        //     height:
        //       (windowSize.innerHeight / windowSize.innerWidth) *
        //         windowSize.innerWidth -
        //       130,
        //     language: "en",
        //     isShowScreenshot: false,
        //     pausePlacement: "center",
        //     isShowSet: false,
        //   }}
        // />

        <JoLPlayer
          option={{
            videoType: "hls",
            videoSrc: videoFilePath,
            isShowWebFullScreen: false,
            width: 750,
            height: 420,
            poster:
              "https://gs-files.oss-cn-hongkong.aliyuncs.com/okr/prod/file/2021/08/31/1080pp.png",
            language: "en",
            pausePlacement: "center",
            isProgressFloat: true,
            isShowScreenshot: false,
            isShowSet: false,
          }}
        />

        // ) : (
        //   <Image
        //     src={epDetails.details.snapshot}
        //     w={windowSize.innerWidth - 130}
        //     h={
        //       (windowSize.innerHeight / windowSize.innerWidth) *
        //         windowSize.innerWidth -
        //       130
        //     }
        //   />
        // )
      }

      <input type="file" onChange={handleVideoUpload} />
    </Box>
  );
};

export default VideoPlayer;
