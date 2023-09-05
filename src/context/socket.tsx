import { createContext, useContext } from "react";

const W3CWebSocket = require("websocket").w3cwebsocket;

export const client = new W3CWebSocket(process.env.REACT_APP_SOCKET_URL);

export const SocketContext = createContext<{
    readyState?: any,
    send?: any,
    close?: any
}>({});

export function useSocketContext() {
    const context = useContext(SocketContext)
    if (!context) throw Error('useSocketContext must be used inside an SocketContextProvider')
    return context
}