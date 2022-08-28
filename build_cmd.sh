#!/usr/bin/env sh

pip install -r ./build_requirements.txt || exit

pyinstaller main.spec

