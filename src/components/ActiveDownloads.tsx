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
import { TbMoodSad } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { pauseLiveDownload, resumeLiveDownload } from 'src/store/actions/animeActions';

import { DownloadList } from './downloadList';

export function ActiveDownloads({ filesStatus, cancelDownloadHandler }) {
    const dispatch = useDispatch();

    const pauseDownloadHandler = (id) => {
        pauseLiveDownload(id);
        // sleep(5000);
        // @ts-ignore
        dispatch(getDownloadHistory());
    };
    const resumeDownloadHandler = (id) => {
        resumeLiveDownload(id);
    };

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
                    {filesStatus && Object.entries(filesStatus).length === 0 ? (
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
                                <DownloadList
                                    filesStatus={filesStatus}
                                    cancelDownloadHandler={cancelDownloadHandler}
                                    pauseDownloadHandler={pauseDownloadHandler}
                                    resumeDownloadHandler={resumeDownloadHandler}
                                />
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Stack>
        </Stack>
    );
}
