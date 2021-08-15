<template>
  <div class="index">
    <video
      ref="localAudio"
      autoplay
      playsinline
      muted
      width="0"
      height="0"
    ></video>
  </div>
</template>
<script>
import { createSocket, sendWSPush } from "../assets/websocket.js";
import indexButton from "./button";
import { keycode } from "../assets/keycode";
export default {
  data() {
    return {
      ok: (e) => {
        this.$message({ message: "" + e, type: "success", duration: 1500 });
      },
      err: (e) => {
        this.$message({ message: "" + e, type: "warning", duration: 1500 });
      },
      dll: null,
      width: 1366,
      height: 768,
      iceServer: {
        //webrtc打洞洞配置
        iceServers: [
          {
            urls: "turn:118.25.101.202:5001",
            username: "demo",
            credential: "demo",
          },
        ],
        // sdpSemantics: 'plan-b'
      },
      PeerConnection:
        window.PeerConnection ||
        window.webkitPeerConnection00 ||
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection,
      stream: null, //当前视频流
      userList: {},
      user: "",
      timer: null, //定时器
      uuphone: "",
      uupwd: "",
      isYc: false,
      stream_two: null,
      phone: "",
      server: "",
      coon: "",
      connection: false,
      pc: "",
      moveSend: false,
      wsUrl: "",
    };
  },

  components: {
    indexButton,
  },
  created() {
    window.addEventListener("wsOnmessage", this.onmessage);
    console.log(this.urlParam("id"));
    let id = this.urlParam("id");
    this.wsUrl = this.ips + id;
    createSocket(this.wsUrl);
  },
  mounted() {
    setTimeout(() => {
      this.login(this.urlParam("id"));
    }, 150);
    console.log("这是被控制调试台");
  },
  methods: {
    onmessage(e) {
      const msg = e && e.detail.data;
      if (msg.data == "欢迎使用！") return;
      var data = JSON.parse(msg);
      switch (data.type) {
        case "login":
          //登录成功开始执行
          this.handleLogin(data.success);
          break;
        case "out":
          //登录成功开始执行
          if (data.other == this.phone || data.other == this.server) {
            this.ipc.send("message", { type: "out", id: this.urlParam("id") });
          }
          break;
        case "offer":
          if (!data.offer) return;
          this.handleOffer(JSON.parse(data.offer), data.server, data.name);
          break;
        case "answer":
          if (!data.answer) return;
          this.handleAnswer(JSON.parse(data.answer));
          break;
        //when a remote peer sends an ice candidate to us
        case "candidate":
          if (data.candidate.indexOf("null") >= 0) return;
          this.handleCandidate(JSON.parse(data.candidate));
          break;
        case "leave":
          console.log(data);
          break;
        case "move":
          let w = data.wh.split(",")[0];
          let h = data.wh.split(",")[1];
          let dx = data.xy.split(",")[0];
          let dy = data.xy.split(",")[1];
          let x = (window.screen.width / w) * dx;
          let y = (window.screen.height / h) * dy;
          this.ipc.send("message", { type: "MoveMouse", x: x, y: y });
          break;
        case "keycode":
          if (data.code == "") return;
          // console.log(data.code);
          this.ipc.send("message", { type: "KeyTap", code: data.code });
          break;
        case "moveclick":
          this.ipc.send("message", {
            type: "MouseToggle",
            k: data.k,
            kt: data.kt,
          });
          break;
        default:
          break;
      }
    },
    recalcWH(e) {
      this.width = window.innerWidth - 1;
      this.height = window.innerHeight - 30.5;
    },
    callBtn() {
      let id = this.urlParam("id");
      this.send({
        type: "controlled",
        msg: "创建完成窗口等待开始.",
        name: id,
        server: this.urlParam("server"),
      });
    },
    handleLeave() {
      this.send({
        type: "leave",
        name: this.phone,
        server: this.server,
      });
    },
    handleCandidate(candidate) {
      this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    },
    handleAnswer(answer) {
      this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    },
    handleOffer(offer, server, name) {
      console.log(name, server);
      this.phone = name;
      this.server = server;
      //   connectedUser = name;
      this.pc.setRemoteDescription(new RTCSessionDescription(offer));
      //create an answer to an offer
      this.pc.createAnswer(
        (answer) => {
          this.pc.setLocalDescription(answer);
          this.send({
            type: "answer",
            answer: JSON.stringify(answer),
            name: this.phone,
            server: this.server,
          });
        },
        (error) => {
          alert("创建answer错误");
        }
      );
    },
    send(message) {
      sendWSPush(message);
    },
    login(id) {
      sendWSPush({
        type: "login",
        name: id,
      });
    },
    videoShow(myStream) {
      this.stream = myStream;
      //展示本地媒体流
      this.$refs.localAudio.srcObject = myStream;
      //服务配置
      var configuration = {
        iceServers: [
          {
            urls: "turn:118.25.101.202:5001",
            username: "demo",
            credential: "demo",
          },
        ],
        // sdpSemantics: 'plan-b'
      };
      let PeerConnection =
        window.RTCPeerConnection ||
        window.mozRTCPeerConnection ||
        window.webkitRTCPeerConnection;
      this.pc = new PeerConnection(configuration);
      // setup stream listening
      this.pc.addStream(myStream);

      //when a remote user adds stream to the peer connection, we display it
      this.pc.onaddstream = (e) => {
        console.log("123456");
        this.connection = true;
        // this.$refs.remoteAudio.srcObject = e.stream;
      };

      // Setup ice handling
      this.pc.onicecandidate = (event) => {
        let json = JSON.stringify(event.candidate);
        if (event.candidate && json.indexOf("118.25.101.202") >= 0) {
          this.send({
            type: "candidate",
            candidate: json,
            name: this.phone,
            server: this.server,
          });
        }
      };
    },
    handleLogin(success) {
      this.callBtn();
      if (success === false) {
        console.log("存在了！");
      } else {
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
        // var constraints = {
        //   video: true,
        //   audio: {
        //     echoCancellation: true,
        //     noiseSuppression: true,
        //     autoGainControl: true,
        //   },
        // };
        navigator.mediaDevices
          .getUserMedia({
            audio: {
              mandatory: {
                chromeMediaSource: "desktop",
              },
            },
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
        // if (navigator.platform == "Win32") {
        //   navigator.mediaDevices
        //     .getDisplayMedia(constraints)
        //     .then((myStream) => {
        //       this.videoShow(myStream);
        //     })
        //     .catch((e) => {});
        // } else {
        //   navigator.mediaDevices
        //     .getUserMedia(constraints)
        //     .then((myStream) => {
        //       this.videoShow(myStream);
        //     })
        //     .catch((e) => {});
        // }
      }
    },
    communication() {
      let that = this;
      let serVideo = localStorage.getItem("serVideo");
      if (serVideo) {
        let user = JSON.parse(serVideo);
        let obj = {
          event: "start",
          receiver: user.receiver,
          upwd: user.upwd,
          name: user.name,
        };
        console.log(obj);
        that.isYc = true;
        that.websock.send(JSON.stringify(obj));
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
  box-shadow: -4px -4px 6px 1px rgba(0, 0, 0, 0.5);
  > .local {
    width: 100%;
    height: 100%;
  }
}
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
  > .tz {
    width: calc(100% - 90px);
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
.sek,
.remoteAudio {
  position: absolute;
  left: 0;
  top: 30px;
  object-fit: fill;
  z-index: 8;
}
.sek {
  z-index: 9999;
}
</style>