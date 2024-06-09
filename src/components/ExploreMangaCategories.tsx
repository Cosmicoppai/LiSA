import {
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button,
    Link,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import server from 'src/utils/axios';
import { openExternalUrl } from 'src/utils/fn';

import { ErrorMessage } from './ErrorMessage';
import { SkeletonCards } from './SkeletonCards';
import { AnimeCard } from './card';

async function getMangaList({ category }) {
    const { data } = await server.get(`top?type=manga&c=${category}&limit=0`);
    return data;
}
export function ExploreMangaCategories({ category }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['manga-list', category],
        queryFn: () => getMangaList({ category }),
    });
    const [isOpen, setIsOpen] = useState(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef();

    const exploreCardHandler = () => {
        setIsOpen(true);
    };
    if (error) return <ErrorMessage error={error} />;

    return (
        <>
            <ul
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    marginTop: '20px',
                }}>
                {isLoading ? (
                    <SkeletonCards />
                ) : (
                    data?.data?.map((data, index) => (
                        <AnimeCard
                            key={index}
                            onClick={exploreCardHandler}
                            cardType="manga"
                            data={{
                                poster: data.poster || data.img_url,
                                type: data.anime_type || data.type,
                                rank: data.rank,
                                episodes: data.episodes,
                                score: data.score,
                                title: data.title,
                            }}
                        />
                    ))
                )}
            </ul>
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
        </>
    );
}
