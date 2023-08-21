const { spawn, spawnSync } = require("child_process");
const { get } = require("axios");

const { getRandomPort } = require('../utilities/getRandomPort')

/**
 * @namespace Starter
 * @description - Scripts to start Electron, React, and Python.
 */
class Starter {
  /**
   * @description - Starts developer mode.
   * @memberof Starter
   */
  developerMode = async () => {
    // Child spawn options for console
    const spawnOptions = {
      hideLogs: { detached: false, shell: true, stdio: "pipe" },
      showLogs: { detached: false, shell: true, stdio: "inherit" },
    };

    /**
     * Method to get first port in range of 3001-3999,
     * Remains unused here so will be the same as the
     * port used in main.js
     */
    // const port = await getPort({
    //   port: getPort.makeRange(3001, 3999)
    // });

    // Kill anything that might using required React port
    // spawnSync('npx kill-port 3000', spawnOptions.hideLogs);

    // Start & identify React & Electron processes

    const { port: REACT_PORT = 3967 } = await getRandomPort();
    const { port: PYTHON_SERVER = 6969 } = await getRandomPort();
    // console.log(REACT_PORT, PYTHON_SERVER);

    spawn(`cross-env BROWSER=none PORT=${REACT_PORT} REACT_APP_SERVER_URL=http://localhost:${PYTHON_SERVER} react-scripts start `, spawnOptions.showLogs);
    spawn(`npx electron main ${REACT_PORT} ${PYTHON_SERVER}`, spawnOptions.showLogs);
    // Kill processes on exit
    const exitOnEvent = (event) => {
      process.once(event, () => {
        try {
          // These errors are expected since the connection is closing
          const expectedErrors = ["ECONNRESET", "ECONNREFUSED"];

          // Send command to Flask server to quit and close
          get(`http://localhost:${REACT_PORT}/quit`).catch(
            (error) =>
              !expectedErrors.includes(error.code) && console.log(error)
          );
        } catch (error) {
          // This errors is expected since the process is closing
          if (error.code !== "ESRCH") console.error(error);
        }
      });
    };

    // Set exit event handlers
    [
      "exit",
      "SIGINT",
      "SIGTERM",
      "SIGUSR1",
      "SIGUSR2",
      "uncaughtException",
    ].forEach(exitOnEvent);
  };
}

module.exports = { Starter };
