# 🤝 Contributing

Thank you for contributing to LiSA! We appreciate your contributions, whether they are bug reports, feature suggestions, or code improvements.

Feel free to submit an [issue](https://github.com/Cosmicoppai/LiSA/issues/new) or, even better a pull request, and we’ll review :)

## 📖 Development Setup

### Prerequisites / Dependencies

- Make sure [Python 3.10.x](https://www.python.org/downloads/release/python-31014) || [Python 3.11.x](https://www.python.org/downloads/release/python-3119) && [Node.js >=18](https://nodejs.org/en/download/package-manager) are installed.

- Run all commands in the project root.

- Powershell is recommended for windows.

### Clone Repo

- If you are a collaborator, clone the repository.
    ```bash
    git clone https://github.com/Cosmicoppai/LiSA.git
    ```
- If you are an external contributor, [fork](https://github.com/Cosmicoppai/LiSA/fork) this repository to your account and then clone it to your local device.

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

4. Run backend as a separate process `(if you are making changes in the backend directory)`.
    ```bash
    python backend/LiSA.py
    ```


### Frontend

1. Create `.env` & paste the following content

    ```bash
    VITE_SERVER_URL=http://localhost:6969
    VITE_SOCKET_URL=ws://localhost:9000
    ```

2. Install yarn
    ```bash
    npm i -g yarn
    ```

3. Install node modules

    ```bash
    yarn
    ```

4. Start dev app
    ```bash
    yarn start
    ```

### Build package

- Build backend
    ```bash
    yarn build:backend
    ```

- Make distributable packages
    ```bash
    yarn make

    # For additional debug logs
    
    DEBUG=* yarn make
    DEBUG=electron-* yarn make
    ```
