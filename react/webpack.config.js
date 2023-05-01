const path =require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
module.exports={
    entry:"./src/index.js",
    plugins:[
        new HTMLWebpackPlugin({
            template: './src/index.html'
        })
    ],
    devServer: {
        proxy: {
            '/post/video':{
                target: 'http://localhost:4000',
            },
            '/api': {
                target: 'http://localhost:4000',
            },
            '/api/video': {
                target: 'http://localhost:4000',
            },
            '/api/posts':{
                target: 'http://localhost:4000',
            },
            '/get/video/*':{
                target: 'http://localhost:4000',
            },
            '/submit/*':{
                target: 'http://localhost:4000',
            }
        },
        webSocketServer: {
            type: 'ws',
            options: {
            webSocketURL: 'ws://localhost:4000/ws',
            },
        },
    },
    devtool: 'source-map',
    module: {
        rules:[
            {
                test: /.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        sourceMaps: true,
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                    use: [
                        {loader: 'file-loader'}]
            }
        ]
        // put css loader later
    }
}