import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { TbMoodSad } from 'react-icons/tb';

import { DownloadItem } from './downloadItem';
import { useGetActiveDownloads } from './useGetDownloads';

export function ActiveDownloads() {
    const { data } = useGetActiveDownloads();

    return (
        <Stack flex={1} flexDirection="column">
            <Heading fontSize={'xl'} py={2} fontFamily={'body'}>
                Active Downloads
            </Heading>

            <Stack
                flex={1}
                flexDirection="column"
                alignItems="flex-start"
                pt={2}
                p={4}
                minWidth={'400px'}>
                {data.length ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            rowGap: 20,
                        }}>
                        {data.map((item) => (
                            <>{item.episodes?.map((i) => <DownloadItem key={i.id} data={i} />)}</>
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
