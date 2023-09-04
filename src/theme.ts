import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
    initialColorMode: "light",
    useSystemColorMode: false,
    fonts: {
        heading: `'Montserrat', sans-serif`,
        body: `'Montserrat', sans-serif`,
    },
    styles: {
        global: {
            body: {
                maxHeight: "100vh",
            },
        },
    },
    colors: {
        brand: {
            100: "#edf2f7",
            900: "#1a202c",
        },
        font: {
            main: "#edf2f7",
        },
    },
});
