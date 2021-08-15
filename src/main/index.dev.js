/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// Install `vue-devtools`
require('electron').app.on('ready', () => {
  // let installExtension = require('electron-devtools-installer')
  // installExtension.default(installExtension.VUEJS_DEVTOOLS)
  //   .then(() => { })
  //   .catch(err => {
  //     console.log('Unable to install `vue-devtools`: \n', err)
  //   })
//   if (!process.env.IS_TEST) {
//     // Install Vue Devtools
//     try {
//       // await installExtension(VUEJS_DEVTOOLS);
//       // 新增的：安装vue-devtools
//       const { session } = require("electron");
//       const path = require("path");
//       session.defaultSession.loadExtension(
//         path.resolve(__dirname, "../../devTools/chrome")  //这个是刚刚build好的插件目录
//       ); 
// //这个是刚开始找的方法不行，换上边的方法
// // BrowserWindow.addDevToolsExtension(path.resolve(__dirname, "../../devTools/chrome")  );
//     } catch (e) {
//       console.error("Vue Devtools failed to install:", e.toString());
//     }
//   }
})

// Require `main` process to boot app
require('./index')