<template>
  <div class="login" @click="allclick">
    <div class="zm">
      <div class="name">&nbsp;聊8</div>
      <div class="form">
        <div class="user_img">
          <img :src="userimg != '' ? userimg : oldimg" alt="" />
        </div>
        <div class="line">
          <input
            type="text"
            class="uname"
            v-model="uname"
            placeholder="请输入您聊8的账号"
          />
          <div class="el-icon-arrow-down users" @click="getAppuser" />
          <div
            class="userlist"
            v-if="userlist.length > 1 && getAppusershow == true"
          >
            <div
              class="line"
              v-for="(item, i) in userlist"
              :key="i"
              @click="userlineclick(item)"
            >
              <img :src="item.img" alt="" srcset="" />
              <p class="name">{{ item.type > 0 ? item.name : item.name }}</p>
              <p class="email">{{ item.uuid }}</p>
              <i class="el-icon-circle-close"></i>
            </div>
          </div>
        </div>
        <div class="line">
          <input
            type="password"
            class="upwd"
            v-model="upwd"
            placeholder="请输入您聊8的密码"
          />
        </div>
        <div class="ridob">
          <label
            v-for="(item, i) in ridob"
            :key="item.key"
            @click="ridobfunc(i, item.is)"
          >
            <div v-if="i < ridob.length - 1 && item.is" class="choice action">
              <img src="../assets/html/ok.png" alt="" />
            </div>
            <div
              v-else-if="i < ridob.length - 1 && !item.is"
              class="choice noact"
            ></div>
            {{ item.name }}
          </label>
        </div>
        <div class="buttonLgoin" @click="buttonLgoin">登&nbsp;&nbsp;录</div>
        <div class="el-icon-warning-outline msg" v-if="msg != ''">
          {{ msg }}
        </div>
        <div class="req" @click="requser">注册账号</div>
      </div>
      <div class="but out" @click="out" title="关闭">
        <img src="../assets/html/out.png" alt="" />
      </div>
      <div class="but hide" @click="hide" title="最小化">
        <img src="../assets/html/js.png" alt="" />
      </div>
    </div>
  </div>
</template>
<script>
import Md5 from "@/assets/md5.js";
export default {
  data() {
    return {
      uname: "",
      upwd: "",
      msg: "",
      userimg: "",
      oldimg: require("../assets/user/0.png"),
      ridob: [
        {
          name: "记住密码",
          key: "password",
          is: false,
        },
        {
          name: "自动登录",
          key: "autologin",
          is: false,
        },
        {
          name: "忘记密码",
          key: "forgetpwd",
          is: false,
        },
      ],
      userlist: [],
      getAppusershow: false,
    };
  },
  created() {
    window.addEventListener("message", (r) => {
      if (!r.detail) return;
      let d = r.detail;
      switch (d.type) {
        case "loginRecord":
          console.log(d);
          if (d.data) {
            this.uname = d.data.type > 0 ? d.data.email : d.data.uuid;
            this.upwd = d.data.upwd;
            this.userimg = d.data.img;
            d.data.checks ? (this.ridob = JSON.parse(d.data.checks)) : "";
            this.ridob[1].is ? this.httpLgoin() : "";
          }
          break;
        case "getAppuser":
          console.log("获取成功", d.data);
          this.userlist = d.data;
          this.getAppusershow = true;
          break;
        default:
          break;
      }
    });
    this.ipc.send("message", { type: "loginRecord" });
  },
  mounted() {},
  methods: {
    httpLgoin() {
      this.post("/lt/islogin", {
        uname: this.uname,
      }).then((res) => {
        if (res.code == 201) {
          //存在登录
          this.ipc.send("message", { type: "setNoLgoin" });
        } else {
          //不存在登录自动登录
          this.buttonLgoin();
        }
      });
    },
    requser() {
      console.log(121212121);
      this.ipc.send("message", { type: "003Register" });
      // this.$ele.shell.openExternal("https://w3cjs.cn");
    },
    userlineclick(d) {
      this.uname = d.type > 0 ? d.email : d.uuid;
      this.upwd = d.upwd;
      this.userimg = d.img;
    },
    allclick() {
      this.getAppusershow = false;
    },
    getAppuser() {
      if (this.getAppusershow == true) return (this.getAppusershow = false);
      console.log("开始获取用户");
      this.ipc.send("message", { type: "getAppuser" });
    },
    buttonLgoin() {
      if (this.uname == "") return (this.msg = "请输入您的账号！");
      if (this.upwd == "") return (this.msg = "请输入您的密码！");
      this.msg = "";
      this.post("/lt/login", {
        uname: this.uname,
        upwd: Md5.md5(this.upwd),
      }).then((res) => {
        console.log(res);
        if (res.code === 200 && res.token) {
          let u = JSON.parse(res.user);
          localStorage.getItem("user", u[0]);
          u[0].upwd = this.upwd;
          u[0].checks = JSON.stringify(this.ridob);
          u[0].type = this.uname.indexOf("@");
          this.ipc.send("message", { type: "userLogin", user: u[0] });
        } else {
          this.msg = res.msg;
        }
      });
    },
    out() {
      this.ipc.send("message", { type: "window-close" });
    },
    hide() {
      this.ipc.send("message", {
        type: "window-hide",
        id: "001",
      });
    },
    ridobfunc(i, d) {
      if (i == 2) return;
      console.log(d);
      this.ridob[i].is = !d;
    },
  },
};
</script>
<style lang="less" scoped>
* {
  box-sizing: border-box;
  color: #333333;
}
.login {
  width: 100%;
  height: 100%;
  -webkit-app-region: drag;
  background: url("../assets/img/login.png");
  background-size: 100%;
  user-select: none;
  > .zm {
    height: 100%;
    width: 100%;
    position: relative;
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 1),
      rgba(145, 152, 229, 0.1)
    );
    > .name {
      width: 100%;
      height: 160px;
      line-height: 160px;
      text-align: center;
      font-size: 50px;
      text-transform: uppercase;
      color: line;
      font-weight: 100;
      //   font-family: Arial;
      letter-spacing: 10px;
      background: linear-gradient(45deg, #00a0e9, #10d39d, #00a0e9, #10d39d);
      // -moz-linear-gradient(45deg, #00a0e9, #10d39d, #00a0e9, #10d39d);
      // -ms-linear-gradient(45deg, #00a0e9, #10d39d, #00a0e9, #10d39d);
      color: transparent;
      -webkit-background-clip: text;
      animation: ran 20s linear infinite;
      > span {
        font-weight: 100;
      }
    }
    > .form {
      padding: 0 50px;
      position: relative;
      > .user_img {
        width: 80px;
        height: 80px;
        border-radius: 40px;
        margin: 0 auto 16px;
        cursor: pointer;
        -webkit-app-region: none;
        > img {
          width: 100%;
          height: 100%;
          border-radius: 40px;
        }
      }
      > .line {
        height: 36px;
        margin-bottom: 10px;
        border-bottom: #cfcfcf 1px solid;
        position: relative;
        > .users {
          width: 20px;
          height: 20px;
          position: absolute;
          top: calc(50% - 10px);
          right: 16px;
          cursor: pointer;
          font-size: 18px;
          &:hover {
            color: #048af8;
          }
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
          text-align: center;

          &::-ms-input-placeholder {
            text-align: center;
          }
          &::-webkit-input-placeholder {
            text-align: center;
          }
        }
        > .userlist {
          position: absolute;
          width: 100%;
          background: #fff;
          left: 0;
          top: 36px;
          z-index: 8;
          max-height: 138px;
          overflow: hidden;
          overflow: scroll;
          > .line {
            width: 100%;
            height: 46px;
            line-height: 46px;
            padding: 0 8px;
            cursor: pointer;
            position: relative;
            padding-left: 46px;
            &:hover {
              background: rgba(0, 0, 0, 0.05);
              color: rgba(4, 138, 248, 1);
            }
            > i {
              font-size: 16px;
              position: absolute;
              top: calc(50% - 8px);
              right: 8px;
              color: #999999;
              &:hover {
                color: red;
              }
            }
            > img {
              position: absolute;
              top: calc(50% - 16px);
              left: 8px;
              width: 32px;
              height: 32px;
              border-radius: 26px;
            }
            > p {
              padding: 0;
              margin: 0;
              height: 23px;
              line-height: 23px;
              &.name {
                height: 24px;
                line-height: 24px;
                font-size: 15px;
              }
              &.email {
                height: 20px;
                line-height: 20px;
                font-size: 14px;
              }
            }
          }
        }
      }
      > .ridob {
        display: flex;
        flex-direction: row;
        height: 20px;
        line-height: 20px;
        > label {
          display: flex;
          flex-direction: row;
          width: 33.333%;
          padding-left: 26px;
          position: relative;
          cursor: pointer;
          -webkit-app-region: none;
          > .choice {
            width: 16px;
            height: 16px;
            position: absolute;
            left: 2px;
            top: 2px;
          }
          > .action {
            background: rgba(4, 138, 248, 0.7);
            > img {
              width: 12px;
              height: 12px;
              position: absolute;
              top: calc(50% - 6px);
              left: calc(50% - 6px);
            }
          }
          > .noact {
            border: 1px #bbbaba solid;
            background: #eaeaea;
          }
          &:hover {
            > .choice {
              border: 1px rgba(4, 138, 248, 0.7) solid;
            }
          }
          &:nth-last-child(1) {
            color: rgba(4, 138, 248, 1);
          }
        }
      }
      > .buttonLgoin {
        height: 36px;
        line-height: 36px;
        text-align: center;
        flex-shrink: 20px;
        color: #fff;
        background: #048af8;
        margin-top: 20px;
        cursor: pointer;
        border-radius: 4px;
        -webkit-app-region: none;
        &:hover {
          background: rgba(4, 138, 248, 0.7);
        }
      }
      > .req {
        color: #ffffff;
        cursor: pointer;
        position: absolute;
        font-size: 14px;
        right: 50px;
        bottom: -50px;
        -webkit-app-region: none;
        &:hover {
          color: rgba(4, 138, 248, 1);
        }
      }
      > .msg {
        position: absolute;
        bottom: -30px;
        color: red;
        left: 50px;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
      }
    }
    > .but {
      position: absolute;
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.1);
      -webkit-app-region: none;
      padding: 4px;
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
        right: 26px;
        cursor: pointer;
        &:hover {
          background: rgba(119, 84, 84, 0.15);
        }
      }
    }
  }
}
</style>
