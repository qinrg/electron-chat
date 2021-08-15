import Vue from 'vue'
import vuex from 'vuex'//加载vuex
Vue.use(vuex);

import login from './login'

export default new vuex.Store({ 
  modules: {
    login: login,//登录状态
  }
})
