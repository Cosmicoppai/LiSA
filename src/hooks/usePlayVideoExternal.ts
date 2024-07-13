import { useMutation } from '@tanstack/react-query';
import server from 'src/utils/axios';

export function usePlayVideoExternal() {
    const playVideoExternalMutation = useMutation({
        mutationFn: (data: any) => {
            return server.post('/stream', data, {
                // @ts-ignore
                'Content-Type': 'application/json',
            });
        },
    });

    return { playVideoExternalMutation };
}
