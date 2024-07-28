export type TCookieReq = {
    type: 'cookie_request';
    data: {
        site_url: string;
        user_agent: string;
    };
};

interface ElectronAPI {
    getDomainCookies: (data: any) => Promise<any>;
    openExternal: (data: any) => Promise<any>;
    showItemInFolder: (data: any) => Promise<any>;
    getPlatformOS: () => Promise<NodeJS.Platform>;
}
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
