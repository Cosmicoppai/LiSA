import { useCallback, useEffect, useRef, useState } from 'react';

export function useFullScreenMode() {
    const ref = useRef<HTMLDivElement | null>(null);

    const [isFullScreen, setIsFullScreen] = useState(false);

    const handleFullScreen = useCallback(async () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else ref.current?.requestFullscreen();
    }, [ref]);

    const handleFullscreenchange = useCallback(
        (e: Event) => {
            console.log('full-screen-change-event', e);
            setIsFullScreen(!isFullScreen);
        },
        [setIsFullScreen, isFullScreen],
    );
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (['f', 'F'].includes(event.key)) handleFullScreen();
        },
        [handleFullScreen],
    );

    useEffect(() => {
        ref.current?.addEventListener('fullscreenchange', handleFullscreenchange);
        return () => ref.current?.removeEventListener('fullscreenchange', handleFullscreenchange);
    }, [ref, handleFullscreenchange]);

    useEffect(() => {
        window?.addEventListener('keydown', handleKeyDown);
        return () => window?.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return { fullScreenRef: ref, handleFullScreen, isFullScreen };
}
