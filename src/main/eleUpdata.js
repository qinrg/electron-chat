/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-07-13 18:00:15
 * @LastEditTime: 2021-08-04 18:14:21
 */
//更新模块
export let eleupdata = (e, win, ipc) => {
    console.log(e)
    // 注意这个autoUpdater不是electron中的autoUpdater 
    let {
        autoUpdater
    } = require("electron-updater");
    let os = require("os")
    // import { red } from 'ansi-colors'; 
    let uploadUrl = "https://w3cjs.cn/updata/webrtc/" + os.arch() + "/"
    // let uploadUrl = "http://127.0.0.1:3000/updata/"
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
        // console.log(info)
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
        // ipc.on('window-updata', function () {
        //     //退出安装
        //     autoUpdater.quitAndInstall(); //更新
        // });
        let issend=false
        win.forEach(e=>{
            if(!issend){
                issend=true
                e.send('message', { type: 'isUpdateNow' })
            }
        })
    });
    ipc.on("checkForUpdate", () => {
        //执行自动更新检查
        // console.log("检查更新");
        autoUpdater.checkForUpdates();
    })
    // 通过main进程发送事件给renderer进程，提示更新信息
    function sendUpdateMessage(text) {
        let issend=false
        win.forEach(e=>{
            if(!issend){
                issend=true
                e.send('message', { type: "updata", data: text })
            }
        })
    }
    //更新方法
    autoUpdater.checkForUpdates();
    console.log("进入更新了")
}