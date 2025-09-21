const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Polyfills for Node.js core modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "fs": false,
        "path": false,
        "os": false,
        "crypto": false,
        "stream": false,
        "buffer": false,
        "process": false,
        "util": false,
        "http": false,
        "https": false,
        "url": false,
        "zlib": false,
        "assert": false,
        "net": false,
        "tls": false,
        "child_process": false,
        "worker_threads": false
      };

      // Ignore warnings from face-api.js and other problematic modules
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Critical dependency/,
        /Module not found.*fs/,
        /Can't resolve 'fs'/
      ];

      // Add DefinePlugin to handle global
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          'global': 'globalThis'
        })
      );

      return webpackConfig;
    },
  },
};