import Vue from 'vue'
import App from './App'
import router from './router'

import ElementUI from 'element-ui';
import {
    Message
} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import store from './store/index' //调用用src/store
import axios from 'axios';
import CryptoJS from "crypto-js"
import moment from "moment"
let ip = "127.0.0.1:3001/"
Vue.prototype.jsRsa = (data) => {
    let publicKey =
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCcMRSbJawpf+Sa/6Vli+OXcJroh8CVrtNj3yxQqoU35uVXundgc0fju5x9WcoclXHHKfIiAmzMNyFVzR8F0/mFjU6jAzxFb0J5Dge/2LDeBV3Yvh+NtijxETm3GCTHt6FpcVt6m7rrtAjwJ9BmEvE3Vu6ALVNEqbdNqvBaS91T/wIDAQAB" // 从后台获取公钥，这里省略，直接赋值
    // console.log(data)
    var encrypt = new JSEncrypt();
    //encrypt.setPrivateKey('-----BEGIN RSA PRIVATE KEY-----'+PRIVATE_KEY+'-----END RSA PRIVATE KEY-----');
    encrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + publicKey + '-----END PUBLIC KEY-----');
    // console.log("时间", str)
    var encrypted = encrypt.encrypt(JSON.stringify(data));
    // console.log('加密前数据:%o', data);
    // console.log('加密后数据:%o', encrypted);
    return encrypted;

}
Vue.prototype.getRsa = (data) => {
    console.log(data)
    var PRIVATE_KEY =
        'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAJwxFJslrCl/5Jr/pWWL45dwmuiHwJWu02PfLFCqhTfm5Ve6d2BzR+O7nH1ZyhyVcccp8iICbMw3IVXNHwXT+YWNTqMDPEVvQnkOB7/YsN4FXdi+H422KPERObcYJMe3oWlxW3qbuuu0CPAn0GYS8TdW7oAtU0Spt02q8FpL3VP/AgMBAAECgYBdgnTXveIopkzzDwKynOGRFPVpKXz/ID+ml0IsuSowoafEsfouYFY13Wh/E3aRTldj6ZTxD4qbaJYojDl6f8HuZm0RMBOvxJWrxGu2L/qRBTZluW/10bZPa1b/jfjlQVUuYqTbOEfpele6XLRDPahLHrrsJ+YPnpp01PtD6MP+4QJBANxt49yZZp2jsEWZFM/KcsNv2IeRjwzJCu+/VimOm8QcdyH8thFoKj189VJCGvSCrOohOqqVQvQcMdx8IdiIDHsCQQC1ZXxvjLa6068ClUbe7cWwsgiQ0X2D8tN1p+199/5rw+XcuXlRLFp2uLvvHX8EJ1bIUN4JtYce2Pc4VbtO38lNAkBR0aBQk8gZH1cgnk+xSU4L6QoQWCEm98DNeNH8nuiGhKJbxTe3glibdjSBEfR7ab3RMgBarQirH4QKeTD+9JDdAkBiyNPNQ8o3UBRcycKAoOgp46p6gzthYhn6Vusk0KsDMPm7DF6e8BKL2Oqvu1ZygqHmEPP6QZtGF036peWNfJ15AkEApBbdYCxkmkBP5XXOPHbIvBGQsLcnm2APDaXtdF4UVna8V6OCxzPtSsBSJiPLKFdJb6HcoVyXMGEU2bvsW+OEGg==';

    var decrypt = new JSEncrypt();
    decrypt.setPrivateKey('-----BEGIN RSA PRIVATE KEY-----' + PRIVATE_KEY + '-----END RSA PRIVATE KEY-----');
    return decrypt.decrypt(data);

}
if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
let ipc = window.require("electron").ipcRenderer
Vue.prototype.ipc = ipc

Vue.prototype.$ele = window.require("electron");
// Vue.prototype.$path = window.require("path");
// 服务器的域名/ip
// axios.defaults.withCredentials=true;//让ajax携带cookie
const instances = axios.create({
    // baseURL: 'https://oa.w3cjs.cn/', //process.env.BASE_API, // api的base_url
    baseURL: process.env.NODE_ENV == "development" ? 'http://' + ip : "https://w3cjs.cn/", //process.env.BASE_API, // api的base_url
    timeout: 30000, // 请求超时时间，1分钟
    headers: {
        'content-type': 'application/x-www-form-urlencoded'
    }
});
// request请求拦截器

instances.interceptors.request.use(
    config => {
        // Loading.service({text: '加载中...'})   这是全局的loading
        config.headers = {
        }
        return config
    },
    error => {
        Promise.reject(error)
    }
)

// respone响应拦截器
instances.interceptors.response.use(
    response => {
        // Loading.service().close()  响应成功，关闭全局的loading
        return response
    },
    error => {
        // Loading.service().close()  响应错误，关闭全局的loading
        // Message({
        //     message: '服务器繁忙，请稍后重试',
        //     type: 'error', 
        //     duration: 4 * 1000
        // })
        return Promise.reject(error)
    }
)
Vue.prototype.post = (url, data) => {
    return new Promise((resolve, reject) => {
        instances.post(url, data).then(res => {
            resolve(res.data)
        }).catch(err => {
            resolve({ code: 1, msg: err })
        })
    })
}
console.log(process.env.NODE_ENV == "development")
Vue.prototype.ips = process.env.NODE_ENV == "development" ? "ws://" + ip + "call?name=" : "wss://w3cjs.cn/call?name="
Vue.prototype.AllTime = (val) => {
    //设置年月日时分秒
    if (!val) return "";
    var date = new Date(Number(val));
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var h = date.getHours();
    h = h < 10 ? "0" + h : h;
    var f = date.getMinutes();
    f = f < 10 ? "0" + f : f;
    var s = date.getSeconds();
    s = s < 10 ? "0" + s : s;
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    return year + "-" + month + "-" + strDate + " " + h + ":" + f + ":" + s;
}
Vue.config.productionTip = false;
Vue.use(ElementUI);
ipc.on("message", (e, res) => {
    window.dispatchEvent(new CustomEvent('message', {
        detail: res
    }))
})

Vue.prototype.setBase = (text) => {
    let ciphertext = CryptoJS.AES.encrypt(text, 'lt007').toString()
    return ciphertext
}
Vue.prototype.getBase = (text) => {
    let bytes = CryptoJS.AES.decrypt(text, 'lt007')
    return bytes.toString(CryptoJS.enc.Utf8);
}
Vue.prototype.urlParam = (name) => {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.href
        .substr(window.location.href.indexOf("?") + 1)
        .match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return ""; //返回参数值
}
Vue.prototype.ok = (e, time) => {
    Message({
        message: "" + e,
        type: "success",
        duration: time ? time : 1500,
        offset: 30
    });
}
Vue.prototype.err = (e, time) => {
    Message({
        message: "" + e,
        type: "warning",
        duration: time ? time : 1500,
        offset: 30
    });
}
Vue.prototype.$moment = moment
/* eslint-disable no-new */
new Vue({
    components: {
        App
    },
    router,
    store,
    template: '<App/>',
}).$mount('#app')