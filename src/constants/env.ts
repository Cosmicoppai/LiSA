export const envVariables = {
    SERVER_URL: import.meta.env.VITE_SERVER_URL || "http://localhost:6969",
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "ws://localhost:9000",
} as const;

export const isViteDEV = import.meta.env.DEV;
export const isVitePROD = import.meta.env.PROD;
