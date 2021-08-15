<!--
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-10 13:34:48
 * @LastEditTime: 2021-08-10 18:30:49
-->
<template>
  <div class="main">
    <myButton />
    <div class="search" @keyup.enter="searchfun">
      <el-input
        size="small"
        placeholder="搜索好友/群"
        suffix-icon="el-icon-user-solid"
        v-model="uuid"
      >
      </el-input>
    </div>
    <div class="centent">
      <el-divider content-position="left">信息列表</el-divider>
      <div class="list">
        <img
          class="nomsg"
          src="../../assets/nomsg.png"
          alt=""
          v-if="user.length == 0"
        />
        <div class="line" v-for="(item, i) in user" :key="i">
          <img class="img" :src="item.img" alt="" />
          <div class="name">{{ item.name }}</div>
          <div class="uuid">{{ item.uuid }}</div>
          <div
            class="icon el-icon-circle-plus-outline"
            @click="applyFriend(item)"
          ></div>
        </div>
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
      user: [],
    };
  },
  components: {
    myButton,
  },
  methods: {
    applyFriend(d) {
      localStorage.setItem("applyFriend", JSON.stringify(d));
      this.ipc.send("message", {
        type: "applyFriend",
        data: d,
      });
    },
    searchfun() {
      if (this.uuid == "") return this.err("请输入账号");
      this.post("/lt/searchUser", {
        search: this.uuid,
      }).then((res) => {
        if (res.code == 200 && res.user.length >= 2) {
          this.user = JSON.parse(res.user);
        }
        console.log(res);
      });
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
    top: 112px;
    bottom: 0;
    width: 100%;
    > .list {
      position: absolute;
      top: 10px;
      left: 0;
      width: 100%;
      bottom: 0;
      padding: 0 30px;
      overflow: hidden;
      overflow-y: scroll;
      > .nomsg {
        width: 128px;
        height: 128px;
        position: absolute;
        top: calc(50% - 64px);
        left: calc(50% - 64px);
      }
      > .line {
        width: 210px;
        height: 48px;
        position: relative;
        display: inline-table;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 2.5px 5px;
        padding: 0 6px;
        &:hover {
          background: rgba(0, 0, 0, 0.12);
        }
        > .img {
          width: 40px;
          height: 40px;
          border-radius: 40px;
          overflow: hidden;
          margin-top: 4px;
        }
        > .name,
        > .uuid {
          width: 100%;
          position: absolute;
          left: 56px;
          height: 20px;
          line-height: 20px;
        }
        > .name {
          font-size: 15px;
          top: 10px;
        }
        > .uuid {
          font-size: 12px;
          bottom: 4px;
        }
        > .icon {
          position: absolute;
          bottom: 4px;
          right: 8px;
          font-size: 16px;
          color: orange;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
