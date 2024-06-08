import {
    Box,
    Heading,
    Text,
    Stack,
    Image,
    Flex,
    Badge,
    Spacer,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button,
    Link,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { openExternalUrl } from 'src/utils/fn';
export function MangaCard({ data, query }) {
    const [isOpen, setIsOpen] = useState(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef();

    const exploreCardHandler = () => {
        setIsOpen(true);
    };

    return (
        <Box
            sx={{ display: 'flex', padding: '1rem', margin: '10px auto' }}
            onClick={exploreCardHandler}>
            <Box
                sx={{ cursor: 'pointer' }}
                role={'group'}
                p={6}
                maxW={'270px'}
                w={'270px'}
                bg={'gray.800'}
                boxShadow={'2xl'}
                rounded={'lg'}
                pos={'relative'}
                zIndex={1}>
                <Box
                    rounded={'lg'}
                    mt={-12}
                    pos={'relative'}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    _after={{
                        transition: 'all .3s ease',
                        content: '""',
                        w: 'full',
                        h: 'full',
                        pos: 'absolute',

                        top: 2,
                        left: 0,
                        backgroundImage: `url(${data.poster || data.img_url})`,
                        filter: 'blur(10px)',
                        zIndex: -1,
                    }}
                    _groupHover={{
                        _after: {
                            filter: 'blur(20px)',
                        },
                    }}>
                    <Image
                        rounded={'lg'}
                        // height={230}
                        // width={282}
                        objectFit={'fill'}
                        src={data.poster || data.img_url}
                        minWidth={'222px'}
                        minHeight={'316px'}
                    />
                </Box>
                <Stack pt={5} align={'center'}>
                    <Flex flex={1} width={'100%'}>
                        <Text color={'gray.500'} fontSize={'sm'} textTransform={'uppercase'}>
                            {data.anime_type}
                        </Text>
                        <Spacer />
                        <Box sx={{ display: 'flex' }}>
                            <Text color={'gray.500'} fontSize={'sm'} textTransform={'uppercase'}>
                                Rank
                            </Text>
                            <Text
                                fontWeight={500}
                                ml={1}
                                // color={"gray.500"}
                                fontSize={'sm'}
                                textTransform={'uppercase'}>
                                #{data.rank}
                            </Text>
                        </Box>
                    </Flex>

                    <Heading
                        fontSize={'xl'}
                        fontFamily={'body'}
                        fontWeight={500}
                        textAlign={'left'}
                        alignSelf={'flex-start'}
                        noOfLines={2}>
                        {data.title}
                    </Heading>
                    <Flex
                        pt={2}
                        direction={'row'}
                        justifyContent={'space-between'}
                        flex={1}
                        width={'100%'}>
                        <Badge
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '5px',
                                p: 1,
                            }}>
                            <Text color={'gray.300'}>
                                {data.volumes !== '?' ? `Volumes ${data.volumes}` : 'Running'}
                            </Text>
                        </Badge>
                    </Flex>
                </Stack>
            </Box>
            {/* AlertDialog for "Manga Not Published yet" message */}
            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Work in Progress ❤️
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            The manga reader and downloader will be rolled out in the next release
                            :)
                            <div style={{ marginTop: '10px' }}>
                                {/* Use onClick to open the link in the default browser */}
                                <Link
                                    color="teal.500"
                                    _hover={{ color: 'teal.600' }}
                                    cursor="pointer"
                                    onClick={() =>
                                        openExternalUrl('https://github.com/cosmicoppai/LiSA')
                                    }>
                                    Check Home Page of LiSA for the latest release
                                </Link>
                            </div>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Close
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}
