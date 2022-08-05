import React, { useState, useContext, useCallback, useEffect } from "react";
import { w3cwebsocket } from "websocket";
var W3CWebSocket = require("websocket").w3cwebsocket;
const client = new W3CWebSocket("ws://localhost:9000");

const DownloadScreen = () => {
  useEffect(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
      client.send(JSON.stringify({ type: "connect" }));
    };
    client.onmessage = (message) => {
      console.log(JSON.parse(message.data));
    };
  }, []);

  return <div>DownloadScreen</div>;
};

export default DownloadScreen;
