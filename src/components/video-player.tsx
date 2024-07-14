import { Box, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import videojs, { VideoJsPlayerOptions } from 'video.js';
import 'video.js/dist/video-js.css';
import { QualityLevel, QualityLevelList } from 'videojs-contrib-quality-levels';
import 'videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels';
import hlsQualitySelector from 'videojs-hls-quality-selector';
import 'videojs-hotkeys';
import 'videojs-pip/videojs-pip';

import { ExternalPlayerPopup } from './externalPopup';

videojs.registerPlugin('hlsQualitySelector', hlsQualitySelector);

export function VideoPlayer({
    url,
    language,
    snapshot,
    setPlayer,
    prevTime,
    nextEpHandler,
    setQualityOptions,
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const videoRef = useRef<HTMLVideoElement>();
    const playerRef = useRef<videojs.Player>();

    const [vidDuration, setVidDuration] = useState(50000);

    useEffect(() => {
        const videoJsOptions: VideoJsPlayerOptions = {
            autoplay: false,
            preload: 'metadata',
            playbackRates: [0.5, 1, 1.5, 2],
            controls: true,
            fluid: true,
            controlBar: {
                pictureInPictureToggle: true,
            },
            html5: {
                nativeAudioTracks: true,
                nativeVideoTracks: true,
                nativeTextTracks: true,
            },
            // @ts-ignore
            pipButton: {},
        };

        const player = videojs(videoRef.current, videoJsOptions, function onPlayerReady() {
            this.hotkeys({
                volumeStep: 0.1,
                seekStep: 5,
                enableModifiersForNumbers: false,
            });
        });

        const fullscreen = player.controlBar.getChild('FullscreenToggle');
        const index = player.controlBar.children().indexOf(fullscreen);
        const externalPlayerButton = player.controlBar.addChild('button', {}, index);

        const externalPlayerButtonDom = externalPlayerButton.el();
        if (externalPlayerButtonDom) {
            externalPlayerButtonDom.innerHTML = 'external';

            // @ts-ignore
            externalPlayerButtonDom.onclick = function () {
                if (player.isFullscreen()) player.exitFullscreen();

                onOpen();
            };
        }

        playerRef.current = player;
        setPlayer(player);

        return () => {
            if (!player.isDisposed()) {
                player.dispose();
                setPlayer(null);
            }
        };
    }, []);

    function handleQualityLevels(qualityLevelList: QualityLevelList) {
        const levels: QualityLevel[] = [];

        for (let i = 0; i < qualityLevelList.length; i++) {
            const quality = qualityLevelList[i];
            levels.push(quality);
        }

        setQualityOptions(levels);
    }

    useEffect(() => {
        if (!playerRef.current || !url) return;

        const player = playerRef.current;

        player.src({
            src: url,
            type: 'application/x-mpegURL',
            // @ts-ignore
            withCredentials: false,
        });

        player.poster(snapshot);

        if (prevTime) {
            player.currentTime(prevTime);
            player.play();
        } else player.currentTime(0);

        const qualityLevels: QualityLevelList = player.qualityLevels();

        player.hlsQualitySelector({ displayCurrentQuality: true });

        qualityLevels.on('addqualitylevel', () => {
            handleQualityLevels(player.qualityLevels());
        });
        qualityLevels.on('removequalitylevel', () => {
            handleQualityLevels(player.qualityLevels());
        });

        return () => {
            qualityLevels.off('addqualitylevel', () => {
                handleQualityLevels(player.qualityLevels());
            });
            qualityLevels.off('removequalitylevel', () => {
                handleQualityLevels(player.qualityLevels());
            });
        };
    }, [playerRef, snapshot, url, prevTime]);

    return (
        <Box p={3} width="100%">
            <div data-vjs-player>
                <video
                    id="my-video"
                    ref={videoRef}
                    className="vidPlayer video-js vjs-default-skin vjs-big-play-centered"
                    controls
                    lang={language}
                    onLoadedMetadata={(e) => {
                        // @ts-ignore
                        setVidDuration(e.target.duration);
                    }}
                    onTimeUpdate={(e) => {
                        // @ts-ignore
                        if (e.target.currentTime >= vidDuration - 1) nextEpHandler();
                    }}
                />
            </div>
            {/* @ts-ignore */}
            <ExternalPlayerPopup isOpen={isOpen} onClose={onClose} language={language} />
        </Box>
    );
}
