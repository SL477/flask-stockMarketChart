import os
from dotenv import load_dotenv


def apikey() -> str:
    """Return the api key"""
    _ = load_dotenv()
    return str(os.environ.get('KEY', ''))


if __name__ == '__main__':
    print('apikey', apikey())
