import axios from 'axios';
import { envVariables } from 'src/constants/env';

const server = axios.create({
    baseURL: envVariables.SERVER_URL,
});

server.interceptors.request.use(
    (config) => {
        try {
            return config;
        } catch {
            return null;
        }
    },
    (error) => Promise.reject(error),
);

export default server;
