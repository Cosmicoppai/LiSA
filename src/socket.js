import React from "react";
var W3CWebSocket = require("websocket").w3cwebsocket;

export const client = new W3CWebSocket(process.env.REACT_APP_SOCKET_URL);

export const SocketContext = React.createContext();