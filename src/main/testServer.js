/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-03 10:45:01
 * @LastEditTime: 2021-08-26 16:13:57
 */
//启动测试连接的服务
let path = require("path");
let fs = require("fs");
let { spawn } = require('child_process');
let vlog = require('electron-log');
let file = {
    "darwin": "-1",
    "win32": path.join(__filename, '../../../tools/test.exe')
}
let os = require('os')
let exe = file[os.platform()]
export let serve_start = () => {
    if (!fs.existsSync(exe) || exe == "-1") return
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