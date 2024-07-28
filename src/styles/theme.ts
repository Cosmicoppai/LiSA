import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
    initialColorMode: 'dark',
    useSystemColorMode: false,
    styles: {
        global: {
            body: {
                maxHeight: '100vh',
            },
        },
    },
    colors: {
        brand: {
            100: '#edf2f7',
            900: '#1a202c',
        },
        font: {
            main: '#edf2f7',
        },
    },
});
