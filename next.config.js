const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    return {
      ...config,
      resolve: {     
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          'mixins': path.resolve(__dirname, './src/styles/_mixins.scss'),
          'variables': path.resolve(__dirname, './src/styles/_variables.scss'),
        },
      },
    }
  }
}

module.exports = nextConfig
