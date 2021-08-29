<template>
  <div
    class="copyIndex"
    ref="copyIndex"
    @mousedown="copyDown"
    @mouseup="copyUp"
    @mousemove="copyMove"
  >
    <canvas
      ref="drawcanvas"
      width="100%"
      height="100%"
      id="drawcanvas"
    ></canvas>
    <canvas
      ref="clipcanvas"
      width="100%"
      height="100%"
      id="clipcanvas"
    ></canvas>
    <div class="copyBtn" ref="copyBtn" v-show="toolkit">
      <span class="el-icon-top-right" title="箭头工具"></span>
      <span class title="矩形工具">口</span>
      <span class title="椭圆工具">〇</span>
      <span class="el-icon-edit-outline" title="画图工具"></span>
      <span class="el-icon-folder-opened" title="另存为"></span>
      <span class="el-icon-close" @click="outcopy" title="退出截图"></span>
      <span class="el-icon-check" title="完成截图" @click="okcopy">完成</span>
    </div>
    <div
      class="canvas_border"
      ref="canvas_border"
      @mousedown="canvas_borderDown"
      @mouseup="canvas_borderUp"
    >
      <span v-show="toolkit" v-for="i in 4" :class="'copy' + i" :key="i"></span>
    </div>
    <!-- <span>@mousemove="canvas_borderMove"</span> -->
  </div>
</template>
<script>
export default {
  data() {
    return {
      img: "",
      url: "",
      start: "",
      clipArea: {}, //裁剪范围
      toolkit: false, //工具包显示
      width: 0,
      height: 0,
      moveXY: {}, //鼠标xy坐标
      ischild: false, //子框按下
      childData: {},
      changeSize: {},
      isChange: false,
    };
  },
  created() {},
  mounted() {
    this.showimg();
  },
  methods: {
    okcopy() {},
    setBorder(width, height, top, left) {
      this.$refs.canvas_border.style.width = width + "px";
      this.$refs.canvas_border.style.height = height + "px";
      this.$refs.canvas_border.style.top = top + "px";
      this.$refs.canvas_border.style.left = left + "px";
      // console.log(width,height,top,left)
    },
    setButton() {
      let xy = this.$refs.canvas_border;
      let ks = this.$refs.copyIndex;
      if (xy.offsetTop < 36) {
        this.$refs.copyBtn.style.top =
          xy.offsetTop + xy.offsetHeight + 10 + "px";
        //
      } else if (xy.offsetTop + xy.offsetHeight + 36 >= ks.offsetHeight) {
        this.$refs.copyBtn.style.top = xy.offsetTop - 36 + "px";
        // this.$refs.copyBtn.style.left = xy.offsetLeft+xy.offsetWidth-240+"px";
      } else {
        this.$refs.copyBtn.style.top =
          xy.offsetTop + xy.offsetHeight + 10 + "px";
      }
      if (xy.offsetLeft + xy.offsetWidth < 240) {
        //   // this.$refs.copyBtn.style.top = xy.offsetTop-36+ "px";
        this.$refs.copyBtn.style.left = "0px";
      } else {
        this.$refs.copyBtn.style.left =
          xy.offsetLeft + xy.offsetWidth - 240 + "px";
      }
    },
    canvas_borderDown(ev) {
      if (ev.buttons == 2) return;
      if (ev.target.className == "canvas_border") {
        this.ischild = true;
        let data = this.childData;
        data["oldx"] = ev.x;
        data["oldy"] = ev.y;
        data["oldw"] = this.$refs.canvas_border.offsetWidth;
        data["oldh"] = this.$refs.canvas_border.offsetHeight;
        data["oldt"] = this.$refs.canvas_border.offsetTop;
        data["oldl"] = this.$refs.canvas_border.offsetLeft;
        console.log("按下是挪动的", this.childData);
      }
      if (ev.target.className.indexOf("copy") != -1) {
        this.isChange = true;
        let data = this.changeSize;
        data["oldx"] = ev.x; //光标x
        data["oldy"] = ev.y; //光标y
        data["oldWidth"] = this.$refs.canvas_border.offsetWidth;
        data["oldHeight"] = this.$refs.canvas_border.offsetHeight;
        data["oldt"] = this.$refs.canvas_border.offsetTop;
        data["oldl"] = this.$refs.canvas_border.offsetLeft;
        data["oldclass"] = ev.target.className;
        // console.log("按下copy", this.changeSize);
      }
      // console.log("按下copy", ev);
    },
    canvas_borderUp(ev) {
      if (ev.buttons == 2) return;
      this.ischild = false;
      this.isChange = false;
    },
    canvas_borderMove(ev) {
      if (ev.buttons == 2) return;
    },
    outcopy() {
      window.close();
    },
    showimg() {
      let that = this;
      let desktopCapturer = that.$ele.desktopCapturer;
      (that.width = window.innerWidth), (that.height = window.innerHeight);
      let options = {
        types: ["screen"],
        thumbnailSize: { width: that.width, height: that.height },
      };
      desktopCapturer.getSources(options).then(async (sources) => {
        for (const source of sources) {
          // //console.log(source)
          if (source.name === "Entire screen" || source.name === "Screen 1") {
            // //console.log(source.thumbnail.toDataURL())
            that.img = source.thumbnail.toDataURL(); //获取截图base64图
            let clipcanvas = document.getElementById("clipcanvas");
            let drawcanvas = document.getElementById("drawcanvas");
            // // 设置画布尺寸
            clipcanvas.width = that.width;
            clipcanvas.height = that.height;
            drawcanvas.width = that.width;
            drawcanvas.height = that.height;
            // // 画布创建图
            let clipCtx = drawcanvas.getContext("2d");
            let clipImg = document.createElement("img");
            clipImg.crossOrigin = "anonymous";
            clipImg.src = this.img;
            let timg = clipImg.cloneNode();
            this.$refs.copyIndex.appendChild(clipImg);
            clipImg.onload = function () {
              clipCtx.drawImage(clipImg, 0, 0);
            };
          }
        }
      });
    },
    copyDown(ev) {
      //按下
      if (ev.buttons == 2 || this.toolkit) return;
      this.buttonDown = true;
      this.toolkit = false;
      this.start = {
        x: ev.offsetX,
        y: ev.offsetY,
      };
      //console.log("", ev);
    },
    copyUp(ev) {
      //起来
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.buttons == 2) return;
      if (this.start) {
        // this.childData=this.start
        this.start = null;
        let url = this.startClip(this.clipArea);
        //  let {width,height,top,left}=

        // img.src = url;
        this.toolkit = true;
        // this.ischild = false;
        // console.log(this.clipArea);
      } else {
      }
      this.ischild = false;
      this.isChange = false;
    },
    copyMove(ev) {
      //需求值
      let w, h, x, y;
      //鼠标移动
      if (ev.buttons == 2) return;
      if (this.isChange == true) {
        let { oldclass, oldHeight, oldWidth, oldl, oldt, oldx, oldy } =
          this.changeSize;
        if (oldclass == "copy1") {
          w = oldWidth - (ev.x - oldx); //新图w=old宽-(当前拖动光标x-old光标x)
          h = oldHeight - (ev.y - oldy); //新图h=old高-(当前拖动光标y-old光标y)
          x = ev.x;
          y = ev.y;
        }
        if (oldclass == "copy2") {
          w = oldWidth - (oldx - ev.x); //新图w=old宽-(old光标x-当前拖动光标x)
          h = oldHeight - (ev.y - oldy); //新图w=old宽+(old光标x-当前拖动光标x)
          y = oldy - (oldy - ev.y);
          x = oldx - oldWidth;
          // console.log("历史", oldx);
          // console.log("现在", ev.x);
        }
        if (oldclass == "copy3") {
          w = oldWidth - (ev.x - oldx); //新图w=old宽-(当前拖动光标x-old光标x)
          h = oldHeight - (oldy - ev.y); //新图h=old高-(当前拖动光标y-old光标y)
          x = ev.x; //-(ev.x - oldx);
          y = oldy - oldHeight;
        }
        if (oldclass == "copy4") {
          w = oldWidth - (oldx - ev.x); //新图w=old宽-(old光标x-当前拖动光标x)
          h = oldHeight - (oldy - ev.y); //新图h=old高-(old光标y-当前拖动光标y)
          x = oldx - oldWidth;
          y = oldy - oldHeight;
        }
      }
      if (
        ev.target.id != "clipcanvas" &&
        ev.target.className == "canvas_border"
      ) {
        if (this.ischild == true && ev.buttons) {
          let { oldw, oldh, oldl, oldt, oldx, oldy } = this.childData;
          let { offsetHeight, offsetWidth } = this.$refs.copyIndex;
          console.log(241, oldx, oldy, oldt, oldl);
          w = oldw;
          h = oldh;
          x = oldl + (ev.x - oldx);
          y = oldt + (ev.y - oldy);
          //阻止外框溢出
          x <= 0 ? (x = 0) : x;
          y <= 0 ? (y = 0) : y;
          y + h > offsetHeight ? (y = offsetHeight - h) : y;
          x + w > offsetWidth ? (x = offsetWidth - w) : x;
        }
      } else {
        if (this.start) {
          console.log("判断内");
          w = ev.x - this.start.x;
          h = ev.y - this.start.y;
          x = this.start.x;
          y = this.start.y;
        }
      }
      if (w <= 0 || h <= 0 || w == undefined || h == undefined) return;
      console.log("历史", w, h, x, y);
      this.setBorder(w, h, y, x);
      this.fill(x, y, w, h);
      this.setButton();
      // console.log(width, height, top, left);
    },
    fill(x, y, w, h) {
      let ctx = clipcanvas.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      // ctx.strokeStyle = "rgba(255,255,255,0.001)";
      // console.log(319,this.width, this.height)
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.beginPath();
      //遮罩层
      ctx.globalCompositeOperation = "source-over"; //source-over
      ctx.fillRect(0, 0, this.width, this.height);
      //画框
      ctx.globalCompositeOperation = "destination-out"; //destination-out
      // ctx.lineWidth=0.7;
      ctx.fillRect(x, y, w, h);
      this.clipArea = {
        //保存画框四点
        x: x,
        y: y,
        w: w,
        h: h,
      };
    },
    startClip(area) {
      if (area) return; //console.log("123");
      if (area.w == 0 && area.h == 0) return false;
      var canvas = document.createElement("canvas");
      canvas.width = area.w;
      canvas.height = area.h;
      var data = clipCtx.getImageData(area.x, area.y, area.w, area.h);
      var context = canvas.getContext("2d");
      context.putImageData(data, 0, 0);
      return canvas.toDataURL("image/png");
    },
  },
};
</script>
<style lang="less" scoped>
.copyIndex {
  width: 100%;
  height: 100%;
  user-select: none;
  > img {
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  > canvas {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  > #drawcanvas {
    background: transparent;
    z-index: 1;
  }
  > #clipcanvas {
    z-index: 2;
  }
  > .copyBtn {
    position: fixed;
    z-index: 5;
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
  > .canvas_border {
    position: fixed;
    width: 0;
    height: 0;
    z-index: 3;
    border: orange 0.5px solid;
    cursor: move;
    > span {
      position: absolute;
      width: 6px;
      height: 6px;
      background: orange;
    }
    > .copy1 {
      z-index: 4;
      top: 0;
      cursor: nw-resize;
    }
    > .copy2 {
      z-index: 4;
      top: 0;
      cursor: ne-resize;
      right: 0;
    }
    > .copy3 {
      z-index: 4;
      bottom: 0;
      cursor: ne-resize;
    }
    > .copy4 {
      z-index: 4;
      bottom: 0;
      right: 0;
      cursor: nw-resize;
    }
  }
}
</style>