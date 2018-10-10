var webpack = require('webpack'); //引入webpack模块
var webpackDevServer = require('webpack-dev-server'); //引入服务器模块
var config = require('./webpack.config'); //引入webpack配置文件


var server = new webpackDevServer(webpack(config), {
    //contentBase: path.join(__dirname,"dist"),//用于静态文件的目录，不设置默认为当前根目录
    // contentBase:[path.join(__dirname,'public'),path.join(__dirname,'assets')],//支持多路径
    // publicPath:"/assets", 服务器地址:http://localhost:8080 ,output file:http://localhost:8080/assets/bundle.js
    //compress:true,//gzip压缩
    //headers:{"X-Custom-Foo":"bar"},
    hot: true, //是否启用热更新   
    historyApiFallback: true, //html5接口,设置为true，所有路径均转到index.html
    inline: true, //是否实时刷新，即代码有更改，自动刷新浏览器 
    stats: { colors: true }, //显示bundle文件信息，不同类型的信息用不同的颜色显示
    // proxy: { //服务器代理配置
    //     "/api/*": { //相对路径已/api打头，将会触发代理
    //         //target:"http://192.168.15.100:8088", //代理地址
    //         target:"http://192.168.15.107:80", //代理地址
    //         pathRewrite: { "^/api": "" }, //路径替换
    //         secure: false, //跨域
    //         changeOrigin: true
    //     }
    // }
});
//将其他路由，全部返回index.html
server.app.get('*', function(req, res) {
    res.sendFile(__dirname + '/build/index.html');
});
server.listen(8080, function() {
    console.log('正常打开8080端口');
});
