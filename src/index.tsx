import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnimeDetailsScreen from "./screens/animeDetailsScreen";
import SettingScreen from "./screens/settingScreen";
import { HomeScreen } from "./screens/homeScreen";
import { ChakraProvider, useColorMode } from "@chakra-ui/react";
import { theme } from "./theme";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";
import { client, SocketContext } from "./socket";

function ForceDarkMode(props) {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    if (colorMode === "dark") return;
    toggleColorMode();
  }, [colorMode]);

  return props.children;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
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
