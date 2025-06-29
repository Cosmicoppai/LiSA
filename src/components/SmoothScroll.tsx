import { ReactLenis } from 'lenis/dist/lenis-react';

export function SmoothScroll({ children }) {
    return <ReactLenis root>{children}</ReactLenis>;
}
