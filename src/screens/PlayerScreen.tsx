import { Box, Center, Flex, Heading, Text, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import videojs, { VideoJsPlayerOptions } from 'video.js';

import 'video.js/dist/video-js.css';
import 'videojs-hotkeys';

import { GoBackBtn } from '../components/GoBackBtn';
import { ExternalPlayerPopup } from '../components/externalPopup';
import { TDownloadAnimeEpisode } from '../hooks/useGetDownloads';

function useGetCurrentLocalVideo() {
    const [searchParams] = useSearchParams();

    const params = useMemo(() => {
        const q = searchParams.get('q');

        return JSON.parse(q) as TDownloadAnimeEpisode;
    }, [searchParams]);

    return {
        ...params,
        file_location: `file:///${params?.file_location}`,
    };
}

export function PlayerScreen() {
    const localVideo = useGetCurrentLocalVideo();

    return (
        <Center py={6} w="100%">
            <Flex
                flexDirection={'column'}
                justifyContent="center"
                alignItems={'center'}
                w="90%"
                margin={'0 auto'}>
                <Box w="100%">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GoBackBtn />
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                flexDirection: 'row',
                            }}>
                            <Heading fontSize={'2xl'} fontFamily={'body'}>
                                {localVideo.series_name}
                            </Heading>
                            <Text fontWeight={600} color={'gray.500'} size="sm" ml={2}>
                                | {localVideo.file_name}
                            </Text>
                        </Box>
                    </Box>
                </Box>
                <VideoPlayer />
            </Flex>
        </Center>
    );
}

export function VideoPlayer() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const videoRef = useRef<HTMLVideoElement>();
    const playerRef = useRef<videojs.Player>();

    const [vidDuration, setVidDuration] = useState(50000);

    const { file_location, id: download_id } = useGetCurrentLocalVideo();

    useEffect(() => {
        const videoJsOptions: VideoJsPlayerOptions = {
            autoplay: true,
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

                player.pause();

                onOpen();
            };
        }

        playerRef.current = player;

        player.requestFullscreen();

        return () => {
            if (!player.isDisposed()) {
                player.dispose();
            }
        };
    }, []);

    useEffect(() => {
        if (!playerRef.current || !file_location) return;

        const player = playerRef.current;

        player.src({
            src: file_location,
            type: 'video/mp4',
        });

        player.currentTime(0);
    }, [playerRef, file_location]);

    return (
        <Box p={3} width="100%">
            <div data-vjs-player>
                <video
                    id="my-video"
                    ref={videoRef}
                    className="vidPlayer video-js vjs-default-skin vjs-big-play-centered"
                    controls
                    onLoadedMetadata={(e) => {
                        // @ts-ignore
                        setVidDuration(e.target.duration);
                    }}
                    onTimeUpdate={async (e) => {
                        // @ts-ignore
                        if (e.target.currentTime >= vidDuration - 1) {
                            const player = playerRef.current;

                            if (!player) return;

                            if (player.isInPictureInPicture()) await player.exitPictureInPicture();
                            else if (player.isFullscreen()) player.exitFullscreen();
                        }
                    }}
                />
            </div>

            <ExternalPlayerPopup
                isOpen={isOpen}
                onClose={onClose}
                data={{
                    type: 'download_id',
                    download_id,
                }}
            />
        </Box>
    );
}
