import { Skeleton } from '@chakra-ui/react';

export function SkeletonCards() {
    return (
        <>
            {Array(30)
                .fill(0)
                .map((data, index: number) => (
                    <Skeleton
                        key={index}
                        width={'300px'}
                        height={'450px'}
                        sx={{ padding: '1rem', margin: '10px auto' }}
                        padding={6}
                    />
                ))}
        </>
    );
}
