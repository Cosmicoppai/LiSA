import { Box, Image, Text } from '@chakra-ui/react';
// @ts-ignore
import NotFoundImg from 'src/assets/img/not-found.png';

export function NotFoundScreen() {
    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <Box textAlign="center" py={10} px={6}>
                <Image
                    src={NotFoundImg}
                    alt="not-found"
                    height={200}
                    display={'flex'}
                    justifyContent={'center'}
                    margin={'0 auto'}
                />
                <Text fontSize="18px" mt={3} mb={2}>
                    Page Not Found
                </Text>
                <Text color={'gray.500'} mb={6}>
                    The result you're looking for does not seem to exist
                </Text>
            </Box>
        </div>
    );
}
