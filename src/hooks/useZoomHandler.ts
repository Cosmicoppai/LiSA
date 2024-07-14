import { useState } from 'react';

// Scale on 1 to 10

const MIN_ZOOM_LEVEL = 3;
const DEFAULT_ZOOM_LEVEL = 6;
const MAX_ZOOM_LEVEL = 9;

export function useZoomHandler() {
    const [scale, setScale] = useState(DEFAULT_ZOOM_LEVEL);

    function zoomIn() {
        setScale(Math.min(MAX_ZOOM_LEVEL, scale + 1));
    }

    function zoomOut() {
        setScale(Math.max(MIN_ZOOM_LEVEL, scale - 1));
    }

    return {
        scale,
        zoomIn,
        zoomOut,
        isZoomInDisabled: scale === MAX_ZOOM_LEVEL,
        isZoomOutDisabled: scale === MIN_ZOOM_LEVEL,
    };
}
