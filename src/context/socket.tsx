import { ReactNode, createContext, useContext } from "react";

const socket: WebSocket = new WebSocket(process.env.REACT_APP_SOCKET_URL);

interface SocketContextType {
    socket: WebSocket;
}

export const SocketContext = createContext<SocketContextType>({
    socket,
});

export function SocketContextProvider({ children }: { children: ReactNode }) {
    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
    const context = useContext(SocketContext);
    if (!context) throw new Error("useSocketContext must be used inside a SocketContextProvider");
    return context;
}
