/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-26 16:44:53
 * @LastEditTime: 2021-08-27 18:06:47
 */
let {
    app,
    ipcMain,
    Notification,
    screen,
    globalShortcut
} = require('electron')
let ipc = ipcMain //数据传输
let { createWinAll } = require("./BrowserWinAll") //公共窗口
let { browserWindow_video } = require("./browserWindow_video") //远程显示视频窗口
let { browserWindow_list } = require("./browserWindow_list") //携程辅助窗口
let { randomWord } = require('./randomWord')
let { eleupdata, startUpdata } = require('./eleUpdata')
let { sqlall, sqldata, sqlonly } = require('./sqlite')
let { init, snipping, MoveMouse, KeyTap, MouseToggle } = require("./dll.js")
let { userLogin, loginRecord, getAppuser, setNoLgoin, userEsclogin, } = require("./dataSetUpdata");
//聊天窗口
let chatViewAll = (d) => {
    let id = "oneMsg" + d.uuid
    let url0 = winURL + "#/oneMsg?id=" + id
    vb = {
        height: 500,
        width: 560,
        resizable: true,
        skipTaskbar: false
    }
    createWinAll(id, url0)
    winobj.get(id).show()
}
let myConfig = async (d) => {
    let s_q = "select * from config where key=?"
    let sd = await sqlonly(s_q, [d.key])
    if (sd.length == 0) {
        let int = `INSERT INTO "main"."config"("uuid", "key", "value", "remark") VALUES (?,?,?,?)`
        let idd = await sqlonly(int, [d.uuid, d.key, d.value, d.remark])
        console.log("无数据", idd, d.uuid, d.key, d.value + "", d.remark);
    } else {
        let int = `UPDATE config SET value = ? WHERE id = ?`
        let idd = await sqlonly(int, [d.value, sd[0].id])
        console.log("更新数据");
    }

}
//F12调试模式
let openDevToolsT = true
let blocker = true //关闭系统变量 
let baseData = "" //图片base64数据
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
                // winobj.get(res.id) ? winobj.get(res.id).hide() : winobj.get("002").hide()
                if (res.id == "001" || res.id == "002") {
                    winobj.get("001") ? winobj.get("001").hide() : null
                    winobj.get("002") ? winobj.get("002").hide() : null
                } else {
                    winobj.get(res.id).minimize()
                }
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
            let sql1 = "select * from config where uuid=?"
            let data1 = await sqlonly(sql1, res.uuid)
            if (data && data.length > 0) {
                winobj.get(res.id).webContents.send('message', { type: "userObj", data: data[0], config: data1 })
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
                win.webContents.send('message', { type: "userObj", data: obj, config: data1 })
            }
            break;
        case "funcKey"://打开控制台
            winobj.get("002").webContents.openDevTools({
                activate: !openDevToolsT
            });
            break;
        case "out"://单个应用退出
            // vlog.info(res.id, winobj.get(res.id))
            winobj.get(res.id).close()
            winobj.delete(res.id)
            winobj.get(res.showid) ? winobj.get(res.showid).show() : null

            break;
        case "window-updata": //执行更新
            startUpdata()
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
            vb = {
                height: 560,
                width: 420,
                resizable: false,
            }
            createWinAll(res.id, winURL + "#/contact?id=" + res.id)
            break;
        case "applyFriend":
            //弹出好友信息列表
            let id = "applyFriend_" + res.data.uuid
            let url0 = winURL + "#/applyFriend?id=" + id + "&type=0"
            vb = {
                height: 520,
                width: 300,
                resizable: false,
            }
            createWinAll(id, url0)
            break;
        case "userAddMsg":
            let url1 = winURL + "#/applyFriend?id=" + res.id + "&type=1"
            vb = {
                height: 520,
                width: 360,
                resizable: false,
            }
            createWinAll(res.id, url1)
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
                let uuid = res.yuser ? JSON.parse(res.yuser).uuid : ""
                winobj.get("oneMsg" + uuid) ? winobj.get("oneMsg" + uuid).send("message", res) : null
            } else {
                winobj.get("002").send("message", res)
            }
            break;
        case "003Register":
            console.log(res)
            let reg = winURL + "#/register?id=003"
            vb = {
                height: 360,
                width: 520,
                resizable: false,
            }
            createWinAll("003", reg)
            // winobj.get("003").setIgnoreMouseEvents(true)
            break;
        case "msgLimit":
            winobj.get("002").send("message", res)
            break;
        case "setLimit":
            let limitid = "oneMsg" + res.setId
            winobj.get(limitid).send("message", res)
            break;
        case "suspended":
            // let reg1 = winURL + "#/register?id=003"
            // let winMain = winobj.get("002").getPosition()
            // console.log(winMain[0], winMain[0], res)
            // if (res.t == 0) {
            // vb = {
            //     height: 520,
            //     width: 360,
            //     resizable: false,
            // }
            //   createWinAll("009", reg1)
            //   winobj.get("009").setPosition(winMain[0] + res.x + 5, winMain[1] + res.y + 5)
            // } else {
            //   winobj.get("009").hide()
            // }

            break
        case "setMenuConfig":
            console.log(res)
            myConfig(res)
            break;
        case "getConfig":

            console.log(res)
            let gets = "select * from config where uuid=?"
            let sd = await sqlonly(gets, [res.uuid])
            winobj.get(res.view).send("message", { type: "getConfig", data: sd })
            break;
        case "snipping":
            // console.log(snipping(0, 0, 1920, 1080, "123"))
            // return
            if (res.isView == 0 && res.data === "") {
                winobj.get(res.view).hide()
                setTimeout(() => {
                    winobj.get(res.view).send("message", { type: "getdosktop" })
                }, 1)
            } else {
                //报错数据
                baseData = res.data
                //创建截图窗口
                let width = screen.getPrimaryDisplay().workAreaSize.width,
                    height = screen.getPrimaryDisplay().workAreaSize.height
                let url = winURL + "#/snipping?id=" + res.view + "&showid=" + res.view
                vb = {
                    height: height,
                    width: width,
                    movable: true, //是否可挪动
                    resizable: false, //窗口可否改不大小  
                    hasShadow: true, //窗口阴影 
                    autoHideMenuBar: true, //去除菜单 
                    show: false,//是否显示
                    fullscreen: true, //全屏
                    fullscreenable: true, //是否可以全屏 
                    transparent: true, //透明窗体
                    maximizable: true, //支持最大化
                }
                createWinAll("snipping", url)
            }
            break;
        case "startBase64":
            winobj.get("snipping").send("message", { data: baseData, type: "base64" })
            break
        case "setsnippingConfig":
            console.log("设置");
            // let width = screen.getPrimaryDisplay().workAreaSize.width,
            // height = screen.getPrimaryDisplay().workAreaSize.height
            // winobj.get("snipping").setSize(width, height)
            // winobj.get("snipping").setFullScreen(true)
            // winobj.get("snipping").setPosition(0, 0)
            // winobj.get("snipping").focus()
            // winobj.get("snipping").setResizable(false)
            // winobj.get("snipping").setMovable(false)
            // winobj.get("snipping").show()
            break;
        default:
            break;//snipping
    }
})