import { Box, Heading, Text, Stack, Image, Flex, Spacer, Badge } from '@chakra-ui/react';
import { useMemo } from 'react';
import { AiFillStar } from 'react-icons/ai';

export function AnimeCard({
    onClick,
    data,
    cardType,
}: {
    onClick: () => void;
    cardType: 'manga' | 'anime';
    data: {
        poster: string;
        type: string;
        rank?: number | string;
        episodes: string | number;

        score?: string | number;
        title: string;
    };
}) {
    const epTxt = useMemo(() => {
        if (data.episodes === '?') return 'Running';

        if (cardType === 'anime') return `Ep ${data.episodes}`;

        if (cardType === 'manga') return `Volumes ${data.episodes}`;

        return '';
    }, [cardType, data]);

    return (
        <Box sx={{ display: 'flex', padding: '1rem', margin: '10px auto' }} onClick={onClick}>
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
                        backgroundImage: `url(${data.poster})`,
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
                        src={data.poster}
                        minWidth={'222px'}
                        minHeight={'316px'}
                    />
                </Box>
                <Stack pt={5} align={'center'}>
                    <Flex flex={1} width={'100%'}>
                        <Text color={'gray.500'} fontSize={'sm'} textTransform={'uppercase'}>
                            {data.type}
                        </Text>
                        <Spacer />
                        {data.rank ? (
                            <Box sx={{ display: 'flex' }}>
                                <Text
                                    color={'gray.500'}
                                    fontSize={'sm'}
                                    textTransform={'uppercase'}>
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
                        ) : null}
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
                        {data.score ? (
                            <Box display={'flex'} alignItems="center" justifyContent={'center'}>
                                <AiFillStar color="#FDCC0D" fontSize={'20px'} />
                                <Text ml={'5px'} fontWeight={800} fontSize={'sm'} mt={0}>
                                    {data.score}
                                </Text>
                            </Box>
                        ) : null}
                        <Badge
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '5px',
                                p: 1,
                            }}>
                            <Text color={'gray.300'}>{epTxt}</Text>
                        </Badge>
                    </Flex>
                </Stack>
            </Box>
        </Box>
    );
}
