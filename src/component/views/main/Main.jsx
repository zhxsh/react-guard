import React,{createRef} from 'react';
import { NavLink as Link } from 'react-router-dom';
import { connect } from "react-redux";
import actions from '../../../action/action.jsx';
import store from '../../../config/Store.jsx';
import { Icon,Modal,Menu,Button,message,Dropdown,Pagination,Spin,LocaleProvider } from "antd";
import zhCN from 'antd/lib/locale-provider/zh_CN';

var echarts = require('echarts/lib/echarts');
// 引入柱状图
require('echarts/lib/chart/bar');
require('echarts/lib/chart/line');
// 引入提示框和标题组件
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');
import uri from '../../../config/uri';
// import Axios from '../../../node_modules/axios';
import Axios from 'axios';

import ErrorBoundary from '../../common/ErrorBoundary.jsx';

import Partner from './Partner.jsx';

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

const n = 'john';
store.dispatch(actions.changeName(n));

const SubMenu = Menu.SubMenu;
class MainComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // faceImgBaseUrl: "http://192.168.81.43",      // 图片地址前缀开发
            faceImgBaseUrl: "http://190.35.194.198",        // 图片地址前缀
            loading: false,                                 // 显示loading层

            communityList: [],                              // 所有社区
            currentCommunity: {},                           // 当前社区
            currentCommunityId: -1,                         // 当前社区id
            defaultSelectedKeys: [],                        // ant默认选择的社区
            openKeys: [],                                   // ant菜单选中的社区

            currentLabel: {},                               // 当前选择的分类标签
            labels: [                                       // 人员标签
                {
                    key: 11,
                    value: "从业者"
                },
                {
                    key: 9,
                    value: "警员"
                },
                {
                    key: 4,
                    value: "运维人员"
                },
                {
                    key: 5,
                    value: "房屋管理员(业主)家属"
                },
                {
                    key: 6,
                    value: "中介"
                },
                {
                    key: 7,
                    value: "城管"
                },
                {
                    key: 8,
                    value: "清洁人员"
                },
                {
                    key: 3,
                    value: "房屋管理员"
                },
                {
                    key: 2,
                    value: "房东(业主)"
                },
                {
                    key: 12,
                    value: "经营者"
                },
                {
                    key: 1,
                    value: "租客"
                },
                {
                    key: -1,
                    value: "未分类人员"
                }
            ],
            labelPeopleList: [],                            // 所有labelpeople                          // 所有labelpeople
            currentPeople: {},                              // 当前labelpeople
            currentPeopleCard: {},                          // 当前labelPeople的开卡信息
            
            page: 1,
            // pageSize: 3,                                    // 每页条数
            pageSize: parseInt(localStorage.labelPeoplePageSize) || 3,
            pageSizeSet: false,                             // 页面初始化只设置一次pageSize
            total: 0,                                       // labelpeople总条数
            maxPage: 0,
            rightStatus: ['path'],                          // 右边轨迹信息(path)和门禁信息(guard)导航菜单

            pathFaces: [],                                  // 轨迹信息人员照片
            pathImgVisible: false,                          // 轨迹大图Modal显示状态
            currentPathFace: {},                            // 轨迹信息大图
            pathImgRect: {},                                // 轨迹信息大图人脸红框信息
            pathVideoVisible: false,                        // 轨迹信息的视频弹出框       
            pathFaceVideo: "",                              // 轨迹信息的视频地址
            past7Days: [],                                  // 轨迹信息折线图X轴
            past7DaysCount: [0,0,0,0,0,0,0],                // 轨迹信息折线图Y轴数据

            guardFaces: [],                                 // 所有门禁信息
            guardDetailVisible: false,                      // 门禁大图Modal显示状态
            currentResembleInfo: {},                        // 门禁信息大图
            videoVisible: false,                            // 门禁信息的视频弹出框
            
        };

        this.setBodyFontSize();

        // this.partnerrr = React.createRef();

        this.onOpenChange = this.onOpenChange.bind(this);
        this.onChangePage = this.onChangePage.bind(this);
        this.getLabelPeopleList = this.getLabelPeopleList.bind(this);
        this.setChart = this.setChart.bind(this);
        this.getCardInfo = this.getCardInfo.bind(this);
        this.peopleClick = this.peopleClick.bind(this);
        this.handleLabelImgUrl = this.handleLabelImgUrl.bind(this);
        this.handelCardCreateTime = this.handelCardCreateTime.bind(this);

        this.partnerrr = this.partnerrr.bind(this);
    }
    partnerrr(ref){
        this.child = ref;
    }
    componentWillMount() {
        let today = new Date().getTime();

        const past7Days = [];
        for(let i = 1;i<8;i++){
            let date = new Date(today-1000*60*60*24*i);
            past7Days.unshift(this.formatDate(date,"MM-dd"));
        }
        this.setState({
            past7Days: past7Days,
            // pageSize: parseInt(localStorage.labelPeoplePageSize) || 3
        })


        sessionStorage.pathList = "";

        // const n = 'john';
        // const boundCompleteTodo = n => dispatch(actions.changeName(n));
        // boundCompleteTodo(n);
        // console.log(boundCompleteTodo);
    }
    componentDidMount() {
        if(this.state.rightStatus.indexOf('path') !== -1) {
            this.setChart()
        }
        // 默认显示陌生人
        this.setState({
            // currentLabel: this.state.labels[6]
            currentLabel: this.state.labels[this.state.labels.length-1]
            // currentLabel: this.state.labels[0]
        })

        var _this = this;
        //  获取社区信息菜单
        Axios.get(uri.groupCommunityInfo)
            .then(function(res){
                // debugger;
                // const data = res.data[0];
                const data = res.data;
                if(data.errCode === 0 && data.data){
                    _this.setState({
                        communityList: data.data
                    })
                    const first = data.data[0];
                    if(first){
                        _this.setState({
                            currentCommunity: first.communityInfo[0],
                            currentCommunityId: first.communityInfo[0].id,
                            openKeys: [first.stationId],
                            defaultSelectedKeys: [first.communityInfo[0].id.toString()]
                        })
                    }

                    sessionStorage.currentCommunity = JSON.stringify(first.communityInfo[0]);

                    _this.communityKeys = data.data.map(item => item.stationId);

                    _this.getLabelPeopleList();

                }
                else {
                    message.warn(res.data.data);
                    _this.setState({
                        communityList: [],
                        currentCommunity: {},
                        currentCommunityId: -1
                    })
                }
            })
            .catch(function(error){
                console.log(error.message);
                message.error('连接服务器失败');
            })
    }
    componentWillUnmount() {

    }
    // js设置rem大小
    setBodyFontSize() {
        function handler(){
            var w=window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
            
            sessionStorage.htmlFontSize = w/1366 * 12;

            document.documentElement.style.fontSize = w/1366 * 12 + 'px';
        }
        if(document.addEventListener) {
            document.addEventListener("DOMContentLoaded",handler,false);
        }
        else if(document.attachEvent) {
            window.attachEvent("onload",handler);
        }
    }
    // 获取屏幕高度设置人员列表pageSize
    setPageSize() {
        // if(!this.state.pageSizeSet) {
            const left = document.querySelector('.left');
            if(left){
                const leftheight = left.clientHeight;
                const labelHeight = left.children[0].clientHeight;
                if(left.children[1].children) {
                    const liHeight = left.children[1].children[0].clientHeight;
                    // const pageHeight = left.children[2].clientHeight;
                    const pageSize = Math.floor((leftheight - labelHeight - 60)/liHeight);
                    localStorage.labelPeoplePageSize = pageSize;
                    this.setState({
                        pageSize: pageSize,
                        pageSizeSet: true
                    })
                }
            }
        // }
    }
    // 点击菜单选择社区
    changeCommunity(item,e) {
        this.setState({
            currentCommunityId: item.id,
            currentCommunity: item,
            page: 1
        }, ()=>{
            this.getLabelPeopleList();
        })
    }
    // 菜单切换的控制函数
    onOpenChange(openKeys) {
        console.log("openKeys:",openKeys);

        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
        
        if (this.communityKeys.indexOf(latestOpenKey) === -1) {
            this.setState({ openKeys });
        } 
        else {
            let station = this.state.communityList.find(item => latestOpenKey === item.stationId.toString());
            this.setState({
                openKeys: latestOpenKey ? [latestOpenKey] : [],
                currentCommunity: station.communityInfo[0],
                currentCommunityId: station.communityInfo[0].id,
                page: 1
            }, ()=>{
                this.getLabelPeopleList();
            });
        }
    }
    // 设置轨迹信息折线图
    setChart() {
        let echartsEle = document.getElementById('main');
        if(!echartsEle){
            console.log("echartsEle null");
            return;
        }
        var myChart = echarts.init(echartsEle);
        const x = this.state.past7Days;
        const y = this.state.past7DaysCount;
        // 绘制图表
        myChart.setOption({
            title: {
                text: "出入规律分析",
                textStyle: {
                    fontSize: 14,
                    color: '#333333'
                }
            },
            tooltip: {
                formatter: '抓拍张数:{c0}<br />日期:{b0}',
                backgroundColor: '#FFFFFF',
                textStyle: { color: '#B2B3B2' },
                borderColor: 'rgba(0,0,0,0.06)',
                borderWidth: 1
            },
            xAxis: {
                data: x,
                // offset: 0,
                position: 'bottom',
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: "#F7F7F7"
                    }
                },
                axisTick: {
                    show: false
                },
                boundaryGap: false,
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#B2B3B2',
                        fontSize: 12
                    },
                    margin: 14
                },
                axisLine: {
                    lineStyle: {
                        color: "#F7F7F7"
                    }
                }
            },
            yAxis: {
                max: function(value){
                    return value.max < 4 ? 4 : value.max;
                },
                boundaryGap: false,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: "#F7F7F7"
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#B2B3B2',
                        fontSize: 12
                    },
                    margin: 27
                },
                axisLine: {
                    lineStyle: {
                        color: "#F7F7F7"
                    }
                }
            },
            grid: {
                top:40,
                bottom: 30,
                left: 45,
                right: 25
            },
            color: ['#0077F8'],
            series:{
                type: 'line',
                data: y,
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: '#e6f2fe' // 0% 处的颜色
                        }, {
                            offset: 1, color: '#FFFFFF' // 100% 处的颜色
                        }],
                        globalCoord: false
                    }
                }
            }
        });
    }
    // 获取左侧人员列表
    getLabelPeopleList() {
        const payload = {
            minTimes: 1,
            labels: this.state.currentLabel.key,
            communityId: this.state.currentCommunity.id
        };
        const page = this.state.page;
        const pageSize = this.state.pageSize;
        const u = uri.labelPeopleList +`page/${page}/pagesize/${pageSize}`;
    
        sessionStorage.pathList = "";


        var _this = this;
        let timer = setTimeout(() => {
            _this.setState({
                loading: true
            });
        }, 200);
        Axios.post(u,payload)
            .then(function(res){
                clearTimeout(timer);
                _this.setState({
                    loading: false
                });

                if(res.data.errCode === 0 && res.data.data){
                    _this.setState({
                        // page: page,
                        maxPage: res.data.maxPage,
                        total: res.data.total,
                        currentPeople: res.data.data[0]
                        
                    }, () => {
                        sessionStorage['partnerData'] = '';
                        
                        if(_this.state.rightStatus.indexOf("partner")!==-1) {
                            console.log('getLabelPeopleList changePeople');
                            _this.child.changePeople();
                        }

                        store.dispatch(actions.setCurrentPeople(res.data.data[0]));

                        _this.setState({
                            labelPeopleList: res.data.data
                        });
                        if(res.data.data.length === 0) {
                            message.info("暂无"+_this.state.currentLabel.value);
                            return;
                        }

                        _this.getPathFaces();
                        _this.getGuardList();
                        _this.getCardInfo();
                    })
                }
                else {
                    message.warning(res.data.data);
                    _this.setState({
                        labelPeopleList: [],
                        currentPeople: {},
                        page: 1,
                        maxPage: 1,
                        total: 0
                    })
                }
            })
            .catch(function(error){
                _this.setState({
                    loading: false
                },() => {
                    console.log(error.message);
                    message.error('连接服务器失败');
                });
            })
    }
    // 分页跳转
    onChangePage(pageNumber) {
        this.setState({
            page: pageNumber
        },() => {
            this.getLabelPeopleList();
        });
    }
    // 选择左侧人员上边标签
    labelClick(item) {
        this.setState({
            labelUpdateStatus: true,
            currentLabel: item,
            page: 1,
            maxPage: 1,
            labelPeopleList: [],
            currentPeople: {},
            currentPathPeople: {},
            currentPeopleCard: {},
            guardFaces: [],
            pathFaces: [],
            past7DaysCount: [0,0,0,0,0,0,0]
        }, () => {
            if(this.state.rightStatus.indexOf("path") !== -1){
                this.setChart();
            }
            if(item.key !== -1) {
                this.setState({
                    rightStatus: ['path']
                })
            }
            this.getLabelPeopleList(true);
        })
        
    }
    // 更新人员标签
    labelUpdate(item) {
        if(item.key === -1) {
            message.info('已分类人员不能修改为未分类人员，可改为其他分类人员');
            return;
        }
        // 需要避免 peopleClick 函数发出请求，因为setState并不是立即生效
        // 所以声明全局变量labelUpdateStatus,
        // 因为overlay={menu}得不到当前人员id,所以在peopleClick中发出请求，在此之前labelUpdateStatus中传入要修改成的label
        window.labelUpdateStatus = {
            status: true,
            data: {
                label: item.key,
                labelVaue: item.value,
                labelPeopleListLenth: this.state.labelPeopleList.length         // 为1时加载上一页
            }
        }

    }
    labelUpdateRequest(payload,labelPeopleListLenth,oldLabelValue) {
        const _this = this;
        const u = uri.updatewhite;
        Axios.post(u,payload)
            .then(function(res){
                console.log('labelUpdateRequest res',res)
                if(res.data.errCode === 0 && res.data.data === "success") {
                    // alert('hhh');
                    setTimeout(() => {
                        message.success('已修改成"'+oldLabelValue+'"');
                    }, 0);
                    // message.success('已修改成"'+oldLabelValue+'"');
                }
                else {
                    message.warn(res.data.data.toString());
                }
                // 当 labelPeopleListLenth 等于1，加载上一页
                if(labelPeopleListLenth === 1){
                    let page = _this.state.page - 1;
                    page = page > 0 ? page : 1;
                    _this.setState({
                        page: page
                    }, () => {
                        _this.getLabelPeopleList();
                    })
                }
                else {
                    _this.getLabelPeopleList();
                }
            })
            .catch(function(error){
                message.error(error.toString());
                message.warning("修改标签失败！");
            })
    }
    // 点击左侧人员列表
    peopleClick(item) {
        sessionStorage.pathList = "";
        if(window.labelUpdateStatus && window.labelUpdateStatus.status){
            if(window.labelUpdateStatus.data.label === this.state.currentLabel.key)  return;

            this.setState({
                past7DaysCount: [0,0,0,0,0,0,0],
                labelPeopleList: [],
                pathFaces: [],
                guardFaces: [],
                currentPeople: {},
                currentPeopleCard: {},
                currentPathFace: {},
                currentResembleInfo: {}
            },() => {
                if(this.state.rightStatus.indexOf("path") !== -1){
                    this.setChart();
                }
            });

            // 人员更新标签点击，冒泡到人员点击列表
            const payload = {
                communityId: this.state.currentCommunityId,
                label: window.labelUpdateStatus.data.label,
                lastlabel: this.state.currentLabel.key,
                strangerId: item.id
            };
            this.labelUpdateRequest(payload,window.labelUpdateStatus.data.labelPeopleListLenth,window.labelUpdateStatus.data.labelVaue);
            window.labelUpdateStatus = null;
            return;
        }

        store.dispatch(actions.setCurrentPeople(item));
        this.setState({
            currentPeople: item,
            currentPeopleCard: {},
            currentPathFace: {},
            currentResembleInfo: {},
            pathFaces: [],
            guardFaces: [],
            past7DaysCount: [0,0,0,0,0,0,0]
        }, () => {
            // this.setChart();
            this.getPathFaces();
            this.getGuardList();
            this.getCardInfo();

            sessionStorage['partnerData'] = '';
            if(this.state.rightStatus.indexOf("partner")!==-1) {
                this.child.changePeople();
            }
        })
    }
    // 获取轨迹信息照片
    getPathFaces(){
        if(!this.state.currentPeople){
            message.warn('没有人员');
            return;
        }
        sessionStorage.pathList = "";

        let u;
        if(this.state.currentPeople.faceSize){
            u = uri.dateFaceList+"page/1/pagesize/"+this.state.currentPeople.faceSize;
        }
        else {
            u = uri.dateFaceList+"page/1/pagesize/1000";
        }
        
        let _this = this;
        let payload = {
            strangerId: this.state.currentPeople.id,
            label: this.state.currentLabel.key
        };
        Axios.post(u,payload,{ 
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                "Login":"yinyi",
                "Accept":"application/json;charset=UTF-8"
                }
            })
            .then(function(res){
                if(res.data.errCode === 0 && res.data.data){
                    const data = res.data.data;
                    _this.setState({
                        pathFaces: data
                    })
                    if(data.length > 0) {
                        store.dispatch(actions.setPathList(data));

                        sessionStorage.pathList = JSON.stringify(data);

                        const today = new Date(new Date().toLocaleDateString()).getTime();
                        const aDay = 1000*60*60*24;
                        const past7DaysCount = [0,0,0,0,0,0,0];

                        if(!localStorage.labelPeoplePageSize) {
                            _this.setPageSize();
                        }


                        for(let i=0;i<data.length;i++){
                            let item = res.data.data[i];
                            let timeLeaveToday = today - item.time;
                            if(timeLeaveToday < 0){
                                continue;
                            }else if(timeLeaveToday < aDay){
                                past7DaysCount[6] ++;
                            }else if(timeLeaveToday < aDay*2){
                                past7DaysCount[5] ++;
                            }else if(timeLeaveToday < aDay*3){
                                past7DaysCount[4] ++;
                            }else if(timeLeaveToday < aDay*4){
                                past7DaysCount[3] ++;
                            }else if(timeLeaveToday < aDay*5){
                                past7DaysCount[2] ++;
                            }else if(timeLeaveToday < aDay*6){
                                past7DaysCount[1] ++;
                            }else if(timeLeaveToday < aDay*7){
                                past7DaysCount[0] ++;
                            }
                            else if(timeLeaveToday < aDay*8){
                                continue;
                            }
                        }
                        _this.setState({
                            past7DaysCount: past7DaysCount
                        });
                        if(_this.state.rightStatus.indexOf("path") !== -1){
                            _this.setChart();
                        }
                    }
                    else {
                        _this.setChart();
                    }
                }
                else {
                    message.warning(res.data.data);
                    
                }
            })
            .catch(function(error){
                console.log(error.message);
                message.error('连接服务器失败');
            })
    }
    // 获取门禁信息照片
    getGuardList(){
        if(!this.state.currentPeople){
            message.error('没有人员');
            return;
        }
        let u;
        // 未分类人员的门禁信息
        if(this.state.currentPeople.label === -1) {
            u = uri.accesseventStrangerList+"page/1/pagesize/100";
        }
        // 已分类人员(居民，从业人员等等)的门禁信息
        else {
            u = uri.accesseventList+"page/1/pagesize/100";
        }
        
        let _this = this;
        let payload = {
            strangerId: this.state.currentPeople.id
        };
        Axios.post(u,payload,{ 
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                "Login":"yinyi",
                "Accept":"application/json;charset=UTF-8"
                }
            })
            .then(function(res){
                if(res.data.errCode === 0 && res.data.data){
                    _this.setState({
                        guardFaces: res.data.data
                    })
                }
                else {
                    message.warning(res.data.data);
                    _this.setState({
                        
                    })
                }
            })
            .catch(function(error){
                console.log(error.message);
                message.error('连接服务器失败');
            })
    }
    // 获取门卡信息
    getCardInfo(){
        if(!this.state.currentPeople){
            message.error('没有人员');
            return;
        }
        const u = uri.getCardInfo+ this.state.currentPeople.id;
        
        let _this = this;
        let payload = {
            strangerId: this.state.currentPeople.id
        };

        // 未分类人员 无开卡信息
        if(this.state.currentPeople.label === -1) {
            this.setState({
                currentPeopleCard: {}
            })
            return;
        }

        Axios.get(u)
            .then(function(res){
                if(res.data.errCode === 0 && res.data.data){
                    _this.setState({
                        currentPeopleCard: res.data.data
                    })
                }
                else {
                    message.warning(res.data.data);
                    _this.setState({
                        
                    })
                }
            })
            .catch(function(error){
                console.log(error.message);
                message.error('连接服务器失败');
            })
    }
    // 轨迹信息 门禁信息切换
    handleStaus(e) {
        if(this.state.rightStatus.indexOf(e.key) !== -1)  return;
        this.setState({ rightStatus:[e.key] });
        if(e.key === 'path') {
            setTimeout(() => {
                this.setChart()                
            }, 0);
        }
    }
    // 查看轨迹信息大图
    openPathImg(item){
        this.setState({
            pathImgVisible: true,
            currentPathPeople: item
        })
        

        let _this = this;
        const u = uri.imageface + item.id;
        Axios.get(u)
            .then(function(res){
                if(res.data.errCode === 0 && res.data.data){
                    const pathFace = res.data.data;
                    if(item.sourceId){
                        pathFace.sourceId = item.sourceId;
                    }
                    const j = JSON.parse(pathFace.json);
                    const rect = j.Rect;

                    const imgWidth = (j.FaceImageRect.right - j.FaceImageRect.left)/2;
                    const imgHeight = (j.FaceImageRect.bottom - j.FaceImageRect.top)/2;
                    const left = (rect.left)/2 - 17;
                    const top = (rect.top)/2 - 20;

                    _this.setState({
                        currentPathFace: pathFace,
                        pathImgRect: {
                            left: left,
                            top: top,
                            width: imgWidth,
                            height: imgHeight
                        }
                    })
                }
                else {
                    message.warning(res.data.data);
                }
            })
            .catch(function(error){
                console.log(error.message);
                message.error('连接服务器失败');
            })
    }
    openPathVideo() {
        // const video = document.getElementById("pathFaceVideo");
        // video.play();
        // if(video.paused){
        //     message.info('paused')
        // }
        
        // 用之前接口，无轨迹视频
        message.info("无视频")
        return;

        const cameraId = this.state.currentPathFace.sourceId;
        if(cameraId){
            const startTime = this.state.currentPathFace.time - 20*1000;
            const endTime = this.state.currentPathFace.time + 20*1000;
            const u = uri.strammedia + `${cameraId}/start/${startTime}/end/${endTime}`;

            let _this = this;
            Axios.get(u)
                .then(function(res){
                    message.info(res.data.data.toString());
                    if(res.data.errCode === 0 && res.data.data != ""){
                        _this.setState({
                            pathFaceVideo : res.data.data
                        })
                        this.setState({
                            pathVideoVisible: true,
                            pathImgVisible: false
                        });
                    }
                    else {
                        message.warning(res.data.data);
                    }
                })
                .catch(function(error){
                    console.log(error.message);
                    message.error('连接服务器失败');
                })
        }
    }
    closePathVideo(){
        const video = document.getElementById("pathFaceVideo");
        video.pause();
        this.setState({
            pathVideoVisible: false,
            pathImgVisible: false
        });
    }
    closePathImg() {
        this.setState({
            pathImgVisible: false,
            currentPathFace: {}
        })
    }
    // 上一张图片
    prePathImg() {
        const index = this.state.pathFaces.indexOf(this.state.currentPathPeople);
        if(index === 0 || index === -1){
            message.info("当前已是第一张");
            return;
        }
        this.openPathImg(this.state.pathFaces[index-1]);
        this.setState({
            currentPathPeople: this.state.pathFaces[index-1]
        });
    }
    // 下一张图片
    nextPathImg() {
        const index = this.state.pathFaces.indexOf(this.state.currentPathPeople);
        if(index === this.state.pathFaces.length-1 || index === -1){
            message.info("当前已是最后一张");
            return;
        }

        this.openPathImg(this.state.pathFaces[index+1]);
        this.setState({
            currentPathPeople: this.state.pathFaces[index+1]
        })
    }
    // 点击门禁信息查看大图，只获取到相似度
    openGuardDetail(item){
        this.setState({
            guardDetailVisible: true,
            currentResembleInfo: item
        })
        
        const u = uri.getResemble + "?image1=" + item.register_path + "&image2="+item.picPath;
        const payload = {
            image1: item.register_path,
            image2: item.picPath
        }
        Axios.post(u,payload)
            .then(function(res){
                if(res.data.errCode === 0 && res.data.data){
                    console.log(res.data.data);             //相似度
                }
                else {
                    message.warning(res.data.data);
                }
            })
            .catch(function(error){
                console.log(error.message);
                message.error('连接服务器失败');
            })
    }
    closeGuardDetail() {
        this.setState({
            guardDetailVisible: false
        })
    }
    openVideo() {
        message.info("无视频");
        // this.setState({
        //     videoVisible: true,
        //     guardDetailVisible: false
        // })
    }
    closeVideo() {
        this.setState({
            videoVisible: false,
            guardDetailVisible: false
        })
    }
    hangdelIdentityType(idNo){
        if(!idNo) return "";
        switch(idNo){
            case "111":
                return "身份证";
            case "112":
                return "临时身份证";
            case "113":
                return "户口簿";
            case "116":
                return "暂住证(居住证)";
            case "219":
                return "结婚证";
            case "335":
                return "机动车驾驶证";
            case "411":
                return "外交护照";
            case "412":
                return "公务护照";
            case "413":
                return "因公普通护照";
            case "414":
                return "普通护照";
            case "415":
                return "旅行证";
            case "416":
                return "入出境通行证";
            case "417":
                return "外国人出入境证";
            case "418":
                return "外国人旅行证";
            case "419":
                return "海员证";
            case "420":
                return "香港特别行政区护照";
            case "421":
                return "澳门特别行政区护照";
            case "423":
                return "澳门特别行政区旅行证";
            case "511":
                return "台湾居民来往大陆通行证";
            case "512":
                return "台湾居民来往大陆通行证(一次有效)";
            case "513":
                return "往来港澳通行证";
            case "515":
                return "前往港澳通行证";
            case "516":
                return "港澳同胞回乡证(通行卡)";
            case "517":
                return "大陆居民往来台湾通行证";
            case "518":
                return "因公往来香港澳门特别行政区通行证";
            case "551":
                return "华侨回国定居证";
            case "552":
                return "台湾居民定居证";
            case "553":
                return "外国人永久居留证";
            case "554":
                return "外国人居留证";
            case "555":
                return "外国人临时居留证";
            default:
                return "";
        }
    }
    // 如果返回的imgUrl没有http前缀，前面加上faceImgBaseUrl
    handleLabelImgUrl(imgUrl) {
        if(imgUrl !== null && imgUrl !== undefined && imgUrl.indexOf("http") === -1){
            return this.state.faceImgBaseUrl + imgUrl;
        }
        return imgUrl;
    }
    handelCardCreateTime(t){
        if(t === null || t === undefined) return;

        let date = new Date(t);
        return this.formatDate(date,"yyyy-MM-dd");
    }
    handleLoading(event) {
        console.log('from child:',event.target.value);
    }
    ptrStartDateChange(date,dateString) {
        console.log(date,dateString)
        // message.info('2');
    }
    ptrEndDateChange(date,dateString){

    }
    chooseCamera() {
        message.info('12')
    }
    filterConfirm(){
        // message.info('123')
        console.log(store.getState())
        console.log(store.getState().app.name);
        console.log(store.getState().app.pathList);
        // const n = 'john';
        // const boundCompleteTodo = n => dispatch({type:'change_name',name:n})
        // console.log(boundCompleteTodo);
    }

    //距离当前时间
    timeLeaveNow(timeStamp){
        var now = new Date().getTime();
        const today = new Date(new Date().toLocaleDateString()).getTime();  // 今天0点
        var timeLeaveNow = now - timeStamp;
        var returnText = '';
        if(timeLeaveNow > 1000*60*60*24*31){
            returnText = Math.floor(timeLeaveNow/(1000*60*60*24*31))+'个月';
        }else if(timeLeaveNow > 1000*60*60*24*7){
            returnText = Math.floor(timeLeaveNow/(1000*60*60*24*7))+'周';
        }else if(timeLeaveNow > 1000*60*60*24){
            returnText = Math.floor(timeLeaveNow/(1000*60*60*24))+'天';
        }else if(timeLeaveNow > 1000*60*60){
            returnText = Math.floor(timeLeaveNow/(1000*60*60))+'小时';
        }else if(timeLeaveNow > 1000*60){
            returnText = Math.floor(timeLeaveNow/(1000*60))+'分钟';
        }else if(timeLeaveNow > 5000){
            returnText = '1分钟';
        }else{
            returnText = '0分钟';
        }
        return returnText;
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
    render() {
        var that = this;
        // const isNull = this.state.labelPeopleList && this.state.labelPeopleList.length > 0 || false;
        // message.info("isNull:"+isNull)
        const menu = (
            <Menu>
            {
                this.state.labels.map(item => 
                    <Menu.Item key={item.key} onClick={() => {this.labelClick(item)}} className={item.key===this.state.currentLabel.key ? 'label-active' : ''}>
                        {item.value}
                    </Menu.Item>
                )
            }
            </Menu>
        );
        const labelMenu = (
            <Menu>
            {
                this.state.labels.map((item,index) => 
                    <Menu.Item key={index} onClick={() => {this.labelUpdate(item)}} className={item.key===this.state.currentLabel.key ? 'label-active' : ''}>
                        {item.value}
                    </Menu.Item>
                )
            }
            </Menu>
        );

        const titleStyle = {
            marginLeft: 20
        };

        const pageWidth = {
            width: '290px'
        }

        return (
            <ErrorBoundary>
            <LocaleProvider locale={zhCN}>
            <div className="main">
                <div className="header">
                    {/* <img src={require("../assets/images/company.png")} alt=""/> */}
                    <span style={titleStyle}>视频门禁管理系统</span>
                </div>
                <div className="container">
                    <div className="menu">
                        <Menu
                            mode="inline"
                            theme="light" 
                            openKeys={this.state.openKeys}
                            onOpenChange={this.onOpenChange}
                            defaultSelectedKeys={this.state.defaultSelectedKeys}
                            className="menu-bg"
                            >
                            {
                            this.state.communityList.map(items => {
                                return (
                                    <SubMenu key={items.stationId} 
                                    title={ <span>{items.name}</span>}>
                                        {
                                            items.communityInfo.map((item) => {
                                                return <Menu.Item key={item.id} 
                                                            className={this.state.currentCommunityId == item.id ? 'menu-select' :''}
                                                            onClick={(event) => this.changeCommunity(item,event)}>
                                                            {item.name}
                                                        </Menu.Item>
                                            }) 
                                        }
                                    </SubMenu>
                                )
                            })
                            }
                        </Menu>
                    </div>


                    <div className="content">
                        <div className="content-bar">{ this.state.currentCommunity.name || "无社区" }</div>
                        <div className="wrap">
                            <div className="left" ref="left">
                                <div className="left-labels">
                                    <Dropdown overlay={menu}>
                                        <a className="ant-dropdown-link" href="#">
                                            {this.state.currentLabel.value} <Icon type="down" />
                                        </a>
                                    </Dropdown>
                                </div>
                                <ul className="labelPeopleList">
                                        {
                                            this.state.labelPeopleList.map(item => {
                                                return (
                                                    this.state.currentPeople &&
                                                    <li className={ item.id === this.state.currentPeople.id ? "active" : ""} 
                                                        onClick={() => {this.peopleClick(item)}} key={item.id}>
                                                        <div className="imgWrap">
                                                            <img src={this.handleLabelImgUrl(item.faceUrl)} alt=""/>
                                                        </div>
                                                        <div>
                                                            <p>{item.name === null ? '无姓名': item.name}</p>
                                                            <div className="identity">{ item.identify === null ? '无身份证号':item.identify}</div>
                                                            <Dropdown overlay={labelMenu} placement="bottomLeft">
                                                                <Button className="labelPeopleBtn">
                                                                    <span>{this.state.currentLabel.value}</span>
                                                                    <div className="arrow"></div>
                                                                </Button>
                                                            </Dropdown>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                        {/* <div>
                                            <p>刘冬梅</p>
                                            <div className="identity">450223199012101111</div>
                                            <Dropdown overlay={menu} placement="bottomLeft">
                                                <Button className="labelPeopleBtn">从业人员</Button>
                                            </Dropdown>
                                        </div> */}
                                    
                                </ul>
                                {/* 分页 */}
                                <Pagination defaultCurrent={this.state.page} current={this.state.page} pageSize={this.state.pageSize} 
                                    total={this.state.total} onChange={this.onChangePage} className="intli-page" maxShowPage="5" style={pageWidth} />
                            </div>


                            <div className="right">
                                <Menu mode="horizontal" selectedKeys={this.state.rightStatus} onClick={(e) => this.handleStaus(e)}>
                                    <Menu.Item key="path">轨迹信息</Menu.Item>
                                    <Menu.Item key="guard">门禁信息</Menu.Item>
                                    { this.state.currentLabel.key === -1 &&
                                        <Menu.Item key="partner">同行分析</Menu.Item>
                                    }
                                </Menu>
                                <span className="open-path-map">
                                    {
                                        this.state.rightStatus.indexOf('path')!==-1 &&
                                        <Link to="/PathMap" target="_blank">查看轨迹地图</Link>
                                    }
                                </span>
                                <div className="right-content">
                                    { 
                                        this.state.rightStatus.indexOf('path') !== -1 &&
                                        <div className="right-content-wrap">
                                            <ul className="pathList">
                                                {/* <li onClick={()=>{this.openPathImg2()}}>
                                                    <img src="../assets/images/4.png" alt="轨迹"/>
                                                    <p>10小时</p>
                                                </li> */}

                                                {
                                                    this.state.pathFaces.map((item) => {
                                                        return(
                                                            <li key={item.id}>
                                                                <img src={item.imageData}
                                                                     onClick={()=>{this.openPathImg(item)}} alt=""/>
                                                                <p>{this.timeLeaveNow(item.time)}</p>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                            <div className="lineChart">
                                                <div id="main" >
                                                    图表
                                                </div>
                                            </div>
                                            <Modal
                                                    title="抓拍详情" 
                                                    visible={this.state.pathImgVisible}
                                                    onCancel= {() => {this.closePathImg()}}
                                                    keyboard={true}
                                                    footer={null}
                                                    className="path-modal"
                                                >
                                                    <img src={require("../../../assets/images/close.png")} className="detail-close" alt="" 
                                                        onClick= {() => {this.closePathImg()}}/>
                                                    <div className="path-detail-wrap">
                                                        <div className="direction">
                                                            
                                                        </div>
                                                        <div className="path-detail">
                                                            <img src={this.state.currentPathFace.uri} className="path-detail-img" alt="" />
                                                            <img src={require("../../../assets/images/video.png")} className="path-detail-video" onClick={()=>{this.openPathVideo()}} />
                                                            <div className="rect" style={this.state.pathImgRect}></div>
                                                            <span className="pre" onClick={() => {this.prePathImg()}}> &#60; </span>
                                                            <span className="next" onClick={() => {this.nextPathImg()}}> &#62; </span>
                                                        </div>
                                                    </div>
                                            </Modal>
                                            <Modal
                                                    title="历史视频" 
                                                    visible={this.state.pathVideoVisible} 
                                                    onCancel= {() => {this.closePathVideo()}}
                                                    keyboard={true}
                                                    footer={null}
                                                    className="video-wrap"
                                                >
                                                    {/* <div className="video-cancel">X</div> */}
                                                    {/* <video src={this.state.pathFaceVideo} id="pathFaceVideo" className="video" autoPlay>您的浏览器不支持。</video> */}
                                                    {/* <video src="../assets/images/1.mp4" id="pathFaceVideo" className="video" autoPlay>您的浏览器不支持。</video> */}
                                                </Modal>
                                        </div>
                                    }
                                    {
                                        this.state.rightStatus.indexOf('guard') !== -1 && 
                                        <div className="guard">
                                            <div className="guard-left">
                                                <div className="info-title">
                                                    <img src={require("../../../assets/images/ID.png")} alt="icon"/>
                                                    <span>身份信息</span>
                                                </div>
                                                <div className="info-id-content">
                                                    {
                                                        this.state.currentPeople ? 
                                                            (<img src={this.handleLabelImgUrl(this.state.currentPeopleCard.identityPhoto)} className="info-id-image" alt=""/>
                                                        ):(
                                                            <img src="" className="info-id-image" alt=""/>
                                                        )
                                                    }
                                                    <div className="info-item">
                                                        <span className="info-item-title">姓名:</span>
                                                        <span className="info-item-value">{this.state.currentPeopleCard.name || "--"}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-item-title">性别:</span>
                                                        <span className="info-item-value">
                                                            {this.state.currentPeopleCard.gender === 1 ? "男":""}
                                                            {this.state.currentPeopleCard.gender === 2 ? "女":""}
                                                            {(this.state.currentPeopleCard.gender !== 1) && (this.state.currentPeopleCard.gender !== 2) ? "--" : ""}
                                                        </span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-item-title">证件类型:</span>
                                                        <span className="info-item-value">{this.hangdelIdentityType(this.state.currentPeopleCard.identityType) || "--"}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-item-title">身份证:</span>
                                                        <span className="info-item-value" title={this.state.currentPeopleCard.identity}>{this.state.currentPeopleCard.identity|| "--"}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-item-title">籍贯:</span>
                                                        <span className="info-item-value" title={this.state.currentPeopleCard.household_address}>{this.state.currentPeopleCard.household_address|| "--"}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-item-title">手机号:</span>
                                                        <span className="info-item-value">{this.state.currentPeopleCard.mobile || "--"}</span>
                                                    </div>
                                                </div>

                                                <div className="info-title card">
                                                    <img src={require("../../../assets/images/card.png")} alt="icon"/>
                                                    <span>门卡信息</span>
                                                </div>
                                                <div className="info-id-content">
                                                    <div className="info-item">
                                                        <span className="info-item-title">卡号:</span>
                                                        <span className="info-item-value">{this.state.currentPeopleCard.housecard_no || "--"}</span>
                                                    </div>
                                                    {/* <div className="info-item">     人没有开门方式，不是开门事件
                                                        <span className="info-item-title">开门方式:</span>  
                                                        <span className="info-item-value">{this.state.currentPeopleCard.type === 0 ? "刷卡" : ""}</span>
                                                    </div> */}
                                                    <div className="info-item">
                                                        <span className="info-item-title">开卡日期:</span>
                                                        <span className="info-item-value">{this.handelCardCreateTime(this.state.currentPeopleCard.cardTime)  || "--"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="guard-right">
                                                <div className="info-title">
                                                    <img src={require("../../../assets/images/door.png")} alt="icon"/>
                                                    <span>门禁信息</span>
                                                </div>
                                                <div className="info-guard-content">
                                                    <ul className="guard-list">
                                                        {
                                                            // this.state.accesseventList.data.map((item) => {
                                                            this.state.guardFaces.map((item) => {
                                                                return (
                                                                    <li onClick={() => {this.openGuardDetail(item)}}>
                                                                        {/* <img src="../assets/images/4.png" alt=""/> */}
                                                                        <img src={this.handleLabelImgUrl(item.picPath)} alt=""/>
                                                                        <p>{this.timeLeaveNow(new Date(item.createTime))}</p>
                                                                    </li>
                                                                )
                                                            })
                                                        }
                                                        {/* <li onClick={() => {this.openGuardDetail()}}>
                                                            <img src="../assets/images/4.png" alt="轨迹"/>
                                                            <p>24小时</p>
                                                        </li>
                                                        <li>
                                                            <img src="../assets/images/4.png" alt="轨迹"/>
                                                            <p>24小时</p>
                                                        </li> */}
                                                        
                                                    </ul>
                                                </div>
                                                <Modal
                                                    title="门禁进入人员详情" 
                                                    visible={this.state.guardDetailVisible}
                                                    onCancel= {() => {this.closeGuardDetail()}}
                                                    keyboard={true}
                                                    footer={null}
                                                    className="guard-detail-modal"
                                                >
                                                    <img src={require("../../../assets/images/close.png")} className="detail-close" alt="" 
                                                        onClick= {() => {this.closeGuardDetail()}}/>
                                                    <div className="detail-wrap">
                                                        <div className="detail-left">
                                                            <div className="info-title">
                                                                <img src={require("../../../assets/images/ID.png")} alt="icon"/>
                                                                <span>身份信息</span>
                                                            </div>
                                                            <div className="info-id-content">
                                                                <img src={this.handleLabelImgUrl(this.state.currentResembleInfo.identityPhoto)} className="info-id-image" alt=""/>
                                                                <div className="info-item">
                                                                    <span className="info-item-title">姓名:</span>
                                                                    <span className="info-item-value">{this.state.currentResembleInfo.name || "--"}</span>
                                                                </div>
                                                                <div className="info-item">
                                                                    <span className="info-item-title">性别:</span>
                                                                    <span className="info-item-value">{this.state.currentResembleInfo.gender || "--"}</span>
                                                                </div>
                                                                <div className="info-item">
                                                                    <span className="info-item-title">证件类型:</span>
                                                                    <span className="info-item-value">{this.hangdelIdentityType(this.state.currentResembleInfo.identityType) || "--"}</span>
                                                                </div>
                                                                <div className="info-item">
                                                                    <span className="info-item-title">身份证:</span>
                                                                    <span className="info-item-value">{this.state.currentResembleInfo.identity || "--"}</span>
                                                                </div>
                                                                <div className="info-item">
                                                                    <span className="info-item-title">籍贯:</span>
                                                                    <span className="info-item-value" title={this.state.currentResembleInfo.house_address}>{this.state.currentResembleInfo.house_address || "--"}</span>
                                                                </div>
                                                                <div className="info-item">
                                                                    <span className="info-item-title">手机号:</span>
                                                                    <span className="info-item-value">{this.state.currentResembleInfo.mobile || "--"}</span>
                                                                </div>
                                                            </div>

                                                            <div className="info-title card">
                                                                <img src={require("../../../assets/images/card.png")} alt="icon"/>
                                                                <span>门卡信息</span>
                                                            </div>
                                                            <div className="info-id-content">
                                                                <div className="info-item">
                                                                    <span className="info-item-title">卡号:</span>
                                                                    <span className="info-item-value">{this.state.currentResembleInfo.cardNo || "--"}</span>
                                                                </div>
                                                                
                                                                <div className="info-item">
                                                                    <span className="info-item-title">开门方式:</span>
                                                                    <span className="info-item-value">{this.state.currentResembleInfo.open_type===0?"刷卡":"--"}</span>
                                                                </div>
                                                                <div className="info-item">
                                                                    <span className="info-item-title">开卡日期:</span>
                                                                    <span className="info-item-value">{this.handelCardCreateTime(this.state.currentResembleInfo.cardTime) || "--"}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="detail-right">
                                                            {/* <img src="../assets/images/4.png" alt=""/> */}
                                                            <img src={this.handleLabelImgUrl(this.state.currentResembleInfo.picPath)} alt=""/>
                                                            <p>
                                                                <span title={this.state.currentResembleInfo.access_address}>{this.state.currentResembleInfo.access_address}</span>
                                                                <span>{this.state.currentResembleInfo.createTime}</span>
                                                            </p>
                                                            <div className="play" onClick={() => {this.openVideo()}}>
                                                                <img src={require("../../../assets/images/play.png")} alt=""/>
                                                                <span>播放历史视频</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Modal>

                                                <Modal
                                                    title="历史视频" 
                                                    visible={this.state.videoVisible} 
                                                    onCancel= {() => {this.closeVideo()}}
                                                    keyboard={true}
                                                    footer={null}
                                                    className="video-wrap"
                                                >
                                                    {/* <div className="video-cancel">X</div> */}
                                                    {/* <video src="../assets/images/1.mp4" className="video" controls="controls" autoPlay>您的浏览器不支持。</video> */}
                                                    <video src={this.state.currentResembleInfo.videoPath} className="video" controls="controls" autoPlay>您的浏览器不支持。</video>
                                                    
                                                </Modal>

                                            </div>
                                        </div>
                                    }
                                    { this.state.rightStatus.indexOf('partner') !== -1 &&
                                        <div className="partner">
                                        
                                            <Partner 
                                                // currentCommunity={this.state.currentCommunity}
                                                loading={this.handleLoading.bind(this)}
                                                currentPeople={this.state.currentPeople}
                                                onRef={this.partnerrr}
                                                // ref="partnerrr"
                                            >
                                            
                                            </Partner>
                                        </div>
                                        
                                    }
                                </div>
                                

                            </div>
                        </div>
                    </div>
                </div>
                {
                    this.state.loading && 
                    <div className="loading">
                        <Spin size="large" />
                    </div>
                }

            </div>
            </LocaleProvider>
            </ErrorBoundary>
        );
    }
}

export default connect(mapStoreStateToProps, mapDispatchToProps)(MainComponent);
