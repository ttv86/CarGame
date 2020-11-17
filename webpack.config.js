const scripts = {
    entry: "./Scripts/Main.ts",
    output: {
        path: __dirname + "/wwwroot",
        filename: 'app.[name].js'
    },
    devtool: "source-map",
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    mode: "development",

    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader' },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    optimization: {
        minimize: false,
        nodeEnv: "development",
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }
};

const background = {
    entry: "./ScriptsWorker/Main.ts",
    output: {
        path: __dirname + "/wwwroot",
        filename: 'worker.[name].js'
    },
    devtool: "source-map",
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    mode: "development",

    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader' },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    optimization: {
        minimize: false,
        nodeEnv: "development",
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }
};

module.exports = [scripts, background];