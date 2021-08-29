/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-07-13 18:00:15
 * @LastEditTime: 2021-08-26 17:20:21
 */
//更新模块
let { app, ipcMain, globalShortcut, } = require('electron')
let {
    autoUpdater
} = require("electron-updater");
let os = require("os")
export let eleupdata = (e) => {
    // 注意这个autoUpdater不是electron中的autoUpdater     
    // import { red } from 'ansi-colors'; 
    // let uploadUrl = "https://w3cjs.cn/updata/webrtc/" + os.arch() + "/"
    let uploadUrl = "http://127.0.0.1:8899/updata/"
    let issend = false
    let msg = {
        isupdate: {
            msg: '检查更新'
        },
        error: {
            msg: "错误了"
        },
        yesupdate: {
            msg: '可更新'
        },
        noupdate: {
            msg: "无更新"
        },
        update: {
            msg: "更新中"
        },
        fileupdate: {
            msg: '更新下载中',
            data: ''
        },
        okfile: {
            msg: "下载完成"
        }
    }
    autoUpdater.setFeedURL(uploadUrl);
    autoUpdater.on('error', function (error) {
        console.log("错误了")
        sendUpdateMessage(msg.error)
    });
    autoUpdater.on('checking-for-update', function (info) {
        console.log("检查更新")
        sendUpdateMessage(msg.isupdate)
    });
    autoUpdater.on('update-available', function (info) {
        console.log("可更新")
        sendUpdateMessage(msg.yesupdate)
    });
    autoUpdater.on('update-not-available', function (info) {
        console.log("无更新")
        sendUpdateMessage(msg.noupdate)
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        console.log("下载中")
        msg.fileupdate.data = progressObj
        sendUpdateMessage(msg.fileupdate)
    })
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
        //给前端传递下载进度
        let issend = false
        if (!issend) {
            issend = true
            // console.log("--------------------1", winobj);
            winobj.get("001") ? winobj.get("001").send('message', { type: 'isUpdateNow' }) : winobj.get("002").send('message', { type: 'isUpdateNow' })

        }
    });
    //执行自动更新检查
    ipcMain.on("checkForUpdate", () => {
        autoUpdater.checkForUpdates();
    })
    // 通过main进程发送事件给renderer进程，提示更新信息
    function sendUpdateMessage(text) {
        if (!issend) {
            issend = true
            // console.log("--------------------2", winobj);
            winobj.get("001") ? winobj.get("001").send('message', { type: "updata", data: text }) : winobj.get("002").send('message', { type: "updata", data: text })
        }
    }
    //更新方法
    autoUpdater.checkForUpdates();
    console.log("进入更新了")
}
//执行更新
export let startUpdata = () => {
    autoUpdater.quitAndInstall(); //更新
}