// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/reset.css'
import './assets/icon/iconfont.css'
import App from './App'
import router from './router'
import resouce from 'vue-resource'
// import store from './store'
// import $ from 'jquery'

Vue.use(ElementUI)
Vue.use(resouce)

Vue.config.productionTip = false
Vue.http.options.emulateJSON = true

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
