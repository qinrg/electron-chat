<!--
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-27 17:00:24
 * @LastEditTime: 2021-08-27 17:35:09
-->
<template>
  <div class="main" ref="snipping">
    <img ref="imgdata0" class="region0" />
    <div class="zz" @mousedown="onSelectRegion"></div>
    <img ref="imgdata" class="region" ondragstart="return false;" />
    <div class="mainv" ref="mainv" @mousedown.stop="regionfun">
      <div
        class="btn btn-index"
        v-for="(item, i) in btns"
        :key="i"
        :class="item"
        @mousedown.stop="btnDown(item)"
      ></div>
    </div>
    <div class="copyBtn" ref="copyBtn" v-show="toolkit">
      <span class="el-icon-top-right" title="箭头工具"></span>
      <span class title="矩形工具">口</span>
      <span class title="椭圆工具">〇</span>
      <span class="el-icon-edit-outline" title="画图工具"></span>
      <span
        class="el-icon-folder-opened"
        title="另存为"
        @click="copyimg"
      ></span>
      <span class="el-icon-close" @click="outcopy" title="退出截图"></span>
      <span class="el-icon-check" title="完成截图" @click="okcopy">完成</span>
    </div>
  </div>
</template>
<script>
document.querySelector("html").style = "opacity: 0;";
export default {
  data() {
    return {
      mainv: {},
      ifBool: false, //判断鼠标是否按下
      contact: "", //当前拖动的触点
      ifCPimg: false, //选区截图
      ifMainv: false, //移动选区
      toolkit: false, //工具包显示
      btns: [
        "left1",
        "left2",
        "left3",
        "main1",
        "main2",
        "right1",
        "right2",
        "right3",
      ],
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      win32: process.platform === "win32",
      isCapture: false,
      completeSelectRegion: false,
    };
  },
  created() {
    window.addEventListener("message", (r) => {
      if (!r.detail) return;
      let d = r.detail;
      console.log(d);
      if (d.type == "base64") {
        this.$refs.imgdata.src = d.data;
        this.$refs.imgdata0.src = d.data;
        this.$refs.imgdata0.onload = () => {
          this.imgLoad();
        };
      }
    });
    this.ipc.send("message", { type: "startBase64" });
    window.addEventListener("contextmenu", this.outcopy);
    document.onmouseup = () => {
      document.onmousemove = null;
      this.ifCPimg = false;
      this.ifMainv = false;
      this.ifBool = true;
      this.contact = "";
      this.toolkit = true; //显示工具包
    };
  },
  methods: {
    imgLoad() {
      document.querySelector("html").style = "opacity: 1;";
      this.ipc.send("message", { type: "setsnippingConfig" });
    },
    pngBase64() {
      let mainv = this.$refs.mainv;
      let canvas = document.createElement("canvas");
      canvas.width = mainv.offsetWidth;
      canvas.height = mainv.offsetHeight;
      canvas.background = "transparent";
      let ctx = canvas.getContext("2d");
      ctx.drawImage(
        this.$refs.imgdata0,
        0 - mainv.offsetLeft,
        0 - mainv.offsetTop
      );
      return canvas.toDataURL("image/png");
    },
    okcopy() {
      let clip = this.$ele.clipboard;
      let nativeImage = this.$ele.nativeImage;
      let img = nativeImage.createFromDataURL(this.pngBase64());
      clip.writeImage(img);
      console.log(clip, nativeImage);
      this.outcopy();
    },
    copyimg() {
      let imgURL = this.pngBase64();
      console.log(imgURL);
      const { dialog } = require("electron").remote;
      let user = JSON.parse(localStorage.getItem("userObj"));
      dialog
        .showSaveDialog({
          title: "截图",
          defaultPath:
            user.name + "_" + user.uuid + "_" + new Date().getTime() + "_截图_",
          filters: [{ name: "Images", extensions: ["png"] }],
        })
        .then((result) => {
          // ////console.log(result.canceled);
          // ////console.log(result.filePaths);
          console.log("关闭后的", result.filePath);
          let base64Data = imgURL.replace(
            /^data:image\/(png|gif|jpeg);base64,/,
            ""
          );
          require("fs").writeFileSync(
            result.filePath,
            new Buffer(base64Data, "base64")
          );
          this.outcopy();
          // this.time = "";
          // if (result.filePaths.length >= 1) {
          //   this.$ipc.send("xlsxFun", result.filePaths[0]);
          // }
        });
    },
    outcopy() {
      console.log("关闭窗口");
      this.ipc.send("message", {
        type: "out",
        id: "snipping",
        showid: this.urlParam("showid"),
      });
    },
    btnDown(v) {
      console.log(v);
      this.ifBool = true;
      this.contact = v;
      document.onmousemove = (e) => {
        this.indexFunMove(e);
      };
    },
    indexFunMove(e) {
      // e.stopPropagation();
      //移动点
      if (this.ifBool) {
        switch (this.contact) {
          case "left1": //左上
            this.leftMove(e);
            break;
          case "left2": //左中
            this.leftMainMove(e);
            break;
          case "left3": //左下
            this.leftdoMove(e);
            break;
          case "main1": //中上
            this.upMove(e);
            break;
          case "main2": //中下
            this.downMove(e);
            break;
          case "right1": //右上
            this.rightupMove(e);
            break;
          case "right2": //右中
            this.rightMainMove(e);
            break;
          case "right3": //右下
            this.rightdoMove(e);
            break;
          default:
        }
      }
    },
    leftMove(e) {
      //左上角
      let x = e.x; //鼠标横坐标
      let y = e.y; //鼠标横坐标
      let left = this.$refs.mainv.offsetLeft;
      let top = this.$refs.mainv.offsetTop;
      let width = this.$refs.mainv.offsetWidth;
      let height = this.$refs.mainv.offsetHeight;
      //越界出来
      if (x == left + width - 20 || y == top + height - 20) {
        this.ifBool = false;
        this.contact = "";
      }
      this.$refs.mainv.style = `left:${x}px;top:${y}px;width:${
        width + left - x
      }px;height:${height + top - y}px`;
      this.setChoice();
    },
    leftMainMove(e) {
      //左中

      let x = e.x; //鼠标横坐标
      let left = this.$refs.mainv.offsetLeft;
      let width = this.$refs.mainv.offsetWidth;
      //越界出来
      if (x == left + width - 20) {
        this.ifBool = false;
        this.contact = "";
      }
      this.$refs.mainv.style.left = x + "px";
      this.$refs.mainv.style.width = width + left - x + "px";
      this.setChoice();
    },
    leftdoMove(e) {
      //左上角
      let x = e.x; //鼠标横坐标
      let y = e.y; //鼠标横坐标
      let left = this.$refs.mainv.offsetLeft;
      let top = this.$refs.mainv.offsetTop;
      let width = this.$refs.mainv.offsetWidth;
      let height = this.$refs.mainv.offsetHeight;
      //越界出来
      if (x == left + width - 20 || y == top + height - 20) {
        this.ifBool = false;
        this.contact = "";
      }
      this.$refs.mainv.style = `left:${x}px;top:${top}px;width:${
        width + left - x
      }px;height:${height + (y - top - height)}px`;
      this.setChoice();
    },
    //上边拖动
    upMove(e) {
      //左中
      let y = e.y; //鼠标横坐标
      let top = this.$refs.mainv.offsetTop;
      let height = this.$refs.mainv.offsetHeight;
      //越界出来
      if (y == top + height - 20) {
        this.ifBool = false;
        this.contact = "";
      }
      this.$refs.mainv.style.top = y + "px";
      this.$refs.mainv.style.height = height + top - y + "px";
      this.setChoice();
    },
    //下边拖动
    downMove(e) {
      //左中
      let y = e.y; //鼠标横坐标
      let top = this.$refs.mainv.offsetTop;
      let height = this.$refs.mainv.offsetHeight;
      //越界出来
      if (y == top - 20) {
        this.ifBool = false;
        this.contact = "";
      }
      // this.$refs.mainv.style.top = y + "px";
      this.$refs.mainv.style.height = height + (y - top - height) + "px";
      this.setChoice();
    },
    rightupMove(e) {
      //右上角
      let x = e.x; //鼠标横坐标
      let y = e.y; //鼠标横坐标
      let left = this.$refs.mainv.offsetLeft;
      let top = this.$refs.mainv.offsetTop;
      let width = this.$refs.mainv.offsetWidth;
      let height = this.$refs.mainv.offsetHeight;
      //越界出来
      if (x == left - 20 || y == top + height - 20) {
        this.ifBool = false;
        this.contact = "";
      }
      this.$refs.mainv.style = `left:${left}px;top:${y}px;width:${
        x - left
      }px;height:${height + top - y}px`;
      this.setChoice();
    },
    rightMainMove(e) {
      //右中
      let x = e.x; //鼠标横坐标
      let left = this.$refs.mainv.offsetLeft;
      let top = this.$refs.mainv.offsetTop;
      let width = this.$refs.mainv.offsetWidth;
      let height = this.$refs.mainv.offsetHeight;
      //越界出来
      if (x == left - 20) {
        this.ifBool = false;
        this.contact = "";
      }
      this.$refs.mainv.style.width = x - left + "px";
      this.setChoice();
    },
    rightdoMove(e) {
      //右下
      let x = e.x; //鼠标横坐标
      let y = e.y; //鼠标横坐标
      let left = this.$refs.mainv.offsetLeft;
      let top = this.$refs.mainv.offsetTop;
      let width = this.$refs.mainv.offsetWidth;
      let height = this.$refs.mainv.offsetHeight;
      //越界出来
      if (x == left + width - 20 || y == top + height - 20) {
        this.ifBool = false;
        this.contact = "";
      }
      this.$refs.mainv.style = `left:${left}px;top:${top}px;width:${
        x - left
      }px;height:${y - top}px`;
      this.setChoice();
    },
    setChoice() {
      let mainv = this.$refs.mainv;
      let top = mainv.offsetTop;
      let right = mainv.offsetLeft + mainv.offsetWidth;
      let bottom = mainv.offsetTop + mainv.offsetHeight;
      let left = mainv.offsetLeft;
      this.$refs.imgdata.style = `clip: rect(${top}px,${right}px,${bottom}px,${left}px)`;
      this.setButton();
    },
    regionfun(e) {
      if (!this.ifMainv) {
        //获取x坐标和y坐标
        this.mainv.x = e.clientX;
        this.mainv.y = e.clientY;
        //获取左部和顶部的偏移量
        this.mainv.w = this.$refs.mainv.offsetWidth;
        this.mainv.h = this.$refs.mainv.offsetHeight;
        this.mainv.l = this.$refs.mainv.offsetLeft;
        this.mainv.t = this.$refs.mainv.offsetTop;
        //设置样式,获取mainv的w，h,桌面的 w，h
        this.$refs.mainv.style.cursor = "move";
        this.ifMainv = true;
        document.onmousemove = (e) => {
          let w = this.mainv.w;
          let winw = window.screen.width;
          let winh = window.screen.height;
          let h = this.mainv.h;
          //获取x和y
          let nx = e.clientX;
          let ny = e.clientY;
          //计算移动后的左偏移量和顶部的偏移量
          let nl = nx - (this.mainv.x - this.mainv.l);
          let nt = ny - (this.mainv.y - this.mainv.t);
          //防越界
          nl <= 0 ? (nl = 0) : null;
          nt <= 0 ? (nt = 0) : null;
          nl + w >= winw ? (nl = winw - w) : null;
          nt + h >= winh ? (nt = winh - h) : null;
          this.$refs.mainv.style.top = nt + "px";
          this.$refs.mainv.style.left = nl + "px";
          this.setChoice();
        };
      }
    },
    onSelectRegion(e) {
      //鼠标按下开始截图
      this.ifCPimg = true;
      if (this.completeSelectRegion) {
        return false;
      } //选区成功后，不可再点击，除非点击"取消"重新选
      this.x = e.x;
      this.y = e.y;
      document.onmousemove = (e) => {
        const width = e.x; //可能反向选区,就为负数
        const height = e.y;
        // 判断是否是在截图，而不是纯粹点击鼠标等普通操作
        this.isCapture = width > 15; //width<0是反向选区，但反向选区遇到bug，尚未解决
        if (this.isCapture) {
          //是在截图进行选区,更新宽高
          this.width = width;
          this.height = height;
          this.top = this.y;
          this.right = this.width;
          this.bottom = this.height;
          this.left = this.x;
          this.$refs.mainv.style = `top:${this.top}px;width:${
            this.right - this.left
          }px;height:${this.bottom - this.top}px;left:${this.left}px`;
          this.setChoice();
        }
      };
    },
    setButton() {
      let mainv = this.$refs.mainv;
      let ks = this.$refs.mainv;
      if (mainv.offsetTop < 36) {
        this.$refs.copyBtn.style.top =
          mainv.offsetTop + mainv.offsetHeight + 10 + "px";
        //
      } else if (mainv.offsetTop + mainv.offsetHeight + 36 >= ks.offsetHeight) {
        this.$refs.copyBtn.style.top = mainv.offsetTop - 36 + "px";
        // this.$refs.copyBtn.style.left = mainv.offsetLeft+mainv.offsetWidth-240+"px";
      } else {
        this.$refs.copyBtn.style.top =
          mainv.offsetTop + mainv.offsetHeight + 10 + "px";
      }
      if (mainv.offsetLeft + mainv.offsetWidth < 240) {
        //   // this.$refs.copyBtn.style.top = mainv.offsetTop-36+ "px";
        this.$refs.copyBtn.style.left = "0px";
      } else {
        this.$refs.copyBtn.style.left =
          mainv.offsetLeft + mainv.offsetWidth - 240 + "px";
      }
      this.toolkit = true;
    },
  },
};
</script>
<style scoped lang="less">
html {
  opacity: 0;
}
* {
  box-sizing: border-box;
  user-select: none;
}
.video {
  position: fixed;
  top: 10000px;
  left: 10000px;
  width: 1px;
  height: 1px;
}
#desktop-canvas {
  position: absolute;
  top: 1000000px;
  left: 0px;
  z-index: -999;
  width: 100%;
  height: 100%;
  pointer-events: none;
  visibility: hidden;
}
.main,
.region,
.region0 {
  // background: rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 100%;
  z-index: 99;
}
.region,
.region0 {
  position: fixed;
  left: 0;
  top: 0;
}
.region {
  z-index: 101;
  cursor: crosshair;
  clip: rect(0px, 0px, 0px, 0px);
}
.region0 {
  z-index: 100;
}
.zz {
  z-index: 101;
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.2);
}

.mainv {
  position: absolute;
  width: 0px;
  height: 0px;
  border: 0.5px solid rgba(37, 81, 220, 1);
  z-index: 2;
  cursor: move;
  z-index: 105;
}
.btn {
  width: 8px;
  height: 8px;
  background: rgba(37, 81, 220, 1);
  font-size: 0;
  position: absolute;
  &:hover {
    &::before {
      content: " ";
      width: 40px;
      height: 40px;
      position: absolute;
      top: -16px;
      left: -16px;
      background: transparent;
    }
  }
}
.btn.left1 {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}
.btn.left2 {
  top: 50%;
  margin-top: -4px;
  left: -4px;
  cursor: e-resize;
}
.btn.left3 {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}
.btn.main1 {
  top: -4px;
  left: 50%;
  margin-left: -4px;
  cursor: n-resize;
}
.btn.right1 {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}
.btn.right2 {
  top: 50%;
  margin-top: -4px;
  right: -4px;
  cursor: e-resize;
}
.btn.right3 {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}
.btn.main2 {
  bottom: -4px;
  left: 50%;
  margin-left: -4px;
  cursor: s-resize;
}
.copyBtn {
  position: fixed;
  z-index: 102;
  background: #fff;
  border-radius: 2px;
  text-align: center;
  width: 240px;
  height: 26px;
  overflow: hidden;
  > span {
    padding: 5px;
    background: rgba(255, 255, 255, 0.2);
    color: #000000;
    cursor: pointer;
  }
}
</style>