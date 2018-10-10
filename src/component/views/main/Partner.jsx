import React from 'react';
import { connect } from "react-redux";
import actions from '../../../action/action.jsx';
import store from '../../../config/Store.jsx';
import { Checkbox,Modal,Menu,Button,message,Dropdown,Divider,Spin,LocaleProvider,DatePicker,Input } from "antd";
import moment from 'moment';

// 引入柱状图
require('echarts/lib/chart/bar');
require('echarts/lib/chart/line');
// 引入提示框和标题组件
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');
import uri from '../../../config/uri';
import Axios from 'axios';

import CheckboxGroup from 'antd/lib/checkbox/Group';
// import { isMoment } from 'moment';


const Search = Input.Search;

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
class PartnerComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // faceImgBaseUrl: "http://192.168.81.43",      // 图片地址前缀龙岗开发过程
            faceImgBaseUrl: "http://190.35.194.198",        // 图片地址前缀南山线上
            loading: false,                                 // 显示loading层

            currentCommunity: {},                           // 当前社区,用于获取 所有摄像头
            currentPeople: {},                              // 当前人员，从main.jsx中得到

            yesterday: null,
            startTime: '',
            endTime: '',
            // endOpen: false,

            chooseCameraVisible: false,                     // 选择摄像头 弹出层
            // cameraInfo: {},                              // 后台返回的摄像头数据
            cameraList: [],                                 // 摄像头列表
            currentStationCameras: [],
            defaultSelectedKeys: [],                        // 默认选中的派出所
            cameraOptionsAll: [],                           // 摄像头转成label value形式 总的
            cameraOptions: [],                              // 摄像头转成label value形式 当前派出所的
            cameraOptionsFilter: [],                        // 摄像头转成label value形式 搜索选中的
            checkedList: [],                                // 选中的摄像头id
            checkedListConfirm: [],                         // 点击确定后选中的摄像头
            defaultCheckedList: [],                         // 默认选中的摄像头id
            checkAll: true,                                 // 全选所有
            checkStationAll: true,                          // 全选选中的派出所所有

            searchCameraStatus: false,                      // 全选状态，不显示全部摄像头CheckBox

            list: [],
            detailList: [],
            detailCount: 0,
            total: 0,
            partnerChoosen: {},  
            currentIndex: 0,


            currentTargetPersonFace: {},
            currentPeerPersonFace: {},
            currentPartnerImg: {},
            currentTargetImg: {},
            faceImgRect: {},

            partnerImgVisible: false,                   // 同行人员大图 Modal
            targetImgVisible: false
        };

        this.props.onRef(this);

        this.getCameras = this.getCameras.bind(this);

        this.ptrStartDateChange = this.ptrStartDateChange.bind(this);
        this.disabledStartDate = this.disabledStartDate.bind(this);
        this.ptrEndDateChange = this.ptrEndDateChange.bind(this);
        this.disabledEndDate = this.disabledEndDate.bind(this);
        // this.handleStartOpenChange = this.handleStartOpenChange.bind(this);
        // this.handleEndOpenChange = this.handleEndOpenChange.bind(this);
        this.handleTime = this.handleTime.bind(this);
        this.emitLoading = this.emitLoading.bind(this);
        this.checkAllChange = this.checkAllChange.bind(this);
        this.checkStationAllChange = this.checkStationAllChange.bind(this);
        this.searchCamera = this.searchCamera.bind(this);

        this.stationClick = this.stationClick.bind(this);
        this.changePeople = this.changePeople.bind(this);

    }
    componentWillMount() {
        // const currentPeople = store.getState().app.currentPeople.currentPeople;
        const currentPeople = this.props.currentPeople;
        if(!currentPeople){
            message.info('获取陌生人失败');
            return;
        }
        console.log("currentPeople:",currentPeople);

        if(!sessionStorage.partnerHandleTip) {
            message.info('同行分析数据量大,加载时间较长',5);
            sessionStorage.partnerHandleTip = true;
        }


        const yesterday = this.formatDate(new Date((new Date()).getTime() - 1000*60*60*24),'yyyy-MM-dd');
        
        let startTime = sessionStorage['partnerStartTime'] || yesterday + ' 00:00:00';
        let endTime = sessionStorage['partnerEndTime'] || yesterday + ' 11:59:59';

        if(sessionStorage.currentCommunity) {
            // 获取当前派出所下摄像头
            const currentCommunity = JSON.parse(sessionStorage.currentCommunity);

            let partnerCheckedListConfirm = [];
            if(sessionStorage['partnerCheckedListConfirm']) {
                partnerCheckedListConfirm = sessionStorage['partnerCheckedListConfirm'].split(',').toString();
            }
            else {
                partnerCheckedListConfirm = currentCommunity.cameraIds.split(',').toString();
            }
            
            // const currentCommunity = this.props.currentCommunity;
            console.log("currentCommunity:",currentCommunity);

            this.setState({
                startTime: startTime,
                endTime: endTime,
                yesterday: new Date(yesterday + " 00:00:00"),
                currentPeople: currentPeople,
                currentCommunity: currentCommunity,
                checkedListConfirm: partnerCheckedListConfirm
            },()=>{
                this.getList();
            })


            // 开发环境
            const cameraUri = uri.cameraList + currentCommunity.cameraIds;
            // const cameraUri = uri.cameraList + "667, 668, 712, 716, 715, 737, 738, 743, 747, 748, 750, 753";
            // const cameraUri = uri.cameraList + "667,668";

            const _this = this;
            Axios.get(cameraUri)
                .then(function(res){
                    const data = res.data;
                    if(data.errCode === 0 && data.data){
                        console.log('cameraData:',data.data);
                        console.log('cameraList:',data.data[0].cameras);
                        let cameraOptionsAll = [];
                        let cameraOptions = [];
                        let checkedList = [];
                        // 加载返回的所有派出所的摄像头
                        data.data.map((station,index) => {
                            station.cameras.map(item => {
                                if(index === 0){
                                    cameraOptions.push({
                                        label: item.displayName,
                                        value: item.id
                                    })
                                }
                                cameraOptionsAll.push({
                                    label: item.displayName,
                                    value: item.id
                                })
                                checkedList.push(item.id);
                            })
                        })
                        
                        // 只加载一个派出所的摄像头
                        // data.data[0].cameras.map(item => {
                        //     cameraOptionsAll.push({
                        //         label: item.displayName,
                        //         value: item.id
                        //     })
                        //     checkedList.push(item.id);
                        // })
                        _this.setState({
                            cameraList: data.data,
                            defaultSelectedKeys: [data.data[0].stationId.toString()],
                            currentStationCameras: data.data[0],
                            cameraOptionsAll: cameraOptionsAll,
                            cameraOptions: cameraOptions,
                            checkedList: checkedList,
                            checkedListConfirm: checkedList
                        })
                    }
                    else {
                        message.warn(res.data.data);
                    }
                })
                .catch(function(error){
                    console.log(error.message);
                    message.error('连接服务器失败');
                });
        }
        else {
            message.info('获取摄像头失败');
        }

    }
    componentDidMount() {
        // const currentPeople = store.getState().app.currentPeople.currentPeople;

        // const currentPeople = this.props.currentPeople;
        // if(!currentPeople){
        //     message.info('获取陌生人失败');
        //     return;
        // }
        // console.log("currentPeople:",currentPeople);

        // const yesterday = this.formatDate(new Date((new Date()).getTime() - 1000*60*60*24),'yyyy-MM-dd');

    }
    componentDidUpdate() {
        let iconBottom = document.querySelector('.details-list-bottom');
        if(iconBottom) {
            let icon = iconBottom.children[0];
            const fontSize = sessionStorage.htmlFontSize;
            const a = ((fontSize/12*20)-10)/2+1;
            icon.style.left = a+'px';
        }
    }
    componentWillReceiveProps(nextProps) {
    
    }
    componentWillUnmount(){
        sessionStorage['partnerStartTime'] = this.state.startTime;
        sessionStorage['partnerEndTime'] = this.state.endTime;
        sessionStorage['partnerCheckedListConfirm'] = this.state.checkedListConfirm.toString();

        const data = {
            data: this.state.list,
            total: this.state.total
        }

        sessionStorage['partnerData'] = JSON.stringify(data);

    }
    getCameras() {
        console.log('getCameras',this.state.currentCommunity);

        // 开发环境
        const cameraUri = uri.cameraList + this.state.currentCommunity.cameraIds;
        // const cameraUri = uri.cameraList + "667, 668, 712, 716, 715, 737, 738, 743, 747, 748, 750, 753";
        // const cameraUri = uri.cameraList + "667,668";

        const _this = this;
        Axios.get(cameraUri)
            .then(function(res){
                const data = res.data;
                if(data.errCode === 0 && data.data){
                    console.log('cameraData:',data.data);
                    console.log('cameraList:',data.data[0].cameras);
                    let cameraOptionsAll = [];
                    let cameraOptions = [];
                    let checkedList = [];
                    // 加载返回的所有派出所的摄像头
                    data.data.map((station,index) => {
                        station.cameras.map(item => {
                            if(index === 0){
                                cameraOptions.push({
                                    label: item.displayName,
                                    value: item.id
                                })
                            }
                            cameraOptionsAll.push({
                                label: item.displayName,
                                value: item.id
                            })
                            checkedList.push(item.id);
                        })
                    })
                    
                    // 只加载一个派出所的摄像头
                    // data.data[0].cameras.map(item => {
                    //     cameraOptionsAll.push({
                    //         label: item.displayName,
                    //         value: item.id
                    //     })
                    //     checkedList.push(item.id);
                    // })
                    _this.setState({
                        cameraList: data.data,
                        defaultSelectedKeys: [data.data[0].stationId.toString()],
                        currentStationCameras: data.data[0],
                        cameraOptionsAll: cameraOptionsAll,
                        cameraOptions: cameraOptions,
                        checkedList: checkedList,
                        checkedListConfirm: checkedList
                    })
                }
                else {
                    message.warn(res.data.data);
                }
            })
            .catch(function(error){
                console.log(error.message);
                message.error('连接服务器失败');
            });
    }
    // 获取同行人员列表
    getList() {

        if(sessionStorage.partnerData) {
            const data = JSON.parse(sessionStorage.partnerData);

            if(data.data.length>0) {
                this.setState({
                    list: data.data,
                    total: data.total,
                    detailCount: data.data[0].peerCount,
                    detailList: data.data[0].peerFaceList
                });
            }
            else {
                this.setState({
                    list: [],
                    total: 0,
                    detailCount: 0,
                    detailList: []
                });
            }
            return;
        }

        const u = uri.peerList + "page/1/pagesize/100";
        const payload = {
            "strangerId": this.state.currentPeople.id,
            "startTime": this.state.startTime,
            "endTime": this.state.endTime,
            "cameraIds": this.state.checkedListConfirm.toString()
        }


        // const payload = {
        //     "strangerId": 2,
        //     "startTime": this.state.startTime,
        //     "endTime": this.state.endTime,
        //     "cameraIds": this.state.currentCommunity.cameraIds
        // }


        // const payload = {
        //     "strangerId": 176,
        //     "startTime": '2018-08-01 00:00:00',
        //     "endTime": '2018-08-05 00:00:00',
        //     "cameraIds": '667, 668, 712, 716, 715, 737, 738, 743, 747, 748, 750, 753'
        // };


        let timer = setTimeout(() => {
            _this.setState({
                loading: true
            });
        }, 200);

        let _this = this;
        Axios.post(u,payload)
            .then(function(res){
                clearTimeout(timer);
                _this.setState({
                    loading: false
                });
                const data = res.data;
                if(data.errCode === 0 && data.data){
                    if(data.data.length>0) {
                        _this.setState({
                            list: data.data,
                            total: data.total,
                            detailCount: data.data[0].peerCount,
                            detailList: data.data[0].peerFaceList
                        });
                    }
                    else {
                        message.info('无同行人员');
                        _this.setState({
                            list: [],
                            total: 0,
                            detailCount: 0,
                            detailList: []
                        });
                    }
                }
                else {
                    message.warn(res.data.data);
                }
            })
            .catch(function(error){
                console.log(error.message);
                message.error('连接服务器失败');
            });
    }
    // 点击左侧人员更新同行列表
    changePeople() {
        sessionStorage['partnerData'] = '';

        sessionStorage['partnerStartTime'] = '';
        sessionStorage['partnerEndTime'] = '';
        sessionStorage['partnerCheckedListConfirm'] = '';
        const yesterday = this.formatDate(new Date((new Date()).getTime() - 1000*60*60*24),'yyyy-MM-dd');
        
        let startTime = yesterday + ' 00:00:00';
        let endTime = yesterday + ' 11:59:59';

        this.setState({
            startTime: startTime,
            endTime: endTime,
            currentPeople: this.props.currentPeople,
            list: [],
            detailList: [],
            detailCount: 0,
            total: 0,
            partnerChoosen: {},  
            currentIndex: 0,
            currentTargetPersonFace: {},
            currentPeerPersonFace: {},
            currentPartnerImg: {}
        },()=>{
            console.log('changePeople');
            this.getList();
        })
    }
    // 开始日期
    ptrStartDateChange(date,dateString) {
        // if((this.state.yesterday-date)>1000*60*60*24*6 || (date-this.state.yesterday)>0) {
        //     message.info('只能选择过去7天');
        //     return 
        // }
        // if((date - new Date(this.state.endTime))>0) {
        //     message.info('开始日期不能大于结束日期');
        //     return 
        // }
        this.setState({
            startTime: dateString + ' 00:00:00'
        })
    }
    disabledStartDate(startValue) {
        const endValue = this.state.endTime;
        if(!startValue || !endValue) {
            return false;
        }
        // console.log("disabledStartDate",(startValue.valueOf() > endValue.valueOf()));
        return (
                (this.state.yesterday-new Date(startValue))>1000*60*60*24*6 
                || new Date(startValue) > new Date(endValue) 
                || (new Date(startValue))-this.state.yesterday>0
            );
    }
    // handleStartOpenChange(open){
    //     if(!open) {
    //         this.setState({ endOpen: true });
    //     }
    // }
    // handleEndOpenChange(open){
    //     // if(!open) {
    //         this.setState({ endOpen: open });
    //     // }
    // }
    // 结束日期
    ptrEndDateChange(date,dateString){
        // if((this.state.yesterday-date)>1000*60*60*24*6 || (date-this.state.yesterday)>0) {
        //     message.info('只能选择过去7天');
        //     return 
        // }
        // if((date - new Date(this.state.startTime))<0) {
        //     message.info('结束日期不能小于开始日期');
        //     return 
        // }
        if(date-(new Date(dateString + ' 11:59:59')))
        this.setState({
            endTime: dateString + ' 11:59:59'
        })
    }
    // 禁止选择的日期
    disabledEndDate(endValue) {
        const startValue = this.state.startTime;
        if(!startValue || !endValue) {
            return false;
        }
        const status = (
                        ((new Date(endValue))-this.state.yesterday)>0 
                        || this.state.yesterday-(new Date(endValue))>1000*60*60*24*6 
                        || new Date(startValue) > new Date(endValue)
                    )
        return status;
    }
    handleEndOpenChange(open) {
        this.setState({
            endOpen: open
        })
    }
    // 选择日期后确定
    filterConfirm(){
        this.setState({
            list: [],
            detailList: [],
            detailCount: 0,
            total: 0,
            partnerChoosen: {},  
            currentIndex: 0,
            currentTargetPersonFace: {},
            currentPeerPersonFace: {}
        },()=>{
            this.getList();
        });
        
    }
    // 左侧同行列表点击
    listClick(index) {
        this.setState({
            currentIndex: index,
            detailCount: this.state.list[index].peerCount,
            detailList: this.state.list[index].peerFaceList
        })
        console.log(this.state.list[index])
    }
    // 同行人员大图
    showPatnerImg(item) {
        item.peerPersonFace.partnerImgTitle = this.handleTime2(item.peerPersonFace.time)+"     "
                +this.getCameraNameById(item.peerPersonFace.sourceId);
        this.setState({
            partnerImgVisible: true,
            currentPeerPersonFace: item.peerPersonFace,
            currentTargetPersonFace: item.targetPersonFace,
            faceImgRect: {}
        });
        
        const u = uri.imageface + item.peerPersonFace.sourceFaceId;
        let _this = this;
        Axios.get(u)
        .then(function(res){
            if(res.data.errCode === 0 && res.data.data){
                const data = res.data.data;

                const j = JSON.parse(data.json);
                const rect = j.Rect;

                const imgWidth = (rect.right - rect.left)/3.3103448;
                const imgHeight = (rect.bottom - rect.top)/3.31288343558;
                const left = (rect.left)/3.3103448;
                const top = (rect.top)/3.31288343558;

                _this.setState({
                    currentPartnerImg: data,
                    faceImgRect: {
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
    
    hidePartnerImg() {
        this.setState({
            partnerImgVisible: false
        })
    }
    // 目标人员大图
    showTargetImg(item) {
        item.targetPersonFace.partnerImgTitle = this.handleTime2(item.targetPersonFace.time)+"     "
                +this.getCameraNameById(item.targetPersonFace.sourceId);
        this.setState({
            targetImgVisible: true,
            currentPeerPersonFace: item.peerPersonFace,
            currentTargetPersonFace: item.targetPersonFace,
            faceImgRect: {}
        });
        
        const u = uri.imageface + item.targetPersonFace.sourceFaceId;
        let _this = this;
        Axios.get(u)
        .then(function(res){
            if(res.data.errCode === 0 && res.data.data){
                const data = res.data.data;

                const j = JSON.parse(data.json);
                const rect = j.Rect;
                const imgWidth = (rect.right - rect.left)/3.3103448;
                const imgHeight = (rect.bottom - rect.top)/3.31288343558;
                const left = (rect.left)/3.3103448;
                const top = (rect.top)/3.31288343558;

                _this.setState({
                    currentTargetImg: data,
                    faceImgRect: {
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
    hideTargetImg() {
        this.setState({
            targetImgVisible: false
        })
    }
    
    // loading状态传给父组件 main.jsx
    emitLoading(loading) {
        // this.props.loading(loading);
    }
    // 打开 选择摄像头
    openChooseCamera() {
        this.setState({
            checkedList: this.state.checkedListConfirm
        },()=>{
            this.setState({
                chooseCameraVisible: true
            })
        })        
    }
    // 关闭 选择摄像头
    closeChooseCamera() {
        this.setState({
            chooseCameraVisible: false
        })        
    }
    // 选择摄像头确定按钮
    chooseCameraOk() {
        // message.info(this.state.checkedList.toString());
        this.setState({
            chooseCameraVisible: false,
            checkedListConfirm: this.state.checkedList
        },()=>{
            if(this.state.checkedListConfirm.length === 0) {
                message.info('请至少选择1个摄像头');
                this.setState({
                    list: [],
                    detailList: [],
                    detailCount: 0,
                    total: 0,
                    partnerChoosen: {},  
                    currentIndex: 0,
                    currentTargetPersonFace: {},
                    currentPeerPersonFace: {},
                    currentPartnerImg: {}
                })
                return;
            }
            this.getList();
        });
    }
    // 搜索摄像头
    searchCamera(val) {
        if(val === ''){
            const index = this.state.cameraList.findIndex((item)=>{
                return item.stationId === parseInt(this.state.defaultSelectedKeys[0]);
            })
            let filterCamera = [];
            this.state.cameraList[index].cameras.map(item => {
                filterCamera.push({
                    label: item.displayName,
                    value: item.id
                })
            })
            this.setState({
                checkAll: false,
                checkStationAll: false,
                checkedList: [],
                cameraOptions: filterCamera,
                searchCameraStatus: false
            })
        }
        else {
            let filterCamera = this.state.cameraOptionsAll.filter(function(item){
                return item.label.indexOf(val) !== -1;
            })
            this.setState({
                checkAll: false,
                checkStationAll: false,
                checkedList: [],
                cameraOptions: filterCamera,
                searchCameraStatus: true
            })
        }
    }
    // 点击派出所   obj.key为数组项数下标
    stationClick(obj) {
        let cameraOptions = [];
        this.state.cameraList[obj.key].cameras.map(item => {
            cameraOptions.push({
                label: item.displayName,
                value: item.id
            })
        })
        // const checkedList = Array.from(set);
        const checkStationAll = cameraOptions.every(item=>{
            return this.state.checkedList.indexOf(item.value) !== -1;
        });
        this.setState({
            currentStationCameras: this.state.cameraList[obj.key],
            defaultSelectedKeys: [this.state.cameraList[obj.key].stationId.toString()],
            cameraOptions: cameraOptions,
            cameraOptionsFilter: [],
            checkStationAll: checkStationAll
        })
    }
    // 摄像头 CheckBox 点击
    changeCamera(event) {
        console.log('checkedList:',this.state.checkedList);
        let set = new Set(this.state.checkedList);
        if(event.target.checked){
            set.add(event.target.value);
        }
        else {
            set.delete(event.target.value);
        }
        const checkedList = Array.from(set);
        const checkStationAll = this.state.cameraOptions.every(item=>{
            return checkedList.indexOf(item.value) !== -1;
        });

        this.setState({
            checkedList: checkedList,
            checkAll: set.size === this.state.cameraOptionsAll.length,
            checkStationAll: checkStationAll
        })
    }
    // 全选摄像头 CheckBox 点击
    checkAllChange(event) {
        var _this = this;
        if(event.target.checked) {
            let checkedList = [];
            _this.state.cameraOptionsAll.map(item => {
                checkedList.push(item.value);
            });
            this.setState({
                checkedList: checkedList,
                checkAll: true
            });
        }
        else {
            this.setState({
                checkedList: [],
                checkAll: false,
                checkStationAll: false
            });
        }
    }
    // 全选一个派出所摄像头 CheckBox 点击
    checkStationAllChange(event) {
        var _this = this;
        console.log("defaultSelectedKeys",this.state.defaultSelectedKeys);
        console.log("cameraOptions",this.state.cameraOptions);
        const index = this.state.cameraList.findIndex((item)=>{
            return item.stationId === parseInt(this.state.defaultSelectedKeys[0]);
        })

        let set = new Set(this.state.checkedList);
        if(event.target.checked){
            // this.state.cameraList[index].cameras.map(item=>{
            //     set.add(item.id);
            // })
            this.state.cameraOptions.map(item=>{
                set.add(item.value);
            })

            this.setState({
                checkedList: Array.from(set),
                checkStationAll: true,
                checkAll: this.state.cameraOptionsAll.length === set.size
            });
        }
        else {
            // this.state.cameraList[index].cameras.map(item=>{
            //     set.delete(item.id);
            // })
            this.state.cameraOptions.map(item=>{
                set.delete(item.value);
            })
            this.setState({
                checkedList: Array.from(set),
                checkStationAll: false,
                checkAll: false
            });
        }

    }
    // 详细标题，通过id获取摄像头名称
    getCameraNameById(id) {
        // console.log("getCameraNameById cameraList",this.state.cameraList);
        const idNum = parseInt(id);
        let retVal = "没有找到id对应的摄像头";
        this.state.cameraList.map(station => {
            station.cameras.map(camera => {
                if(idNum === camera.id){
                    retVal = camera.displayName;
                }
            })
        })
        // console.log("没有找到id对应的摄像头:",idNum);
        // console.log("cameraList:",this.state.cameraList);
        return retVal;
    }
    // 如果返回的imgUrl没有http前缀，前面加上faceImgBaseUrl
    handleImgUrl(imgUrl) {
        if(imgUrl !== null && imgUrl !== undefined && imgUrl.indexOf("http") === -1){
            return this.state.faceImgBaseUrl + imgUrl;
        }
        return imgUrl;
    }
    handleTime(milliseconde) {
        return this.formatDate(new Date(milliseconde),'hh:mm:ss');
    }
    handleTime2(milliseconde) {
        return this.formatDate(new Date(milliseconde),'yyyy-MM-dd hh:mm:ss');
    }
    handleTime3(milliseconde) {
        return this.formatDate(new Date(milliseconde),'yyyy-MM-dd');
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

        return (
            <div className='partner'>
                <div className="partner-filter">
                    <button className='choose-camera' onClick={()=>this.openChooseCamera()}>
                        {'已选择'+this.state.checkedListConfirm.length+'个摄像头'}
                        <i className="choose-camera-icon"></i>
                    </button>
                    
                    <DatePicker disabledDate={this.disabledStartDate} onChange={this.ptrStartDateChange} 
                        value={moment(this.state.startTime,'YYYY-MM-DD')}
                        //   onOpenChange={this.handleStartOpenChange}
                        className='partner-date' placeholder='开始日期' showToday={false} />
                    
                    {/* <span className='seperate'>-</span> */}
                    <Divider></Divider>
                    <DatePicker disabledDate={this.disabledEndDate} onChange={this.ptrEndDateChange} value={moment(this.state.endTime,'YYYY-MM-DD')} 
                        className='partner-date' placeholder='结束日期' 
                        // open={this.state.endOpen} onOpenChange={this.handleEndOpenChange} 
                        showToday={false} />
                    <Button type="primary" className="confirm" onClick={()=>this.filterConfirm()}>确定</Button>
                </div>
                <div className="partner-list-wrap">
                <div className='partner-list'>
                    <div className='partner-list-title'>
                        同行人员
                        <span>{this.state.total}人</span>
                    </div>
                    <div className="right-border"></div>
                    <ul>
                        {
                            this.state.list.map((item,index) => {
                                return (
                                    <li key={index} onClick={()=>this.listClick(index)}  className={index===this.state.currentIndex?'choosen':''}>
                                        <div className={index===this.state.currentIndex?'partner-list-item choosen':'partner-list-item'}>
                                            <div className={index===this.state.currentIndex?'partner-list-item-wrap choosen2':'partner-list-item-wrap'}>
                                                <span className="partner-list-img-wrap">
                                                    <img src={this.handleImgUrl(this.state.currentPeople.faceUrl)} />
                                                </span>
                                                <span title={"同行"+(item.peerCount || 0)+"次"}>
                                                    同行{item.peerCount}次
                                                </span>
                                                <span className="partner-list-img-wrap2">
                                                    <img src={this.handleImgUrl(item.peerFaceList[0].peerPersonFace.imageData)} />
                                                    <span>{this.handleTime(item.peerFaceList[0].peerPersonFace.time)}</span>
                                                </span>
                                                {
                                                    item.peerFaceList.length>1 && (
                                                        <span className="partner-list-img-wrap2">
                                                            <img src={this.handleImgUrl(item.peerFaceList[1].peerPersonFace.imageData)} />
                                                            <span>{this.handleTime(item.peerFaceList[1].peerPersonFace.time)}</span>
                                                        </span>
                                                    )
                                                }

                                                {/* {
                                                    item.peerFaceList.length===1 && (
                                                        <span className="partner-list-img-wrap2">
                                                            <img src="" />
                                                            <span>00:00:00</span>
                                                        </span>
                                                    )
                                                } */}

                                                {/* <span className="partner-list-img-wrap2">
                                                    <img src={this.handleImgUrl(item.peerFaceList[1].targetPersonFace.imageData)} />
                                                    <span>{this.handleTime(item.peerFaceList[1].targetPersonFace.time)}</span>
                                                </span> */}
                                            </div>
                                            
                                        </div>
                                        
                                    </li>
                                )
                                
                            })
                        }
                        
                    </ul>
                </div>
                </div>


                <div className='partner-details'>
                    <div className='partner-details-title'>
                        同行{this.state.detailCount}次
                    </div>
                    <ul className="partner-details-list">
                        {/* {
                            if(this.state.detailList.peerFaceList){

                            }
                        } */}
                        {
                        this.state.detailList.map((item,index)=>{
                            return (
                            <li key={index}>
                                <div className='details-list-title'>
                                    <img className="details-list-title-icon" src={require("../../../assets/images/camera.png")} />
                                    {/* <span title=''>南园村大门入口,2018-09-12南园村大门入口,2018-09-12南园村大门入口,2018-09-12南园村大门入口,2018-09-12</span> */}
                                    <span title=''>{this.getCameraNameById(item.targetPersonFace.sourceId)},{this.handleTime3(item.targetPersonFace.time)}</span>
                                    
                                </div>
                                <div className="details-list-content">
                                    <span className='details-self'>
                                        <img src={this.handleImgUrl(item.targetPersonFace.imageData)} onClick={() => this.showTargetImg(item)} />
                                        <div>
                                            {this.handleTime(item.targetPersonFace.time)}
                                            <span>本人</span>
                                        </div>
                                    </span>
                                    <span className="details-icons">
                                        <img className="detail-icon1" src={require("../../../assets/images/partner.png")} />
                                        {/* <img className="detail-icon1" src="../assets/images/left.png" />
                                        <img className="detail-icon1" src="../assets/images/left.png" /> */}
                                    </span>
                                    <span className='details-partner'>
                                        <img src={this.handleImgUrl(item.peerPersonFace.imageData)} onClick={() => this.showPatnerImg(item)} />
                                        <div>
                                            {this.handleTime(item.peerPersonFace.time)}
                                            <span>同行</span>
                                        </div>
                                    </span>
                                </div>
                            </li>
                            )
                        })
                        }
                        
                        {
                            this.state.detailList.length>0 && (
                                <div className="details-list-bottom">
                                    <i></i>
                                    <span>已经没有信息了</span>
                                </div>
                            )
                        }
                        
                    </ul>
                    <Modal
                        title={this.state.currentPeerPersonFace.partnerImgTitle}
                        visible={this.state.partnerImgVisible}
                        keyboard={true}
                        onCancel={()=>this.hidePartnerImg()}
                        footer={null}
                        className="partner-img"
                    >
                    <img src={require("../../../assets/images/close.png")} className="detail-close" alt="" 
                                            onClick= {() => {this.hidePartnerImg()}}/>
                    <div className="partner-img-content">
                        {/* <img src="../assets/images/test/6.jpg" className="content-img" alt=""/> */}
                        <img src={this.handleImgUrl(this.state.currentPartnerImg.uri)} className="content-img" alt=""/>
                        <div className="rect" style={this.state.faceImgRect}></div>
                        
                    </div>
                    <div className="content-faces">
                        <div className="fleft">
                            <span className="fleft">
                                <img src={this.handleImgUrl(this.state.currentTargetPersonFace.imageData)} className="content-face" alt=""/>
                                {/* <img src="../assets/images/test/6.jpg" className="content-face" alt=""/> */}
                            </span>
                            <span className="fleft content-face-origin">
                                <span>原图人员</span>
                                {/* <span>2018-09-10 12:00:00</span> */}
                                <span>{this.handleTime2(this.state.currentTargetPersonFace.time)}</span>
                            </span>
                        </div>
                        <div className="fright">
                            <span className="fright">
                                {/* <img src="../assets/images/test/6.jpg" className="content-face" alt=""/> */}
                                <img src={this.handleImgUrl(this.state.currentPeerPersonFace.imageData)} className="content-face" alt=""/>
                            </span>
                            <span className="fright content-face-partner">
                                <span>同行人员</span>
                                <span>{this.handleTime2(this.state.currentPeerPersonFace.time)}</span>
                                {/* <span>2018-09-10 12:00:00</span> */}
                                
                            </span>
                        </div>
                    </div>
                        
                    </Modal>
                        
                    <Modal
                        title={this.state.currentTargetPersonFace.partnerImgTitle}
                        visible={this.state.targetImgVisible}
                        keyboard={true}
                        onCancel={()=>this.hideTargetImg()}
                        footer={null}
                        className="partner-img"
                    >
                    <img src={require("../../../assets/images/close.png")} className="detail-close" alt="" 
                                            onClick= {() => {this.hideTargetImg()}}/>
                    <div className="partner-img-content">
                        {/* <img src="../assets/images/test/6.jpg" className="content-img" alt=""/> */}
                        <img src={this.handleImgUrl(this.state.currentTargetImg.uri)} className="content-img" alt=""/>
                        <div className="rect" style={this.state.faceImgRect}></div>
                        
                    </div>
                    <div className="content-faces">
                        <div className="fleft">
                            <span className="fleft">
                                <img src={this.handleImgUrl(this.state.currentTargetPersonFace.imageData)} className="content-face" alt=""/>
                                {/* <img src="../assets/images/test/6.jpg" className="content-face" alt=""/> */}
                            </span>
                            <span className="fleft content-face-origin">
                                <span>原图人员</span>
                                {/* <span>2018-09-10 12:00:00</span> */}
                                <span>{this.handleTime2(this.state.currentTargetPersonFace.time)}</span>
                            </span>
                        </div>
                        <div className="fright">
                            <span className="fright">
                                {/* <img src="../assets/images/test/6.jpg" className="content-face" alt=""/> */}
                                <img src={this.handleImgUrl(this.state.currentPeerPersonFace.imageData)} className="content-face" alt=""/>
                            </span>
                            <span className="fright content-face-partner">
                                <span>同行人员</span>
                                <span>{this.handleTime2(this.state.currentPeerPersonFace.time)}</span>
                                {/* <span>2018-09-10 12:00:00</span> */}
                                
                            </span>
                        </div>
                    </div>
                        
                    </Modal>

                </div>

                <Modal
                    title="选择摄像头范围"
                    visible={this.state.chooseCameraVisible}
                    keyboard={true}
                    onOk={()=>this.chooseCameraOk()}
                    onCancel={()=>this.closeChooseCamera()}
                    className="camera-modal"
                >
                    <img src={require("../../../assets/images/close.png")} className="detail-close" alt="" 
                                            onClick= {() => {this.closeChooseCamera()}}/>
                    <div className="filter">
                        {
                        !this.state.searchCameraStatus && (
                            <Checkbox checked={this.state.checkAll} onChange={this.checkAllChange}>
                                全部摄像头
                            </Checkbox>
                        )
                        }

                        <span className={this.state.searchCameraStatus?"fright paddingRight8":"fright"}>
                            <Search placeholder="搜索摄像头" onSearch={val=>this.searchCamera(val)} enterButton></Search>
                        </span>
                    </div>


                    <div className="camera-content">
                        <div className="police-station">
                            <Menu theme="" 
                                defaultSelectedKeys={this.state.defaultSelectedKeys}
                                openKeys={this.state.defaultSelectedKeys}
                                >
                                {
                                    this.state.cameraList.map((item,index)=>{
                                        return (
                                            <Menu.Item 
                                                key={index}
                                                onClick={this.stationClick}
                                                className={this.state.defaultSelectedKeys.indexOf(item.stationId.toString()) !== -1 ? 'ant-menu-item-selected':'' }
                                                >
                                                {item.stationName}
                                            </Menu.Item>
                                        )
                                    })
                                }
                                {/* <Menu.Item 
                                    key={this.state.cameraInfo.stationId}
                                    className='ant-menu-item-selected'
                                    >
                                    {this.state.cameraInfo.stationName}
                                </Menu.Item> */}
                            </Menu>
                        </div>
                        <div className="cameras">
                            {
                            !this.state.searchCameraStatus && (
                                <div className="station-all">
                                    <Checkbox 
                                        indeterminate={this.state.indeterminate} 
                                        checked={this.state.checkStationAll} 
                                        onChange={this.checkStationAllChange}>
                                        全选
                                        {this.state.currentStationCameras.stationName}
                                    </Checkbox>
                                </div>
                            )
                            }
                            
                            {/* <div className="camera-list">
                                <CheckboxGroup options={this.state.cameraOptions} 
                                    value={this.state.checkedList } onChange={(e)=>this.changeCamera(e)} />
                            </div> */}


                            <ul>
                                {
                                this.state.cameraOptions.map(item => {
                                    return(
                                        <li key={item.value}>
                                            <Checkbox value={item.value} checked={this.state.checkedList.indexOf(item.value) !== -1} onChange={(event)=>{this.changeCamera(event)}}>
                                                {item.label}
                                            </Checkbox>
                                        </li>
                                    )
                                })
                                }
                            </ul>


                        </div>
                    </div>


                </Modal>

                {
                    this.state.loading && 
                    <div className="loading">
                        <Spin size="large" />
                    </div>
                }
            
            </div>
        );
    }
}

export default connect(mapStoreStateToProps, mapDispatchToProps)(PartnerComponent);
