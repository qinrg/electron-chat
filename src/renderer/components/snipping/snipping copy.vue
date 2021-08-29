<!--
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-27 17:00:24
 * @LastEditTime: 2021-08-27 17:35:09
-->
<template>
  <div class="main" ref="snipping">
    <canvas id="desktop-canvas" ref="desktop"></canvas>
    <video class="video" ref="video"></video>
    <img
      ref="imgdata0"
      class="region0"
      ondragstart="return false;"
      @mousedown="onSelectRegion"
    />
    <img
      ref="imgdata"
      class="region"
      ondragstart="return false;"
      @contextmenu="operate"
    />
    <div
      class="mainv ui-draggable"
      id="mainv"
      ref="mainv"
      @mousedown="regionfun"
    >
      <div
        id="left-up"
        ref="leftUpDiv"
        class="minDiv left-up"
        @mousedown="MoveDown('leftUp')"
      ></div>
      <div id="left" class="minDiv left" @mousedown="MoveDown('left')"></div>
      <div
        id="left-down"
        class="minDiv left-down"
        @mousedown="MoveDown('leftDown')"
      ></div>
      <div id="up" class="minDiv top" @mousedown="MoveDown('up')"></div>
      <div
        id="right-up"
        class="minDiv right-up"
        @mousedown="MoveDown('rightUp')"
      ></div>
      <div id="right" class="minDiv right" @mousedown="MoveDown('right')"></div>
      <div
        id="right-down"
        class="minDiv right-down"
        @mousedown="MoveDown('rightDown')"
      ></div>
      <div id="down" class="minDiv bottom" @mousedown="MoveDown('down')"></div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      mainv: {},
      ifBool: false, //判断鼠标是否按下
      contact: "", //当前拖动的触点
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
      canDrag: true,

      captureRegionStyle: {
        position: "absolute",
        zIndex: 99,
        // cursor:'move',
        background: "rgba(0,0,0,0)",
        draggable: false,
        borderWidth: "2px",
        borderColor: this.$root.$data.captureColor,
        borderStyle: "solid",
        boxShadow: "0px 0px 2px 2px rgba(85, 80, 80, 0.3)",
        left: "0px", // =this.x
        top: "0px", // = this.y
        width: "0px", //this.width
        height: "0px", //this.height
      },

      showColorTip: this.$root.$data.showColorTip,
    };
  },
  computed: {
    toolbarBottom() {
      //传给子组件，给colorpicker定位
      return this.$root.$data.screenHeight - (this.y + this.height + 60 + 40);
    },
    canvasX() {
      return this.x + parseInt(this.captureRegionStyle.borderWidth);
    },
    canvasY() {
      return this.y + parseInt(this.captureRegionStyle.borderWidth);
    },
    canvasWidth() {
      let width =
        this.width - 2 * parseInt(this.captureRegionStyle.borderWidth);
      return width > 0 ? width : 0;
    },
    canvasHeight() {
      let height =
        this.height - 2 * parseInt(this.captureRegionStyle.borderWidth);
      return height > 0 ? height : 0;
    },
  },
  created() {
    this.getWin();
    window.addEventListener("contextmenu", this.operate);
    window.addEventListener("mouseup", this.onmouseup);
    document.onmousemove = (e) => {
      this.onmousemove(e);
    };
  },
  methods: {
    MoveDown(v) {
      console.log(v);
      this.ifBool = true;
      this.contact = v;
    },
    onmouseup(e) {
      this.ifBool = false;
      this.contact = "";
      console.log("清空");
    },
    onmousemove(e) {
      if (this.ifBool) {
        console.log(e.x, e.y);
        this.indexFunMove(e);
      }
    },
    indexFunMove(e) {
      // e.stopPropagation();
      switch (this.contact) {
        case "leftUp": //左上
          this.leftMove(e);
          break;
        case "left": //左中
          this.leftMainMove(e);
          break;
        case "leftDown": //左下
          this.leftdoMove(e);
          break;
        case "up": //中上
          this.upMove(e);
          break;
        case "down": //中下
          this.downMove(e);
          break;
        case "rightUp": //右上
          this.rightupMove(e);
          break;
        case "right": //右中
          this.rightMainMove(e);
          break;
        case "rightDown": //右下
          this.rightdoMove(e);
          break;
        default:
      }
    },
    getPosition(node) {
      let left = node.offsetLeft;
      let top = node.offsetTop;
      let current = node.offsetParent; // 取得元素的offsetParent // 一直循环直到根元素
      while (current != null) {
        left += current.offsetLeft;
        top += current.offsetTop;
        current = current.offsetParent;
      }
      return { left: left, top: top };
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
      if (x == left + width - 6 || y == top + height - 6) {
        this.ifBool = false;
        this.contact = "";
      }
      this.$refs.mainv.style = `left:${x}px;top:${y}px;width:${
        width + left - x
      }px;height:${height + (y - top)}px`;
      this.setChoice();
    },
    leftMainMove(e) {
      //左中
      let x = e.x; //鼠标横坐标
      let left = this.$refs.mainv.offsetLeft;
      let width = this.$refs.mainv.offsetWidth;
      //越界出来
      if (x == left + width - 6) {
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
      if (x == left + width - 6 || y == top + height - 6) {
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
      if (y == top + height - 6) {
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
      if (y == top - 6) {
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
      if (x == left - 6 || y == top + height - 6) {
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
      if (x == left - 6) {
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
      if (x == left + width - 6 || y == top + height - 6) {
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
    },
    regionfun(e) {
      if (this.completeSelectRegion) {
        //获取x坐标和y坐标
        this.mainv.x = e.clientX;
        this.mainv.y = e.clientY;
        //获取左部和顶部的偏移量
        this.mainv.w = this.$refs.mainv.offsetWidth;
        this.mainv.h = this.$refs.mainv.offsetHeight;
        this.mainv.l = this.$refs.mainv.offsetLeft;
        this.mainv.t = this.$refs.mainv.offsetTop;
        //设置样式,获取mainv的w，h,桌面的 w，h
        let w = this.mainv.w;
        let winw = window.screen.width;
        let winh = window.screen.height;
        let h = this.mainv.h;
        this.$refs.mainv.style.cursor = "move";
        document.onmousemove = (e) => {
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
    operate() {
      console.log("关闭窗口");
      this.ipc.send("message", { type: "out", id: "snipping" });
    },
    // onDrag(e) {
    //   if (this.completeSelectRegion && this.canDrag) {
    //     // 鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器
    //     // 最左边的距离-物体左边框相对于浏览器最左边的距离，纵向同理
    //     const leftWidth = e.clientX - this.x;
    //     const topHeight = e.clientY - this.y;

    //     document.onmousemove = (e) => {
    //       this.completeSelectRegion = false; //移动时意味着重新选区，未完成选区隐藏工具条

    //       // 控制拖拽物体的范围只能在浏览器视窗内，不允许出现滚动条或拖出可视区域
    //       let posX = e.clientX - leftWidth;
    //       let posY = e.clientY - topHeight;

    //       if (posX < 0) {
    //         posX = 0;
    //       } else if (posX > document.body.clientWidth - this.width) {
    //         posX = document.body.clientWidth - this.width;
    //       }

    //       if (posY < 0) {
    //         posY = 0;
    //       } else if (posY > document.body.clientHeight - this.height) {
    //         posY = document.body.clientHeight - this.height;
    //       }

    //       //拖动
    //       this.x = posX;
    //       this.y = posY;
    //       this.captureRegionStyle.left = this.x + "px";
    //       this.captureRegionStyle.top = this.y + "px";
    //     };

    //     document.onmouseup = () => {
    //       // 鼠标抬起时不再移动
    //       // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
    //       document.onmousemove = null;
    //       this.completeSelectRegion = true; //重新选取完成，显示工具条

    //       //-------设置宽高、清空画布都会使canvas状态清空，所以在这里处理高dpi模糊问题
    //       setCanvas(this.$refs.display, this.canvasWidth, this.canvasHeight);
    //       setCanvas(this.$refs.assist, this.canvasWidth, this.canvasHeight);
    //       //------
    //       this.clipDesktop();
    //     };
    //   }
    // },
    // setCanvas(canvas, width, height) {
    //   let ctx = canvas.getContext("2d");
    //   let backingStorePixelRatio =
    //     ctx.backingStorePixelRatio ||
    //     ctx.webkitBackingStorePixelRatio ||
    //     ctx.mozBackingStorePixelRatio ||
    //     ctx.msBackingStorePixelRatio ||
    //     ctx.oBackingStorePixelRatio ||
    //     ctx.backingStorePixelRatio ||
    //     1;

    //   const pixelRatio =
    //     (window.devicePixelRatio || 1) / backingStorePixelRatio; //获得屏幕像素比，进行缩放，否则绘制会出现模糊
    //   canvas.width = width * pixelRatio; //相应缩放画布
    //   canvas.height = height * pixelRatio;
    //   ctx.scale(pixelRatio, pixelRatio);

    //   canvas.style.width = width + "px"; //实际按照屏幕大小绘制
    //   canvas.style.height = height + "px";

    //   return ctx;
    // },
    // initSelect() {
    //   //每次选择区域前初始化选区状态,也就是"取消"工具按钮作用
    //   this.completeSelectRegion = false;
    //   this.isCapture = false;
    //   this.canDrag = true;
    //   this.captureRegionStyle.left = "0px";
    //   this.captureRegionStyle.top = "0px";
    //   this.captureRegionStyle.width = "0px";
    //   this.captureRegionStyle.height = "0px";
    // },
    onSelectRegion(e) {
      //鼠标按下开始截图
      if (this.completeSelectRegion) {
        return false;
      } //选区成功后，不可再点击，除非点击"取消"重新选

      // if(this.showPixelCanvas){
      //   return false
      // } //像素查看时，不可进行截图选取
      //开始还原图像

      // this.initSelect();
      this.x = e.x;
      this.y = e.y;
      // this.captureRegionStyle.left = this.x + "px";
      // this.captureRegionStyle.top = this.y + "px";

      document.onmousemove = (e) => {
        const width = e.x; //可能反向选区,就为负数
        const height = e.y;

        // 判断是否是在截图，而不是纯粹点击鼠标等普通操作
        this.isCapture = width > 15; //width<0是反向选区，但反向选区遇到bug，尚未解决
        if (this.isCapture) {
          //是在截图进行选区,更新宽高
          this.width = width;
          this.height = height;
          // this.captureRegionStyle.width = this.width + "px";
          // this.captureRegionStyle.height = this.height + "px";
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
      document.onmouseup = () => {
        //BUG:偶尔丢失mouseup事件，我鼠标问题吗？
        //放开鼠标，清除移动事件，生成选区
        document.onmousemove = null;
        this.completeSelectRegion = this.canDrag = this.isCapture;
        // console.log(this.x, this.y, this.width, this.height);
        // let top, right, bottom, left;

        this.completeSelectRegion = true;
        //-------设置宽高、清空画布都会使canvas状态清空，所以在这里处理高dpi模糊问题
        // this.setCanvas(this.$refs.display, this.canvasWidth, this.canvasHeight);
        // this.setCanvas(this.$refs.assist, this.canvasWidth, this.canvasHeight);
        // //-------
        // this.clipDesktop();
      };
    },
    // clipDesktop() {
    //   let desktop = this.$refs.desktop;
    //   const ctx = this.$refs.display.getContext("2d");
    //   ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    //   ctx.drawImage(
    //     desktop,
    //     this.canvasX,
    //     this.canvasY,
    //     this.canvasWidth,
    //     this.canvasHeight,
    //     0,
    //     0,
    //     this.canvasWidth,
    //     this.canvasHeight
    //   );
    //   ctx.globalCompositeOperation = "source-over";
    // },
    videoShow(stream) {
      const video = this.$refs.video;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        let canvas = this.$refs.desktop;
        canvas.width = window.screen.width;
        canvas.height = window.screen.height;
        canvas.style.width = window.screen.width + "px";
        canvas.style.height = window.screen.height + "px";
        const ctx = canvas.getContext("2d");
        // ctx.drawImage(video,0, 0)
        ctx.clearRect(0, 0, window.screen.width, window.screen.height);
        createImageBitmap(video).then((bmp) => {
          //转为bitmap，可以提高性能，降低canvas渲染延迟
          ctx.drawImage(bmp, 0, 0);
          stream.getTracks()[0].stop(); //关闭视频流，序号是反向的，此处只有一个所以是0

          this.$refs.imgdata0.src = canvas.toDataURL();
          this.$refs.imgdata.src = canvas.toDataURL();
          this.ipc.send("message", {
            type: "window-show",
            id: "snipping",
          });
          // console.log(canvas.toDataURL());
        });
      };
    },
    getWin() {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
      if (navigator.getUserMedia) {
        // 支持
        console.log("支持");
        // alert("支持")
      } else {
        // 不支持
        console.log("不支持");
        // alert("不支持")
      }
      // if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      //     console.log('the getUserMedia is not supported!');
      // } else {
      //getting local audio stream
      // let constraints = {
      //   video: true,
      //   audio: {
      //     echoCancellation: true,
      //     noiseSuppression: true,
      //     autoGainControl: true,
      //   },
      // };
      navigator.mediaDevices
        .getUserMedia({
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
            },
          },
        })
        .then((myStream) => {
          this.videoShow(myStream);
        })
        .catch((e) => {});
    },
  },
};
</script>
<style scoped lang="less">
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
  opacity: 0.3;
}

.mainv {
  position: absolute;
  width: 0px;
  height: 0px;
  border: 1px solid rgba(0, 0, 0, 1);
  z-index: 2;
  cursor: move;
  z-index: 105;
}
.minDiv {
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 1);
  font-size: 0;
  position: absolute;
}
.minDiv.left-up {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}
.minDiv.left {
  top: 50%;
  margin-top: -4px;
  left: -4px;
  cursor: e-resize;
}
.minDiv.left-down {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}
.minDiv.top {
  top: -4px;
  left: 50%;
  margin-left: -4px;
  cursor: n-resize;
}
.minDiv.right-up {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}
.minDiv.right {
  top: 50%;
  margin-top: -4px;
  right: -4px;
  cursor: e-resize;
}
.minDiv.right-down {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}
.minDiv.bottom {
  bottom: -4px;
  left: 50%;
  margin-left: -4px;
  cursor: s-resize;
}
</style>