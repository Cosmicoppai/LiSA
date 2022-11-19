import React from "react";
var W3CWebSocket = require("websocket").w3cwebsocket;

export const client = new W3CWebSocket("ws://localhost:9000");

export const SocketContext = React.createContext();