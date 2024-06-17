import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { SocketContextProvider } from 'src/context/socket';

import './styles/index.css';

import { App } from './App';
import { AppContextProvider } from './context/app';
import store from './store/store';
import { theme } from './styles/theme';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ChakraProvider theme={theme}>
        <SocketContextProvider>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AppContextProvider>
                        <App />
                    </AppContextProvider>
                </Provider>
            </QueryClientProvider>
        </SocketContextProvider>
    </ChakraProvider>,
);
