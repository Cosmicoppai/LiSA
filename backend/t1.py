import asyncio
import re
import requests
from bs4 import BeautifulSoup
from m3u8 import Downloader


# * API call for Searching an Anime
def search_anime(inp_anime):
    search_headers = {
        'authority': 'animepahe.com',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-GB,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6',
        'referer': 'https://animepahe.com/',
    }

    search_params = {
        'm': 'search',
        'q': inp_anime,
    }

    search_response = requests.get('https://animepahe.com/api', params=search_params, headers=search_headers)

    return search_response


while True:
    try:
        anime_details = search_anime(input("Enter an Anime to watch: ")).json()['data'][0]
    except KeyError:
        print('No results for this anime...')
        continue
    else:
        break

anime_title = anime_details['title']
anime_session = anime_details['session']
anime_episodes = anime_details['episodes']

# print(anime_details)


# * API call for getting anime and episode sessions
episodes_headers = {
    'authority': 'animepahe.com',
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'en-GB,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6',
    # Requests sorts cookies= alphabetically
    # 'cookie': 'amp=1; SERVERID=janna; aud=jpn; ann-fakesite=0; latest=54603; res=720; dom3ic8zudi28v8lr6fgphwffqoz0j6c=95c15125-006d-4c33-94ae-4515fbd24e4f%3A2%3A1; sb_onpage_8966b6c0380845137e2f0bc664baf7be=1; __cf_bm=JUlg4S1l8BqqeG7gEkZq7yItYVXwy4jBNS7GmVNm9Aw-1657965656-0-AZV/yneLMCwe5UayPvtMBsCvFUx5qmzwQDOOVo/H4Jeii+WQH88Jzpt9SvRsqEai56ffOOaqAqcEoiiM3YHwou2MORwwYrea09J5963ECaBECazDMi9R5P9PK76LpeWV2Q==; XSRF-TOKEN=eyJpdiI6IkpPYXNaVlJhMEtuQ3U2SVVBNndQRFE9PSIsInZhbHVlIjoicnMybkxtMFJ6a1p4bUU4WG5sUHRUei9aZlE0RUZPb3VXdFhKalpHUTRQZFRqUmhkMnJiOXpFb1YvcCtRZFlWejdKWWhDSzYvVE5TNU1kOW5iTkxaQmhxeVVGWlQvVEVWNDZiT1QwMm84bm9aUmJ2RUd0SzZGUlpPbHZEckJxY20iLCJtYWMiOiI0ZmVmZDU1YjQzZDE5YjYzNWY1ZTUzOGQ0N2IwYzFhZDBmMDE1YmE0MDVmZjg4Y2YzMzE1ZWNjMjRlNWU5MzA2IiwidGFnIjoiIn0%3D; laravel_session=eyJpdiI6InZkMzhrWFZxakJkTnFKYkYrWFVBUHc9PSIsInZhbHVlIjoiZTg3OEhWWWNWbTEvb09hTjdtRC84RWFVR1lDVWdlV0pySEhHUDhOL2hTNEQ3RUlEdzRVU1hMeWgyVnA2c2IvRHNsZkpaNmhRTU82UVVxWlhiQmxhbFVMRHp6K0JPeGpEcXVFa3JDc1EyOVJScFU0NjBFTXZiRGcrRnJGSitFdkQiLCJtYWMiOiI5YjBhYmFmZDM4ZjBjYmE2MWJhYTk0OWM3ZmJmNTY0NzA5MmQ0NDA3MmE1Y2ZiYjhkNmI3ZDgwNmYyZGQ4NmEzIiwidGFnIjoiIn0%3D',
    'referer': 'https://animepahe.com/anime/{}'.format(anime_session),
}

episodes_params = {
    'm': 'release',
    'id': anime_session,
    'sort': 'episode_asc',
    'page': '1',
}

episodes_resp = requests.get('https://animepahe.com/api', params=episodes_params, headers=episodes_headers)

print(f"The most significant result for the given input: \t {anime_title}")

episodes = episodes_resp.json()['data']

episodes_session = {}
i = 0
for episode in episodes:
    episodes_session[i] = episodes[i]['session']
    i += 1

# print('#episodes: ', len(episode_session))

# * Getting stream data of each session
stream_data = []

for episode_session in episodes_session.values():
    ep_headers = {
        'authority': 'animepahe.com',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-GB,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6',
        # Requests sorts cookies= alphabetically
        # 'cookie': 'amp=1; SERVERID=janna; aud=jpn; ann-fakesite=0; latest=54603; res=720; dom3ic8zudi28v8lr6fgphwffqoz0j6c=95c15125-006d-4c33-94ae-4515fbd24e4f%3A2%3A1; sb_onpage_8966b6c0380845137e2f0bc664baf7be=1; __cf_bm=0bUIzqSeTCU.dZxT2gLYqkpL5bClMOCBu5poU6weFec-1657968577-0-AWzkzzKLY069tP2q/SkVMVkxeLXOcNR7GGSTT0odRxAYn/82W4ItT6InE148duzBzZATEhwSEgk48LYSaT/bXhR1fg0L2I/vE+BpKRmCqT0lR4FJoywrUuIzqPKBRBTu9A==; XSRF-TOKEN=eyJpdiI6IkZUa2RNeUl3NjFRcWVCckpSbklwdWc9PSIsInZhbHVlIjoiVmVPNjdRYVcyLzhRd1g1ZUQyTEYwci9IbmNFNmFiYm9CSzhMRGNFNUlISFllSXZtTFhCSFlpeW9iZWZIZnZNRzBHZ2lFNDdpVy84TDB0aC92QktTalFOcVR1eUFjdFBzQldHdkxnNjMvVW5uRXErQmlhQm1YSWc4RFJ0c09GMWUiLCJtYWMiOiI2ZDg0MDEwNzk3MzUyZTRmZjM3YzdmZGEzOThmYWYxMWE4OTU3MmUwMTU0Yjg4ZjQxM2EzN2M2ODEzMjNlYmE1IiwidGFnIjoiIn0%3D; laravel_session=eyJpdiI6ImxjemFxU1hFRTB3NXJNTTg2YTIrVkE9PSIsInZhbHVlIjoiaHArbmx6RFowYzZIRW9jWmE4elh3cHJ5ZXROYkczZ09kT2I1T2FsNFdEU3FrQ2IvSEo5VGE2alJEclBtMGlPNHRMRm1FMG14Y1QyMTcwT2NqQWRTbXhPbkpMdTBBNDZLdFo1d3p3ajFHSHlCRkxtNFBPQXBtZHh5N3Vud2NqUG8iLCJtYWMiOiJmZjkwYjM3NDUxMjcwMWQ3NDRhMDFhODM0MjAxZjk3ZDQ4NDVmYzc2OWE2MGRkMzNjMjg1ZDIxMjc5YWQ0ZmQ5IiwidGFnIjoiIn0%3D',
        'referer': 'https://animepahe.com/play/{}/{}'.format(anime_session, episode_session),
    }

    ep_params = {
        'm': 'links',
        'id': episode_session,
        'p': 'kwik',
    }

    ep_response = requests.get('https://animepahe.com/api', params=ep_params, headers=ep_headers)

    stream_data.append(ep_response.json())

# Getting the available qualities of the episodes
available_quality = set()
for i in stream_data:
    episode_data = i['data']
    for j in episode_data:
        available_quality.add(list(j.keys())[0])

available_quality = list(available_quality)

# * Asking for episode no, quality and getting the kwik link for that episode and quality
episode_no = 1
if anime_episodes > 1:
    while True:
        episode_no = int(input(f'Enter the episode you would like to watch there are {anime_episodes} episode(s): '))
        if episode_no < 1 or episode_no > anime_episodes:
            print(f"Please enter the valid response an episode between 1 and {anime_episodes}")
            continue
        else:
            # satified with the response
            break

while True:
    print("Select one of the following qualities: ")
    for i in range(len(available_quality)):
        print(f"({i + 1}) {available_quality[i]}p")
    quality = int(input())

    if quality < 1 or quality > len(available_quality):
        print("Do select the correct quality... \n")
        continue
    else:
        # satisfied with the resposnse
        break

print()

# print(stream_data)

stream_data = stream_data[episode_no - 1]['data']
for i in stream_data:
    if list(i.keys())[0] == available_quality[quality - 1]:
        stream = i[str(available_quality[quality - 1])]['kwik']

print(f"Kwik Stream: {stream}")

print()

# * Getting the stream-id for accessing uwu.m3u8
stream_headers = {
    'authority': 'kwik.cx',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-language': 'en-GB,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6',
    'referer': 'https://animepahe.com/',
}

stream_response = requests.get(stream, headers=stream_headers)

# print(stream_response.text)

bs = BeautifulSoup(stream_response.text, 'html.parser')

all_scripts = bs.find_all('script')

pattern = r'\|\|\|.*\'\.'
pattern_list = (re.findall(pattern, str(all_scripts[6]))[0]).split('|')[88:98]

# code_pattern = r'[A-z0-9]{64}'
# code = re.findall(code_pattern, str(all_scripts[6]))[0]

# stream_code_0X_pattern = r'\|0[0-9]+\|'
# stream_code_0X = (re.findall(stream_code_0X_pattern, str(all_scripts[6]))[-1]).replace('|', '')

# print(pattern_list)

# print(f"uwu Code: {code}")
# print(f"Stream code 0X: {stream_code_0X}")

# * Request for uwu file

import requests

headers = {
    'authority': 'eu-142.files.nextcdn.org',
    'accept': '*/*',
    'accept-language': 'en-GB,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6',
    'origin': 'https://kwik.cx',
    'referer': 'https://kwik.cx/',
}

uwu_url = 'https://{}-{}.files.nextcdn.org/stream/{}/{}/uwu.m3u8'.format(pattern_list[9], pattern_list[8],
                                                                         pattern_list[3],
                                                                         pattern_list[2])
print(uwu_url)

# response = requests.get(uwu_url, headers=headers)
#
#
# async def downloader(m3u8: str, file_name: str):
#     await Downloader(m3u8, file_name).run()
#
#
# file_name = input("enter file_name")
# asyncio.run(downloader(response.text, file_name))
