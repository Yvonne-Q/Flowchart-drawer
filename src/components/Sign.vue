<template>
  <div class="sign_container">
    <el-form ref="form" :model="form" class="">
      <el-form-item>
        <el-input prefix-icon="el-icon-flowchart-user" v-model="form.account" placeholder="用户名"></el-input>
        <p class="error_tip"><span v-if="form.accountError.length!=0" class="el-icon-warning tip_icon"></span>{{form.accountError}}</p>
      </el-form-item>
      <el-form-item>
        <el-input prefix-icon="el-icon-flowchart-password" type="password" v-model="form.password" placeholder="密码"></el-input>
        <p class="error_tip"><span v-if="form.passwordError.length!=0" class="el-icon-warning tip_icon"></span>{{form.passwordError}}</p>
      </el-form-item>
      <el-form-item>
        <el-input prefix-icon="el-icon-flowchart-password" type="password" v-model="form.confirmPassword" placeholder="确认密码"></el-input>
        <p class="error_tip"><span v-if="form.confirmError.length!=0" class="el-icon-warning tip_icon"></span>{{form.confirmError}}</p>
      </el-form-item>
      <el-form-item class="lastform">
        <el-button class="submit_btn" type="primary" @click="onSubmit">立即注册</el-button>
      </el-form-item>
    </el-form>
    <div style="font-size:12px;margin-top:16px;"><span class="el-icon-info"></span>注册表示您已阅读和同意服务协议</div>
  </div>
</template>

<script>
export default {
  name: 'sign',
  data: function () {
    return {
      form: {
        account: '',
        password: '',
        confirmPassword: '',
        accountError: '',
        passwordError: '',
        confirmError: ''
      }
    }
  },
  methods: {
    onSubmit: function () {
      this.form.accountError = ''
      this.form.passwordError = ''
      this.form.confirmError = ''
      if (this.form.password !== this.form.confirmPassword) {
        this.form.confirmError = '两次密码输入不一致！'
      } else {
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
              this.form.accountError = '该账号已被注册！'
            } else {
              count++
            }
          }
          if (count === users.length) {
            // 创建一个账号密码
            return this.$http.post('/api/user/createAccount', params)
              .then((res) => {
                console.log(res)
                if (res.status === 200) {
                  this.form.account = ''
                  this.form.password = ''
                  this.form.confirmPassword = ''
                  this.$message('账号创建成功！请登录账号！')
                }
              })
          }
        })
      }
    }
  }
}
</script>

<style scoped>
  .sign_form{
    margin: 50px auto;
  }
  .submit_btn{
    width: 100%;
  }
  .login_link{
    float: left;
    color: #555;
  }
  .login_link:hover{
    color: #333;
    position: relative;
  }
  .login_link:hover::after{
    content: "";
    display: inline-block;
    position: absolute;
    bottom: 0px;
    left: calc(50% - 7px);
    width: 14px;
    height: 4px;
    background: #409eff;
  }
  .el-icon-info{
    margin-right: 10px;
    color: #E6A23C;
  }
  .error_tip{
    color: #F56C6C;
    text-align: left;
  }
  .tip_icon{
    margin-right: 10px;
  }
</style>
