import { Box, Button, Fade, Flex, Icon, Skeleton, Spacer, Text } from '@chakra-ui/react';
import { FaPlay } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetAnimeDetails } from 'src/hooks/useGetAnimeDetails';
import { useGetAnimeEpPagination } from 'src/hooks/useGetAnimeEpPagination';
import { useGetAnimeStream } from 'src/hooks/useGetAnimeStream';

export function PaginateCard() {
    const location = useLocation();
    const isPlayRoute = location.pathname.includes('/play');

    const {
        data: { params },
    } = useGetAnimeDetails();

    const {
        data: ep_details,
        isLoading: epsLoading,
        episodePageUrl,
        onPrevPage,
        onNextPage,
    } = useGetAnimeEpPagination();

    const {
        data: { animeEpisode },
    } = useGetAnimeStream();

    const currentEp = Math.trunc(animeEpisode?.ep_no);

    // console.log(epsLoading);

    const navigate = useNavigate();

    const episodeClickHandler = (item, ep_no) => {
        navigate(
            `/play?${new URLSearchParams({
                q: JSON.stringify(params),
                episodePageUrl,
                stream: JSON.stringify({
                    ...item,
                    ep_no,
                }),
            })}`,
            { replace: isPlayRoute, preventScrollReset: isPlayRoute },
        );
    };

    let coloredIdx;

    // console.log(ep_details);

    if (!epsLoading && ep_details) {
        const current_page_eps = ep_details.ep_details;
        current_page_eps?.map((single_ep, idx) => {
            if (Number(Object.keys(single_ep)[0]) === currentEp) {
                coloredIdx = idx;
            }
        });
    }

    if (ep_details?.ep_details?.length === 1) {
        if (isPlayRoute) return null;

        return (
            <div
                style={{
                    display: 'flex',
                    flexGrow: 1,
                    alignItems: 'flex-end',
                    marginTop: 18,
                }}>
                {/* TODO: Write in better way */}
                {ep_details?.ep_details?.map((item, key) => (
                    <Button
                        bg={'brand.900'}
                        leftIcon={<Icon as={FaPlay} w={4} h={4} />}
                        key={key}
                        onClick={() =>
                            episodeClickHandler(Object.values(item)[0], Object.keys(item)[0])
                        }>
                        Watch Now
                    </Button>
                ))}
            </div>
        );
    }

    return (
        <div>
            <Box mt={5}>
                {!epsLoading && ep_details ? (
                    <Flex direction={'row'} flexWrap="wrap" width={'100%'} justifyContent="center">
                        {ep_details?.ep_details?.map((item, key) => (
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
                                bg={isPlayRoute && coloredIdx === key ? '#10495F' : 'brand.900'}
                                onClick={() =>
                                    episodeClickHandler(
                                        Object.values(item)[0],
                                        Object.keys(item)[0],
                                    )
                                }>
                                <Text textAlign={'center'}>{Object.keys(item)[0]}</Text>
                            </Flex>
                        ))}
                    </Flex>
                ) : (
                    <Flex direction={'row'} flexWrap="wrap" width={'100%'} justifyContent="center">
                        {Array(25)
                            .fill(0)
                            .map((item, key) => (
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
                            ))}
                    </Flex>
                )}
            </Box>

            <Flex sx={{ marginTop: '20px !important' }}>
                <Flex justifyContent={'space-between'} width={'100%'}>
                    <Fade in={Boolean(ep_details?.prev_page_url)}>
                        <Button
                            onClick={onPrevPage}
                            disabled={!ep_details?.prev_page_url || epsLoading}>
                            Previous Page
                        </Button>
                    </Fade>

                    <Spacer />

                    {ep_details?.next_page_url && (
                        <Button ml={5} onClick={onNextPage} disabled={epsLoading}>
                            Next Page
                        </Button>
                    )}
                </Flex>
            </Flex>
        </div>
    );
}
