import { Box } from '@chakra-ui/react';
import { RouterProvider, createHashRouter, Outlet, ScrollRestoration } from 'react-router-dom';

import './styles/App.css';

import { Navbar } from './components/navbar';
import { useHandleInitialSocketConnection } from './hooks/useHandleInitialSocketConnection';
import { DownloadScreen } from './screens/DownloadsScreen';
import { MyListScreen } from './screens/MyListScreen';
import { NotFoundScreen } from './screens/NotFoundScreen';
import { AnimeDetailsScreen } from './screens/animeDetailsScreen';
import { ExploreScreen } from './screens/exploreScreen';
import { HomeScreen } from './screens/homeScreen';
import { InbuiltPlayerScreen } from './screens/inbuiltPlayerScreen';
import { MangaDetailsScreen } from './screens/mangaDetailsScreen';
import { MangaReaderScreen } from './screens/mangaReaderScreen';
import { SettingScreen } from './screens/settingScreen';

function AppLayout() {
    return (
        <>
            <Box
                h={'100%'}
                w="70px"
                position={'fixed'}
                zIndex={1}
                top={0}
                left={0}
                overflowX={'hidden'}
                maxWidth={'70px'}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Navbar />
            </Box>
            <Box bg={'gray.900'} marginLeft={'70px'} minHeight={'100vh'}>
                <Outlet />
            </Box>
            <ScrollRestoration />
        </>
    );
}

const router = createHashRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                path: '/',
                element: <HomeScreen />,
            },
            {
                path: 'explore',
                element: <ExploreScreen />,
            },
            {
                path: 'download',
                element: <DownloadScreen />,
            },
            {
                path: 'mylist',
                element: <MyListScreen />,
            },
            {
                path: 'setting',
                element: <SettingScreen />,
            },
            {
                path: 'anime-details',
                element: <AnimeDetailsScreen />,
            },
            {
                path: 'manga-details',
                element: <MangaDetailsScreen />,
            },
            {
                path: 'manga-reader',
                element: <MangaReaderScreen />,
            },
            {
                path: 'play',
                element: <InbuiltPlayerScreen />,
            },
            {
                path: '*',
                element: <NotFoundScreen />,
            },
        ],
    },
]);

export function App() {
    useHandleInitialSocketConnection();

    return <RouterProvider router={router} />;
}
