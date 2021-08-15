<!--
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-10 13:34:48
 * @LastEditTime: 2021-08-11 13:30:07
-->
<template>
  <div class="main">
    <myButton />
    <div class="centent" v-if="type == 0">
      <img class="img" :src="img" alt="" />
      <div class="name">{{ name }}</div>
      <div class="uuid">{{ uuid }}</div>
      <div class="centen">
        <p>请输入验证信息：</p>
        <br />
        <el-input
          type="textarea"
          :rows="4"
          resize="none"
          placeholder="请输入内容"
          v-model="textarea"
        >
        </el-input>
      </div>
      <div class="btn">
        <el-button size="small" round @click="applyfun(0)">确定</el-button>
        <el-button size="small" round @click="out">关闭</el-button>
      </div>
    </div>
    <div class="centent" v-if="type == 1">
      <img class="img" :src="om.img" alt="" />
      <div class="name">{{ om.name }}</div>
      <div class="uuid">{{ om.uuid }}</div>
      <div class="centen">
        <p class="title">留言信息：</p>
        <div>
          <el-input
            type="textarea"
            :rows="2"
            disabled
            resize="none"
            placeholder="请输入内容"
            v-model="om.remark"
          >
          </el-input>
        </div>
        <p class="title">请输入验证信息：</p>
        <el-input
          type="textarea"
          :rows="4"
          resize="none"
          placeholder="请输入内容"
          v-model="textarea"
        >
        </el-input>
      </div>
      <div class="btn">
        <el-button size="small" round @click="applyfun('Y')">确定</el-button>
        <el-button size="small" round @click="applyfun('N')">拒绝</el-button>
        <el-button size="small" round @click="out">关闭</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import myButton from "../button.vue";
export default {
  data() {
    return {
      uuid: "",
      name: "",
      img: "",
      textarea: "",
      type: 0,
      ou: "",
      om: "",
    };
  },
  created() {
    let type = this.urlParam("type");
    this.type = type;
    if (type == 0 || !type) {
      let u = localStorage.getItem("applyFriend");
      if (u) {
        let us = JSON.parse(u);
        this.uuid = us.uuid;
        this.name = us.name;
        this.img = us.img;
      }
    } else {
      let u = localStorage.getItem("userAddMsg");
      let ou = localStorage.getItem("applyFriend");
      if (u) {
        this.om = JSON.parse(u);
      }
      if (ou) {
        this.ou = JSON.parse(ou);
      }
    }
  },
  components: {
    myButton,
  },
  methods: {
    out() {
      this.ipc.send("message", { type: "out", id: this.urlParam("id") });
    },
    applyFriend(d) {
      this.ipc.send("message", {
        type: "applyFriend",
        data: d,
      });
      this.ipc.send("");
    },
    applyfun(y) {
      if (this.type == 0 || !this.type) {
        let lu = localStorage.getItem("userObj");
        if (lu) {
          this.post("/lt/applyUser", {
            uuid: JSON.parse(lu).uuid,
            useruuid: this.uuid,
            remark: this.textarea,
          }).then((res) => {
            if (res.code == 200) {
              this.ok(res.msg);
            }
          });
        }
      } else {
        let lu = localStorage.getItem("userObj");
        let obj = {
          uuid: JSON.parse(lu).uuid,
          useruuid: this.om.uuid,
          remark: this.textarea,
          type: y,
        };
        this.post("/lt/applyUser", obj).then((res) => {
          if (res.code == 200) {
            this.ok(res.msg);
          }
        });
      }
    },
  },
};
</script>
<style lang="less" scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
.main {
  width: 100%;
  height: 100%;
  position: relative;
  > .search {
    height: 62px;
    padding: 20px 30px 10px;
    margin-bottom: 46px;
  }
  > .centent {
    position: absolute;
    padding: 0 30px 30px;
    left: 0;
    top: 50px;
    bottom: 0;
    width: 100%;

    > .img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      margin-top: 4px;
    }
    > .name,
    > .uuid {
      width: 100%;
      position: absolute;
      left: 30px;
      height: 20px;
      line-height: 20px;
    }
    > .name {
      top: 130px;
      font-size: 17px;
    }
    > .uuid {
      font-size: 14px;
      top: 150px;
    }
    > .icon {
      position: absolute;
      bottom: 4px;
      right: 8px;
      font-size: 16px;
      color: orange;
      cursor: pointer;
    }
    > .centen {
      position: absolute;
      right: 0;
      left: 180px;
      top: 0px;
      bottom: 0;
      padding-right: 30px;
      > .title {
        height: 30px;
        line-height: 30px;
      }
    }
    > .btn {
      position: absolute;
      right: 30px;
      bottom: 30px;
    }
  }
}
</style>
