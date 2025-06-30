// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { App } from './App';
import { SocketContextProvider } from './context/socket';
import { AppContextProvider } from './context/app';
import { theme } from './styles/theme';

import './styles/index.css';

const queryClient = new QueryClient();

// Fixes: Even if setting initialColorMode as dark, localStorage chakra-ui-color-mode key sets to 'light'
function ForceDarkMode() {
    const { colorMode, toggleColorMode } = useColorMode();

    useEffect(() => {
        if (colorMode === 'dark') return;
        toggleColorMode();
    }, [colorMode]);

    return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ChakraProvider theme={theme}>
        <ForceDarkMode />
        <SocketContextProvider>
            <QueryClientProvider client={queryClient}>
                <AppContextProvider>
                    <App />
                </AppContextProvider>
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />
            </QueryClientProvider>
        </SocketContextProvider>
    </ChakraProvider>,
);
