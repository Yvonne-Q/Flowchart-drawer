import Vue from 'vue'
import Router from 'vue-router'

// 引入创建的页面
import Home from '../Home'
import Index from '../Index'
import Draw from '../Draw'
import Enter from '../Enter'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/enter',
      name: 'Enter',
      component: Enter
    },
    {
      path: '/index/:userid',
      name: 'Index',
      component: Index
    },
    {
      path: '/draw/:fileid',
      name: 'Draw',
      component: Draw
    }
  ]
})
