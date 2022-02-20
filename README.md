# flask-stockMarketChart
 Chart the stock market

Uses https://www.alphavantage.co/documentation/

Make as part of FreeCodeCamp's challenge https://www.freecodecamp.org/learn/coding-interview-prep/take-home-projects/chart-the-stock-market

[Link to live project](https://limitless-ridge-52978.herokuapp.com/static/index.html)

![Finished stock market chart](https://link477.com/dataScience/ChartTheStockMarket.JPG)

## Docker
Build with:
docker build -t stockmarketchart .

Run with:
docker run -dp 5000:5000 stockmarketchart

## Heroku
Old procfile command
web: gunicorn wsgi:app

git push heroku (sign into the Heroku cli with heroku login)
