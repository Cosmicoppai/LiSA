import { Flex, Icon, Tooltip } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuListPlus, LuListX } from 'react-icons/lu';
import server from 'src/utils/axios';

export function AddToWatchListManga({
    mylist,
    session,
    manga_id,
    total_chps,
    genres,
    poster,
    status,
}) {
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        setIsAdded(mylist);
    }, [mylist]);

    async function addToMyList() {
        await server.post(
            `/readlist`,
            {
                session,
                total_chps,
                genres,
                poster,
                status,
            },
            {
                // @ts-ignore
                'Content-Type': 'application/json',
            },
        );
        setIsAdded(true);
    }

    async function removefromMyList() {
        if (manga_id) await server.delete(`/readlist?manga_id=${manga_id}`);
        setIsAdded(false);
    }

    return (
        <Tooltip label={isAdded ? 'Remove from My List' : 'Add to My List'} placement="top">
            <Flex
                cursor={'pointer'}
                borderRadius={14}
                justifyContent="center"
                alignItems="center"
                p={2}
                bg={'brand.900'}
                onClick={isAdded ? removefromMyList : addToMyList}>
                <Icon as={isAdded ? LuListX : LuListPlus} w={8} h={8} />
            </Flex>
        </Tooltip>
    );
}
