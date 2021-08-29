/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-02 09:16:12
 * @LastEditTime: 2021-08-27 18:01:44
 */
let ffi = require("ffi-napi");
let path = require("path");
let fs = require("fs");
let vlog = require('electron-log');
let dev = process.env.NODE_ENV == "development" ? true : false
let { devmain, buildmain } = require("./file")
let dll = null
export let MoveMouse = (x, y) => {
    if (dll) {
        dll.MoveMouse(parseInt(x), parseInt(y));
    } else {
        vlog.info("地址不对", dev ? devmain : buildmain);
    }
}
export let KeyTap = (d1, d2, d3) => {
    vlog.info("键盘按键", d1, d2, d3);
    if (dll) {
        let s = dll.KeyTap(d1, d2, d3);
        console.log("-------", s)
    } else {
        vlog.info("地址不对", dev ? devmain : buildmain);
    }
}
export let MouseToggle = (k, kt) => {
    vlog.info("鼠标操作", k, kt);
    if (dll) {
        dll.MouseToggle(k, kt);
    } else {
        vlog.info("地址不对", dev ? devmain : buildmain);
    }
}
export let snipping = (x, y, w, h, n) => {
    vlog.info("截图操作，截图坐标x=" + x + ",y=" + y + ",宽=" + w + "高=" + h + "图片名称:" + n);
    if (dll) {
        return dll.snipping(x, y, w, h, n);
    } else {
        vlog.info("地址不对", dev ? devmain : buildmain);
    }
}
let filedll = () => {
    vlog.info("路径正确，开始读取", dev ? "开发" + devmain : "正式" + buildmain);
    if (devmain.indexOf("-1") >= 0 || buildmain.indexOf("-1") >= 0) return vlog.info("执行dll不存在")
    if (fs.existsSync(dev ? devmain : buildmain)) {
        dll = ffi.Library(dev ? devmain : buildmain, {
            Init: ["int", ["int"]], //传输0打开键盘鼠标 1 关闭
            KeyTap: ["int", ["string", "string", "string"]],
            MoveMouse: ["int", ["int", "int"]],
            MouseClick: ["int", ["string"]],
            MouseToggle: ["int", ["string", "string"]],
            snipping: ["string", ["int", "int", "int", "int", "string"]]
        });
    }
    let ca = dll ? dll.Init(0) : "失败";
    vlog.info("执行dll返回", ca)
}
export let init = filedll
