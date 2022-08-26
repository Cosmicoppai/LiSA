import { Box, Image, useDisclosure, useToast } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import videojs from "video.js";
import "videojs-contrib-quality-levels";
import qualitySelector from "videojs-hls-quality-selector";
import "video.js/dist/video-js.css";
import ExternalPlayerPopup from "./externalPopup";
import { useDispatch, useSelector } from "react-redux";
// function getWindowSize() {
//   const { innerWidth, innerHeight } = window;
//   return { innerWidth, innerHeight };
// }
import hlsQualitySelector from "videojs-hls-quality-selector";
import { downloadVideo } from "../actions/animeActions";

const VideoPlayer = ({ url, epDetails, player, setPlayer, prevTime }) => {
  const toast = useToast();

  const { details } = useSelector((state) => state.animeStreamDetails);
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [language, setLanguage] = useState("jpn");
  const videoRef = useRef();
  const [callFinishVideoAPI, setCallFinishVideoAPI] = useState(false);
  const [vidDuration, setVidDuration] = useState(50000);
  const videoId = url;
  // console.log(epDetails);
  // console.log(language);
  const thumbnailURL = epDetails?.details?.snapshot;
  const liveURL = url;
  // console.log(url);
  useEffect(() => {
    if (player && url) {
      player.src({
        src: liveURL,
        type: "application/x-mpegURL",
        withCredentials: false,
        
      });
      player.poster("");
      setCallFinishVideoAPI(false);
    }

    if (player && prevTime) {
      if (prevTime) {
        player?.currentTime(prevTime);
        player?.play();
      } else {
        console.log("kokoko")
        player?.currentTime(0);
      }
    }

    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, liveURL, thumbnailURL]);

  useEffect(() => {
    if (callFinishVideoAPI) {
      //finishesVideo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callFinishVideoAPI]);

  useEffect(() => {
    videojs.registerPlugin("hlsQualitySelector", hlsQualitySelector);

    const videoJsOptions = {
      autoplay: false,
      preload: "metadata",
      playbackRates: [0.5, 1, 1.5, 2],

      controls: true,
      poster: thumbnailURL,
      controlBar: {
        pictureInPictureToggle: false
      },
      fluid: true,
      sources: [
        {
          src: liveURL,
          type: "application/x-mpegURL",
          withCredentials: false,
        },
      ],
      html5: {
        nativeAudioTracks: true,
        nativeVideoTracks: true,
        nativeTextTracks: true,
      },
    };

    const plyer = videojs(
      videoRef.current,
      videoJsOptions,
      function onPlayerReady() {
        // console.log('onPlayerReady');
      }
    );
    console.log(plyer.controlBar);
    var fullscreen = plyer.controlBar.getChild("FullscreenToggle");
    var index = plyer.controlBar.children().indexOf(fullscreen);
    var externalPlayerButton = plyer.controlBar.addChild("button", {}, index);

    var externalPlayerButtonDom = externalPlayerButton.el();
    if (externalPlayerButtonDom) {
      externalPlayerButtonDom.innerHTML = "external";

      externalPlayerButtonDom.onclick = function () {
        onOpen();
      };
    }
    var downloadButton = plyer.controlBar.addChild("button", {}, index);

    var downloadButtonDom = downloadButton.el();
    if (downloadButtonDom) {
      downloadButtonDom.style.width = "2em";
      downloadButtonDom.innerHTML = `<img style={{margin: "0 auto"}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAABmJLR0QA/wD/AP+gvaeTAAAAjklEQVQ4je2UsQkCQRBF34iBVRjYhsZygZ3YxKYWYEdnGwY2oUbPZEHxzpMbBRMfTLDM8ubDsAtfIoaa6gpY1uMhItrUFLV4pwzdnaQm/EUpOutX58AemAGLWgDHWhdgGxGnt3Z1rZ7tclU3o6L2yMZLemR5yYOsUZuPJL/j6XGOpQBMq6sFdskcua/lFTf9ZKaqnDiZAAAAAABJRU5ErkJggg==">`;

      downloadButtonDom.onclick = function () {
        try {
          dispatch(downloadVideo(url));

          toast({
            title: "Download Started",
            description:
              "Download has bee started. You can check in downloads sections",
            status: "success",
            duration: 6000,
            isClosable: true,
          });
        } catch (error) {
          console.log(error);
        }
      };
    }

    //lANGUAGE Selector Inbuilt

    // var MenuButton = videojs.getComponent("MenuButton");
    // var MenuItem = videojs.getComponent("MenuItem");

    // var CustomMenuButton = videojs.extend(MenuButton, {
    //   createItems: function () {
    //     return this.options().myItems.map(function (i) {
    //       var item = new MenuItem(plyer, { label: i.name });
    //       item.handleClick = function () {
    //         setLanguage(i.name);
    //         console.log(i.name);
    //       };
    //       return item;
    //     });
    //   },
    //   selectable: true,
    //   multiSelectable: false,
    // });
    // videojs.registerComponent("CustomMenuButton", CustomMenuButton);
    // console.log(plyer.controlBar.children());

    // if (details && language) {
    //   plyer.controlBar.children().map((child) => {
    //     {
    //       if (
    //         child.name() === "CustomMenuButton" ||
    //         child.name() === "subClass"
    //       ) {
    //         plyer.removeChild("CustomMenuButton");
    //       }
    //     }
    //   });

    //   console.log(plyer.controlBar.children());

    //   var lanBtn = plyer.controlBar.addChild("CustomMenuButton", {
    //     title: "Language",
    //     default: "jpcccccn",
    //     name: "jpccccccn",
    //     text: "jpccccccn",
    //     myItems: Object.keys(details)?.map((lan) => {
    //       return { name: lan };
    //     }),
    //   });
    //   // console.log(plyer.controlBar.children());
    //   var lanBtnDom = lanBtn.el();
    //   lanBtn.controlText("language");

    //   lanBtnDom.querySelector(".vjs-icon-placeholder").innerHTML = language;
    // }

    setPlayer(plyer);

    return () => {
      if (player) player.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (player && player.hlsQualitySelector) {
      player.hlsQualitySelector = hlsQualitySelector;

      player.hlsQualitySelector({ displayCurrentQuality: true });
    }
  }, [player]);

  // useEffect(() => {
    
  //   if (player && prevTime) {
  //     if (prevTime) {
  //       player?.currentTime(prevTime);
  //       player?.play();
  //     } else {
  //       console.log("kokoko")
  //       player?.currentTime(0);
  //     }
  //   }

  //   return () => {
  //     if (player) player.dispose();
  //   };
  // }, [prevTime]);

  return (
    <Box p={3} width="100%">
      <div data-vjs-player>
        <video
          ref={videoRef}
          lan
          onLoadedMetadata={(e, px) => {
            // console.log(e.target.duration);
            console.log(e);
            console.log(px);
            setVidDuration(e.target.duration);
          }}
          onTimeUpdate={(e) => {
            if (e.target.currentTime >= vidDuration - 10) {
              setCallFinishVideoAPI(true);
            }
          }}
          className="vidPlayer video-js vjs-default-skin vjs-big-play-centered"
        ></video>
      </div>

      <ExternalPlayerPopup
        isOpen={isOpen}
        onClose={onClose}
        language={language}
      />
    </Box>
  );
};

export default VideoPlayer;
