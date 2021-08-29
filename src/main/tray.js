/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-02 09:16:12
 * @LastEditTime: 2021-08-26 17:24:13
 */
// import { eleupdata } from "./eleUpdata";

//托盘和菜单
let {
    Menu,
    Tray,
    shell,
    ipcMain,
    globalShortcut,
    app
} = require("electron")
//系统托盘图标目录
let path = require('path') //路径管理
export let trays = (e) => {
    let trayIcon = path.join(__dirname, "tray");
    let appTray = new Tray(path.join(trayIcon, "icon.1.png"));
    //系统托盘右键菜单
    let trayMenuTemplate = [
        // {
        //     label: "显示窗口",
        //     icon: trayIcon + '/0.png',
        //     click: function() {
        //             win.show();
        //         } //打开相应页面
        // },
        {
            label: "关于我们",
            icon: trayIcon + '/1.png',
            click: function () {
                shell.openExternal("https://w3cjs.cn");
                // console.log("1111111",win.isMinimized(),win.isMaximized()  )
                // win.restore()
            }
        },
        {
            label: "检查更新",
            icon: trayIcon + '/3.png',
            click: function () {
                winobj.get("001") ? winobj.get("001").send("message", { type: 'close-main-window' }) : ""//检查更新
                winobj.get("002") ? winobj.get("002").send("message", { type: 'close-main-window' }) : ""//检查更新

            }
        },
        {
            label: "退出应用",
            icon: trayIcon + '/2.png',
            click: function () {
                app.quit()
                // win.close();
                // globalShortcut.unregister('CommandOrControl+X')
                // // 注销所有快捷键
                globalShortcut.unregisterAll()
            }
        }
    ];
    //系统托盘图标目录
    //图标的上下文菜单
    let contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

    //设置此托盘图标的悬停提示内容
    appTray.setToolTip(e ? e : "聊8");

    //设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu);
    //系统托盘图标闪烁
    let count = 0,
        timer = null;
    timer = setInterval(function () {
        count++;
        if (count % 2 == 0) {
            appTray.setImage(path.join(trayIcon, "icon.2.png"));
        } else {
            appTray.setImage(path.join(trayIcon, "icon.2.png"));
        }
    }, count % 2 == 0 ? 500 : 1000);
    //单点击 1.主窗口显示隐藏切换 2.清除闪烁
    appTray.on("click", function () {
        if (!!timer) {
            // appTray.setImage(path.join(appTray, 'abc.png'))
            //主窗口显示隐藏切换
            // win.isVisible() ? win.hide() : win.show();
            // win.show();
            winobj.get("001") ? winobj.get("001").show() : winobj.get("002").show()
        }
    });
}