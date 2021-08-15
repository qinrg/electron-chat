/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-03 10:45:01
 * @LastEditTime: 2021-08-03 17:56:41
 */
//启动测试连接的服务
let path = require("path");
let { spawn } = require('child_process');
let vlog = require('electron-log');
let exe = path.join(__filename, '../../../tool/test.exe')
export let serve_start = () => {
    const ls = spawn(exe);

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