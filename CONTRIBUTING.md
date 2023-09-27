# 🤝 Contributing

Thank you for help improving LiSA. All kinds of contributions are welcome. We are open to suggestions!

Please submit an Issue or even better a PR and We'll review :)

## 📖 Installation

### Environment Tested on

-   Tested on Windows 8, 10 & 11.

### Building From Source

-   Clone the project using

    ```cli
    git clone https://github.com/Cosmicoppai/LiSA.git
    ```

#### Prerequisites / Dependencies

-   Make sure python 3.10 and node 18 are installed.

-   [ffmpeg](https://ffmpeg.org/download.html)

#### Installing

1. Create and activate the virtual environment

    ```cli
    python -m venv ./env
    env/Script/activate
    ```

2. Install the dependencies using the `requirements.txt` and `build_requirements.txt` files.

    ```cli
    pip install -r ./requirements.txt
    pip install -r ./build_requirements.txt
    ```

3. Create `.env` & paste the following content

    ```dotenv
    REACT_APP_SERVER_URL=http://localhost:6969
    REACT_APP_SOCKET_URL=ws://localhost:9000
    ```

4. Install Node modules

    ```
    npm install
    ```

5. Add `ffmpeg` executable to `root folder` or in `PATH` Var.

6. Build package using

    ```cli
    npm run build:package:windows
    ```

Note:

> Make sure to allow app to run as admin and allow incomming port forwarding on (`6969`, `9000`).
