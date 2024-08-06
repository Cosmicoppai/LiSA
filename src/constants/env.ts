export const envVariables = {
    SERVER_URL: import.meta.env.VITE_SERVER_URL,
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
} as const;

export const isViteDEV = import.meta.env.DEV;
export const isVitePROD = import.meta.env.PROD;
