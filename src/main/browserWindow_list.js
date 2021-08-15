let {
    app,
    BrowserWindow,
    ipcMain,
    globalShortcut,
    Notification
} = require('electron')
let pattern = process.env.NODE_ENV == "development" ? true : false; //运行环境
// 规划创建窗口
export let browserWindow_list = (type, id, server,port,winobj) => {
    vlog.info("进来了", "browserWindow_list1", id,winobj)
    if (winobj.get(id)) {
      winobj.get(id).show()
      winobj.get(id).focus()
    } else {
      let winbw = new BrowserWindow({
        height: pattern ? 400 : 0,
        width: pattern ? 400 : 0,
        show: pattern,
        // parent: win,
        useContentSize: true, //网页字体
        frame: false, //边框
        movable: false, //是否可挪动
        resizable: true, //窗口可否改不大小
        hasShadow: true, //窗口阴影 
        darkTheme: true, //窗口使用 dark 主题
        transparent: true, //透明窗体
        skipTaskbar: false, //windows任务栏窗口去除（true）
        // transparent: true, //透明窗体
        alwaysOnTop: false, //窗口置顶 
        webPreferences: {
          webSecurity: true,
          enableRemoteModule: true,
          nodeIntegrationInWorker: true,
          nodeIntegration: true, //是否完整支持node
          nativeWindowOpen: true,
          contextIsolation: false, //require is not defined 处理 
          devTools: true //控制开发模式 
        }
      })
      vlog.info("输出地址", wineUrl)
      let wineUrl = pattern ? `http://127.0.0.1:4000/#/controlled?id=` + id + "&server=" + server : `http://127.0.0.1:` + port + '/#/controlled?id=' + id + "&server=" + server

      winbw.loadURL(wineUrl)
      winbw.show()
      pattern ? winbw.webContents.openDevTools() : ""
      winbw.focus()
      winobj.set(id, winbw)
    }

  }