import { ReactNode, createContext, useContext, useEffect, useState } from "react";

interface SocketContextType {
    socket: WebSocket | null;
    isSocketConnected: boolean;
}

export const SocketContext = createContext<SocketContextType>({
    socket: null,
    isSocketConnected: false,
});

export function SocketContextProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const isSocketConnected = socket?.readyState === 1;

    useEffect(() => {
        const websocket: WebSocket = new WebSocket(process.env.REACT_APP_SOCKET_URL);

        websocket.onopen = (event: Event) => {
            setSocket(websocket);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isSocketConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocketContext() {
    const context = useContext(SocketContext);
    if (!context) throw new Error("useSocketContext must be used inside a SocketContextProvider");
    return context;
}
