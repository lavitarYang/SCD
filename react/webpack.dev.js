const path =require('path');
const common =require("./webpack.config");
const {merge} = require("webpack-merge");
module.exports=merge(common,{
    mode:"development",
    output:{
        filename:'main.js',
        path:path.resolve(__dirname,"dev"),
        // mimeTypes: {
        //     'text/html': ['html'],
        //     'text/javascript': ['js']
        //   }
    },
    devServer:{
        historyApiFallback:true
    }
});