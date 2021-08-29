/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-02 09:16:12
 * @LastEditTime: 2021-08-23 09:52:25
 */
let fs = require('fs')
let path = require('path')
let os = require('os')
let vlog = require("electron-log")
// let userInfo = os.userInfo().homedir
let { app } = require('electron')
let dev = process.env.NODE_ENV == "development" ? true : false
console.log('程序驱动区分：', os.arch())
let oss = os.platform() == "darwin" ? "mac" : os.platform() == "win32" ? "win" : os.platform() == "linux" ? "linux" : null
let filet = {
    macx64: "-1",
    winx64: "tray/main.dll",
    win32: "tray/main32.dll",
    linux: "-1"
}
let buildfile = {
    macx64: "-1",
    winx64: "/guangVideo/data/main.dll",
    win32: "/guangVideo/data/main32.dll",
    linux: "-1"
}
export let devmain = path.join(__dirname, filet[oss + os.arch()])
export let buildmain = path.join(app.getPath('home'), buildfile[oss + os.arch()])
//渲染进程
export let filecopy = () => {
    //创建文件夹
    // 递归创建目录 同步方法
    function mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true
        } else {
            if (mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname)
                return true
            }
        }
    }
    mkdirsSync(app.getPath('home') + '/guangVideo/data')
    if (!dev) {
        if (!fs.existsSync(buildmain)) {
            vlog.info("复制文件", os.arch())
            fs.copyFileSync(devmain, buildmain);
        }
    }
}

