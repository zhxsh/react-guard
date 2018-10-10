var path=require('path');
var webpack = require('webpack');//引入webpack模块
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var os = require('os');
var Happypack = require('happypack');
var happypackThreadPool = Happypack.ThreadPool({size:4});//根据电脑的idle，配置当前最大的线程数量

module.exports = {

entry:{app:[ 
            //   'webpack-dev-server/client?http://localhost:8080',  // 热更新监听此地址 ,如果要生成最终文件之前，需要屏蔽这两句热启动服务的代码                                                    
            //    'webpack/hot/dev-server',  // 启用热更新
              path.resolve(__dirname, 'src', 'app')  
        ] },
output: {
    filename:'bundle.js',//js合并后的输出的文件，命名为bundle.js
    path:path.resolve(__dirname,'build'),//指令的意思是：把合并的js文件，放到根目录build文件夹下面
    //publicPath:'build',//生成文件的公共路径，‘/work/reactweb/dist’ 生产环境下所有的文件路径将会添加这个公共路径
},
devtool:'eval-soure-map',
//    devtool:false,
module:{
    rules:[ 
        {
        test:/\.js$/,
        enforce:'pre',
       loader:'eslint-loader',
       include:path.resolve(__dirname,'src'),
       exclude:/static/
    },
 {
    test:/\.css$/,        

    use:ExtractTextPlugin.extract({//使用ExtractTextPlugin 插件
        fallback:"style-loader",//用于开发环境
        use:[{loader:"css-loader",options:{minimize:true}},"postcss-loader"]
    }),

},
  {
    test:/\.less$/,       
    use:ExtractTextPlugin.extract({//使用ExtractTextPlugin 插件
        fallback:"style-loader",//用于开发环境
        use:["css-loader","postcss-loader","less-loader"]
    }),
},
   {
    test:/\.scss$/,        

    use:ExtractTextPlugin.extract({//使用ExtractTextPlugin 插件
        fallback:"style-loader",//用于开发环境
        use:["css-loader","postcss-loader","sass-loader"]
    }),

},
 {
        test:/\.jsx?$/,
        exclude:/(node_modules|bower_components)/,//排除XXX类型文件
        include:path.resolve(__dirname),
        loader:'happypack/loader?id=happybabel'
    },
    {   //配置辅助loader,处理图片  
        test:/\.(png|jpg|gif|svg|eot|ttf|woff|woff2|mp3|pdf)$/,
        loader:'url-loader',
        options:{limit:8192,name:"images/[name].[ext]"}
    },
    { //处理图片外的其他文件类型
        test:/\.(appcache)(\?|$)/,
        exclude: /node_modules/,
        include:path.resolve(__dirname,'src'),
        loader:'file-loader?name=[name].[ext]' 
    }
]
},
plugins:[
new HtmlwebpackPlugin({
    title:'webpackDll',
    template:'./src/index.html', //模板文件路径
   
}),
new webpack.HotModuleReplacementPlugin(),//热更新配套插件
new ExtractTextPlugin("styles.css"),    //插件声明
 
new webpack.optimize.UglifyJsPlugin(
{output: { 
    comments:false,//删除代码中所有注释
},
compress:{
 warnings:false,
}
}),
new Happypack({
    id:"happybabel",
    loaders:['babel-loader'],
    threadPool:happypackThreadPool,
    verbose:true
}),
 new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./build/manifest1.json'),
    }),
],
resolve:{
    extensions:['.js','jsx','less','.css','.scss']//后缀名自动补全
}


};
