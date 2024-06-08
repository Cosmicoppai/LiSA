import { ReactNode, createContext, useContext, useEffect, useState, useRef } from 'react';

interface SocketContextType {
    socket: WebSocket | null;
    isSocketConnected: boolean;
}

const MAX_RETRIES = 10;
const RETRY_DELAY = 2000;

export const SocketContext = createContext<SocketContextType>({
    socket: null,
    isSocketConnected: false,
});

export function SocketContextProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const isSocketConnected = socket?.readyState === 1;

    const retryCountRef = useRef(0);

    const connectWebSocket = () => {
        const websocket = new WebSocket(process.env.REACT_APP_SOCKET_URL);

        websocket.onopen = () => {
            setSocket(websocket);

            retryCountRef.current = 0; // Reset retry count on successful connection
        };

        websocket.onclose = () => {
            retryConnection();
        };

        websocket.onerror = () => {
            websocket.close();
        };
    };

    const retryConnection = () => {
        if (retryCountRef.current < MAX_RETRIES) {
            setTimeout(() => {
                retryCountRef.current += 1;
                connectWebSocket();
            }, RETRY_DELAY);
        }
    };

    useEffect(() => {
        connectWebSocket();

        // close socket on unmount
        return () => {
            socket?.close();
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
    if (!context) throw new Error('useSocketContext must be used inside a SocketContextProvider');
    return context;
}
