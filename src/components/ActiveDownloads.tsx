import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { TbMoodSad } from 'react-icons/tb';

import { DownloadItem } from './downloadItem';
import { useGetDownloads } from './useGetDownloads';

export function useGetDownloadingList() {
    const { data } = useGetDownloads();

    const downloadingList = useMemo(() => {
        const library = data?.length ? data : [];
        return library.filter((i) => i.status !== 'downloaded');
    }, [data]);

    return { downloadingList };
}

export function ActiveDownloads() {
    const { downloadingList } = useGetDownloadingList();

    return (
        <Stack flex={1} flexDirection="column">
            <Heading fontSize={'xl'} py={2} fontFamily={'body'}>
                Active Downloads
            </Heading>

            <Stack
                flex={1}
                flexDirection="column"
                alignItems="flex-start"
                p={1}
                pt={2}
                bg={'gray.900'}
                minWidth={'400px'}>
                {downloadingList.length ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            rowGap: 20,
                        }}>
                        {downloadingList.map((item, index: number) => (
                            <DownloadItem key={index} data={item} />
                        ))}
                    </div>
                ) : (
                    <ActiveDownloadsEmpty />
                )}
            </Stack>
        </Stack>
    );
}

function ActiveDownloadsEmpty() {
    return (
        <Flex alignItems={'center'} justifyContent="center" p={3} width={'100%'}>
            <Box color="gray.500" mr="2">
                <TbMoodSad size={24} />
            </Box>
            <Text fontWeight={600} color={'gray.500'} size="lg" textAlign={'center'}>
                No Active Downloads
            </Text>
        </Flex>
    );
}
