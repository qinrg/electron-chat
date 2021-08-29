/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-10 13:28:27
 * @LastEditTime: 2021-08-27 17:30:06
 */
let {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Notification
} = require('electron')
let pattern = process.env.NODE_ENV == "development" ? true : false; //运行环境
export let createWinAll = (id, url) => {
  if (winobj.get(id)) {
    winobj.get(id).show()
    winobj.get(id).focus()
    return
  }
  // vb = {
  //   height: height,
  //   width: width,
  //   movable: true, //是否可挪动
  //   resizable: false, //窗口可否改不大小  
  //   hasShadow: true, //窗口阴影 
  //   autoHideMenuBar: true, //去除菜单 
  //   show: true,//是否显示
  //   fullscreen: true, //全屏
  //   fullscreenable: true, //是否可以全屏
  //   webPreferences: {
  //     webSecurity: true,
  //     enableRemoteModule: true,
  //     nodeIntegrationInWorker: true,
  //     nodeIntegration: true, //是否完整支持node
  //     nativeWindowOpen: true,
  //     contextIsolation: false, //require is not defined 处理  
  //     devTools: true //控制开发模式
  //   }
  // }
  console.log("初始化参数数据", vb, vb.height ? vb.height : 600, vb.width ? vb.width : 900)
  let win = new BrowserWindow({
    useContentSize: true, //网页字体  
    frame: false, //无边框
    height: 600,
    width: 900,
    minWidth: vb.width ? vb.width : 0,
    minHeight: vb.height ? vb.height : 0,
    movable: true, //是否可挪动
    resizable: true, //窗口可否改不大小
    hasShadow: true, //窗口阴影
    // darkTheme:true, //窗口使用 dark 主题
    //skipTaskbar: false, //windows任务栏窗口去除（true）
    // transparent: true, //透明窗体
    // alwaysOnTop: true, //窗口置顶
    autoHideMenuBar: true, //去除菜单 
    show: false,//是否显示
    fullscreen: false, //全屏
    fullscreenable: true, //是否可以全屏
    webPreferences: {
      webSecurity: true,
      enableRemoteModule: true,
      nodeIntegrationInWorker: true,
      nodeIntegration: true, //是否完整支持node
      nativeWindowOpen: true,
      contextIsolation: false, //require is not defined 处理  
      devTools: true //控制开发模式
    }, ...vb
  })
  //加载url
  console.log(url)
  win.loadURL(url)
  // win.once('ready-to-show', async () => {
  //   win.show()
  //   win.focus()
  // })
  winobj.set(id, win)
}