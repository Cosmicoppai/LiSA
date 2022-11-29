![Banner](src/assests/images/home_screen_logo.png)

![GitHub contributors](https://img.shields.io/github/contributors/cosmicoppai/LiSA?color=lightgrey)
[![GitHub forks](https://img.shields.io/github/forks/cosmicoppai/LiSA?color=lightgrey)](https://github.com/Cosmicoppai/LiSA/network)
[![GitHub stars](https://img.shields.io/github/stars/cosmicoppai/LiSA?color=lightgrey)](https://github.com/Cosmicoppai/LiSA/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Cosmicoppai/LiSA?color=lightgrey)](https://github.com/Cosmicoppai/LiSA/issues)
[![MIT License](https://img.shields.io/badge/license-MIT-lightgrey)](./LICENSE)

![image](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue)
![image](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![image](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

# LiSA

> A Desktop application, for streaming and downloading your favourite anime.

## CONTENTS OF THE FILE

* [Features](#🚀-features)
* [Dependencies](#dependencies)
* [Download](#🤗-download)
* [Installation](#📖-installation)
* [Demo](#😁-demo)
* [Future Plans](#future-plans)
* [FAQ](#🤔-faq)
* Appendix
    * [Supported Webistes](#😶‍🌫️-supported-websites)
    * [Supported External Video Player](#📺-supported-external-players)
    * [Filters](#filters)
* [Contributing](#🤝-contributing)
* [Support](#⭐-support)
* [License](#🪪-license)
* [Disclaimer](#disclaimer)

## 🚀 Features

* A User Friendly Interface
* Download anime from [supported websites](#😶‍🌫️-supported-websites) in multiple resoultions and languages
* Batch Download
* Stream anime on the inbuilt player and your favourite [external video player](#📺-supported-external-players)
* Explore anime based on different [filters](#filters)
* Download Manager
* Library to view pre-downloaded episodes and active downloads
* Recomendation System

<br>

## Dependencies

* [ffmpeg](https://ffmpeg.org/download.html)

<br>

## 🤗 Download

[![Total Downloads](https://img.shields.io/github/downloads/Cosmicoppai/LiSA/total.svg?style=for-the-badge)](https://github.com/Cosmicoppai/LiSA/releases)

> Note: Currently only windows executables is provided.

Download the [latest release](https://github.com/Cosmicoppai/LiSA/releases) from here and extract the zip file.

## 📖 Installation

### Building From Source

* Clone the project using

```cli
git clone https://github.com/Cosmicoppai/LiSA.git
```

#### Prerequisites

* Make sure python 3.10 and node 18 are installed.

#### Installing

1) Create and activate the virtual environment

```cli
python -m venv ./env
env/Script/activate
```

2) Download the dependancies using requirements.txt file

```cli
pip install -r ./requirements.txt
pip install -r ./buid_requirements.txt
```

3) Install Node modules

```cli
npm install
```

4) Add ffmpeg executable to root folder or in PATH Var.

5) Build package using

```cli
npm run build:package:windows
```

Note:
> Make sure to allow app to run as admin and allow incomming port forwarding on (```6969```, ```9000```).

<br>

### Environment Tested on

* Tested on Windows 8, 10 & 11.

<br>

## 😁 Demo

### Screenshots

![search](demo_images/ss_search.png)
*Search results for Bakuman*

![Anime Details Page](demo_images/ss_anime_details.png)
*Episode details of Bakuman*

![Video Player](demo_images/ss_play_episode.png)
*Built-in Video Player on LiSA*

![Download Manager and Library](demo_images/ss_download_manager.png)
*Download Manager and Library*

![Explore Page](demo_images/ss_explore.png)
*Explore Page with filters*

*Demo*

## Future Plans

* UI Improvement
* Watchlist
* Continue Watching
* Download episodes with custom range

## 🤔 FAQ

### Q) How can I download detective conan's episodes from 10 to 30?

-> Search for the anime with ```dective conan```, on the anime page you get **Download all** option, this will start the batch download of all the episodes present in that page.

### Q) Where can I access all the downloaded episodes?

-> You can either view them in the Download page of LiSA application, OR Visit ```LiSA-win32-x64\resources\downloads\``` on windows file explorer.

### Q) Where can I view recommendations, if I liked Kimetsu no Yaiba?

-> Search for the anime, in this case `Kimetsu no Yaiba`, scroll down there you see a tab recommendations.

### Q) How can I switch to external player?

-> In video player, on the bottom right click the keyword `external`, choose your favourite video player, [currently supported players](#supported-external-players).

### Q) How do I download Episode 8 of Mob Psycho III?

-> Visit the episode, you want to download, select the langauge, and resolution you want to download in, the downloud will start, the status of which you can check from Download manager.

### Q) Do I have to create any user account to stream or download anime?

-> No, you do not need to sign up to any account to stream or download anime.

## 😶‍🌫️ Supported Websites

Note: In the following version the user can only download from animepahe, more websites to come in future. <br>
| Website | Sub/Dub selection | Supported resolutions | File Size |
|--- |--- |--- |--- |
| [AnimePahe](https://animepahe.com/) | Yes | 720p, 1080p | 720p: ~150MB, 1080p: ~200MB |

## 📺 Supported External Players

### MPV

To install mpv, run the following command from the command line or PowerShell:

```cli
choco install mpv
```

OR

Visit: [Official MPV site](https://mpv.io/installation/)

Make sure mpv is added to Path.<br> <br>

### VLC Media Player

Download and Install VLC Media player form [here](https://www.videolan.org/vlc/download-windows.html).

<br>

## Filters

* TV
* Movie
* Airing
* Upcoming
* By Popularity
* OVA
* ONA
* Special
* Favourite

## 🤝 CONTRIBUTING

Contribututions, issues, and feature requests are welcome! See [CONTRIBUTING.md]()

## ⭐ SUPPORT

If this project is helpful to you and love our work and feels like showing love/appreciation, give a ⭐, AND 😉...

[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/SayAnime)

## 🪪 LICENSE

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Cosmicoppai/LiSA/blob/main/LICENSE) file for details.

<br>

## DISCLAIMER

This software has been developed just to improve users experience while streaming and downloading anime. Please support original content creaters!
