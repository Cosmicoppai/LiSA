import {
    Box,
    Button,
    Center,
    Flex,
    Select,
    Stack,
    Text,
    Heading,
    Skeleton,
    Menu,
    MenuButton,
    MenuList,
    MenuGroup,
    MenuItem,
    useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoBackBtn } from 'src/components/GoBackBtn';
import { MetaDataPopup } from 'src/components/metadata-popup';
import { useDownloadVideo } from 'src/hooks/useDownloadVideo';
import { useGetAnimeDetails } from 'src/hooks/useGetAnimeDetails';
import { useGetAnimeEpPagination } from 'src/hooks/useGetAnimeEpPagination';
import { useGetAnimeStream } from 'src/hooks/useGetAnimeStream';
import { useFeatureAvailable } from 'src/utils/fn';

import { PaginateCard } from '../components/paginateCard';
import { VideoPlayer } from '../components/video-player';

export function InbuiltPlayerScreen() {
    const { data, isLoading: streamLoading } = useGetAnimeStream();

    const details = data?.streamDetails;

    const {
        data: { params: anime, details: anime_details },
    } = useGetAnimeDetails();
    const session = anime?.session;

    const {
        data: eps_details,
        isLoading: eps_loading,
        episodePageUrl,
        onNextPage,
    } = useGetAnimeEpPagination();

    const navigate = useNavigate();

    const [language, setLanguage] = useState('jpn');
    const [qualityOptions, setQualityOptions] = useState([]);

    const [prevTime, setPrevTime] = useState(null);
    const [player, setPlayer] = useState(undefined);

    const languageChangeHandler = (e) => {
        setPrevTime(player.currentTime());
        setLanguage(e.target.value);
    };
    const ep_no = Math.trunc(data.animeEpisode.ep_no);

    const current_page_eps = eps_details?.ep_details;

    const nextEpHandler = () => {
        if (ep_no === Number(Object.keys(current_page_eps[current_page_eps.length - 1])[0])) {
            if (eps_details.next_page_url) onNextPage();
            else return;
        }

        let item;

        current_page_eps.map((single_ep) => {
            if (Number(Object.keys(single_ep)[0]) === ep_no + 1) {
                console.log(single_ep);
                item = Object.values(single_ep)[0];
            }
        });

        if (item) {
            console.log('item', item);

            navigate(
                `/play?${new URLSearchParams({
                    q: JSON.stringify(anime),
                    episodePageUrl,
                    stream: JSON.stringify({
                        ...item,
                        ep_no: ep_no + 1,
                    }),
                })}`,
                { replace: true },
            );
        }
    };

    const { downloadVideo, downloadLoading } = useDownloadVideo();
    const singleDownloadHandler = (url) => {
        downloadVideo({
            manifest_url: url.slice(2),
        });
    };
    const downloadPageHandler = async () => {
        downloadVideo({
            anime_session: session,
        });
    };
    const { isOpen, onOpen, onClose } = useDisclosure();
    useEffect(() => {
        if (downloadLoading) onOpen();
        else onClose();
    }, [downloadLoading]);

    const { isDownloadFeatureAvailable } = useFeatureAvailable();

    const animeTitle = anime.title || anime.jp_name || anime_details?.description?.eng_name;

    return (
        <Center py={6} w="100%">
            <Flex
                flexDirection={'column'}
                justifyContent="center"
                alignItems={'center'}
                w="90%"
                margin={'0 auto'}>
                {anime && (
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
                                    {animeTitle}
                                </Heading>
                                <Text fontWeight={600} color={'gray.500'} size="sm" ml={2}>
                                    | Episode {data.animeEpisode.ep_no}
                                </Text>
                            </Box>
                        </Box>

                        {details &&
                        language &&
                        details[language] &&
                        data?.animeEpisode?.snapshot &&
                        !streamLoading ? (
                            <VideoPlayer
                                key={details[language]}
                                url={details[language]}
                                language={language}
                                snapshot={data.animeEpisode.snapshot}
                                setPlayer={setPlayer}
                                prevTime={prevTime}
                                nextEpHandler={nextEpHandler}
                                setQualityOptions={setQualityOptions}
                            />
                        ) : (
                            <Skeleton width={'100%'} height={'660px'} mt={3} />
                        )}
                    </Box>
                )}

                <Stack
                    borderWidth="1px"
                    borderRadius="lg"
                    justifyContent="space-between"
                    direction={'column'}
                    bg={'gray.900'}
                    boxShadow={'2xl'}
                    padding={3}
                    w="100%">
                    {details ? (
                        <Flex
                            flex={1}
                            justifyContent={'space-between'}
                            alignItems={'center'}
                            p={1}
                            pt={2}
                            gap={6}>
                            <Select
                                // placeholder="Language"
                                size="md"
                                value={language}
                                onChange={languageChangeHandler}
                                width={'max-content'}>
                                {Object.keys(details || {}).map((language, idx) => (
                                    <option key={idx} value={language}>
                                        {language === 'jpn'
                                            ? 'Japanese'
                                            : language === 'eng'
                                              ? 'English'
                                              : ''}
                                    </option>
                                ))}
                            </Select>
                            {isDownloadFeatureAvailable ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        columnGap: 10,
                                    }}>
                                    <Menu>
                                        <MenuButton disabled={eps_loading} as={Button}>
                                            Download
                                        </MenuButton>
                                        <MenuList>
                                            <MenuGroup title="Select quality">
                                                {qualityOptions?.map(({ id, height }) => (
                                                    <MenuItem
                                                        key={id}
                                                        onClick={() => singleDownloadHandler(id)}>
                                                        {height}p
                                                    </MenuItem>
                                                ))}
                                            </MenuGroup>
                                        </MenuList>
                                    </Menu>
                                    {eps_details?.ep_details?.length > 1 ? (
                                        <Button
                                            disabled={eps_loading}
                                            onClick={downloadPageHandler}>
                                            Download all
                                        </Button>
                                    ) : null}
                                </div>
                            ) : null}
                        </Flex>
                    ) : streamLoading ? (
                        <Flex
                            flex={1}
                            justifyContent={'space-between'}
                            alignItems={'center'}
                            p={1}
                            gap={6}>
                            <Skeleton width={'150px'} height={10} />
                            <div style={{ display: 'flex', columnGap: 10 }}>
                                <Skeleton width={'150px'} height={10} />
                                <Skeleton width={'150px'} height={10} />
                            </div>
                        </Flex>
                    ) : null}
                    <PaginateCard />
                    <MetaDataPopup isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
                </Stack>
            </Flex>
        </Center>
    );
}
