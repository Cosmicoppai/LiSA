import { ReactNode, createContext, useContext, useState } from 'react';

type TAppMode = 'anime' | 'manga';

interface AppContextType {
    mode: TAppMode;
    setMode: (mode: TAppMode) => void;
}

export const AppContext = createContext<AppContextType>({
    mode: 'anime',
    setMode: () => {},
});

export function AppContextProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<TAppMode>('anime');

    return <AppContext.Provider value={{ mode, setMode }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used inside a AppContextProvider');
    return context;
}
