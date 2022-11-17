// CRA react-app-rewired override
module.exports = function override (config, env) {
    let loaders = config.resolve
    loaders.fallback = {
        "Buffer": require.resolve("buffer/")
    }
    return config
}