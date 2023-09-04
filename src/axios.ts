import axios from "axios";

const server = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

server.interceptors.request.use(
  (config) => {
    try {
      return config;
    } catch {
      return null;
    }
  },
  (error) => Promise.reject(error)
);

export default server;



