<!--/Enter.vue-->
<template>
  <div class="enter_page">
    <!--header start-->
    <!--<el-row class="header">
      <el-col :span="24">
        <div class="grid-content">
          <p class="enter_title" v-if="type=='0'">注册</p>
          <p class="enter_title" v-else>登录</p>
        </div>
      </el-col>
    </el-row>-->
    <el-row class="title">
      <el-col :span="24">
          <h1>Flowchart-drawer</h1>
      </el-col>
    </el-row>
    <!--header end-->
    <div class="form_container">
      <!--switch start-->
      <div class="switch-header">
        <div class="switch" id="switch">

          <!--<router-link class="switch_btn switch_btn_focus" id="switch_qlogin" :to="{ path: 'enter', query: { type: '1' }}">快速登录</router-link>-->
          <!--<router-link class="switch_btn" :to="{ path: 'enter', query: { type: '0' }}">快速注册</router-link>-->
          <el-button type="text" class="switch_btn" :class="[type=='1'?'switch_btn_focus':'']" id="switch_qlogin" @click="onSignin" tabindex="7">快速登录</el-button>
          <el-button type="text" class="switch_btn" :class="[type=='0'?'switch_btn_focus':'']" id="switch_login" @click="onRegister" tabindex="8">快速注册</el-button>
          <div class="switch_bottom" :class="[type=='1'?'signin_active':'register_active']" id="switch_bottom"></div>
        </div>
      </div>
      <!--switch end-->
      <!--注册表单-->
      <sign class="sign_form" v-if="type=='0'"></sign>
      <!--登录表单-->
      <login class="login_form" v-else></login>
    </div>
  </div>
</template>

<script>
import Sign from './components/Sign'
import Login from './components/Login'
export default {
  name: 'Enter',
  components: {
    'sign': Sign,
    'login': Login
  },
  data: function () {
    const enterData = {
      type: '',
      user: '',
      password: ''
    }
    return enterData
  },
  methods: {
    getType: function () {
      this.type = this.$route.query.type
      // console.log(this.type)
    },
    onSignin: function () {
      this.type = '1'
      // console.log(this.type)
    },
    onRegister: function () {
      this.type = '0'
      // console.log(this.type)
    }
  },
  mounted: function () {
    this.getType()
  },
  watch: {
    '$route': function (route) {
      var query = route.query
      this.page = query.page
      location.reload()
    }
  }
}
</script>

<style scoped>
.enter_page{
  width: 100%;
  height: 100%;
  background: url('assets/images/1.jpg') 50% 0 no-repeat;
  background-size: cover;
  position: relative;
  margin: 0;
}
  .header{
    height: 60px;
    line-height: 60px;
    background-color: #409eff;
    color: #fff;
    font-weight: 500;
    font-size: 24px;
    box-shadow: rgba(0, 0, 0, 0.14) 0 4px 5px 0, rgba(0, 0, 0, 0.12) 0 1px 10px 0, rgba(0, 0, 0, 0.2) 0 2px 4px -1px;
  }
  .el-col-24{
    height: 100%;
  }
  .grid-content{
    width: 100%;
    height: 100%;
  }
  .enter_title{
    letter-spacing: 24px;
  }
  .title{
    position: absolute;
    width: 100%;
    top: 10%;
    left: 0;
    right: 0;
  }
  .title h1{
      text-align: center;
      color: #fff;
      font-size: 35px;
      font-weight: bold;
      text-shadow: 0px 1px 1px #555;
      font-family: "Microsoft Yahei";
  }
  .form_container{
    width: 400px;
    margin: 50px auto 0;
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    box-sizing: border-box;
    position: absolute;
    top: 20%;
    left: calc(50% - 200px);
    overflow: hidden;
  }
.switch-header{
  height: 50px;
  border-bottom: 1px solid #e2e2e2;
  position: relative;
  margin-bottom: 25px;
}
.switch-header .switch {
  height: 45px;
  position: absolute;
  left:70px;
  bottom: 0;
  font-size: 16px;
}
.switch-header .switch #switch_qlogin {
  margin-right: 85px;
}
.switch-header .switch .switch_btn {
  display: inline-block;
  height: 45px;
  outline: none;
  color: #999;
}
.switch-header .switch .switch_btn_focus {
  color: #333;
  display: inline-block;
  height: 45px;
  outline: none;
}
#switch_bottom {
  position: absolute;
  bottom: -1px;
  border-bottom: 2px solid #848484;
  position: absolute; width: 62px;
}
  .signin_active{
    left: 0;
  }
  .register_active{
    left: 154px;
  }
</style>
