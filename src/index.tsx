import { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom/client";

import { ChakraProvider, useColorMode } from "@chakra-ui/react";
import { Provider } from "react-redux";

import "./styles/index.css";

import App from "./App";

import store from "./store/store";

import { SocketContextProvider } from "src/context/socket";
import { theme } from "./styles/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function ForceDarkMode({ children }: { children: ReactNode }) {
    const { colorMode, toggleColorMode } = useColorMode();

    useEffect(() => {
        if (colorMode === "dark") return;
        toggleColorMode();
    }, [colorMode]);

    return <>{children}</>;
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
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
    </ChakraProvider>
);
