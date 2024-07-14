import { Box, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import videojs, { VideoJsPlayerOptions } from 'video.js';
import 'videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels';
import 'video.js/dist/video-js.css';
import 'videojs-hotkeys';
import 'videojs-pip/videojs-pip';
import { QualityLevel, QualityLevelList } from 'videojs-contrib-quality-levels';
import hlsQualitySelector from 'videojs-hls-quality-selector';

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
    const player = useRef<videojs.Player>();

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
            pipButton: {},
            poster: snapshot,
            sources: [
                {
                    src: url,
                    type: 'application/x-mpegURL',
                    // @ts-ignore
                    withCredentials: false,
                },
            ],
        };

        const plyer = videojs(videoRef.current, videoJsOptions, function onPlayerReady() {
            this.hotkeys({
                volumeStep: 0.1,
                seekStep: 5,
                enableModifiersForNumbers: false,
            });
        });
        const fullscreen = plyer.controlBar.getChild('FullscreenToggle');
        const index = plyer.controlBar.children().indexOf(fullscreen);
        const externalPlayerButton = plyer.controlBar.addChild('button', {}, index);

        const externalPlayerButtonDom = externalPlayerButton.el();
        if (externalPlayerButtonDom) {
            externalPlayerButtonDom.innerHTML = 'external';

            // @ts-ignore
            externalPlayerButtonDom.onclick = function () {
                // @ts-ignore
                if (plyer.isFullscreen()) fullscreen.handleClick();

                onOpen();
            };
        }

        plyer.hlsQualitySelector({ displayCurrentQuality: true });
        const qualityLevels: QualityLevelList = plyer.qualityLevels();

        qualityLevels.on('addqualitylevel', () => {
            handleQualityLevels(plyer.qualityLevels());
        });
        qualityLevels.on('removequalitylevel', () => {
            handleQualityLevels(plyer.qualityLevels());
        });

        setPlayer(plyer);

        return () => {
            qualityLevels.off('addqualitylevel', () => {
                handleQualityLevels(plyer.qualityLevels());
            });
            qualityLevels.off('removequalitylevel', () => {
                handleQualityLevels(plyer.qualityLevels());
            });

            if (plyer && !plyer.isDisposed()) {
                plyer.dispose();
                setPlayer(null);
            }
        };
    }, [snapshot]);

    function handleQualityLevels(qualityLevelList: QualityLevelList) {
        const levels: QualityLevel[] = [];

        for (let i = 0; i < qualityLevelList.length; i++) {
            const quality = qualityLevelList[i];
            levels.push(quality);
        }

        console.log({ levels });
        setQualityOptions(levels);
    }

    useEffect(() => {
        if (!player.current || !url) return;

        player.current.src({
            src: url,
            type: 'application/x-mpegURL',
            // @ts-ignore
            withCredentials: false,
        });
        player.current.poster('');

        if (prevTime) {
            player.current.currentTime(prevTime);
            player.current.play();
        } else player.current.currentTime(0);
    }, [player, url, prevTime]);

    return (
        <Box p={3} width="100%">
            <div data-vjs-player>
                <video
                    id="my-video"
                    ref={videoRef}
                    className="vidPlayer video-js vjs-default-skin vjs-big-play-centered"
                    controls
                    // @ts-ignore
                    lan
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
