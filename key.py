import os
def apikey():
    '''
    Return the api key
    '''
    return str(os.environ.get('KEY',''))