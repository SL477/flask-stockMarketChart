# import logging
import os
from dotenv import load_dotenv
from .app import socketio, app

if __name__ == "__main__":
    _ = load_dotenv()
    # logging.basicConfig(filename='app.log', filemode='a',
    #                     format='%(name)s - %(levelname)s - %(message)s',
    #                     level=logging.WARNING)
    socketio.run(app, host="0.0.0.0", port=os.environ.get('PORT', '5000'))
