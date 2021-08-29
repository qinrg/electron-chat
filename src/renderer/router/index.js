/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-03-24 14:49:48
 * @LastEditTime: 2021-08-27 17:02:48
 */
import Vue from 'vue'
import Router from 'vue-router'
//开始加载
// import login from '@/components/user/login' //登录
// import register from '@/components/user/register' //登录
Vue.use(Router)
const router = new Router({
    // mode: 'history',
    routes: [
        {
            path: '/login',
            name: 'login',
            component: (resolve) => require(["@/components/login"], resolve),
        }, //首页register.vue
        {
            path: '/register',
            name: 'register',
            component: (resolve) => require(["@/components/user/register"], resolve),
        }, //首页register.vue
        {
            path: '/index',
            name: 'index',
            component: (resolve) => require(["@/components/index"], resolve),
        }, //首页
        {
            path: '/contact',
            name: 'contact',
            component: (resolve) => require(["@/components/user/contact"], resolve),
        }, //联系
        {
            path: '/applyFriend',
            name: 'applyFriend',
            component: (resolve) => require(["@/components/user/applyFriend"], resolve),
        }, //添加好友
        {
            path: '/oneMsg',
            name: 'oneMsg',
            component: (resolve) => require(["@/components/messageView/index"], resolve),
        }, //单聊
        {
            path: '/video',
            name: 'video',
            component: (resolve) => require(["@/components/video"], resolve),
        }, //显示
        {
            path: '/controlled',
            name: 'controlled',
            component: (resolve) => require(["@/components/controlled"], resolve),
        }, //controlled 媒体流获取
        {
            path: "/snipping",
            name: 'snipping',
            component: (resolve) => require(["@/components/snipping/snipping"], resolve),
        },
        {
            path: '*',
            redirect: '/login'
        }
    ]
})
// 全局路由守卫
router.beforeEach((to, from, next) => {
    // console.log("123", sessionStorage.isLogin)
    //store.state.login.status
    if (to.matched.some(m => m.meta.auth)) {

        // 对路由进行验证
        if (sessionStorage.isLogin && sessionStorage.isLogin == "true") {
            //     // 已经登陆
            next(); // 正常跳转到你设置好的页面
            console.log(sessionStorage.isLogin)
        } else {
            console.log(sessionStorage.isLogin)
            //     // 未登录则跳转到登陆界面，query:{ Rurl: to.fullPath}表示把当前路由信息传递过去方便登录后跳转回来；
            next({
                path: "/login"
            });
            // next()
        }
    } else {
        next();
    }
});
export default router;