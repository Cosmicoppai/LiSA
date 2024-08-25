<div align="center">

![Banner](public/images/home_screen_logo.png)

![GitHub contributors](https://img.shields.io/github/contributors/cosmicoppai/LiSA?color=lightgrey)
[![GitHub forks](https://img.shields.io/github/forks/cosmicoppai/LiSA?color=lightgrey)](https://github.com/Cosmicoppai/LiSA/network)
[![GitHub stars](https://img.shields.io/github/stars/cosmicoppai/LiSA?color=lightgrey)](https://github.com/Cosmicoppai/LiSA/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Cosmicoppai/LiSA?color=lightgrey)](https://github.com/Cosmicoppai/LiSA/issues)
[![MIT License](https://img.shields.io/badge/license-MIT-lightgrey)](./LICENSE)
[![Open Source Helpers](https://www.codetriage.com/cosmicoppai/lisa/badges/users.svg)](https://www.codetriage.com/cosmicoppai/lisa)

![image](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue)
![image](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![image](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

</div>

A Desktop application, for streaming and downloading your favourite anime.

## CONTENTS OF THE FILE

-   [Features](#-features)
-   [Download](#-download)
-   [Demo](#-demo)
-   [FAQ](#-faq)
-   Appendix
    -   [Supported Webistes](#%EF%B8%8F-supported-websites)
    -   [Supported External Video Player](#-supported-external-players)
-   [Contributing](#-contributing)
    -   [Setup](./CONTRIBUTING.md#-development-setup)
-   [Support](#-support)
-   [License](#-license)
-   [Disclaimer](#disclaimer)

## 🚀 Features

-   A User Friendly Interface
-   Download anime from [supported websites](#-supported-websites) in multiple resolutions and languages
-   Batch Download
-   Stream anime on the inbuilt player and your favourite [external video player](#-supported-external-players)
-   Explore anime based on different filters
-   Download Manager
-   Library to view pre-downloaded episodes and active downloads
-   Recommendation System
<br>

## 🤗 Download

[![Total Downloads](https://img.shields.io/github/downloads/Cosmicoppai/LiSA/total.svg?style=for-the-badge)](https://github.com/Cosmicoppai/LiSA/releases/latest)

Download the [latest release](https://github.com/Cosmicoppai/LiSA/releases/latest) from here and extract the zip file.

On Windows, ensure you run as an administrator and allow incoming port forwarding on `6969` and `9000`.
 
On macOS, run the below command in terminal. See [reference](https://discussions.apple.com/thread/253714860?answerId=257037956022&sortBy=rank#257037956022)

```
xattr -c /Applications/LiSA.app
```

### Tested on

-   Windows 8, 10 & 11.

## 😁 Demo

### Screenshots

![Anime Search](docs/images/ss_anime_search.png)
_Search results for Bakuman_

![Anime Details](docs/images/ss_anime_details.png)
_Episode details of Bakuman_

![Video Player](docs/images/ss_play_episode.png)
_Built-in Video Player_

![Manga Search](docs/images/ss_manga_search.png)
_Search results for Doraemon_

![Manga Details](docs/images/ss_manga_details.png)
_Episode details of Doraemon_

![Manga Reader](docs/images/ss_manga_reader.png)
_Built-in Manga Reader_

![Explore Anime](docs/images/ss_anime_explore.png)
_Explore Anime with filters_

![Explore Manga](docs/images/ss_manga_explore.png)
_Explore Manga with filters_

![Download Manager and Library - 1](docs/images/ss_download_screen_1.png)
_Download Manager and Library - 1_

![Download Manager and Library - 2](docs/images/ss_download_screen_2.png)
_Download Manager and Library - 2_

![My List](docs/images/ss_my_list.png)
_My List_

https://user-images.githubusercontent.com/66635990/204451842-76fdbbd0-3476-48fd-a1dd-77eff145a432.mp4

## Future Plans

-   UI Improvement
-   Continue Watching
-   Download episodes with custom range

## 🤔 FAQ

### Q) How can I download detective conan's episodes from 10 to 30?

-> Search for the anime with `detective conan`, on the anime page you get **Download all** option, this will start the batch download of all the episodes present on that page.

### Q) Where can I access all the downloaded episodes?

-> You can either view them on the Download page of LiSA , OR Visit `LiSA-win32-x64\resources\downloads\` on windows file explorer.

### Q) Where can I view recommendations, if I liked Kimetsu no Yaiba?

-> Search for the anime, in this case `Kimetsu no Yaiba`, scroll down there you see a tab recommendations.

### Q) How can I switch to the external player?

-> In video player, on the bottom right click on `external`, choose your favourite video player, [currently supported players](#supported-external-players).

### Q) How do I download Episode 8 of Mob Psycho III?

-> Visit the episode, you want to download, select the language, and resolution you want to download in, the downloud will start, the status of which you can check from Download manager.

### Q) Do I have to create any user account to stream or download anime?

-> No, you do not need to sign up for an account to stream, explore or download anime.

## 😶‍🌫️ Supported Websites

Note: In the following version the user can only download from animepahe, more websites to come in future.

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

Make sure mpv is added to Path.

### VLC Media Player

Download and Install VLC Media player form [here](https://www.videolan.org/vlc/download-windows.html).

## Filters

-   TV
-   Movie
-   Airing
-   Upcoming
-   By Popularity
-   OVA
-   ONA
-   Special
-   Favourite

## 🤝 CONTRIBUTING

Contributions, issues, and feature requests are welcome! See [Contribution Guide.](./CONTRIBUTING.md)

## ⭐ SUPPORT

If this project is helpful to you and love our work and feels like showing love/appreciation, give a ⭐, AND 😉...

[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/SayAnime)

##### LTC
```
LLk9HEj6nz9vTb591Foq9mhx7A8SfueWzh
```

## 📄 LICENSE

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Cosmicoppai/LiSA/blob/main/LICENSE) file for details.

## DISCLAIMER

This software has been developed just to improve users experience while streaming and downloading anime. Please support original content creators!
