/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-02 09:16:12
 * @LastEditTime: 2021-08-03 11:38:38
 */
export let elestart = () => {
    return
    //设置开机启动
    let { ipcMain } = require('electron');
    // import { red } from 'ansi-colors'; 
    let ipc = ipcMain; //数据传输
    let { Registry } = require('rage-edit')
    // 开机自启动
    // 查看开机自启注册表是否已经注册electronApp
    // let regUrl = "HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run",
    let regUrl = "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
        regname = "fx2019"
    var reg = new Registry(regUrl)
    reg.get("Run").then(e => {
    })
    reg.get("fx2019").then(e => {
        return
        if (e == undefined) { //不存在
            console.log("=============")
            Registry.set(regUrl, regname, app.getPath('exe'))

        } else {
            Registry.delete(regUrl, regname)
        }
    })
    ipc.on("delRegKey", (e, a) => {
        Registry.delete(regUrl, regname)
    });
}