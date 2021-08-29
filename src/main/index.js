/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-19 11:30:42
 * @LastEditTime: 2021-08-27 17:23:22
 */
(async () => {
  let winobj = new Map()
  global.winobj = winobj
  global.vb = {}
  let getPort = require('get-port')
  let port = await getPort()
  let pattern = process.env.NODE_ENV == "development" ? true : false; //运行环境
  let { createWindow } = require("./BrowserWin")  //主要窗口
  let { trays } = require('./tray') //托盘设置
  let { filecopy } = require("./file") //初始化文件处理
  let { serve_start } = require("./testServer") //测试服务辅助工具
  let { elestart } = require("./startEle") // 开启自启
  let { eleupdata } = require('./eleUpdata') //热更新
  let { MyHttp } = require("./httpServer") //http服务
  let { init } = require("./dll.js") //动态库
  let vlog = require('electron-log'); //文件日志  C:\Users\Administrator\AppData\Roaming\项目名称\logs
  let { app, globalShortcut, } = require('electron')
  //前端渲染的 
  if (!pattern) {
    global.__static = require('path')
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\')
  }
  let winURL = pattern ? `http://127.0.0.1:4000/` : `http://127.0.0.1:` + port + '/' //`file://${__dirname}/index.html`
  global.winURL = winURL
  app.once('ready', () => {
    globalShortcut.register('CommandOrControl+alt+c', () => {
      console.log('Alt is pressed,v')
      winobj.get("002") ? winobj.get("002").send("message", { type: "getdosktop" }) : nill
    })
    createWindow("001", winURL, 360, 500, winobj)
    eleupdata() //更新的
    trays('聊8') // 启动托盘
    filecopy() //初始化
    elestart()// 开机启动
    if (pattern) {
      vlog.info("启动测试服务",)
      init(0)
      serve_start() //测试服务辅助工具
    } else {
      init(0)
      vlog.info("启动dll服务")
    }
  })
  app.on('will-quit', () => {
    // globalShortcut.unregister('CommandOrControl+F4') // 注销快捷键
    globalShortcut.unregisterAll()   // 注销所有快捷键
  })
  app.on('activate', () => {
    if (winobj.size === 0) {
      createWindow("001", winURL, 360, 500, winobj)
    }
  })
  MyHttp(port) //启动http服务
  require("./ipcMain")//引入ipc
  //注册快捷键
})()