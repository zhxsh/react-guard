const express = require('express');
const fs = require('fs');


const app = express();

app.use(function(req,res,next){
    // res.writeHead(200,{"Content-Type":"application/json;charset=utf-8" });

    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept,Login");
    res.header("Access-Control-Allow-Methods","PUT,GET,POST,DELETE,OPTIONS");

    
    if(req.method == "OPTIONS") {
        res.send(200);
        res.end();
        // return next();
    }
    else {
        return next();
    }
    // res.status(404).send('oops...');
})


let community = {};
fs.readFile('mock/json/1groupcommunityinfo.json',function(err,data) {
    if(err) console.log('json/1groupcommunityinfo.json',err);
    community = JSON.parse(data.toString());
})
app.get('/mining/analysis/community/groupcommunityinfo',(req,res) => {
    res.json(community);
})


let labelpeople = {};
fs.readFile('mock/json/2labelpeople.json',function(err,data) {
    if(err) console.log('json/2labelpeople.json',err);
    labelpeople = JSON.parse(data.toString());
})
app.post('/mining/analysis/youhua/community/labelpeople/list/page/1/pagesize/3',(req,res) => {
    res.json(labelpeople);
})


let pathface = {};
fs.readFile('mock/json/3pathface.json',function(err,data) {
    if(err) console.log('json/3pathface.json',err);
    pathface = JSON.parse(data.toString());
})
app.post('/mining/analysis/nanshan/community/labelpeople/date/face/list/page/1/pagesize/1000',(req,res) => {
    console.log('date/face/list');
    res.json(pathface);
})


let accessevent = {};
fs.readFile('mock/json/4accessevent.json',function(err,data) {
    if(err) console.log('json/4accessevent.json',err);
    accessevent = JSON.parse(data.toString());
})
app.post('/mining/analysis/nanshan/community/label/accessevent/list/page/1/pagesize/100',(req,res)=>{
    res.json(accessevent);
})


let personinfo = {};
fs.readFile('mock/json/5personinfo.json',function(err,data) {
    if(err) console.log('json/5personinfo.json',err);
    personinfo = JSON.parse(data.toString());
})
app.get('/mining/analysis/community/nanshan/stranger/accessevent/personinfo/1',(req,res)=>{
    res.json(personinfo);
})

let peerlist = {};
fs.readFile('mock/json/6peerlist.json',function(err,data) {
    if(err) console.log('json/6peerlist.json',err);
    peerlist = JSON.parse(data.toString());
})
app.post("/mining/analysis/nanshan/community/stranger/peer/list/page/1/pagesize/100",(req,res)=>{
    console.log('peer');
    res.json(peerlist);
})

let cameralist = {};
fs.readFile('mock/json/7cameralist.json',function(err,data) {
    if(err) console.log('json/7cameralist.json',err);
    cameralist = JSON.parse(data.toString());
})
app.get("/mining/analysis/nanshan/community/stranger/peer/list/camera/396,519,397,398,520,399,400,407,521,522,514,523,524,525,526,402,403,404,515,516,393,394,517,518,395",(req,res)=>{
    console.log('peer');
    res.json(cameralist);
})

// 同行分析大图
let faceImg = {};
fs.readFile('mock/json/8faceImg.json',function(err,data) {
    if(err) console.log('json/8faceImg.json',err);
    faceImg = JSON.parse(data.toString());
})
app.get("/image/face/json/161285230795653122",(req,res)=>{
    res.json(faceImg);
})


app.listen(8100,() => console.log('listening on port 8100\n模拟后台数据成功'));

