import random
import platform


# Configuration for generating user agents based on platform and browser
PLATFORM_CONFIG = {
    'windows': {
        'platforms': [
            '(Windows NT 10.0; Win64; x64)',  # Windows 10/11
            '(Windows NT 10.0; WOW64)'  # 32-bit on 64-bit
        ],
        'browsers': {
            'chrome': 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36',
            'firefox': 'Gecko/20100101 Firefox/{version}',
            'edge': 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36 Edg/{version}'
        }
    },
    'darwin': {
        'platforms': [
            '(Macintosh; Intel Mac OS X 10_15_7)',  # A common modern version
            '(Macintosh; Intel Mac OS X 14_0)',  # macOS Sonoma
            '(iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            '(iPad; CPU iPad OS 17_0 like Mac OS X)'
        ],
        'browsers': {
            'chrome': 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36',
            'firefox': 'Gecko/20100101 Firefox/{version}',
            'safari': 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/{version} Safari/605.1.15'
        }
    },
    'linux': {
        'platforms': [
            '(X11; Linux x86_64)',
            '(X11; Ubuntu; Linux x86_64)'
        ],
        'browsers': {
            'chrome': 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36',
            'firefox': 'Gecko/20100101 Firefox/{version}'
        }
    }
}


def _generate_version(major_min, major_max):
    """Generates a plausible browser version string."""
    major = random.randint(major_min, major_max)
    minor = random.randint(0, 9)
    build = random.randint(1000, 9999)
    patch = random.randint(0, 99)
    return f"{major}.{minor}.{build}.{patch}"


def _generate_firefox_version(major_min, major_max):
    """Generates a plausible Firefox version string."""
    major = random.randint(major_min, major_max)
    return f"{major}.0"


def _generate_safari_version(major_min, major_max):
    """Generates a plausible Safari version string."""
    major = random.randint(major_min, major_max)
    minor = random.randint(0, 9)
    return f"{major}.{minor}"


def generate_user_agent(platform, browser):
    """
    Generates a single user agent string for a specific platform and browser.
    """
    if platform not in PLATFORM_CONFIG or browser not in PLATFORM_CONFIG[platform]['browsers']:
        raise ValueError(f"Unsupported platform or browser: {platform}/{browser}")

    platform_str = random.choice(PLATFORM_CONFIG[platform]['platforms'])
    template = PLATFORM_CONFIG[platform]['browsers'][browser]

    if browser == 'firefox':
        version = _generate_firefox_version(115, 125)  # Firefox versions are simpler
    elif browser == 'safari':
        version = _generate_safari_version(15, 17)
    else:  # Chrome and Edge
        version = _generate_version(118, 126)

    # Replace platform and version in the final UA string
    ua_template = f"Mozilla/5.0 {platform_str} {template}"
    user_agent = ua_template.format(version=version)

    return user_agent


def generate_user_agent_list(platform, count=30):
    """
    Generates a list of random user agents for a given platform.
    """
    if platform not in PLATFORM_CONFIG:
        raise ValueError(f"Platform '{platform}' not supported. Choose from {list(PLATFORM_CONFIG.keys())}")

    ua_list = []
    available_browsers = list(PLATFORM_CONFIG[platform]['browsers'].keys())

    for _ in range(count):
        browser = random.choice(available_browsers)
        ua_list.append(generate_user_agent(platform, browser))

    return ua_list


# --- Main Usage ---

# Pre-generate lists for each platform
user_agents = {
    "windows": generate_user_agent_list(platform="windows", count=40),
    "darwin": generate_user_agent_list(platform="darwin", count=40),
    "linux": generate_user_agent_list(platform="linux", count=30),
}


def get_random_agent(platform_os=None):
    """
    Returns a random user agent. Defaults to the native OS of the user.

    Args:
        platform_os (str, optional): 'windows', 'darwin', 'linux', or 'all'.
                                     If None, detects the native OS. Defaults to None.

    Returns:
        str: A random user agent string.

    Raises:
        ValueError: If the specified platform is not supported.
    """
    # If no platform is specified, detect the native OS
    if platform_os is None:
        system = platform.system().lower()
        if system in user_agents:
            platform_os = system
        else:
            return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) LiSA/2.1.0 Chrome/124.0.6367.243 Electron/30.4.0 Safari/537.36"

    return random.choice(user_agents[platform_os.lower()])
