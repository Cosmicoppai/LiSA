import { Center, Stack } from '@chakra-ui/react';
import { useFeatureAvailable } from 'src/utils/fn';

import { ActiveDownloads } from '../components/ActiveDownloads';
import { DownloadsHistory } from '../components/DownloadsHistory';

export function DownloadScreen() {
    const { isDownloadFeatureAvailable } = useFeatureAvailable();

    if (isDownloadFeatureAvailable)
        return (
            <Center py={6} w="100%">
                <Stack flex={1} flexDirection="column" rowGap={5} p={1} pt={2} maxWidth={'90%'}>
                    <ActiveDownloads />
                    <DownloadsHistory />
                </Stack>
            </Center>
        );

    return (
        <Center py={6} w="100%" h={'100vh'}>
            <p
                style={{
                    fontSize: 20,
                }}>
                Downloads feature is not available for MacOS.
            </p>
        </Center>
    );
}
