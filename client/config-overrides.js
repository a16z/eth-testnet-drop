// CRA react-app-rewired override
const webpack = require("webpack")

module.exports = function override (config, env) {
    let loaders = config.resolve
    loaders.fallback = {
        "buffer": require.resolve("buffer"),
        "crypto": require.resolve("crypto-browserify")
    }
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
        }),
    ]
    return config
}