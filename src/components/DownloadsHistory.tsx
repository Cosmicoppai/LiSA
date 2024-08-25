import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { Fragment } from 'react/jsx-runtime';
import { TbMoodSad } from 'react-icons/tb';

import { DownloadsHistoryAnimeItem } from './DownloadsHistoryAnime';
import { DownloadsHistoryMangaItem } from './DownloadsHistoryManga';
import { useGetDownloadsHistory } from '../hooks/useGetDownloads';

export function DownloadsHistory() {
    const { data } = useGetDownloadsHistory();

    return (
        <Stack flex={1} flexDirection="column">
            <Heading fontSize={'xl'} py={2} fontFamily={'body'}>
                History
            </Heading>
            <Stack
                flex={1}
                flexDirection="column"
                alignItems="flex-start"
                pt={2}
                minWidth={'400px'}>
                {data.length ? (
                    <Box
                        style={{
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 18,
                        }}>
                        {data.map((item) => (
                            <Fragment key={`${item.type}-${item.title}`}>
                                {item.type === 'manga' ? (
                                    <DownloadsHistoryMangaItem item={item} />
                                ) : (
                                    <DownloadsHistoryAnimeItem item={item} />
                                )}
                            </Fragment>
                        ))}
                    </Box>
                ) : (
                    <DownloadsHistoryEmpty />
                )}
            </Stack>
        </Stack>
    );
}

function DownloadsHistoryEmpty() {
    return (
        <Flex alignItems={'center'} justifyContent="center" p={3} width={'100%'}>
            <Box color="gray.500" marginInline="2">
                <TbMoodSad size={24} />
            </Box>
            <Text fontWeight={600} color={'gray.500'} size="lg" textAlign={'center'}>
                No Previous Downloads
            </Text>
        </Flex>
    );
}
