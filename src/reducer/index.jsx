import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import "../config/polyfill.js";
const defaultState = {
    //参数初始化
    loggined:0,
    userId:0,
    auth:0,
    withdrawChecked:true,
    url:"",
    name: 'bob',
    pathList: [],
    currentPeople: {}
};
const reducer = (state = defaultState, action) => {
    switch(action.type) {
        case "SET_NAME":
            state.name = action;
            return state;
        case "SET_PATHLIST":
            state.pathList = action;
            return state;
        case "SET_CURRENTPEOPLE":
            state.currentPeople = action;
            return state;
        default:
            var ob = {};
            ob[action.type] = action.payload;
            return Object.assign({}, state, ob);
    }
    // if (action.type.indexOf("@@redux") != -1) {
    //     return state;
    // } 
    // else if(action.type === "SET_NAME") {
    //     state.name = action;
    //     return state;
    // }
    // else if(action.type === 'SET_PATHLIST'){
    //     state.pathList = action;
    //     return state;
    // }
    // else {
    //     var ob = {};
    //     ob[action.type] = action.payload;
    //     return Object.assign({}, state, ob);
    // }
};
const RootReducer = combineReducers({
    routing: routerReducer,
    app: reducer
});
export default RootReducer;