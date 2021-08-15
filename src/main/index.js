

(async () => {
  let path = require('path')
  let getPort = require('get-port')
  let pattern = process.env.NODE_ENV == "development" ? true : false; //运行环境
  let Koa = require('koa') //koa2中间件依赖
  let web = new Koa() //js的继承 
  let port = await getPort()
  let statics = require('koa-static') //静态资源服务插件
  let bodyParser = require('koa-bodyparser') //请求体，返回体解析类似json，text，图片等
  let { createWindow } = require("./BrowserWin")  //主要窗口
  let { createWinAll } = require("./BrowserWinAll") //公共窗口
  let { browserWindow_video } = require("./browserWindow_video") //远程显示视频窗口
  let { browserWindow_list } = require("./browserWindow_list") //携程辅助窗口
  let { randomWord } = require('./randomWord')
  let { eleupdata } = require('./eleUpdata')
  let { trays } = require('./tray')
  let { sqlall, sqldata, sqlonly } = require('./sqlite')
  let { filecopy } = require("./file")
  let { serve_start } = require("./testServer")

  const { init, MoveMouse, KeyTap, MouseToggle } = require("./dll.js")
  let vlog = require('electron-log');
  let { autoUpdater } = require("electron-updater");
  let {
    app,
    BrowserWindow,
    ipcMain,
    globalShortcut,
    Notification
  } = require('electron')
  // 注意这个autoUpdater不是electron中的autoUpdater 
  let ipc = ipcMain //数据传输
  let blocker = true //关闭系统变量 
  let win, winobj = new Map()
  //前端渲染的
  if (!pattern) {
    global.__static = require('path')
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\')
  }
  web.use(bodyParser()) //使用解析上下文插件
  // 配置静态资源
  web.use(statics(path.join(__dirname, "./")))
  web.listen(port) //服务启动端口 
  vlog.info('启动成功', port) //日志打印  
  let winURL = pattern ? `http://127.0.0.1:4000/` : `http://127.0.0.1:` + port + '/' //`file://${__dirname}/index.html`

  // if (!fs.existsSync(dllf)) { 
  //   vlog.info("复制文件",os.arch()) 
  //   //os.arch() 
  //   fs.copyFileSync(os.arch().indexOf("64")>0?dll64:dll32, dllf);
  // } else {
  //   fs.unlink(dllf, (err)=> {
  //     if (err) {
  //       throw err;
  //     }
  //     fs.copyFileSync(os.arch().indexOf("64")>0?dll64:dll32, dllf);
  //   })
  // }
  /*
    限制用户只允许单开
    */
  // let gotTheLock = app.requestSingleInstanceLock()
  // if (!gotTheLock) {
  //   app.quit()
  // } else {
  //   app.on('second-instance', (event, commandLine, workingDirectory) => {
  //     // 当运行第二个实例时,将会聚焦到myWindow这个窗口
  //     // if (win) {
  //     //   win.get("002").focus()
  //     // }
  //     let cz = `select id from user where email=? ORDER BY "logintime" DESC`
  //     let d = await sqlonly(cz, [e.email])
  //     if (d && d.length > 0) {
  //       let sel = `UPDATE user SET area=?, email=?, employ=?, img=?, logintime=?, name=?, phone=?, signin=?, token=?, uuid=?, vocational=?, upwd=?,checks=?,motto=? WHERE id = ?`
  //       await sqlonly(sel, [e.area, e.email, e.employ, e.img, e.logintime, e.name, e.phone, e.signin, e.token, e.uuid, e.vocational, e.upwd, e.checks, e.motto, d[0].id])
  //     }
  //   })
  // }
  app.once('ready', () => {
    createWindow("001", winURL, 360, 500, winobj)
    eleupdata('聊8', winobj, ipc) //更新的
    trays('聊8', winobj, ipc) // 启动托盘
    filecopy()
    if (pattern) {
      vlog.info("启动测试服务")
      init(0)
      serve_start()
    } else {
      init(0)
      vlog.info("启动dll服务")
    }
    // globalShortcut.register('CommandOrControl+X', () => {
    //   vlog.info('按下win键')
    // })
    // globalShortcut.register('CommandOrControl+c', () => {
    //   vlog.info('Alt is pressed,c')
    // })
    // globalShortcut.register('CommandOrControl+v', () => {
    //   vlog.info('Alt is pressed,v')
    // })
    // globalShortcut.register('CommandOrControl+Tab', () => { 
    //   vlog.info('Alt is pressed')
    // })



    //     let ret2 = globalShortcut.register('F4', () => {
    // vlog.info('F4 is pressed', ret)
    //     })

    // if (!ret) {
    //     vlog.info('registration failed')
    // }

    // 检查快捷键是否注册成功 
    // vlog.info(123, globalShortcut.isRegistered('Alt'))
    // vlog.info(123, globalShortcut.isRegistered('F4'))
  })

  app.on('will-quit', () => {
    vlog.info(4)
    // 注销快捷键
    // globalShortcut.unregister('CommandOrControl+F4')
    // 注销所有快捷键
    globalShortcut.unregisterAll()
  })
  app.on('activate', () => {
    if (win === null) {
      createWindow("001", winURL, 360, 500, winobj)
    }
  })


  // 视频显示窗口

  //登录记住密码
  let userLogin = async (e) => {
    let cz = `select id from user where email=? ORDER BY "logintime" DESC`
    let d = await sqlonly(cz, [e.email])
    if (d && d.length > 0) {
      let sel = `UPDATE user SET area=?, email=?, employ=?, img=?, logintime=?, name=?, phone=?, signin=?, token=?, uuid=?, vocational=?, upwd=?,checks=?,motto=?,type=? WHERE id = ?`
      await sqlonly(sel, [e.area, e.email, e.employ, e.img, e.logintime, e.name, e.phone, e.signin, e.token, e.uuid, e.vocational, e.upwd, e.checks, e.motto, e.type, d[0].id])
    } else {
      let sq = `INSERT INTO user(id, area, email, employ, img, logintime, name, phone, signin, token, uuid, vocational, upwd,checks,motto,type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      await sqlonly(sq, [e.id, e.area, e.email, e.employ, e.img, e.logintime, e.name, e.phone, e.signin, e.token, e.uuid, e.vocational, e.upwd, e.checks, e.motto, e.type])

    }
    await createWindow("002", winURL + "#/index?id=" + e.uuid, 300, 700, winobj)
    // winobj.get("002").webContents.openDevTools({
    //   activate: true
    // })
    await winobj.get("001").close()
    winobj.delete("001")
  }
  //获取最后登录的账号回显
  let loginRecord = async () => {
    let cz = `select email,upwd,checks,img,type,uuid from user ORDER BY "logintime" DESC`
    let d = await sqlall(cz)
    winobj.get("001").send('message', { type: "loginRecord", data: d[0] })
  }
  //退出登录
  let userEsclogin = async (d) => {
    let ins = `UPDATE "main"."user" SET "checks" = ?,logintime=? WHERE id = ?`
    let data = JSON.parse(d.checks)
    data[1].is = false
    let sd = await sqlonly(ins, [JSON.stringify(data), +new Date() + "", d.id])
    if (sd) {
      createWindow("001", winURL, 360, 500, winobj)
      setTimeout(() => {
        winobj.forEach((e, i) => {
          if (i != "001") {
            winobj.get(i).close()
            winobj.delete(i)
          }
        })
        winobj.get("001").focus()
      })
    }
  }
  //获取用户信息
  let getAppuser = async () => {
    let sql = "select email,upwd,img,name,uuid,type from user ORDER BY logintime DESC"
    let res = await sqlonly(sql)
    winobj.get("001").send("message", { type: "getAppuser", data: res })
  }
  //关闭自动登录
  let setNoLgoin = async () => {
    let cz = `select id,checks from user ORDER BY "logintime" DESC`
    let d = await sqlonly(cz, [])
    if (d && d.length > 0) {
      let checks = JSON.parse(d[0].checks)
      checks[1].is = false
      let sel = `UPDATE user SET checks=? WHERE id = ?`
      await sqlonly(sel, [JSON.stringify(checks), d[0].id])
    }
  }
  //聊天窗口
  let chatViewAll = (d) => {
    let id = "oneMsg" + d.uuid
    let url0 = winURL + "#/oneMsg?id=" + id
    createWinAll(id, url0, 560, 420, winobj, true)
  }
  //F12调试模式
  let openDevToolsT = true
  //统一接受信息
  ipc.on("message", async (e, res) => {
    // vlog.info("收到消息", res)
    switch (res.type) {
      case "browserWindow"://创建后台被控窗口
        let myNotification = new Notification("正在控制您的电脑！", {
          body: '正在控制您的电脑！'
        });
        myNotification.show();
        browserWindow_list(res.type, res.name, res.server, port, winobj)
        break;
      case "openVideo": //打开视频显示控制端
        browserWindow_video(res, port, winobj)
        break;
      case "window-hide": //窗口隐藏
        if (res.id) {
          winobj.get(res.id) ? winobj.get(res.id).hide() : winobj.get("002").hide()
          return
        }
        break;
      case "window-show": //窗口显示
        if (res.id) {
          winobj.get(res.id).show()
          return
        }
        break;
      case "window-close": //关闭全部应用
        blocker = true
        app.quit()
        break;
      case "userObj": //获取本地信息\


        let sql = "select * from user where uuid=?"
        let data = await sqlonly(sql, res.uuid)
        if (data && data.length > 0) {
          winobj.get(res.id).webContents.send('message', { type: "userObj", data: data[0] })
        } else {
          // vlog.info('---------------返回了-------------1', data[0])
          let obj = {
            id: +new Date(),
            time: +new Date(),
            uuid: randomWord(false, 9, 9, 1),
            uupwd: randomWord(false, 6, 6),
            list: JSON.stringify([])
          }
          let ins = `INSERT INTO "main"."user"("id", "time", "uuid", "uupwd","list") VALUES (?,?,?,?,?)`
          await sqlonly(ins, [obj.id, obj.time, obj.uuid, obj.uupwd, obj.list])
          // vlog.info("读取数据",obj);
          win.webContents.send('message', { type: "userObj", data: obj })
        }
        break;
      case "funcKey"://打开控制台
        winobj.get("002").webContents.openDevTools({
          activate: !openDevToolsT
        });
        break;
      case "win-on-close":
        if (res.id) {
          vlog.info(winobj.get(res.id));
          winobj.get(id).close()
          winobj.delete(res.id)
          return
        }
        win.hide()
        setTimeout(() => {
          blocker = true
          app.quit()
        }, 300)
        break;
      case "allClose"://显示所以窗口
        if (winobj.size > 0) {
          win.show()
          winobj.forEach(e => {
            e.show()
          })
        }
        win.show()
        win.send("message", { type: "window-close" })
        break;
      case "out"://单个应用退出
        vlog.info(res.id, winobj.get(res.id))
        winobj.get(res.id).close()
        winobj.delete(res.id)
        break;
      case "window-updata": //执行更新
        autoUpdater.quitAndInstall(); //更新 
        break;
      case "close-main-window"://更新的 
        eleupdata('聊8', winobj, ipc)
        break;
      case "MoveMouse":
        MoveMouse(res.x, res.y)
        break;
      case "KeyTap":
        KeyTap(res.code)
        break;
      case "MouseToggle":
        MouseToggle(res.k, res.kt)
        break;
      case "userLogin":
        userLogin(res.user)
        break;
      case "loginRecord":
        loginRecord()
        break;
      case "switch-user":
        userEsclogin(res.data)
        break;
      case "getAppuser":
        getAppuser()
        break;
      case "addContact":
        //添加好友页面
        createWinAll(res.id, winURL + "#/contact?id=" + res.id, 520, 380, winobj, true)
        break;
      case "applyFriend":
        //弹出好友信息列表
        let id = "applyFriend_" + res.data.uuid
        let url0 = winURL + "#/applyFriend?id=" + id + "&type=0"
        createWinAll(id, url0, 520, 300, winobj, false)
        break;
      case "userAddMsg":
        let url1 = winURL + "#/applyFriend?id=" + res.id + "&type=1"
        createWinAll(res.id, url1, 520, 360, winobj, false)
        break;
      case "setNoLgoin":
        setNoLgoin()
        break;
      case "chatViewAll":
        chatViewAll(res.data)
        //创建单聊
        break;
      case "chatViewAll1":
        //创建单聊
        break;
      case "ltone":
        if (res.t == "pull") {
          let uuid = res.user ? JSON.parse(res.user).uuid : ""
          winobj.get("oneMsg" + uuid) ? winobj.get("oneMsg" + uuid).send("message", res) : null
        } else {
          winobj.get("002").send("message", res)
        }
        break;
      case "003Register":
        //创建单聊
        console.log(res)
        let reg = winURL + "#/register?id=003"
        createWinAll("003", reg, 520, 360, winobj, false)
        break;
      default:
        break;//getAppuser
    }
  })
})()