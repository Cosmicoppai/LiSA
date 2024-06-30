import { Box, Tooltip } from '@chakra-ui/react';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

export function GoBackBtn() {
    const navigate = useNavigate();

    return (
        <Tooltip label={'Go Back'} placement="right">
            <Box
                onClick={() => navigate(-1)}
                alignSelf={'flex-start'}
                _hover={{
                    cursor: 'pointer',
                    opacity: 0.8,
                    backgroundColor: '#F7FAFC',
                    color: '#1A202C',
                }}
                backgroundColor={'brand.900'}
                style={{
                    padding: 10,
                    borderRadius: 9999,
                }}
                display="flex"
                justifyContent={'center'}
                alignItems={'center'}
                mr={6}
                height={'fit-content'}
                my={4}>
                <IoArrowBack size={28} />
            </Box>
        </Tooltip>
    );
}
