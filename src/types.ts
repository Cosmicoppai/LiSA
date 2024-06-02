export type TCookieReq = {
    data: {
        type: "cookie_request";
        site_url: string;
        user_agent: string;
    };
};
