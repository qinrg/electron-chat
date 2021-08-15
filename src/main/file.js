/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-02 09:16:12
 * @LastEditTime: 2021-08-04 15:46:55
 */
let fs = require('fs')
let path = require('path')
let os = require('os')
let vlog = require("electron-log")
let userInfo = os.userInfo().homedir
let dev = process.env.NODE_ENV == "development" ? true : false
console.log(os.arch())
export let devmain = path.join(__dirname, os.arch() == "x64" ? 'tray/main.dll' : 'tray/main32.dll')
export let buildmain = path.join(userInfo, '/guangVideo/data/main.dll')
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
    mkdirsSync(userInfo + '/guangVideo/data')
    if (!dev) {
        if (!fs.existsSync(buildmain)) {
            vlog.info("复制文件", os.arch())
            fs.copyFileSync(devmain, buildmain);
        }
    }
}

