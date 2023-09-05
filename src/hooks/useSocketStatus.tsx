import { useState, useEffect } from "react";

const useSocketStatus = () => {
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    useEffect(() => {
        console.log("useSocketStatus", isSocketConnected);

        const interval = setInterval(() => {
            fetch("http://localhost:6969/", {
                mode: "no-cors",
            })
                .then(() => {
                    setIsSocketConnected(true);
                    clearInterval(interval);
                })
                .catch(() => isSocketConnected && setIsSocketConnected(false));
        }, 5000);

        return () => clearInterval(interval);
    }, [isSocketConnected]);

    return { isSocketConnected };
};

export default useSocketStatus;
