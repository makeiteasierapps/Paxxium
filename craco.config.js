const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

const config = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            if (env === 'production') {
                // Remove the default GenerateSW plugin
                webpackConfig.plugins = webpackConfig.plugins.filter(
                    (plugin) => plugin.constructor.name !== 'GenerateSW'
                );

                // Add InjectManifest with minimal configuration
                webpackConfig.plugins.push(
                    new WorkboxWebpackPlugin.InjectManifest({
                        swSrc: './src/service-worker.js',
                        swDest: 'service-worker.js',
                    })
                );
            }
            return webpackConfig;
        },
    },
};

module.exports = config;
