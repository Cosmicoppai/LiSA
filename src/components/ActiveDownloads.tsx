import {
    Box,
    Flex,
    Heading,
    Stack,
    Table,
    TableContainer,
    Text,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import { TbMoodSad } from 'react-icons/tb';

import { DownloadItem } from './downloadItem';
import { useGetDownloads } from './useGetDownloads';

export function ActiveDownloads() {
    const { data } = useGetDownloads();

    const downloadingList = useMemo(() => {
        const library = data?.length ? data : [];
        return library.filter((i) => i.status !== 'downloaded');
    }, [data]);

    return (
        <Stack flex={1} flexDirection="column">
            <Heading fontSize={'xl'} fontFamily={'body'}>
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
                <Box
                    sx={{
                        width: '100%',
                        p: 3,
                    }}>
                    {downloadingList.length === 0 ? (
                        <Flex alignItems={'center'} justifyContent="center">
                            <Box color="gray.500" mr="2">
                                <TbMoodSad size={24} />
                            </Box>
                            <Text
                                fontWeight={600}
                                color={'gray.500'}
                                size="lg"
                                textAlign={'center'}>
                                No Active Downloads
                            </Text>
                        </Flex>
                    ) : (
                        <TableContainer width={'100%'}>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th></Th>
                                        <Th fontSize={'16px'}>FILE NAME</Th>
                                        <Th fontSize={'16px'}>STATUS</Th>
                                        <Th fontSize={'16px'}>SPEED</Th>
                                        <Th fontSize={'16px'}>SIZE</Th>
                                        <Th></Th>
                                    </Tr>
                                </Thead>
                                {downloadingList.map((item, index) => (
                                    <DownloadItem key={index} data={item} />
                                ))}
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Stack>
        </Stack>
    );
}
