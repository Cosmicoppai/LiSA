import { Center, Stack } from '@chakra-ui/react';

import { ActiveDownloads } from '../components/ActiveDownloads';
import { DownloadsHistory } from '../components/DownloadsHistory';

export function DownloadScreen() {
    return (
        <Center py={6} w="100%">
            <Stack flex={1} flexDirection="column" rowGap={5} p={1} pt={2} maxWidth={'90%'}>
                <ActiveDownloads />
                <DownloadsHistory />
            </Stack>
        </Center>
    );
}
