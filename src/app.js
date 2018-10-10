import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {
    NavLink,
    Route,
    HashRouter as Router,
    Swith,
    Redirect
} from 'react-router-dom';
import RouteConfig from '../src/config/Route.jsx';
import {Provider} from 'react-redux';
import store from '../src/config/Store.jsx';
// import './config/fontSize';
import "./less/less.less";


// axios.defaults.baseURL = "http://192.168.81.43:8063/api/intellif/";      // 龙岗万科后台
// axios.defaults.baseURL = "http://192.168.81.43:8064/api/intellif/";      // 龙岗万科后台
// axios.defaults.baseURL = "http://192.168.81.43:8065/api/intellif/";      // 龙岗万科后台2
// axios.defaults.baseURL = "http://190.35.194.198:8063/api/intellif/";     // 南山视频专网后台
axios.defaults.baseURL = "http://localhost:8100";                        // 测试模拟后台

// 无任何操作，30分钟后退出登录
let timer = setTimeout(() => {
    window.location.href('http://192.168.81.26:8066');
}, 1800000);
document.addEventListener('click',function(){
    clearTimeout(timer);
    timer = setTimeout(() => {
        window.location.href = 'http://192.168.81.26:8066';
    }, 1800000);
});

var div = document.createElement("div");
div.setAttribute("id", "root");
document
    .body
    .insertBefore(div, document.body.childNodes[0]);
ReactDOM.render(
    <Provider store={store} >
    <Router basename="/menjin">
        {RouteConfig}
    </Router>
</Provider>, document.getElementById('root'));
