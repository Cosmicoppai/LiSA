import { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom/client";

import { ChakraProvider, useColorMode } from "@chakra-ui/react";
import { Provider } from "react-redux";

import "./styles/index.css";

import App from "./App";

import store from "./store/store";

import { client, SocketContext } from "src/context/socket";
import { theme } from "./styles/theme";

function ForceDarkMode({ children }: {
    children: ReactNode
}) {
    const { colorMode, toggleColorMode } = useColorMode();

    useEffect(() => {
        if (colorMode === "dark") return;
        toggleColorMode();
    }, [colorMode]);

    return <>{children}</>;
}

ReactDOM
    .createRoot(document.getElementById("root"))
    .render(
        <SocketContext.Provider value={client}>
            <ChakraProvider theme={theme}>
                <ForceDarkMode>
                    <Provider store={store}>
                        <App />
                    </Provider>
                </ForceDarkMode>
            </ChakraProvider>
        </SocketContext.Provider>
    );
