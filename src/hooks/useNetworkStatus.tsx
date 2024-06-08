import { useState, useEffect } from "react";

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);

    function updateOnlineStatus() {
        setIsOnline(navigator.onLine);
    }

    useEffect(() => {
        if (!window) return;

        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOnlineStatus);

        return () => {
            window.removeEventListener("online", updateOnlineStatus);
            window.removeEventListener("offline", updateOnlineStatus);
        };
    }, [window]);

    return { isOnline };
}
