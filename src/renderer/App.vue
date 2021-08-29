<template>
  <div id="app">
    <!-- <div class="msg"> {{msg}}</div> -->
    <router-view></router-view>
    <div class="jd" v-if="jdnum >= 1">
      <el-progress :percentage="jdnum" :color="customColor"></el-progress>
    </div>
  </div>
</template>

<script>
import { getbase64 } from "./assets/getdosktop";
export default {
  name: "guang",
  data() {
    return {
      msg: "1",
      v: 0,
      ismenu: false,
      f12: 0,
      timer: null,
      jdnum: 0,
      customColor: "fff",
    };
  },
  mounted() {
    window.addEventListener("message", (r) => {
      if (!r.detail) return;
      let d = r.detail;
      switch (d.type) {
        case "updata":
          if (d.data.msg == "更新下载中") {
            let s = d.data.data;
            this.jdnum = Number(s.percent.toFixed(2));
            if (s.percent >= 1) this.customColor = "#f56c6c";
            if (s.percent >= 20) this.customColor = "#e6a23c";
            if (s.percent >= 40) this.customColor = "#5cb87a";
            if (s.percent >= 60) this.customColor = "#1989fa";
            if (s.percent >= 80) this.customColor = "#6f7ad3";
          }
          break;
        case "isUpdateNow":
          if (this.v == 0) {
            this.v++;
            this.$confirm("有新版本升级, 是否继续?", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            })
              .then(() => {
                this.v = 0;
                this.ipc.send("message", { type: "window-updata" });
              })
              .catch(() => {
                this.v = 0;
                this.$message("您取消了更新，下次若要更新,右键菜单更新！");
              });
          }
          break;
        case "allClose":
          this.ipc.send("message", { type: "allClose" });
          break;
        case "window-close":
          if (this.v == 0) {
            this.v++;
            this.$confirm("退出应用程序, 是否继续?", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            })
              .then(() => {
                this.v = 0;
                this.ipc.send("message", { type: "window-close" });
              })
              .catch(() => {
                this.v = 0;
              });
          }
          break;
        case "close-main-window":
          this.ipc.send("message", { type: "close-main-window" });
        case "getdosktop":
          getbase64().then((res) => {
            this.ipc.send("message", {
              type: "snipping",
              view: this.urlParam("id"),
              isView: 1,
              data: res,
            });
          });
          break;
        default:
          break;
      }
    });
    // this.ipc.send("message", { type: "userObj" });
    // const remote = this.$ele.remote;
    // const Menu = remote.Menu;
    // const MenuItem = remote.MenuItem;
    // const shell = this.$ele.shell;
    // menu.append(
    //   new MenuItem({ label: "更新", type: "checkbox", checked: true })
    // ); //选中
    // window.addEventListener(
    //   "contextmenu",
    //   (e) => {
    //     e.preventDefault();
    //     let menu = new Menu();
    //     menu.append(
    //       new MenuItem({
    //         label: "复制图片",
    //         accelerator: "CmdOrCtrl+C",
    //         role: "copy",
    //         visible: e.target.localName == "img" ? true : false,
    //         enabled: window.getSelection().type == "Range" ? true : false, //可用
    //       })
    //     );

    //     menu.append(
    //       new MenuItem({
    //         label: "复制文本",
    //         accelerator: "CmdOrCtrl+C",
    //         role: "copy",
    //         visible: e.target.localName == "img" ? false : true,
    //         enabled: window.getSelection().type == "Range" ? true : false, //可用
    //       })
    //     );
    //     menu.append(
    //       new MenuItem({
    //         label: "剪      切",
    //         accelerator: "CmdOrCtrl+X",
    //         role: "cut",
    //         enabled: window.getSelection().type == "Range" ? true : false, //可用
    //       })
    //     );
    //     menu.append(
    //       new MenuItem({
    //         label: "粘      贴",
    //         accelerator: "CmdOrCtrl+V",
    //         role: "paste",
    //         visible: e.target.className == "text myicon" ? true : false,
    //         // enabled: window.getSelection().type == "Range" ? true : false //可用
    //       })
    //     );
    //     menu.append(
    //       new MenuItem({
    //         label: "粘      贴2",
    //         click: function () {
    //           const clipboard = this.$ele.clipboard;
    //           console.log("1111", clipboard);
    //           // console.log("1111",clipboard.availableFormats())
    //           const rawFilePath = clipboard
    //             .readBuffer("FileNameW")
    //             .toString("ucs2");
    //           let filePath = rawFilePath.replace(
    //             new RegExp(String.fromCharCode(0), "g"),
    //             ""
    //           );
    //           console.log(filePath);
    //           if (filePath != "") {
    //             let type = filePath
    //               .substr(filePath.lastIndexOf("\\") - 1)
    //               .lastIndexOf(".");
    //             if (type == -1) return alert("您不能上传文件夹！");
    //             console.log(type);
    //           }
    //           // let type=
    //           return console.log(
    //             filePath.substr(filePath.lastIndexOf("\\") - 1).lastIndexOf(".")
    //           );
    //           var fileexe = require("fs").statSync(filePath);
    //           var size = fileexe.size;
    //           console.log(filePath);
    //           var inp = document.createElement("input");
    //           inp.setAttribute("type", "file");
    //           inp.setAttribute("value", filePath);
    //           console.log(inp.files);
    //         },
    //         // accelerator: "CmdOrCtrl+V",
    //         // role: "paste",
    //         // visible: e.target.className=="text myicon"? true : false,
    //         // enabled: window.getSelection().type == "Range" ? true : false //可用
    //       })
    //     );
    //     menu.append(
    //       new MenuItem({
    //         label: "更新版本",
    //         click: function (e) {
    //           console.log(e);
    //           this.ipc.send("oldUpdata");
    //         },
    //       })
    //     );
    //     menu.append(new MenuItem({ type: "separator" })); //分割线
    //     menu.append(
    //       new MenuItem({
    //         label: "关于我们",
    //         click: function () {
    //           shell.openExternal(
    //             "file:///D:/%E8%AE%BE%E8%AE%A1%E5%99%A8/www/index/bi.html"
    //           );
    //         },
    //       })
    //     );
    //     console.log(e);
    //     menu.popup({ window: remote.getCurrentWindow() });
    //   },
    //   false
    // );
    // document.addEventListener("keyup", this.funckeydown);
    // document.addEventListener("keypress", this.funckeypress); //keypress
    // document.addEventListener("keydown", this.funckeydown);
  },
  methods: {
    onclick() {
      this.ismenu = false;
    },
    menu(c) {
      return;
    },
    funckeypress(e) {
      console.log(e);
    },
    funckeydown(e) {
      console.log(e);
      if (e.code == "F12") {
        this.f12 += 1;
        if (this.f12 == 3) {
          this.f12 = 0;
          this.ipc.send("message", { type: "funcKey" });
        }
      }
    },
  },
};
</script>

<style>
/* CSS */
/* * {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
} */
.cursor {
  cursor: pointer;
}
.orange {
  color: orange;
}
#app {
  font-size: 14px;
  height: calc(100% - 0px);
  width: calc(100% - 0px);
  overflow: hidden;
  box-shadow: -4px -4px 6px 1px rgba(0, 0, 0, 0.5);
  position: relative;
}
/* .msg {
  position: fixed;
  top: 5px;
  left: 15px;
  z-index: 9999;
  color: azure;
  font-size: 10px;
} */
.dialog .el-dialog__body {
  padding: 0 20px !important;
}
.buttonAdd {
  width: 80px !important;
  min-width: 80px !important;
}
::-webkit-scrollbar {
  width: 5px;
  height: 10px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(25, 135, 209, 0.5);
  border-radius: 5px;
}

::-webkit-scrollbar-track {
  width: 0;
  height: 10px;
  margin-right: 1px;
}
.ismenu {
  position: fixed;
  width: 150px;
  height: 200px;
  top: -9999px;
  left: -9999px;
  z-index: 9999;
  flex: 9999;
  border: 1px #a3a2a2 solid;
  box-shadow: 0 2px 3px 0 rgb(0 0 0 / 20%);
}
.ismenu > .x {
  width: 100%;
  border-bottom: #a3a2a2 0.5px solid;
  margin-bottom: 16px;
}
.ismenu > .line {
  padding: 0 16px;
  height: 30px;
  line-height: 30px;
  color: #222222;
  font-size: 14px;
}
.ismenu > .line > span:nth-child(2) {
  float: right;
  font-size: 12px;
  color: #a3a2a2;
}
.jd {
  position: fixed;
  z-index: 7;
  bottom: 0;
  width: 100%;
  display: flex;
  left: 0;
  right: 0;
  flex-direction: column;
  text-align: center;
}
.meme_img {
  width: 16px;
  height: 16px;
  vertical-align: sub;
}
</style>
