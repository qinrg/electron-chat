<!--
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-10 13:34:48
 * @LastEditTime: 2021-08-27 16:51:28
-->
<template>
  <div class="main">
    <video class="video" ref="video" autoplay playsinline></video>
    <div class="title">
      <div class="name">{{ user.name }}({{ user.uuid }})</div>
      <span @click="min" class="btn el-icon-minus hide" title="最小化"></span>
      <span
        @click="close(status)"
        class="btn el-icon-close out"
        title="关闭"
      ></span>
    </div>
    <div class="centent">
      <div
        class="messageList"
        @mouseover="hover = true"
        @mouseout="hover = false"
        ref="messageList"
        @scroll="messagescroll"
      >
        <div
          class="line"
          :class="item.t"
          v-for="(item, i) in messageList"
          :key="i"
        >
          <div class="usd" v-if="item.t == 'pull'">
            <img class="img" :src="item.img" alt="" />
          </div>
          <span class="name" :class="item.t">
            {{
              item.t == "push"
                ? item.time + "&nbsp;&nbsp;" + item.name
                : item.name + "&nbsp;&nbsp;" + item.time
            }}
          </span>
          <div class="text">
            <div class="msg" v-html="htmlzy(item.text)"></div>
          </div>
          <div class="usd" v-if="item.t == 'push'">
            <img class="img" :src="item.img" alt="" />
          </div>
        </div>
      </div>
      <div class="ckt">
        <div class="tools">
          <span v-for="(item, j) in msgbtn" :key="j" :title="item.title">
            <div v-if="item.title == '表情'">
              <el-popover
                placement="top"
                title="表情"
                trigger="click"
                style="user-select: none"
              >
                <div style="">
                  <img
                    :src="img.url"
                    style="cursor: pointer; user-select: none"
                    ondragstart="return false;"
                    v-for="(img, id) in meme"
                    :key="id"
                    @click="faceSet(img.key)"
                  />
                </div>
                <img :src="item.url" alt="" slot="reference" />
              </el-popover>
            </div>
            <div v-else-if="item.title == '截图'">
              <el-popover
                placement="top"
                trigger="hover"
                style="user-select: none"
              >
                <p class="toolsline btnVideo" @click="toolsmenu(0)">录制视频</p>
                <p
                  class="toolsline btnImg"
                  @click="toolsmenu(1)"
                  title="CTRL+ALT+C"
                >
                  屏幕截图<span class="cpImgKj">CTRL+ALT+C</span>
                </p>
                <p class="toolsline isview" @click="toolsmenu(2)">
                  {{ isView == 0 ? "隐藏当前窗口" : "显示当前窗口" }}
                </p>
                <img :src="item.url" alt="" slot="reference" />
              </el-popover>
            </div>
            <img v-else :src="item.url" alt="" />
          </span>
        </div>
        <div
          class="contents text myicon"
          contenteditable
          ref="contents"
          tabindex="1"
          @keydown.enter="textareaKeydown"
          @contextmenu="msgMoenright"
        ></div>
        <el-button-group class="button">
          <el-button size="mini" @click="appContent">发送</el-button>
          <el-button
            size="mini"
            icon="el-icon-arrow-down"
            style="padding: 7px 2px"
            @click="msgSendSet"
          ></el-button>
        </el-button-group>
      </div>
    </div>
    <br />
    <canvas class="desktop" ref="desktop"></canvas>
  </div>
</template>
<script>
import myButton from "../button.vue";
import { getbase64 } from "../../assets/getdosktop";
export default {
  data() {
    return {
      uuid: "",
      user: [],
      meme: [],
      messageList: [],
      hover: false,
      msgbtn: [
        {
          id: 0,
          title: "表情",
          url: require("../../assets/msg/0.png"),
        },
        {
          id: 1,
          title: "截图",
          url: require("../../assets/msg/1.png"),
        },
        {
          id: 2,
          title: "文件",
          url: require("../../assets/msg/2.png"),
        },
        {
          id: 3,
          title: "视频",
          url: require("../../assets/msg/3.png"),
        },
        {
          id: 4,
          title: "远程协助",
          url: require("../../assets/msg/4.png"),
        },
      ],
      msgPage: 1,
      config: [],
      isView: 1,
    };
  },
  components: {
    myButton,
  },
  created() {
    for (let i = 1; i <= 50; i++) {
      this.meme.push({
        url: require("../../assets/icon/i_f" + i + ".gif"),
        title: i,
        key: "i_f" + i,
      });
    }
    window.addEventListener("keyup", this.funckeydown);
    window.addEventListener("message", (r) => {
      if (!r.detail) return;
      let d = r.detail;
      switch (d.type) {
        case "ltone":
          d.text = this.getBase(d.text);
          let yuser = JSON.parse(d.yuser);
          this.messageList.push({
            ...d,
            ...yuser,
            time: this.$moment(d.time).format("YYYY-MM-DD HH:mm:ss"),
          });
          if (this.hover) return;
          setTimeout(() => {
            this.messageListscroll();
          }, 1);
          break;
        case "setLimit":
          console.log(JSON.parse(d.msglist).reverse());
          if (d.msglist == "[]") this.msgPage--;
          if (this.messageList.length == 0) {
            JSON.parse(d.msglist)
              .reverse()
              .map((d) => {
                // debugger;
                d.text = this.getBase(d.content);

                this.messageList.push({
                  ...d,
                  t:
                    "oneMsg" + d.your_uuid == this.urlParam("id")
                      ? "pull"
                      : "push",
                  time: this.$moment(Number(d.time)).format(
                    "YYYY-MM-DD HH:mm:ss"
                  ),
                });
              });
          } else {
            JSON.parse(d.msglist).map((d) => {
              // debugger;
              d.text = this.getBase(d.content);
              this.messageList.unshift({
                ...d,
                t:
                  "oneMsg" + d.your_uuid == this.urlParam("id")
                    ? "pull"
                    : "push",
                time: this.$moment(Number(d.time)).format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
              });
            });
          }
          if (!this.hover) {
            setTimeout(() => {
              this.messageListscroll();
            }, 1);
          }
          console.log(this.messageList);
          break;
        case "getConfig":
          localStorage.setItem("config", JSON.stringify(d.data));
          break;
        case "getdosktop":
          this.sendBaseImg(true);
          break;
        default:
          break;
      }
    });
    this.ipc.send("message", {
      type: "getConfig",
      uuid: JSON.parse(localStorage.getItem("userObj")).uuid,
      view: this.urlParam("id"),
    });
  },
  mounted() {
    let list = localStorage.getItem("msglist");
    if (list) {
      list = JSON.parse(list);
      let user = list.find((e) => this.urlParam("id").indexOf(e.uuid) >= 0);
      console.log(user);
      this.getmsgList(user.meid, user.uuid, this.msgPage);
      this.user = user;
    }
    let config = localStorage.getItem("config");
    config ? (this.config = JSON.parse(config)) : null;
    let configs = this.config.find((e) => e.key == "截图");
    if (configs) {
      this.isView = configs.value;
    }
  },
  methods: {
    sendBaseImg(v) {
      let s = this.config.find((e) => e.key == "截图");
      if (v) {
        getbase64().then((res) => {
          document.querySelector("html").style = "opacity: 1;";
          this.ipc.send("message", {
            type: "snipping",
            view: this.urlParam("id"),
            isView: s.value,
            data: res,
          });
        });
      } else {
      }
    },
    async toolsmenu(i) {
      let r = localStorage.getItem("config");
      let user = JSON.parse(localStorage.getItem("userObj"));
      r ? (this.config = JSON.parse(r)) : (this.config = []);
      if (i == 0) {
      }
      if (i == 1) {
        let s = this.config.find((e) => e.key == "截图");
        if (s.value == 1) {
          getbase64().then((res) => {
            this.ipc.send("message", {
              type: "snipping",
              view: this.urlParam("id"),
              isView: s.value,
              data: res,
            });
          });
        } else {
          document.querySelector("html").style = "opacity: 0;";
          setTimeout(() => {
            this.ipc.send("message", {
              type: "snipping",
              view: this.urlParam("id"),
              isView: s.value,
              data: "",
            });
          }, 1);
        }
        console.log(this.isView);
      } else if (i == 2) {
        let s = this.config.find((e) => e.key == "截图");
        let obj = {
          uuid: user.uuid,
          key: "截图",
          value: 0,
          remark: "0隐藏1显示",
        };
        if (!s) {
          this.config.push(obj);
        } else {
          let ind = this.config.findIndex((e) => e.key == "截图");
          obj.value = s.value == 0 ? 1 : 0;
          this.$set(this.config, ind, obj);
        }
        localStorage.setItem("config", JSON.stringify(this.config));
        this.isView = obj.value;
        this.ipc.send("message", {
          type: "setMenuConfig",
          ...obj,
        });
      }
    },
    setKeyMenu(val) {
      let user = JSON.parse(localStorage.getItem("userObj"));
      this.ipc.send("message", {
        type: "setMenuConfig",
        uuid: user.uuid,
        key: "发送",
        value: val,
        remark: "0回车1组合",
      });
      let s = this.config.find((e) => e.key == "发送");
      let ind = this.config.findIndex((e) => e.key == "发送");
      if (s) {
        s.value = val;
        this.$set(this.config, ind, s);
      } else {
        s = {};
        s.key = "发送";
        s.value = val;
        s.uuid = user.uuid;
        this.config.push(s);
      }

      localStorage.setItem("config", JSON.stringify(this.config));
    },
    msgSendSet(e) {
      const remote = this.$ele.remote;
      const Menu = remote.Menu;
      const MenuItem = remote.MenuItem;
      e.preventDefault();
      let menu = new Menu();
      let config = 0;
      if (this.config.length >= 1) {
        console.log(this.config);
        let s = this.config.find((e) => e.key == "发送");
        console.log(s);
        if (s) {
          config = s.value;
        }
      }
      menu.append(
        new MenuItem({
          label: "Enter发送",
          enabled: config == 1,
          click: () => {
            console.log("设置Enter发送");
            this.setKeyMenu(0);
          },
        })
      );
      menu.append(new MenuItem({ type: "separator" })); //分割线
      menu.append(
        new MenuItem({
          label: "Enter+Ctrl发送",
          enabled: config == 0,
          click: (ev) => {
            console.log("设置Enter+Ctrl发送");
            this.setKeyMenu(1);
          },
        })
      );

      menu.popup({ window: remote.getCurrentWindow() });
    },
    msgMoenright(e) {
      const remote = this.$ele.remote;
      const Menu = remote.Menu;
      const MenuItem = remote.MenuItem;
      console.log("121212asasas", e);
      e.preventDefault();
      let menu = new Menu();
      menu.append(
        new MenuItem({
          label: "复制图片",
          accelerator: "CmdOrCtrl+C",
          role: "copy",
          visible: e.target.localName == "img" ? true : false,
          enabled: window.getSelection().type == "Range" ? true : false, //可用
        })
      );
      menu.append(
        new MenuItem({
          label: "复制文本",
          accelerator: "CmdOrCtrl+C",
          role: "copy",
          visible: e.target.localName == "img" ? false : true,
          enabled: window.getSelection().type == "Range" ? true : false, //可用
        })
      );
      menu.append(
        new MenuItem({
          label: "剪      切",
          accelerator: "CmdOrCtrl+X",
          role: "cut",
          enabled: window.getSelection().type == "Range" ? true : false, //可用
        })
      );
      menu.append(
        new MenuItem({
          label: "粘      贴",
          accelerator: "CmdOrCtrl+V",
          role: "paste",
          visible: e.target.className == "text myicon" ? true : false,
          // enabled: window.getSelection().type == "Range" ? true : false //可用
        })
      );
      menu.append(
        new MenuItem({
          label: "粘      贴2",
          click: function () {
            const clipboard = this.$ele.clipboard;
            console.log("1111", clipboard);
            // console.log("1111",clipboard.availableFormats())
            const rawFilePath = clipboard
              .readBuffer("FileNameW")
              .toString("ucs2");
            let filePath = rawFilePath.replace(
              new RegExp(String.fromCharCode(0), "g"),
              ""
            );
            console.log(filePath);
            if (filePath != "") {
              let type = filePath
                .substr(filePath.lastIndexOf("\\") - 1)
                .lastIndexOf(".");
              if (type == -1) return alert("您不能上传文件夹！");
              console.log(type);
            }
            // let type=
            return console.log(
              filePath.substr(filePath.lastIndexOf("\\") - 1).lastIndexOf(".")
            );
            var fileexe = require("fs").statSync(filePath);
            var size = fileexe.size;
            console.log(filePath);
            var inp = document.createElement("input");
            inp.setAttribute("type", "file");
            inp.setAttribute("value", filePath);
            console.log(inp.files);
          },
          // accelerator: "CmdOrCtrl+V",
          // role: "paste",
          // visible: e.target.className=="text myicon"? true : false,
          // enabled: window.getSelection().type == "Range" ? true : false //可用
        })
      );
      menu.append(
        new MenuItem({
          label: "更新版本",
          click: function (e) {
            console.log(e);
            this.ipc.send("oldUpdata");
          },
        })
      );
      menu.append(new MenuItem({ type: "separator" })); //分割线
      menu.append(
        new MenuItem({
          label: "关于我们",
          click: function () {
            shell.openExternal(
              "file:///D:/%E8%AE%BE%E8%AE%A1%E5%99%A8/www/index/bi.html"
            );
          },
        })
      );
      console.log(e);
      menu.popup({ window: remote.getCurrentWindow() });
    },
    htmlzy(v) {
      let d = v.replace(/\[i_f\d+\]/gi, (v) => {
        let g = v.substr(1, v.length - 2);
        console.log(216, g);
        return `<img src="${require("../../assets/icon/" + g + ".gif")}">`;
      });
      // console.log(d);
      return d;
    },
    faceSet(key) {
      let el = this.$refs.contents;
      let html = el.innerHTML;
      this.$refs.contents.innerHTML += `<span key="${key}"><img src="${require("../../assets/icon/" +
        key +
        ".gif")}"/></span>`;
      /**
         * let el = this.$refs.contents;
      let html = `<img key="${key}" src="${require("../../assets/icon/" +
        key +
        ".gif")}"/>`;
      var selection = window.getSelection();
      let index = el.childNodes;
      if (index.length == 0) {
      }
      if (selection.anchorNode.nodeName != "#text") {
        console.log("1213", selection.anchorNode.nodeName);
      }
      // 获取包含当前节点的文档片段
      var range = selection.getRangeAt(0);
      // 创建需追加到光标处节点的文档片段
      var fragment = range.createContextualFragment(html);
      // 将创建的文档片段插入到光标处
      range.insertNode(fragment.lastChild);
      range.collapse(); //处理光标
         */
    },
    messagescroll(e) {
      let scrollTop = this.$refs.messageList.scrollTop;
      if (scrollTop <= 0) {
        // console.log("加载", scrollTop);
        this.msgPage++;
        this.getmsgList(this.user.meid, this.user.uuid, this.msgPage);
      }
    },
    getmsgList(uuid, yourid, num) {
      console.log(uuid, yourid, num);
      this.ipc.send("message", {
        type: "msgLimit",
        uuid: uuid,
        yourid: yourid,
        page: num,
      });
    },
    placeCaretAtEnd(el) {
      //传入光标要去的jq节点对象
      el.focus();
      if (
        typeof window.getSelection != "undefined" &&
        typeof document.createRange != "undefined"
      ) {
        let range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (typeof document.body.createTextRange != "undefined") {
        let textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
      }
    },
    textareaRange() {
      let el = this.$refs.contents;
      let html = el.innerHTML;
      this.$refs.contents.innerHTML +=
        html == "" ? "<div><br></div><div><br></div>" : "<div><br></div>";
      this.placeCaretAtEnd(el.lastElementChild);
    },
    textareaKeydown(event) {
      let config = localStorage.getItem("config")
        ? JSON.parse(localStorage.getItem("config"))
        : [];
      if (event.ctrlKey && event.keyCode === 13) {
        //ctrl+enter
        if (config.length >= 1) {
          let s = config.find((e) => e.key == "发送");
          if (s) {
            if (s.value == 0) {
              this.textareaRange();
            } else {
              this.appContent();
            }
          }
        }
      } else if (event.keyCode === 13) {
        if (config.length >= 1) {
          let s = config.find((e) => e.key == "发送");
          if (s) {
            if (s.value == 0) {
              this.appContent();
            } else {
              this.textareaRange();
            }
          }
        }
      }
      event.preventDefault(); // 阻止浏览器默认换行操作
      return false;
    },
    funckeydown(e) {
      // console.log(e);
    },
    ctrlV() {},
    messageListscroll() {
      document
        .querySelector(".messageList")
        .scrollTo(0, document.querySelector(".messageList").scrollHeight + 60);
    },
    appContent() {
      this.hover = false;
      let _d = this.$refs.contents.children;
      let user = JSON.parse(localStorage.getItem("userObj"));
      let to = false;
      let rmlist = this.$refs.contents.innerHTML;
      for (let i = 0; i < _d.length; i++) {
        // console.log(rmlist);
        if (
          _d[i].getAttribute("key") &&
          _d[i].getAttribute("key").indexOf("i_f") >= 0
        ) {
          _d[i].innerHTML = "[" + _d[i].getAttribute("key") + "]";
          _d[i].removeAttribute("key");
        }
        if (_d[i].innerHTML == "<br>") {
          if (!to) {
            this.$refs.contents.removeChild(_d[i]);
          }
        } else {
          to = true;
        }
      }
      let html = JSON.stringify(this.$refs.contents.innerHTML);
      console.log(user, this.user);
      html = html.replace("<div><br></div>", "");
      // html = html.replace(/<.*?span>/gi, "");
      html = html.length >= 2 ? html.substr(1, html.length - 2) : "";
      if (html == "" || html.length == 0 || html.length == " ") return;
      let obj = {
        yourid: this.user.uuid,
        uuid: user.uuid,
        time: this.$moment().format("YYYY-MM-DD hh:mm:ss"),
        t: "push",
        text: this.setBase(html),
        type: "ltone",
      };
      this.messageList.push({
        text: rmlist,
        time: this.$moment().format("YYYY-MM-DD hh:mm:ss"),
        uuid: this.user.meid,
        img: user.img,
        name: user.name,
        t: "push",
      });
      console.log(obj);
      this.ipc.send("message", obj);
      setTimeout(() => {
        this.$refs.contents.innerHTML = "";
        this.messageListscroll();
      }, 1);
    },
    max() {
      //最大化
      this.ipc.send("message", {
        type: "window-show",
        id: this.urlParam("id"),
      });
    },
    min() {
      //最小化
      this.ipc.send("message", {
        type: "window-hide",
        id: this.urlParam("id"),
      });
    },
    close(e) {
      //关闭
      this.ipc.send("message", { type: "out", id: this.urlParam("id") });
    },
  },
};
</script>
<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.main {
  width: 100%;
  height: 100%;
  position: relative;
  > .title {
    width: 100%;
    -webkit-app-region: drag;
    height: 36px;
    background: rgba(0, 0, 0, 0.8);
    position: relative;
    color: #ffffff;
    line-height: 36px;
    font-size: 16px;
    text-align: center;
    > .btn {
      position: absolute;
      top: 0;
      right: 0;
      width: 36px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      font-size: 20px;
      cursor: pointer;
      color: #ffffff;
      -webkit-app-region: none;
      &.hide {
        right: 36px;
        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
      &.out {
        &:hover {
          background: rgba(252, 2, 52, 0.548);
        }
      }
    }
  }
  > .centent {
    position: absolute;
    padding: 0;
    left: 0;
    top: 36px;
    bottom: 0;
    width: 100%;
    > .messageList {
      height: calc(100% - 130px);
      width: 100%;
      overflow: hidden;
      overflow-y: scroll;
      position: relative;
      &:hover {
        &::-webkit-scrollbar {
          position: absolute;
          width: 0px;
          height: 0px;
          right: 0;
        }
        &::-webkit-scrollbar-thumb {
          background-color: rgba(25, 135, 209, 0.5);
          border-radius: 5px;
          position: absolute;
          right: 0;
        }

        &::-webkit-scrollbar-track {
          position: absolute;
          right: 0;
          width: 0;
          height: 0px;
          margin-right: 0px;
        }
      }
      &::-webkit-scrollbar {
        width: 0px;
        height: 0px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: rgba(25, 135, 209, 0.5);
        border-radius: 5px;
      }

      &::-webkit-scrollbar-track {
        width: 0;
        height: 0px;
        margin-right: 0px;
      }
      > .line {
        display: flex;
        flex-direction: row;
        min-height: 60px;
        width: 100%;
        position: relative;
        padding: 8px;
        margin-top: 16px;
        > .text {
          width: calc(100% - 40px);
          display: flex;
          > .msg {
            max-width: calc(100% - 20px);
            display: flex;
            justify-content: flex-end;
            line-height: 20px;
            background: rgba(0, 0, 0, 0.06);
            padding: 6px;
            border-radius: 4px;
            position: relative;
            vertical-align: middle;
            display: table-cell;
            word-wrap: break-word;
            &::before {
              content: " ";
              width: 0;
              height: 0;
              border-top: 8px solid transparent;
              border-bottom: 8px solid transparent;
              position: absolute;
            }
          }
        }
        > .usd {
          width: 40px;
          position: relative;
          > .img {
            width: 30px;
            height: 30px;
            border-radius: 50px;
            border: #eaeaea 1px solid;
            position: absolute;
          }
        }
        > .name {
          font-size: 12px;
          position: absolute;
          top: -12px;
          color: #717171;
        }
        &.push {
          > .name {
            right: 8px;
          }
          > .usd {
            > .img {
              right: 0px;
            }
          }
          > .text {
            justify-content: flex-end;
            > .msg {
              &::before {
                right: -10px;
                border-left: 10px solid rgba(0, 0, 0, 0.06);
              }
            }
          }
        }
        &.pull {
          > .name {
            left: 8px;
          }

          > .text {
            justify-content: flex-start;
            > .msg {
              &::before {
                left: -10px;
                border-right: 10px solid rgba(0, 0, 0, 0.06);
              }
            }
          }
        }
      }
    }
    > .ckt {
      width: 100%;
      height: 130px;
      position: relative;
      border-top: #eaeaea 1px solid;
      > .tools {
        height: 30px;
        line-height: 30px;
        padding: 0 8px;
        display: flex;
        flex-direction: row;
        user-select: none;

        > span {
          width: 30px;
          height: 30px;
          margin-right: 6px;
          padding: 4px;
          cursor: pointer;
          img {
            height: 22px;
            width: 22px;
          }
        }
        .memeimg {
          cursor: pointer;
        }
      }
      > .text {
        width: 100%;
        position: absolute;
        left: 0;
        top: 30px;
        bottom: 35px;
        border: none;
        outline: none;
        overflow: hidden;
        overflow-y: scroll;

        padding: 8px 8px 0px;
        line-height: 20px;
        z-index: 1;
      }
      > .button {
        position: absolute;
        width: 120px;
        height: 30px;
        right: 6px;
        bottom: 4px;
        z-index: 2;
      }
    }
  }
}
.toolsline {
  margin-bottom: 5px;
  cursor: pointer;
}
.video {
  position: fixed;
  top: 50000px;
  width: 320px;
  height: 240px;
  left: 50000px;
  z-index: 8;
}
.desktop {
  position: fixed;
  top: 10000px;
  left: 10000px;
}
.cpImgKj {
  font-size: 12px;
  color: #717171;
  margin-left: 6px;
}
</style>
