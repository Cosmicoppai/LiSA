import { Box, Stack, Text } from '@chakra-ui/react';

export function YoutubeVideo({ url }: { url: string | undefined }) {
    if (!url || typeof url !== 'string') {
        return (
            <Box>
                <Text>No trailer available</Text>
            </Box>
        );
    }

    const ytToEmbeded = url?.split('?')[1].slice(2);

    return (
        <Stack
            borderWidth="1px"
            borderRadius="lg"
            w={'100%'}
            justifyContent="space-between"
            boxShadow={'2xl'}>
            <div
                style={{
                    overflow: 'hidden',
                    paddingBottom: '56.25%',
                    position: 'relative',
                    height: 0,
                }}>
                <iframe
                    width="853"
                    style={{
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        // border: 0,
                    }}
                    height="480"
                    src={`https://www.youtube.com/embed/${ytToEmbeded}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
                />
            </div>
        </Stack>
    );
}
