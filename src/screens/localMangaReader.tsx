import { Box, Center, Flex, Heading, Text } from '@chakra-ui/react';

import { GoBackBtn } from '../components/GoBackBtn';

export function LocalMangaReaderScreen() {
    return (
        <div
            style={{
                overflowY: 'hidden',
                maxHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}>
            <Center pt={6} w="100%">
                <Flex
                    flexDirection={'column'}
                    justifyContent="center"
                    alignItems={'center'}
                    w="95%"
                    margin={'0 auto'}>
                    <Box w="100%" h="100%">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <GoBackBtn />
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                }}>
                                <Heading fontSize={'2xl'} fontFamily={'body'}>
                                    Title
                                </Heading>
                                <Text fontWeight={600} color={'gray.500'} size="sm" ml={2} mt={1}>
                                    | {'Chapter Name'}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Flex>
            </Center>
            <div
                style={{
                    paddingBottom: 18,
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    overflowY: 'hidden',
                    rowGap: 5,
                    margin: '0 20px',
                }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <p>Downloaded Manga Reader - Under Development</p>
                </div>
            </div>
        </div>
    );
}
