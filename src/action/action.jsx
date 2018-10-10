const actions = {
  changeInfo:(infotype,string)=>{   
      if(infotype == ""){
        return action;
      }else{
        return {type:infotype,payload:string};
      }
  },
  changeName: (name) => {
    return {type: 'SET_NAME',name};
  },
  setPathList: (list) => {
    return { type:'SET_PATHLIST',list };
  },
  setCurrentPeople: currentPeople => {
    return { type:'SET_CURRENTPEOPLE',currentPeople }
  }
};
export default actions;