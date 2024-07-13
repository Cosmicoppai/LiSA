import {
    Box,
    Button,
    Fade,
    Flex,
    Menu,
    MenuButton,
    MenuGroup,
    MenuItem,
    MenuList,
    Skeleton,
    Spacer,
    Text,
    useDisclosure,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDownloadVideo } from 'src/hooks/useDownloadVideo';
import { useGetAnimeDetails } from 'src/hooks/useGetAnimeDetails';
import { getAnimeEpisodeDetails } from 'src/hooks/useGetAnimeEpisodeDetails';

import { MetaDataPopup } from './metadata-popup';
import { addCurrentEp, getStreamDetails } from '../store/actions/animeActions';

export function PaginateCard({ showPageNav, redirect, isSingleAvailable, qualityOptions }) {
    const {
        data: { params },
    } = useGetAnimeDetails();

    const [episodePageUrl, setEpisodePageUrl] = useState(null);

    const { data: ep_details, isLoading: epsLoading } = useQuery({
        queryKey: ['anime-ep-details', episodePageUrl, params?.ep_details],
        queryFn: () => getAnimeEpisodeDetails({ url: episodePageUrl || params?.ep_details }),
    });
    const session = params?.session;

    const { isOpen, onOpen, onClose } = useDisclosure();

    // @ts-ignore
    const epDetails = useSelector((state) => state.animeCurrentEp);
    const currentEp = Math.trunc(epDetails?.details?.current_ep);

    // console.log(epsLoading);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const episodeClickHandler = (item, ep_no) => {
        console.log(item);
        // @ts-ignore
        dispatch(getStreamDetails(item.stream_detail));
        dispatch(
            // @ts-ignore
            addCurrentEp({
                ...item,
                current_ep: ep_no,
            }),
        );

        if (redirect) {
            navigate(
                `/play?${new URLSearchParams({
                    q: JSON.stringify(params),
                })}`,
            );
        }
    };

    let coloredIdx;
    console.log({ coloredIdx, qualityOptions, l: 2222 });
    // console.log(ep_details);

    if (!epsLoading && ep_details) {
        const current_page_eps = ep_details.ep_details;
        current_page_eps?.map((single_ep, idx) => {
            if (Number(Object.keys(single_ep)[0]) === currentEp) {
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

    return (
        <>
            <Box mt={5}>
                {!epsLoading && ep_details ? (
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
                                    bg={coloredIdx === key && !redirect ? '#10495F' : 'brand.900'}
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
                {showPageNav ? (
                    <Flex justifyContent={'space-between'} width={'100%'}>
                        <Fade in={Boolean(ep_details?.prev_page_url)}>
                            <Button
                                onClick={() => setEpisodePageUrl(ep_details?.prev_page_url)}
                                disabled={!ep_details?.prev_page_url || epsLoading}>
                                Previous Page
                            </Button>
                        </Fade>

                        <Spacer />

                        {ep_details?.next_page_url && (
                            <Button
                                ml={5}
                                onClick={() => setEpisodePageUrl(ep_details?.next_page_url)}
                                disabled={epsLoading}>
                                Next Page
                            </Button>
                        )}
                    </Flex>
                ) : null}
                {!isSingleAvailable && <Spacer />}
                {/* <Button disabled={epsLoading} onClick={downloadPageHandler}>
                    Download all
                </Button> */}
                {isSingleAvailable && (
                    <>
                        <Spacer />
                        <Menu>
                            <MenuButton disabled={epsLoading} as={Button}>
                                Download
                            </MenuButton>
                            <MenuList>
                                <MenuGroup title="Select quality">
                                    {qualityOptions?.map(({ id, height }) => {
                                        return (
                                            <MenuItem
                                                key={id}
                                                onClick={() => singleDownloadHandler(id)}>
                                                {height}p
                                            </MenuItem>
                                        );
                                    })}
                                </MenuGroup>
                            </MenuList>
                        </Menu>
                    </>
                )}
            </Flex>

            <MetaDataPopup isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
        </>
    );
}
