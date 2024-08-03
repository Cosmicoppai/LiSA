# 🤝 Contributing

Thank you for help improving LiSA. All kinds of contributions are welcome. We are open to suggestions!

Please submit an Issue or even better a PR and We'll review :)

## 📖 Development Setup

### Clone Repo

-   Clone the project using

    ```bash
    git clone https://github.com/Cosmicoppai/LiSA.git
    ```

### Prerequisites / Dependencies

-   Make sure [Python 3.10](https://www.python.org/downloads/release/python-31011/) and [Node.js](https://nodejs.org/en/download/package-manager) >=18 are installed.

-   Download [ffmpeg](https://ffmpeg.org/download.html).

-   Run all commands in root folder.

-   Powershell is recommended for windows.

### Backend

1. Create python virtual environment

    ```bash
    python -m venv ./venv

    # OR
    python3.10 -m venv ./venv
    ```

2. Activate the virtual environment

    ```bash
    # For Windows
    ./venv/Scripts/activate

    # For Linux & macOS
    source ./venv/bin/activate
    ```

3. Install the dependencies using the `requirements.txt` file.

    ```bash
    pip install -r ./requirements.txt
    ```

4. Add `ffmpeg` executable to root folder or in `PATH` Var.

### Frontend

1. Create `.env` & paste the following content

    ```bash
    VITE_SERVER_URL=http://localhost:6969
    VITE_SOCKET_URL=ws://localhost:9000
    ```

3. Install yarn
    ```bash
    npm i -g yarn
    ```

3. Install Node modules

    ```bash
    yarn
    ```

4. Start dev app using
    ```bash
    yarn start
    ```

### Build package

- Build Backend
    ```bash
    yarn build:python
    ```

- Make distributable packages
    ```bash
    yarn make
    ```


Note:

> Make sure to allow app to run as admin and allow incoming port forwarding on (`6969`, `9000`).
