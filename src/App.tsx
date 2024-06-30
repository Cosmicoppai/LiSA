import { Box, Grid, GridItem } from '@chakra-ui/react';
import { HashRouter, Routes, Route } from 'react-router-dom';

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

export function App() {
    useHandleInitialSocketConnection();

    return (
        <HashRouter>
            <Grid templateColumns="repeat(1, 0.04fr 1fr)" w={'100%'} h={'100%'} overflow={'hidden'}>
                <GridItem
                    w="100%"
                    h={'100vh'}
                    maxWidth={'70px'}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Navbar />
                </GridItem>
                <GridItem
                    w="100%"
                    h={'100vh'}
                    bg={'gray.900'}
                    sx={{
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                            borderRadius: '8px',
                            backgroundColor: `rgba(255, 255, 255, 0.2)`,
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: `rgba(255, 255, 255, 0.2)`,
                        },
                    }}>
                    <Box sx={{ width: '100%', height: '100%' }}>
                        <Routes>
                            <Route path="/" element={<HomeScreen />} />
                            <Route path="explore" element={<ExploreScreen />} />
                            <Route path="download" element={<DownloadScreen />} />
                            <Route path="mylist" element={<MyListScreen />} />
                            <Route path="setting" element={<SettingScreen />} />

                            <Route path="anime-details" element={<AnimeDetailsScreen />} />
                            <Route path="manga-details" element={<MangaDetailsScreen />} />
                            <Route path="manga-reader" element={<MangaReaderScreen />} />
                            <Route path="play" element={<InbuiltPlayerScreen />} />
                            <Route path="*" element={<NotFoundScreen />} />
                        </Routes>
                    </Box>
                </GridItem>
            </Grid>
        </HashRouter>
    );
}
