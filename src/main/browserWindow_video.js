let {
    app,
    BrowserWindow,
    ipcMain,
    globalShortcut,
    Notification
} = require('electron')
let pattern = process.env.NODE_ENV == "development" ? true : false; //运行环境
let { sqlall, sqldata, sqlonly } = require('./sqlite')
export let browserWindow_video = async (res,port,winobj) => {
    console.log("---------------------0", res)
    // return
    let cz = `select list,id from user`
    let d = await sqlall(cz)
    if (d && d.length > 0) {
        let ds = JSON.parse(d[0].list)
        console.log("--------------------------------------------", ds, res)
        if (d[0].list.indexOf(res.value) == -1) {
            ds.push({ value: res.value, code: "", time: new Date() })
            let ins = `UPDATE "main"."user" SET "list" = ? WHERE id = ?`
            await sqlonly(ins, [JSON.stringify(ds), d[0].id])
        } else {
            ds.map(e => {
                if (e.value == res.value) e.code = "",
                    e.time = new Date()
                return e
            })
            let ins = `UPDATE "main"."user" SET "list" = ? WHERE id = ?`
            await sqlonly(ins, [JSON.stringify(ds), d[0].id])
        }

    }
    if (winobj.get(res.id)) {
        winobj.get(res.id).show()
        winobj.get(res.id).focus()
    } else {
        let winbw = new BrowserWindow({
            height: 768 / 2,
            width: 1366 / 2,
            // parent: win,
            useContentSize: true, //网页字体
            frame: false, //边框
            movable: true, //是否可挪动 
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
                // devTools: true //控制开发模式 
            }
        })
        let wineUrl = pattern ? `http://127.0.0.1:4000/#/video?id=` + res.id + "&server=" + res.server : `http://127.0.0.1:` + port + '/#/video?id=' + res.id + "&server=" + res.server

        winobj.set(res.id, winbw)
        winobj.get(res.id).loadURL(wineUrl)
        winobj.get(res.id).once('ready-to-show', async () => {
            winobj.get(res.id).show()
            winobj.get(res.id).focus()
            if (pattern) {
                winobj.get(res.id).webContents.openDevTools() //开发调试工具 
            }
        })
    }
}