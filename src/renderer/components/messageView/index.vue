<!--
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-10 13:34:48
 * @LastEditTime: 2021-08-13 18:33:58
-->
<template>
  <div class="main">
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
          <span class="name" :class="item.t"
            >{{ item.name }}&nbsp;&nbsp;{{ item.time }}</span
          >
          <div class="text"><div class="msg" v-html="item.text"></div></div>
          <div class="usd" v-if="item.t == 'push'">
            <img class="img" :src="item.img" alt="" />
          </div>
        </div>
      </div>
      <div class="ckt">
        <div
          class="contents text myicon"
          contenteditable
          ref="contents"
          tabindex="1"
          @keydown.enter="textareaKeydown"
        ></div>
        <el-button class="button" @click="appContent">发送</el-button>
      </div>
    </div>
    <br />
  </div>
</template>
<script>
import myButton from "../button.vue";
export default {
  data() {
    return {
      uuid: "",
      user: [],
      messageList: [],
      hover: false,
    };
  },
  components: {
    myButton,
  },
  created() {
    window.addEventListener("keyup", this.funckeydown);
    window.addEventListener("message", (r) => {
      if (!r.detail) return;
      let d = r.detail;
      if (d.type == "ltone") {
        d.text = this.getBase(d.text);
        let user = JSON.parse(d.user);
        this.messageList.push({
          ...d,
          ...user,
          time: this.$moment(d.time).format("YYYY-MM-DD HH:mm:ss"),
        });
        if (this.hover) return;
        setTimeout(() => {
          this.messageListscroll();
        }, 1);
      }
    });
    let list = localStorage.getItem("msglist");
    if (list) {
      list = JSON.parse(list);
      let user = list.find((e) => this.urlParam("id").indexOf(e.uuid) >= 0);
      this.user = user;
    }
  },
  methods: {
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
      if (event.ctrlKey && event.keyCode === 13) {
        //ctrl+enter
        this.textareaRange();
      } else if (event.keyCode === 13) {
        this.appContent();
        event.preventDefault(); // 阻止浏览器默认换行操作
        return false;
      }
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
      let to = false;
      for (let i = 0; i < _d.length; i++) {
        if (_d[i].innerHTML == "<br>") {
          if (!to) {
            this.$refs.contents.removeChild(_d[i]);
          }
        } else {
          to = true;
        }
      }
      let html = JSON.stringify(this.$refs.contents.innerHTML);
      console.log(html);
      html = html.replace("<div><br></div>", "");
      html = html.length >= 2 ? html.substr(1, html.length - 2) : "";
      if (html == "" || html.length == 0 || html.length == " ") return;
      let obj = {
        meid: this.user.meid,
        uuid: this.user.uuid,
        time: this.$moment().format("YYYY-MM-DD hh:mm:ss"),
        t: "push",
        text: this.setBase(html),
        type: "ltone",
      };
      this.messageList.push({
        text: html,
        time: this.$moment().format("YYYY-MM-DD hh:mm:ss"),
        uuid: this.user.meid,
        img: this.user.img,
        name: this.user.name,
        t: "push",
      });
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
  padding: 0;
  margin: 0;
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
          width: 5;
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
            background: rgba(0, 0, 0, 0.15);
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
          font-size: 14px;
          position: absolute;
          top: -16px;
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
                border-left: 10px solid rgba(0, 0, 0, 0.15);
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
                border-right: 10px solid rgba(0, 0, 0, 0.15);
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
      > .text {
        width: 100%;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 35px;
        border: none;
        outline: none;
        overflow: hidden;
        overflow-y: scroll;
        border-top: #eaeaea 1px solid;
        padding: 8px 8px 0px;
        line-height: 20px;
        z-index: 1;
      }
      > .button {
        position: absolute;
        width: 80px;
        height: 30px;
        right: 6px;
        bottom: 4px;
        z-index: 2;
      }
    }
  }
}
</style>
