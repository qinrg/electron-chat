<!--
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-10 13:34:48
 * @LastEditTime: 2021-08-10 18:30:49
-->
<template>
  <div class="main">
    <myButton />
    <div class="form" v-if="!text">
      <div class="line">
        <span class="title">您的昵称</span>
        <span class="uname">
          <el-input
            v-model="uname"
            placeholder="请输入您的昵称"
            size="small"
            maxlength="16"
          ></el-input>
        </span>
      </div>
      <div class="line">
        <span class="title">您的邮箱</span>
        <span class="email">
          <el-input
            v-model="email"
            placeholder="请输入您的邮箱"
            size="small"
          ></el-input>
        </span>
      </div>
      <div class="line">
        <span class="title">您的密码</span>
        <span class="uname">
          <el-input
            v-model="upwd"
            placeholder="请输入您的密码"
            size="small"
          ></el-input>
        </span>
      </div>
      <el-alert
        title="请使用正确邮箱号，以便后续的找回密码，更改密码等！"
        type="warning"
        :closable="false"
      ></el-alert>
      <div class="button">
        <el-button
          round
          size="small"
          @click="(uname = ''), (email = ''), (upwd = '')"
          >重置</el-button
        >
        <el-button type="primary" round size="small" @click="onReg"
          >注册账号</el-button
        >
      </div>
    </div>
    <div class="text form" v-if="text">
      <div class="line">
        <span>您的账号：</span>
        <span class="t">{{ text.uuid }}</span>
      </div>
      <div class="line">
        <span>您的昵称：</span>
        <span class="t">{{ text.uname }}</span>
      </div>
      <div class="line">
        <span>您的邮箱：</span>
        <span class="t">{{ text.email }}</span>
      </div>
      <el-alert
        title="注册成功，感谢您的使用！请妥善保管个人账户密码等信息！"
        type="success"
        show-icon
        :closable="false"
      >
      </el-alert>
    </div>
  </div>
</template>
<script>
import myButton from "../button.vue";
import Md5 from "@/assets/md5.js";
export default {
  data() {
    return {
      uname: "",
      email: "",
      upwd: "",
      text: null,
    };
  },
  components: {
    myButton,
  },
  methods: {
    onReg() {
      if (this.uname == "") return this.err("请输入您的昵称");
      if (this.email == "") return this.err("请输入您的邮箱");
      if (this.upwd == "") return this.err("请输入您的密码");
      console.log(this.uname, this.email);
      this.post("/lt/reg", {
        uname: this.uname,
        email: this.email,
        upwd: Md5.md5(this.upwd),
      }).then((res) => {
        console.log(res);
        if (res.code == 200) {
          this.ok(res.msg);
          this.text = {
            uuid: res.uuid,
            upwd: this.upwd,
            uname: this.uname,
            email: this.email,
          };
        }
      });
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
  > .form {
    padding: 50px;
    > .line {
      height: 40px;
      line-height: 40px;
      display: flex;
      flex-direction: row;
      margin-bottom: 10px;
      > .title {
        width: 80px;
      }
      > .uname,
      > .email {
        width: 100%;
      }
      > .t {
        font-size: 15px;
        color: deepskyblue;
        margin-left: 10px;
      }
    }
    > .button {
      margin-top: 16px;
      width: 100%;
      text-align: center;
    }
  }
}
</style>
