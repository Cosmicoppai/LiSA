import { Box, Text } from '@chakra-ui/react';
import { BiArrowBack } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';

export function GoBackBtn() {
    const navigate = useNavigate();

    return (
        <Box
            onClick={() => navigate(-1)}
            alignSelf={'flex-start'}
            _hover={{
                cursor: 'pointer',
                opacity: 0.8,
            }}
            display="flex"
            justifyContent={'center'}
            alignItems={'center'}
            mr={6}
            height={'fit-content'}
            my={4}>
            <BiArrowBack />
            <Text ml={1}>Back</Text>
        </Box>
    );
}
