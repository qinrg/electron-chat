<template>
  <div class="newtitle">
    <span class="lookvalue" v-if="lshow">
      鼠标：<el-button size="mini" @click="lookvaluefun" type="text">{{
        lookvalue ? "锁" : "开"
      }}</el-button></span
    >
    <span class="tz"></span>
    <span class="button">
      <span @click="min" class="el-icon-minus" title="最小化"></span>
      <!-- <span title="最大化" @click="max" class="el-icon-copy-document">
       
        <span v-show="false">
           <span  id="qqLoginBtn"></span>
        </span>
       
      </span> -->
      <span @click="close(status)" class="el-icon-close" title="关闭"></span>
    </span>
  </div>
</template>
<script>
export default {
  data() {
    return {
      lshow: location.href.indexOf("video") >= 0 ? true : false,
      lookvalue: false,
    };
  },
  computed: {
    status() {
      return this.$store.state.login.status;
    },
  },
  methods: {
    lookvaluefun() {
      this.lookvalue = !this.lookvalue;
      this.$emit("lookval", this.lookvalue);
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
.newtitle {
  width: 100%;
  height: 30px;
  color: #ffffff;
  /* border-bottom: 1px dotted #ccc; */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  display: flex;
  flex-direction: row;
  background: rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: hidden;
  > .lookvalue {
    display: inline-block;
    width: 60px;
    display: flex;
    line-height: 30px;
    padding-left: 8px;
  }
  > .tz {
    width: calc(100% - 150px);
    -webkit-app-region: drag;

    /*挪动窗体*/
  }
  > .button {
    display: flex;
    flex-direction: row;
    position: absolute;
    top: 0;
    right: 0;
    > span {
      display: block;
      width: 30px;
      line-height: 30px;
      cursor: pointer;
      > span {
        width: 30px;
        line-height: 30px;
        height: 30px;
        display: block;
        > button {
          width: 30px;
          line-height: 30px;
          height: 30px;
          display: block;
          position: relative;
          .tu {
            position: absolute;
            width: 30px;
            line-height: 30px;
            height: 30px;
            top: 0;
            left: -1px;
            // padding: 0;
            // margin: 0;
            color: #ffffff;
            font-size: 16px !important;
          }
        }
      }
    }
    > span:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    > span:hover:nth-last-child(1) {
      background: rgba(248, 40, 40, 0.5);
    }
    > span:before {
      width: 100%;
      height: 100%;
      font-size: 18px;
      font-weight: 400;
      margin-left: 6px;
    }
  }
}
</style>