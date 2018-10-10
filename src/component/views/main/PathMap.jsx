import React from 'react';
import actions from '../../../action/action.jsx';
import store from '../../../config/Store.jsx';
import { Menu,message,Pagination,LocaleProvider  } from "antd";
import zhCN from 'antd/lib/locale-provider/zh_CN';

import L from 'leaflet';
import 'proj4leaflet';
import 'leaflet/dist/leaflet.css';
// import 'font-awesome/css/font-awesome.css';

import '../../../lib/Leaflet.AnimatedMarker';

import iconSr from '../../../assets/images/map/sr.png';
import iconCr from '../../../assets/images/map/cr.png';
import iconFr from '../../../assets/images/map/fr.png';
import iconAnimate from '../../../assets/images/map/dw22.png';
import iconSb from '../../../assets/images/map/sb.png';
import iconCb from '../../../assets/images/map/cb.png';
import iconFb from '../../../assets/images/map/fb.png';


const mapStoreStateToProps = (state) => (
    {
       // loggined:state.app.loggined
    }
);

const mapDispatchToProps = (dispatch, ownProps) => ({
    fn: {
        changeInfo: (infotype, string) => dispatch(actions.changeInfo(infotype, string))
    }
});

function IconText(props) {
    const pageAll = Math.ceil(props.total/9);
    console.log("props.page:",props.page,pageAll,props.page === pageAll)
    if(props.index === 0 && props.page === 1) {
        return "始";
    }
    else if(props.index === (props.list.length-1) && props.page === pageAll) {
        return "终";
    }
    else {
        return "过";
    }
}

// const SubMenu = Menu.SubMenu;
export default class PathMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pathList: [],
            headBtnClick: true,
            pathMap: null,
            currentPath: {},
            line: null,
            pagePoints: [],              // 列表
            pointsPure: [],              // 只含有经纬度数组，用于绘制折线

            page: 1,
            pageSize: 9,                                    // 每页条数
            // pageSizeSet: false,                             // 页面初始化只设置一次pageSize
            total: 0,                                       // labelpeople总条数
            // maxPage: 0,
        };

        // this.startAnimation = this.startAnimation.bind(this);
        this.onChangePage = this.onChangePage.bind(this);
    }
    componentWillMount() {
        
        // this.setMovingMaker();

    }
    componentDidMount() {
        this.initMap();
        
        // console.log('store:',store.getState().app.name);
        // if(!store.getState().app.pathList || store.getState().app.pathList.length===0){
        //     message.info("没有轨迹信息");
        //     return;
        // }
        // const a = store.getState().app;
        // const b = store.getState().app.pathList;
        // console.log('store:',store.getState().app.pathList);
        // let pathList = JSON.parse(store.getState().app.pathList);

        if(!sessionStorage.pathList){
            message.info("没有轨迹信息");
            return;
        }
        let pathList = JSON.parse(sessionStorage.pathList);

        pathList = pathList.reverse();
        console.log("pathList:",pathList);
        let pointsPure = [];
        for(let i=0;i<pathList.length;i++){
            const path = pathList[i];
            let point = path.geoString.substring(path.geoString.indexOf('(')+1,path.geoString.indexOf(')')).split(' ');

            pathList[i]["timeFormat"] = this.formatDate(new Date(path.time),"yyyy-MM-dd hh:mm:ss");
            pathList[i]["point"] = [point[1],point[0]];

            pointsPure.push([point[1],point[0]]);
        }

        this.setState({
            pathList: pathList,
            pagePoints: pathList.slice(0,9),
            pointsPure: pointsPure,
            // pageSize: Math.ceil(pathList.length/9),
            total: pathList.length
        },() => {
            console.log("points:",this.state.pathList);
            this.setPathMap();
        });

        let _this = this;
        setTimeout(() => {
            let icons = document.getElementsByClassName("point-icon");
            if(icons.length > 0) {
                for(var i=0;i<icons.length;i++) {
                    // 避免监听事件闭包问题
                    (function(){
                        var ele = icons[i];
                        if(ele) {
                            ele.addEventListener("mouseover",function(){
                                let data = JSON.parse(decodeURI(ele.dataset.item));
                                console.log('mouseover icon-cr');

                                _this.setState({
                                    currentPath: data
                                })
                                if(ele.getAttribute('class').indexOf('icon-sr') !== -1){
                                    ele.setAttribute('src',iconSb);
                                }
                                else if(ele.getAttribute('class').indexOf('icon-cr') !== -1){
                                    ele.setAttribute('src',iconCb);
                                }
                                else if(ele.getAttribute('class').indexOf('icon-fr') !== -1){
                                    ele.setAttribute('src',iconFb);
                                }
                                else {
                                    console.log('wrong src mouseover icon');
                                }
                            })
                            ele.addEventListener("mouseout",function(){
                                _this.setState({
                                    currentPath: {}
                                })
                                if(ele.getAttribute('class').indexOf('icon-sr') !== -1){
                                    ele.setAttribute('src',iconSr);
                                }
                                else if(ele.getAttribute('class').indexOf('icon-cr') !== -1){
                                    ele.setAttribute('src',iconCr);
                                }
                                else if(ele.getAttribute('class').indexOf('icon-fr') !== -1){
                                    ele.setAttribute('src',iconFr);
                                }
                                else {
                                    console.log('wrong src mouseout icon');
                                }
                            })
                        }
                        else {
                            console.log("add fail");
                        }
                    }())
                }
            }


        }, 1000);

    }
    componentWillUnmount() {
        
    }
    initMap() {
        var url =
            'http://190.35.192.2/ifaas/WebClient/lib/mapapi/overlay/{z}/{x}/{y}.png';   // 南山地图瓦片地址

        var crs = new L.Proj.CRS(
            'EPSG:900913',
            '+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
            {
                resolutions: (function() {
                let level = 19;
                let res = [];
                res[0] = Math.pow(2, 18);
                for (let i = 1; i < level; i++) {
                    res[i] = Math.pow(2, 18 - i);
                }
                return res;
                })(),
                origin: [0, 0],
                bounds: L.bounds([20037508.342789244, 0], [0, 20037508.342789244])
            }
            );

        var tilemap = L.tileLayer(url, {
            subdomains: [0, 1, 2],
            tms: true
            });
    
            
        var point1 = [22.523122, 113.923035]; //南山区南园村

        var map = L.map('pathMap', {
            crs,
            center: point1,
            zoom: 17,
            maxZoom: 18,
            minZoom: 0,
            layers: [tilemap]
        });
        
        
        this.setState({
            pathMap: map
        })
    }
    setPathMap() {
        // // var url =
        // //     'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20150518';
        
        // var url =
        //     'http://190.35.192.2/ifaas/WebClient/lib/mapapi/overlay/{z}/{x}/{y}.png';   // 南山地图瓦片地址

        var markers = this.state.pathList.map((item,index,array) => {
            let itemString = encodeURI(JSON.stringify(item));  
            return L.marker(item.point, {
                    icon: L.divIcon({
                    className: 'auto',
                    html: ` <img id=${item.id} 
                                ${index===0?'class="point-icon icon-sr point-show"'+ 'src='+iconSr:''}
                                ${index!==0 && index !== (array.length-1)?'class="point-icon icon-cr point-show"'+ 'src='+iconCr:''} 
                                ${index===(array.length-1)?'class="point-icon icon-fr point-show"'+ 'src='+iconFr:''}
                                data-item=${itemString}
                            />
                        `
                    })
                })
            } 
        );

        L.layerGroup(markers).addTo(this.state.pathMap);

        const line = L.polyline(this.state.pointsPure,{
            color: 'rgb(191, 191, 191)'
        });
        this.setState({
            line: line
        })
        line.addTo(this.state.pathMap);

    }
    pathLink(event){
        this.setState({
            headBtnClick: true
        });
        const line = L.polyline(this.state.pointsPure,{
            color: 'rgb(191, 191, 191)'
        });
        this.setState({
            line: line
        })
        line.addTo(this.state.pathMap);

        // L.polyline(this.state.pointsPure,{
        //     color: 'rgb(191, 191, 191)'
        // }).addTo(this.state.pathMap);
    }
    onMouseEnter(item) {
        this.setState({
            currentPath: item
        },()=>{
            let ele = document.getElementById(item.id);
            if(ele.getAttribute('class').indexOf('icon-sr') !== -1){
                ele.setAttribute('src',iconSb);
            }
            else if(ele.getAttribute('class').indexOf('icon-cr') !== -1){
                ele.setAttribute('src',iconCb);
            }
            else if(ele.getAttribute('class').indexOf('icon-fr') !== -1){
                ele.setAttribute('src',iconFb);
            }
            else {
                console.log('wrong src onMouseEnter liebiao');
            }
        })
    }
    onMouseLeave(item) {
        this.setState({
            currentPath: {}
        },()=>{
            let ele = document.getElementById(item.id);
            if(ele.getAttribute('class').indexOf('icon-sr') !== -1){
                ele.setAttribute('src',iconSr);
            }
            else if(ele.getAttribute('class').indexOf('icon-cr') !== -1){
                ele.setAttribute('src',iconCr);
            }
            else if(ele.getAttribute('class').indexOf('icon-fr') !== -1){
                ele.setAttribute('src',iconFr);
            }
            else {
                console.log('wrong src onMouseLeave liebiao');
            }
        })
    }
    // date: Date类型，如var date = new Date()
    // fmt: String类型,年 y,月 M,日 d,时 h,分 m,秒 s,季度 q,毫秒 S,如'yyyy--MM-dd'
    formatDate(date,fmt){
        var o = {
            "M+": date.getMonth() + 1, //月份 
            "d+": date.getDate(), //日 
            "h+": date.getHours(), //小时 
            "m+": date.getMinutes(), //分 
            "s+": date.getSeconds(), //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    startAnimation() {
        if(this.state.animatedMarker){
            this.state.animatedMarker.start();
            return;
        }

        var myIcon = L.icon({
            iconUrl: iconAnimate,
            className: 'animate-icon'
        });

        let _this = this;
        let animatedMarker = L.animatedMarker(this.state.line.getLatLngs(),{
            icon: myIcon,
            autoStart: false,
            onEnd: function(){

                _this.state.animatedMarker.stop();
            }
        });
        this.setState({
            animatedMarker: animatedMarker
        },()=>{
            this.state.pathMap.addLayer(animatedMarker);
            animatedMarker.start();
        })

    }
    // stopAnimation() {
    //     this.state.animatedMarker.stop();
    //     this.state.pathMap.removeLayer(this.state.animatedMarker);
    //     this.setState({
    //         animatedMarker: null
    //     });
    // }
    pauseAnimation() {
        console.log('pause');
        this.state.animatedMarker.pause();
        
    }
    onChangePage(page) {
        this.setState({
            pagePoints: this.state.pathList.slice((page-1)*9,9*page),
            page: page
        },() => {
            console.log("pathList:",this.state.pathList);
            console.log("pagePoints:",this.state.pagePoints);
        });

    }

    render() {
        return(
            <LocaleProvider locale={zhCN}>
            <div className="pathmap-container">
                <div id="pathMap"></div>
                <div className="pathmap-list">
                    <div className="pathmap-head">
                        <span className="pathmap-head-title">轨迹地图&nbsp;>&nbsp;</span>
                        <span className="pathmap-head-count">共{this.state.pathList.length}个点位</span>
                        {/* <span onClick={(e)=>this.pathLink(e)} 
                            className={this.state.headBtnClick?"pathmap-head-button-disable":"pathmap-head-button"}>
                            轨迹连接
                        </span> */}
                    </div>
                    <ul>
                        {
                        this.state.pagePoints.map((item,index,array) => {
                            return(
                                <li key={item.id} onMouseEnter={()=>this.onMouseEnter(item)} onMouseLeave={()=>this.onMouseLeave(item)}
                                    className={item.id===this.state.currentPath.id?"path-current":""} >
                                    <span className={index !== array.length-1 ? "pathmap-icon pathmap-line":"pathmap-icon"}>
                                        <IconText index={index} list={array} page={this.state.page} total={this.state.total} />
                                    </span>
                                    <div className="pathmap-info">
                                        <span>{item.cameraAddress}&nbsp;{item.timeFormat}</span>
                                        <span className="pathmap-info-arrow"></span>
                                    </div>
                                </li>
                            )
                        })
                        }
                    </ul>
                    {
                        this.state.headBtnClick && 
                        <div className="lushu-wrap">
                            <span className="lushu-start" onClick={()=>{this.startAnimation()}}>开始动画</span>
                            <span className="lushu-end" onClick={()=>{this.pauseAnimation()}}>停止动画</span>
                        </div>
                    }

                    <Pagination defaultCurrent={this.state.page} current={this.state.page} pageSize={this.state.pageSize} 
                                    total={this.state.total} onChange={this.onChangePage} className="pathmap-page" />
                    
                </div>
            </div>
            </LocaleProvider>
        )
    }
}

