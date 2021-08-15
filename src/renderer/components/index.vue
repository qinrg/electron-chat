<template>
  <div class="index" @click="mainClick">
    <!-- <indexButton /> -->
    <div class="top">
      <div class="but out" @click="out" title="关闭">
        <img src="../assets/html/out.png" alt="" />
      </div>
      <div class="but hide" @click="hide" title="最小化">
        <img src="../assets/html/js.png" alt="" />
      </div>
      <div class="userImg" ref="userImg">
        <img :src="user.img" alt="" />
      </div>
      <div class="userls">
        <div class="name">{{ user.name }}</div>
        <div class="motto" :title="user.motto">
          {{ user.motto }}
        </div>
      </div>
      <div class="search" :class="{ action: searchBlurView }">
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
        <input
          placeholder="请输入内容"
          v-model="search"
          @blur="searchBlurView = false"
          @focus="searchBlurView = true"
        />
      </div>
    </div>
    <div class="main">
      <div class="tabs">
        <div
          class="message btn"
          :class="{ action: activeName == 'message' }"
          @click="activeName = 'message'"
        >
          消息
        </div>
        <div
          class="connection btn"
          :class="{ action: activeName == 'connection' }"
          @click="activeName = 'connection'"
        >
          联系
        </div>
        <div class="addLINK" title="加好友/群" @click="addContact">
          <i class="el-icon-plus"></i>
        </div>
      </div>
      <div class="tabsView">
        <div
          class="list"
          :style="{
            width: width * 2 + 'px',
            left: activeName == 'message' ? '0px' : 0 - width + 'px',
          }"
        >
          <div
            v-for="(item, i) in tabsList"
            :key="i"
            :class="item.name"
            :style="{ width: width + 'px' }"
          >
            <div class="block" v-if="activeName == 'message'">
              <div
                class="line"
                v-for="(line, j) in item.data"
                :key="line.id"
                :class="{ action: line.action }"
                @click="onclickLine(i, j)"
                v-if="line.user_obj"
              >
                <img class="img" :src="line.user_obj.img" alt="" />
                <div class="text">
                  <div class="name">
                    {{ line.user_obj.uuid }}
                  </div>
                  <div class="motto">
                    {{ dispose(line.text) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="block">
              <div class="gr_line" v-for="(gr, gi) in item.data" :key="gi">
                <div class="title" @click.stop="gr.action = !gr.action">
                  <i v-if="!gr.action" class="el-icon-arrow-right"></i>
                  <i v-else class="el-icon-arrow-down"></i>
                  <span>{{ gr.name }}</span
                  ><span>&nbsp;&nbsp;{{ gr.num }}/{{ gr.num }}</span>
                </div>
                <div
                  class="list"
                  :class="{
                    action: gr.action == true,
                  }"
                  :style="{ height: gr.action ? gr.num * 60 + 'px' : '0px' }"
                >
                  <div
                    class="line"
                    v-for="(line, jl) in gr.list"
                    :key="jl"
                    :class="{ action: line.action }"
                    @click="onclick_grline(i, gi, jl)"
                  >
                    <img class="img" :src="line.img" alt="" />
                    <div class="text">
                      <div class="name">
                        {{ line.name }}
                      </div>
                      <div class="motto">
                        {{ line.motto }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="searchBlurView" v-if="searchBlurView"></div>
    <div class="footer">
      <div class="tabs">
        <i
          class="menu el-icon-s-grid"
          slot="reference"
          @click.stop="menuShow = !menuShow"
        ></i>
      </div>
      <div class="menuview" :style="{ height: menuShow ? 'auto' : 0 }">
        <div class="line" @click="ipc.send('message', { type: '003Register' })">
          <i class="el-icon-s-custom"></i>
          <span>注册</span>
        </div>
        <div class="line" @click="aboutus">
          <i class="el-icon-share"></i>
          <span>关于</span>
        </div>
        <div class="line" @click="appOut">
          <i class="el-icon-sort"></i>
          <span>切换账号</span>
        </div>
        <div class="line" @click="userOut">
          <i class="el-icon-eleme"></i>
          <span>退出</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import indexButton from "./button";
import { createSocket, sendWSPush } from "../assets/websocket.js";
export default {
  data() {
    return {
      indexbackground: "", //背景图图
      user: "", //用户信息
      search: "", //搜索内容
      activeName: "message", //显示块
      width: "",
      wsUrl: null,
      searchBlurView: false, //搜索视图
      tabsList: [], //消息组
      grodList: [], //联系组
      clickIs: 0, //鼠标双击出来
      timer: null, //时间差
      menuShow: false, //菜单显示
      fdmenu: true,
    };
  },
  created() {
    this.width = window.innerWidth;
    //监听后端返回的信息
    window.addEventListener("wsOnmessage", this.onmessage);
    window.onresize = () => {
      this.width = window.innerWidth;
    };
    window.addEventListener("message", (r) => {
      if (!r.detail) return;
      let d = r.detail;
      if (d.type == "userObj") {
        localStorage.setItem("userObj", JSON.stringify(d.data));
        this.user = d.data;
        this.user.motto =
          "时间让我们从过去到现在，冲淡了是回忆。再美好，也经不住遗忘，再悲伤，也抵不过时间，过去的了就过去吧！...";
      }
      if (d.type == "ltone") {
        sendWSPush(d);
      }
    });
    //只想缓存用户信息
    // this.ipc.send("message", { type: "userObj", id: "002" });
    // let ud = localStorage.getItem("user");
    // if (ud) this.user = JSON.parse(ud);
    //检查用户信息开始链接

    this.timer = setInterval(() => {
      let u = localStorage.getItem("userObj");
      if (u) {
        clearInterval(this.timer);
        this.timer = null;
        this.getData(u); //开始长链接
      } else {
        this.ipc.send("message", {
          type: "userObj",
          id: "002",
          uuid: this.urlParam("id"),
        });
      }
    }, 100);
  },
  components: {
    indexButton,
  },
  mounted() {},
  methods: {
    dispose(d) {
      if (!d) return "";
      return this.getBase(d);
    },
    addContact() {
      this.ipc.send("message", {
        type: "addContact",
        id: "lt_addContact",
      });
    },
    aboutus(e) {
      this.$ele.shell.openExternal("https://w3cjs.cn");
    },
    mainClick(e) {
      this.menuShow = false;
    },
    handleChange() {},
    handleLogin() {
      sendWSPush({
        type: "getMessageList",
        name: this.user.uuid,
      });
    },
    onmessage(e) {
      //如果获取到消息，心跳检测重置
      //拿到任何消息都说明当前连接是正常的
      //console.log('websocket服务获得数据了');

      //接受消息后的UI变化
      const msg = e && e.detail.data;
      if (msg == "欢迎使用！") return;
      let data = JSON.parse(msg);
      switch (data.type) {
        case "login":
          //链接开始
          this.handleLogin(data.success);
          break;
        case "getMessageList":
          // console.log(data);
          let userList = JSON.parse(data.msgList).map((e) => {
            e["action"] = false;
            e.user_obj ? (e.user_obj = { ...JSON.parse(e.user_obj) }) : "";
            return e;
          });

          let grodList = data.grodList.map((e) => {
            let s = JSON.parse(e.list);
            if (s.length >= 1) {
              s.map((d) => {
                d["action"] = false;
                return d;
              });
            }
            e["list"] = s;
            e["action"] = false;
            e["num"] = e.list.length;
            return e;
          });
          this.tabsList = [
            {
              name: "message",
              data: userList,
            },
            {
              name: "connection",
              data: grodList,
            },
          ];
          break;
        case "userAddMsg":
          let u = JSON.parse(data.user)[0];
          u.remark = data.remark;
          localStorage.setItem("userAddMsg", JSON.stringify(u));
          this.ipc.send("message", {
            type: "userAddMsg",
            id: "userAddMsg_" + u.uuid,
          });
          break;
        case "ltone":
          let d = data;
          d.t = "pull";
          this.ipc.send("message", data);
          break;

        default:
          break;
      }
    },
    getData(u) {
      this.user = JSON.parse(u);
      this.wsUrl = this.ips + this.user.uuid;
      createSocket(this.wsUrl);
    },
    openViewMsg(r) {
      //设置保存id
      r.meid = this.user.uuid;
      //获取聊天列表信息
      let list = localStorage.getItem("msglist");
      let newList = [],
        istrue = false;
      if (list) {
        newList = JSON.parse(list);
      } else {
        newList.push(r);
      }
      newList.map((e) => {
        if (e.uuid == r.uuid) {
          istrue = true;
        }
        return e;
      });
      if (!istrue) {
        newList.push(r);
      }
      localStorage.setItem("msglist", JSON.stringify(newList));
      this.ipc.send("message", {
        type: "chatViewAll",
        data: r,
      });
    },
    onclick_grline(i, j, k) {
      this.clickIs++;
      if (this.timer) return;
      this.tabsList[i].data[j].list.map((e, z) => {
        if (k == z) {
          e.action = true;
        } else {
          e.action = false;
        }
        return e;
      });
      this.timer = setTimeout(() => {
        if (this.clickIs >= 2) {
          let d = this.tabsList[i].data[j].list[k];
          d.type = this.tabsList[i].data[j].type;
          this.openViewMsg(d);
        }
        this.timer = null;
        this.clickIs = 0;
      }, 300);
    },
    onclickLine(i, j) {
      this.clickIs++;
      if (this.timer) return;
      this.tabsList[i].data.map((e, z) => {
        if (j == z) {
          e.action = true;
        } else {
          e.action = false;
        }
        return e;
      });
      this.timer = setTimeout(() => {
        if (this.clickIs >= 2) {
          this.openViewMsg(this.tabsList[i].data[j].user_obj);
        }
        this.timer = null;
        this.clickIs = 0;
      }, 300);
    },
    appOut() {
      localStorage.clear();
      this.ipc.send("message", { type: "switch-user", data: this.user });
    },
    userOut() {
      localStorage.clear();
      this.ipc.send("message", { type: "window-close" });
    },
    out() {
      // this.ipc.send("message", { type: "window-close" });
      this.ipc.send("message", {
        type: "window-hide",
        id: "002",
      });
    },
    hide() {
      this.ipc.send("message", {
        type: "window-hide",
        id: "002",
      });
    },
  },
};
</script>
<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.index {
  width: 100%;
  // min-width: 1024px;
  height: 100%;
  padding: 0;
  margin: 0;
  z-index: 1;
  overflow: hidden;
  background: url("../assets/img/login.png");
  // border: #333333 0.5px solid;
  user-select: none;
  position: relative;
  > .top {
    height: 140px;
    -webkit-app-region: drag;
    position: relative;
    > .but {
      position: absolute;
      width: 30px;
      height: 30px;
      // background: rgba(255, 255, 255, 0.1);
      -webkit-app-region: none;
      padding: 7px;
      > img {
        width: 16px;
        height: 16px;
      }
      &.out {
        top: 0;
        cursor: pointer;
        right: 0;

        &:hover {
          background: rgba(240, 23, 23, 0.856);
        }
      }
      &.hide {
        top: 0;
        right: 30px;
        cursor: pointer;
        &:hover {
          background: rgba(119, 84, 84, 0.15);
        }
      }
    }
    > .userImg {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      position: absolute;
      left: 16px;
      top: 40px;
      > img {
        width: 100%;
        height: 100%;
      }
    }
    > .userls {
      top: 50px;
      position: absolute;
      left: 90px;
      right: 10px;
      > .name {
        height: 22px;
        line-height: 22px;
        font-size: 16px;
        font-weight: 600;
      }
      > .motto {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        -webkit-app-region: none;
      }
    }
    > .search {
      width: 100%;
      height: 32px;
      -webkit-app-region: none;
      position: absolute;
      bottom: 0;
      display: flex;
      flex-direction: row;
      background: rgba(107, 106, 106, 0.15);
      &.action {
        background: rgba(255, 255, 255, 0.9);
        border-bottom: 1px #eaeaea solid;
      }
      > i {
        width: 32px;
        height: 32px;
        line-height: 32px;
        font-size: 16px;
        color: #8a8888;
      }
      > input {
        width: 100%;
        -webkit-app-region: none;
        box-sizing: border-box;
        height: 100%;
        outline-color: invert;
        outline-style: none;
        outline-width: 0px;
        border: none;
        border-style: none;
        text-shadow: none;
        -webkit-appearance: none;
        -webkit-user-select: text;
        outline-color: transparent;
        background: transparent;
        box-shadow: none;
        z-index: 1;
        &::-webkit-input-placeholder {
          text-align: left;
          color: rgb(97, 96, 96);
        }
      }
    }
  }
  > .main,
  > .searchBlurView {
    width: 100%;
    // border: 1px #eaeaea solid;
    padding-bottom: 8px;
    position: absolute;
    top: 140px;
    bottom: 32px;
    background: rgba(255, 255, 255, 0.4);
    z-index: 1;
    > .tabs {
      height: 42px;
      border-bottom: 2px #ffffff solid;
      display: flex;
      flex-direction: row;
      position: relative;
      > .btn {
        width: 25%;
        height: 42px;
        line-height: 42px;
        text-align: center;
        color: #888888;
        position: relative;
        &:hover {
          color: #000;
        }
        &::before {
          content: " ";
          position: absolute;
          width: 0%;
          height: 2px;
          bottom: 0px;
          left: 25%;
          background: rgba(0, 0, 0, 0.7);
          transition: linear 0.1s all;
        }
        &.action {
          color: #000;
          position: relative;
          &::before {
            width: 50%;
            background: rgba(0, 0, 0, 0.7);
          }
        }
      }
      > .addLINK {
        width: 30px;
        height: 30px;
        position: absolute;
        top: 6px;
        right: 8px;
        line-height: 30px;
        text-align: center;
        cursor: pointer;
        > i {
          font-size: 15px;
        }
        &:hover {
          color: #018fdf;
        }
      }
    }
    > .tabsView {
      height: calc(100% - 42px);
      position: relative;
      padding: 8px 0 0;
      > .list {
        position: absolute;
        transition: all 0.15s linear;
        height: 100%;
        display: flex;
        flex-direction: row;
        > .message,
        > .connection {
          overflow: hidden;
          &:hover {
            overflow-y: scroll;
          }
          > .block {
            width: 100%;
            .line {
              height: 60px;
              display: flex;
              flex-direction: row;
              padding: 0 8px;
              &.action {
                background: rgba(0, 0, 0, 0.09);
              }
              &:hover {
                background: rgba(0, 0, 0, 0.05);
              }
              > .img {
                width: 40px;
                height: 40px;
                border-radius: 50px;
                margin: 10px 8px 10px 0;
              }
              > .text {
                width: calc(100% - 70px);
                height: 60px;
                padding: 10px 2px;
                > .name {
                  height: 20px;
                  line-height: 20px;
                  font-size: 14px;
                  color: #333;
                  font-weight: 500;
                }
                > .motto {
                  height: 20px;
                  line-height: 20px;
                  font-size: 12px;
                  color: #8a8888;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  -webkit-app-region: none;
                }
              }
            }
            > .gr_line {
              > .title {
                height: 30px;
                font-size: 14px;
                font-weight: 400;
                line-height: 30px;
                padding: 0 8px;
              }
              > .list {
                overflow: hidden;
                width: 100%;
                height: 0;
                transition: all 0.15s linear;
              }
            }
          }
        }
      }
    }
  }
  > .searchBlurView {
    background: rgba(255, 255, 255, 0.9);
  }
  > .footer {
    width: 100%;
    height: 32px;
    position: fixed;
    left: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
    z-index: 9999;
    padding: 0 4px;
    > .tabs {
      > .menu {
        width: 30px;
        height: 30px;
        font-size: 24px;
        line-height: 30px;
        margin-top: 1px;
        cursor: pointer;
        color: rgba(101, 166, 163, 0.99);
      }
    }
    > .menuview {
      width: 168px;
      position: fixed;
      bottom: 32px;
      left: 0;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      background: rgba(255, 255, 255, 0.98);
      border-radius: 0 4px 0 0;
      overflow: hidden;
      > .line {
        width: 100%;
        min-height: 30px;
        line-height: 30px;
        font-size: 14px;
        padding: 0 8px;
        cursor: pointer;
        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }
    }
  }
}
</style>
