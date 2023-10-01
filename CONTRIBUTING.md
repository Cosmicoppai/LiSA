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

-   Make sure python 3.10 and node 18 are installed.

-   Download [ffmpeg](https://ffmpeg.org/download.html).

-   Run all commands in root folder.

-   Powershell is recommended.

### Backend

1. Create and activate the virtual environment

    ```bash
    python -m venv ./env
    ./env/Script/activate
    ```

2. Install the dependencies using the `requirements.txt` and `build_requirements.txt` files.

    ```bash
    pip install -r ./requirements.txt
    pip install -r ./build_requirements.txt
    ```

3. Add `ffmpeg` executable to root folder or in `PATH` Var.

### Frontend

1. Install Node modules

    ```bash
    npm i
    ```

2. Create `.env` & paste the following content

    ```bash
    REACT_APP_SERVER_URL=http://localhost:6969
    REACT_APP_SOCKET_URL=ws://localhost:9000
    ```

3. Start dev app using
    ```bash
    npm start
    ```

### Build package

-   For Windows
  
    ```bash
    npm run build:package:windows
    ```

Note:

> Make sure to allow app to run as admin and allow incomming port forwarding on (`6969`, `9000`).
