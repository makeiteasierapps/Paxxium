const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

const config = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            if (env === 'production') {
                webpackConfig.plugins.push(
                    new WorkboxWebpackPlugin.InjectManifest({
                        swSrc: './src/service-worker.js',
                        swDest: 'service-worker.js',
                        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                    })
                );
            }
            return webpackConfig;
        },
    },
};

module.exports = config;
