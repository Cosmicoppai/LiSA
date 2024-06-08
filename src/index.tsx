import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { SocketContextProvider } from 'src/context/socket';

import './styles/index.css';

import { App } from './App';
import store from './store/store';
import { theme } from './styles/theme';

function ForceDarkMode({ children }: { children: ReactNode }) {
    const { colorMode, toggleColorMode } = useColorMode();

    useEffect(() => {
        if (colorMode === 'dark') return;
        toggleColorMode();
    }, [colorMode]);

    return <>{children}</>;
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
    <ChakraProvider theme={theme}>
        <ForceDarkMode>
            <SocketContextProvider>
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <App />
                    </Provider>
                </QueryClientProvider>
            </SocketContextProvider>
        </ForceDarkMode>
    </ChakraProvider>,
);
