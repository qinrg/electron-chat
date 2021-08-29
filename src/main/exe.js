/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-03 14:25:00
 * @LastEditTime: 2021-08-03 14:45:26
 */
let { main, dmain } = require("./file")
const { spawn } = require('child_process');
let vlog = require('electron-log');
export let spawnexe = (port) => {
    const ls = spawn(port == "4001" ? main : dmain, [port]);

    ls.stdout.on('data', (data) => {
        vlog.info(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        vlog.info(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        vlog.info(`子进程退出码：${code}`);
    });
}
