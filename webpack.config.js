const path = require('path');

module.exports = {
  entry: ['./js/cards.jsx', './js/navbar.jsx', './js/messages.jsx', './js/footer.jsx', './js/chess.jsx'],
  output: {
    path: path.join(__dirname, '/static/'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        // Test for js or jsx files
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/react',"@babel/preset-env"],
            plugins: ["@babel/plugin-proposal-object-rest-spread"]
          },
        },
        // query: {
        //   // Convert ES6 syntax to ES5 for browser compatibility
        //   presets: ['env', 'react'],
        // },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
