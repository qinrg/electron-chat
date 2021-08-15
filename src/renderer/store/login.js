export default { //用户的vuex
    state: {
        status: 'null', //登录状态值
        users: '', //用户名
        judname: 0, //注册匹配邮箱存在,
        msgVal: "",
        msgTxt: "",
        listbox: ''
    },
    mutations: {
        status(state, data) { //state固定值，（status第二个自定义
            state.status = data;
        },
        user(state, data) { //state固定值，（status第二个自定义
            state.users = data;
        },
        judname(state, data) { //state固定值，（status第二个自定义
            state.judname = data;
        },
        msgVal(state, data) {
            state.msgVal = data;
        },
        msgTxt(state, data) {
            state.msgTxt = data;
        },
        listbox(state, data) {
            state.listbox = data;
        },

    }
}