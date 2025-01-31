const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

const config = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            if (env === 'production') {
                // Remove the default GenerateSW plugin that CRA adds
                webpackConfig.plugins = webpackConfig.plugins.filter(
                    (plugin) => plugin.constructor.name !== 'GenerateSW'
                );

                // Add our InjectManifest plugin
                webpackConfig.plugins.push(
                    new WorkboxWebpackPlugin.InjectManifest({
                        swSrc: './src/service-worker.js',
                        swDest: 'service-worker.js',
                        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                        // Add these options
                        exclude: [/\.map$/, /asset-manifest\.json$/],
                        manifestTransforms: [
                            (manifest) => {
                                return {
                                    manifest: manifest.map((entry) => {
                                        return entry;
                                    }),
                                };
                            },
                        ],
                    })
                );
            }
            return webpackConfig;
        },
    },
};

module.exports = config;
