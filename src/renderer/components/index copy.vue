<template>
  <div class="index">
    <indexButton />
    <div class="main">
      <p class="title">此设备</p>
      <div class="line">
        <span> 当前设备 </span>
        <span>
          {{ user.uuid }}
        </span>
      </div>
      <div class="line">
        <span> 临时密码 </span>
        <span>
          {{ user.uupwd }}
        </span>
      </div>
      <p class="title">此设备</p>
      <div class="line">
        <span> 对方设备 </span>
        <span>
          <!-- <el-input
            size="mini"
            maxlength="11"
            v-model="uuphone"
            placeholder="请输入对方设备"
          /> -->
          <el-autocomplete
            class="inline-input"
            v-model="uuphone"
            size="mini"
            :fetch-suggestions="querySearch"
            placeholder="请输入对方设备"
            oninput="value=value.replace(/[^\d]/g,'')"
            :trigger-on-focus="true"
            @select="handleSelect"
          ></el-autocomplete>
        </span>
      </div>
      <br />
      <el-button size="mini" @click="communication">连接</el-button>
    </div>
  </div>
</template>
<script>
import indexButton from "./button";
import { createSocket, sendWSPush } from "../assets/websocket.js";
export default {
  data() {
    return {
      wsUrl: null,
      user: "",
      uuphone: "",
      uupwd: "",
      restaurants: [],
      timer: null,
    };
  },
  components: {
    indexButton,
  },
  mounted() {
    window.addEventListener("message", (r) => {
      //  console.log(r)
      if (!r.detail) return;
      let d = r.detail;
      if (d.type == "userObj") {
        localStorage.setItem("userObj", JSON.stringify(d.data));
        this.user = d.data;
      }
    });
    this.timer = setInterval(() => {
      let u = localStorage.getItem("userObj");
      if (u) {
        clearInterval(this.timer);
        this.getData(u);
      } else {
        this.ipc.send("message", { type: "userObj", id: this.urlParam("id") });
      }
    }, 100);
    // let u = localStorage.getItem("userObj");
    // this.ipc.send("message", { type: "userObj", id: this.urlParam("id") });
  },
  methods: {
    getData(u) {
      this.user = JSON.parse(u);
      this.wsUrl = this.ips + this.user.uuid;
      createSocket(this.wsUrl);
      clearInterval(this.timer);
      if (this.user.list && this.user.list.length >= 1) {
        this.restaurants = JSON.parse(this.user.list);
      }
      window.addEventListener("wsOnmessage", this.onmessage);
      this.login();
    },
    ag() {
      // var int = ref.types.int;
      // let string = ref.types.CString;
      // console.log(ref.types);
      // let dll = ffi.Library(path.join(__dirname, "/dll/main.dll"), {
      //   Init: [int, [int]], //传输0打开键盘鼠标 1 关闭
      //   KeyTap: [int, [string]],
      //   MoveMouse: [int, [int, int]],
      //   MouseClick: [int, [string]],
      //   MouseToggle: [int, [string, string]],
      // });
      // //返回0 成功 1失败
      // dll.Init(0); // 初始化打开 0打开控制 1关闭控制
      // setTimeout(() => {
      //   dll.MoveMouse(300, 300); //鼠标移动/(x,y)
      //   dll.MouseClick("Left"); //鼠标左键单击一下
      //   dll.KeyTap("a"); //输入A键
      //   // dll.MouseToggle("down", "left"); //第一个值鼠标抬起按下"up" : "down",第二个左右键 "left" : "right",
      //   setTimeout(() => {
      //     dll.MouseToggle("down", "left");
      //     dll.MoveMouse(300, 900); //鼠标移动/(x,y)
      //     dll.MoveMouse(0, 900); //鼠标移动/(x,y)
      //   }, 1000);
      //   // setTimeout(() => {
      //   //   dll.MouseToggle("up", "left");
      //   // }, 2000);
      // }, 1000);
    },
    lists(e) {
      console.log("-------------------", e.button, e.buttons);
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
          //登录成功开始执行
          this.handleLogin(data.success);
          break;
        case "BrowserWindow":
          //创建客户端准备远程装
          this.ipc.send("message", {
            type: "browserWindow",
            name: "controlled_" + +new Date() + "_" + data.server,
            server: data.server,
          });
          break;
        case "getOnline":
          //登录成功开始执行
          if (data.code == 0) {
            this.onlines(data);
          } else {
            this.err("对方无应答！");
          }
          break;
        default:
          break;
      }
    },
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    handleSelect(item) {
      console.log(item);
      this.uuphone = item.value;
      this.uupwd = item.code;
      // if (!item.password) return (this.pwdVal = "");
      // let p = this.getRsa(item.password);
      // this.pwdVal = p.substr(1, p.length - 2);
    },
    async communication() {
      if (__dirname.indexOf("components") == -1) {
        if (this.user.uuid == this.uuphone) return this.err("不能连接自己喔！");
      }
      sendWSPush({
        type: "online",
        s: this.uuphone,
        n: this.user.uuid,
      });
    },
    async onlines(d) {
      let vid = "v_" + +new Date();
      let obj = {
        type: "openVideo",
        event: "start",
        server: d.server,
        name: this.user.uuid,
        id: vid,
        value:this.uuphone
      };
      this.ipc.send("message", obj);
    },
    send(message) {
      if (this.server) {
        message.name = this.server;
      }
      sendWSPush(message);
    },
    login() {
      sendWSPush({
        type: "login",
        name: this.user.uuid,
      });
    },
    videoShow(myStream) {
      this.stream = myStream;
      //展示本地媒体流
      //服务配置
      this.$refs.localAudio.srcObject = myStream;
    },
    handleLogin(success) {
      if (success === false) {
        console.log("存在了");
      }
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
  background: #ffffff;
  // border: #333333 0.5px solid;
  > .main {
    width: 100%;
    height: calc(100% - 30px);

    border: 1px #eaeaea solid;
    padding: 50px;
    > .title {
      font-size: 18px;
      color: blue;
      font-weight: 900;
    }
    > .line {
      height: 36px;
      width: 100%;
      display: flex;
      flex-direction: row;
      > span:nth-child(1) {
        font-size: 16px;
        font-weight: 600;
        line-height: 36px;
        margin-right: 8px;
      }
      > span:nth-child(2) {
        font-size: 14px;
        line-height: 36px;
      }
    }
  }
}
</style>