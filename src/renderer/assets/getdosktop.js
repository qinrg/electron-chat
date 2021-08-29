
let videoShow = (stream) => {
    /*
    1、创建视频流媒体，
    2、创建画布截取成图像
    3、获取图片base64
    4、删除video与 canvas
    5、返回需要的base64图片信息
    
    */
    let video = document.createElement("video")
    let canvas = document.createElement("canvas")
    video.style = `position: fixed;top: 50000px;width: 320px;height: 240px;left: 50000px;z-index: 8;`
    canvas.style = `position: fixed;top: 32000px;320px;height: 240px;left: 50000px;z-index: 8;`
    video.srcObject = stream;//autoplay playsinline
    video.getAttribute("autoplay", true)
    video.getAttribute("playsinline", true)
    document.querySelector("body").appendChild(video)
    document.querySelector("body").appendChild(canvas)
    return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
            video.play();
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
                let base = canvas.toDataURL()
                resolve(base)
                video.remove()
                canvas.remove()
            });
        };
    })


}
let getWin = async () => {
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
    let optobj = {
        video: {
            mandatory: {
                chromeMediaSource: "desktop",
            },
        }
    }
    let myStream = await navigator.mediaDevices.getUserMedia(optobj)
    return await videoShow(myStream)
}
export let getbase64 = () => {
    return getWin()
}