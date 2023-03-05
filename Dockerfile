FROM python:3.8-slim-buster

WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip3 install --user -r requirements.txt

COPY . .

# Run the app
CMD [ "python3", "app.py"]
# CMD [ "python3", "-m", "gunicorn", "--worker-class", "eventlet", "-w", "1", "wsgi" ]
