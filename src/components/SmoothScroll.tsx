import { ReactLenis, useLenis } from 'lenis/dist/lenis-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function SmoothScroll({ children }) {
    const lenis = useLenis();
    const location = useLocation();

    useEffect(() => {
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        }
    }, [location.key]);

    return <ReactLenis root>{children}</ReactLenis>;
}
