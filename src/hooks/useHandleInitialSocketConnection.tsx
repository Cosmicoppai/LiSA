import { useCallback, useEffect } from "react";
import { useSocketContext } from "../context/socket";
import { TCookieReq } from "../types";

export function useHandleInitialSocketConnection() {
    const { socket, isSocketConnected } = useSocketContext();

    const handleSocketConnection = useCallback((ev: MessageEvent<any>) => {
        const msg: TCookieReq = typeof ev?.data === "string" ? JSON.parse(ev?.data) : null;

        console.log("socket event", msg);
        if (msg?.data?.type === "cookie_request") {
            // @ts-ignore
            window?.electronAPI?.getDomainCookies(msg).then((response) => {
                socket.send(
                    JSON.stringify({
                        type: "cookie_request",
                        data: response,
                    })
                );
            });
        }
    }, []);

    useEffect(() => {
        if (!socket || !isSocketConnected) return;

        socket.send(JSON.stringify({ type: "connect" }));
        console.log("WebSocket Client Connected");

        socket.addEventListener("message", handleSocketConnection);

        return () => socket.removeEventListener("message", handleSocketConnection);
    }, [isSocketConnected, socket, window]);
}
