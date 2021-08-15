let {
    app,
    BrowserWindow,
    ipcMain,
    globalShortcut,
    Notification
  } = require('electron')
  let pattern = process.env.NODE_ENV == "development" ? true : false; //运行环境
export let createWindow = (id, url, w, h,winobj) => {
    let win = new BrowserWindow({
      useContentSize: true, //网页字体  
      frame: false, //无边框
      height: h,
      width: w,
      minWidth: w,
      minHeight: h,
      maxHeight: 972,
      maxWidth: 700,
      movable: true, //是否可挪动
      resizable: pattern ? true : id == "001" ? false : true, //窗口可否改不大小  
      hasShadow: true, //窗口阴影
      // darkTheme: true, //窗口使用 dark 主题
      skipTaskbar: false, //windows任务栏窗口去除（true）
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
      }
    })
    //加载url
    console.log(url)
    win.loadURL(url)
    win.once('ready-to-show', async () => {
      win.show()
      win.focus()
    })
    win.on("focus", () => {
      // vlog.info("111---",win.isMinimized())
      // if(!win.isMinimized()){
      //   vlog.info("进来了")
      //   win.setKiosk(true)
      //   win.setAlwaysOnTop(true)
      //   win.setFullScreen(true);
      // }
    })
    // if (pattern == 'development') {
    // win.webContents.openDevTools() //开发调试工具  
    // }
    winobj.set(id, win)
  }