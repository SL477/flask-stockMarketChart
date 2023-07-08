const path = require('path');

module.exports = {
    entry: './src/stocks.js',
    output: {
        filename: 'stocks.js',
        path: path.resolve(__dirname, 'app', 'static'),
    },
    mode: 'production'
};
