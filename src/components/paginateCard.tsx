// @ts-nocheck
import {
    Box,
    Button,
    Fade,
    Flex,
    Menu,
    MenuButton,
    MenuDivider,
    MenuGroup,
    MenuItem,
    MenuList,
    Skeleton,
    Spacer,
    Text,
    useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDownloadVideo } from 'src/hooks/useDownloadVideo';

import { MetaDataPopup } from './metadata-popup';
import { addCurrentEp, addEpisodesDetails, getStreamDetails } from '../store/actions/animeActions';
import server from '../utils/axios';

export function PaginateCard({
    data,
    loading,
    ep_details,
    redirect,
    isSingleAvailable,
    qualityOptions,
    player,
    setTest,
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { loading: epsLoading } = useSelector((state) => state.animeEpisodesDetails);
    const epDetails = useSelector((state) => state.animeCurrentEp);
    const { session } = useSelector((state) => state.animeDetails.details);
    const currentEp = parseInt(epDetails?.details?.current_ep);

    // console.log(epsLoading);
    const [isDownloadButtonAvailable, setIsDownloadButtonAvailable] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const episodeClickHandler = (item, ep_no) => {
        setIsDownloadButtonAvailable(false);
        console.log(item);
        dispatch(getStreamDetails(item.stream_detail));
        dispatch(
            addCurrentEp({
                ...item,
                current_ep: ep_no,
            }),
        );
        // sleep(2000).then(() => {
        //   setIsDownloadButtonAvailable(true);
        //   setTest({ assdfda: "assdfdasd" });
        // });
        if (redirect) {
            navigate('/play');
        }
    };
    const pageChangeHandler = async (url) => {
        setIsDownloadButtonAvailable(false);

        const { data } = await server.get(url);
        dispatch(addEpisodesDetails(data));

        sleep(2000).then(() => {
            setIsDownloadButtonAvailable(true);
        });
    };
    let coloredIdx;

    // console.log(ep_details);

    if (!loading && ep_details) {
        const current_page_eps = ep_details.ep_details;
        current_page_eps?.map((single_ep, idx) => {
            if (Object.keys(single_ep)[0] == currentEp) {
                coloredIdx = idx;
            }
        });
    }

    const { downloadVideo, downloadLoading } = useDownloadVideo();

    useEffect(() => {
        if (downloadLoading) onOpen();
        else onClose();
    }, [downloadLoading]);

    const downloadPageHandler = async () => {
        downloadVideo({
            anime_session: session,
        });
    };

    const singleDownloadHandler = (url) => {
        downloadVideo({
            manifest_url: url.slice(2),
        });
    };

    useEffect(() => {
        if (!isSingleAvailable) return;
        setTest({ asda: 'asdasd' });

        sleep(2000).then(() => {
            setIsDownloadButtonAvailable(true);
            setTest({ assdfda: 'assdfdasd' });
        });
    }, [isSingleAvailable]);
    useEffect(() => {
        sleep(4000).then(() => {
            setIsDownloadButtonAvailable(true);
        });
    }, [isDownloadButtonAvailable]);
    function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    return (
        <>
            <Box mt={5}>
                {!loading && ep_details ? (
                    <Flex direction={'row'} flexWrap="wrap" width={'100%'} justifyContent="center">
                        {ep_details?.ep_details?.map((item, key) => {
                            return (
                                <Flex
                                    cursor={'pointer'}
                                    key={key}
                                    p={1}
                                    mr={2}
                                    mt={2}
                                    width={'100%'}
                                    maxWidth={'45px'}
                                    minWidth={'45px'}
                                    maxHeight={'45px'}
                                    minHeight={'45px'}
                                    justifyContent="center"
                                    alignItems="center"
                                    bg={coloredIdx == key && !redirect ? '#10495F' : 'brand.900'}
                                    onClick={() =>
                                        episodeClickHandler(
                                            Object.values(item)[0],
                                            Object.keys(item)[0],
                                        )
                                    }>
                                    <Text textAlign={'center'}>{Object.keys(item)[0]}</Text>
                                </Flex>
                            );
                        })}
                    </Flex>
                ) : (
                    <Flex direction={'row'} flexWrap="wrap" width={'100%'} justifyContent="center">
                        {Array(25)
                            .fill(0)
                            .map((item, key) => {
                                return (
                                    <Skeleton
                                        p={2}
                                        mr={2}
                                        mt={2}
                                        width={'100%'}
                                        maxWidth={'50px'}
                                        justifyContent="center"
                                        key={key}>
                                        <Flex
                                            width={'100%'}
                                            maxWidth={'50px'}
                                            backgroundColor={
                                                currentEp === key + 1 ? 'while' : 'inherit'
                                            }
                                            justifyContent="center">
                                            <Text textAlign={'center'}>{key + 1}</Text>
                                        </Flex>
                                    </Skeleton>
                                );
                            })}
                    </Flex>
                )}
                {/* <EpPopover isOpen={isOpen} onOpen={onOpen} onClose={onClose} /> */}
            </Box>

            <Flex sx={{ marginTop: '20px !important' }}>
                {data && (
                    <Flex justifyContent={'space-between'} width={'100%'}>
                        <Fade in={ep_details?.prev_page_url}>
                            <Button
                                onClick={() => pageChangeHandler(ep_details?.prev_page_url)}
                                disabled={loading || !ep_details?.prev_page_url || epsLoading}>
                                Previous Page
                            </Button>
                        </Fade>

                        <Spacer />

                        {ep_details?.next_page_url && (
                            <Button
                                ml={5}
                                onClick={() => pageChangeHandler(ep_details?.next_page_url)}
                                disabled={loading || epsLoading}>
                                Next Page
                            </Button>
                        )}
                    </Flex>
                )}
                {!isSingleAvailable && <Spacer />}
                {/* <Button disabled={epsLoading}>Download all</Button> */}
                {isSingleAvailable && (
                    <>
                        <Spacer />

                        <Menu>
                            <MenuButton
                                disabled={!isDownloadButtonAvailable}
                                as={Button}
                                onClick={() => setTest({ sdf: 'asdaasdsd' })}>
                                Download
                            </MenuButton>
                            <MenuList>
                                <MenuGroup title="Select quality">
                                    {qualityOptions?.map(({ id, height }) => {
                                        return (
                                            <MenuItem
                                                onClick={() => singleDownloadHandler(id)}
                                                key={id}>
                                                {height}p
                                            </MenuItem>
                                        );
                                    })}
                                </MenuGroup>
                                {/* <MenuDivider /> */}
                            </MenuList>
                        </Menu>
                    </>
                )}
            </Flex>

            <MetaDataPopup isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
        </>
    );
}
