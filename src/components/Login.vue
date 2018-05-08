<template>
  <div class="login_container">
    <div class="SignIn">
      <el-form ref="form" :model="form" class="">
        <el-form-item>
          <el-input prefix-icon="el-icon-flowchart-user" v-model="form.account" placeholder="用户名"></el-input>
          <p class="error_tip"><span v-if="form.accountError.length!=0" class="el-icon-warning tip_icon"></span>{{form.accountError}}</p>
        </el-form-item>
        <el-form-item>
          <el-input prefix-icon="el-icon-flowchart-password" type="password" v-model="form.password" placeholder="密码"></el-input>
          <p class="error_tip"><span v-if="form.passwordError.length!=0" class="el-icon-warning tip_icon"></span>{{form.passwordError}}</p>
        </el-form-item>
        <el-form-item class="lastform">
          <el-button class="submit_btn" type="primary" @click="onSubmit">立即登录</el-button>
           <!--<router-link class="sign_link" :to="{ path: 'enter', query: { type: '0' }}">注册</router-link>-->
        </el-form-item>
      </el-form>
    </div>
    <!--<div class="register disnone">-->

    <!--</div>-->
  </div>
</template>

<script>
export default {
  name: 'login',
  data: function () {
    return {
      form: {
        account: '',
        password: '',
        accountError: '',
        passwordError: ''
      }
    }
  },
  methods: {
    onSubmit: function () {
      this.form.accountError = ''
      this.form.passwordError = ''
      this.$http({
        url: '/api/user/getAccount',
        method: 'get',
        headers: {
          'Content-Type': 'x-www-from-urlencoded'
        }
      }).then(function (response) {
        let params = {
          account: this.form.account,
          password: this.form.password
        }
        let count = 0
        let users = response.data
        for (let i = 0; i < users.length; i++) {
          if (params.account === users[i].account) {
            if (params.password === users[i].password) {
              const path = '/index/' + users[i]._id
              this.$router.push({path: path})
            } else {
              this.form.passwordError = '密码错误！'
            }
          } else {
            count++
          }
        }
        if (count === users.length) {
          this.form.accountError = '用户名不存在！'
        }
      })
    }
  }
}
</script>

<style scoped>

    .login_form{
      /*margin: 0px auto;*/
    }
  .submit_btn{
    width: 100%;
  }
  .error_tip{
    color: #F56C6C;
    text-align: left;
  }
  .tip_icon{
    margin-right: 10px;
  }
  .sign_link{
    float: left;
    color: #555;
  }
  .sign_link:hover{
    color: #333;
    position: relative;
  }
  .sign_link:hover::after{
    content: "";
    display: inline-block;
    position: absolute;
    bottom: 0px;
    left: calc(50% - 7px);
    width: 14px;
    height: 4px;
    background: #409eff;
  }
  .lastform{
    margin-bottom: 0px;
  }
</style>
