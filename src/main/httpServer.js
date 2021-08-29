/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-26 16:17:05
 * @LastEditTime: 2021-08-26 17:08:42
 */
let path = require('path')
let Koa = require('koa') //koa2中间件依赖
let web = new Koa() //js的继承 
let statics = require('koa-static') //静态资源服务插件
let bodyParser = require('koa-bodyparser') //请求体，返回体解析类似json，text，图片等
let vlog = require('electron-log');
export let MyHttp = (port) => {
    web.use(bodyParser()) //使用解析上下文插件
    // 配置静态资源
    web.use(statics(path.join(__dirname, "./")))
    web.listen(port) //服务启动端口 
    vlog.info('启动成功', port) //日志打印 
}