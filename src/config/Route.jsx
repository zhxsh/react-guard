import React from 'react';
import ReactDOM from 'react-dom';
import {NavLink,Route,BrowserRouter as Router,HashRouter,Switch,Redirect}  from 'react-router-dom';

import MainComponent from '../component/views/main/Main.jsx';
import PathMap from '../component/views/main/PathMap.jsx';
 
import getComponent from '../component//common/getComponent.jsx';
const routes =[
    {
        path:'/',
        exact:true,
        component: MainComponent
    },
    {
        path:'/Main',
        exact:false,
        component: MainComponent
    },
    {
        path:'/PathMap',
        exact:false,
        component: PathMap
    }
    // {
    //     path:'/AscriptionUser',
    //     exact:false,
    //     //component: PersonalCenterComponent ,
    //      component: (props) => getComponent(props, ()=> import('../../component/AscriptionUser.jsx'))
    // },
   
];
const RouteConfig = (
    <Switch>
    {
      routes.map((route,index)=>{
        return(
                  <Route
                   key ={index}
                   path={route.path}
                   exact={route.exact}
                   component={route.component}                
                  />
                )})
    }
    <Redirect from='' to="/" />
    </Switch>
);  

 

export default RouteConfig;
