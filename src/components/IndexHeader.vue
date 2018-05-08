<template>
    <div class="index_header">
      <el-row>
        <el-col :span="24">
          <div class="grid-content header_container">
            <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
              <el-menu-item index="1">我的</el-menu-item>
              <el-menu-item index="2">推荐</el-menu-item>
            </el-menu>
            <div class="right_btn mine_btn" v-on-clickaway="hideModal">
              <el-button type="text" class="mine_item" @click.stop="mineToggle"><span class="user_pic default_user"></span></el-button>
            </div>
            <!--<div class="right_btn message_btn" v-on-clickaway="hideModal">
              <el-button type="text" class="message_item" @click.stop="messageToggle()"><span class="el-icon-bell"></span></el-button>
              <div class="message_container" v-show="messageContainer">
                <div class="message_head">
                  <div class="message_nav">
                    <div class="message_tab" :class="activeTab == 'unread'?'active':''" tit="unread" @click="tabClick($event)">未读通知</div>
                    <div class="message_tab" :class="activeTab == 'all'?'active':''" tit="all" @click="tabClick($event)">全部通知</div>
                    <span class="el-icon-setting setting" @click="settingToggle"></span>
                  </div>
                </div>
                <div class="message_content">
                  <div class="empty-link" v-if="messageNum==0">没有新通知</div>
                  <ul v-else></ul>
                  <ul class="message_menu menu" v-if="settingContent" style="z-index: 2; position: fixed; top: 88px; left: 1206.81px; display: block;">
                    <li>
                      <a href="javascript:;" tit="read">全部已读</a>
                    </li>
                    <li>
                      <a href="javascript:;" tit="del">全部删除</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>-->
            <div class="mine_container" v-show="mineContainer">
              <ul class="user-menu menu noarrow popover">
                <li>
                  <el-button type="text" class="user_item" @click="changePassword = true"><span class="icon el-icon-setting"></span>修改密码</el-button>
                </li>
                <li class="sep"></li>
                <li>
                  <router-link :to="{ path: '/enter', query: { type: '1' } }" tit="loginout" class="user_item"><span class="icon el-icon-back"></span> 退出登录</router-link>
                </li>
              </ul>
            </div>
          </div>
        </el-col>
      </el-row>
      <!--修改密码弹框 start-->
      <el-dialog title="密码修改" :visible.sync="changePassword">
        <el-form ref="form" :model="form" class="">
          <el-form-item>
            <el-input prefix-icon="el-icon-flowchart-password" type="password" v-model="form.oldPassword" placeholder="旧密码"></el-input>
            <p class="error_tip"><span v-if="form.oldPasswordError.length!=0" class="el-icon-warning tip_icon"></span>{{form.oldPasswordError}}</p>
          </el-form-item>
          <el-form-item>
            <el-input prefix-icon="el-icon-flowchart-password" type="password" v-model="form.newPassword" placeholder="新密码"></el-input>
            <p class="error_tip"><span v-if="form.newPasswordError.length!=0" class="el-icon-warning tip_icon"></span>{{form.newPasswordError}}</p>
          </el-form-item>
          <el-form-item>
            <el-input prefix-icon="el-icon-flowchart-password" type="password" v-model="form.confirmPassword" placeholder="新密码确认"></el-input>
            <p class="error_tip"><span v-if="form.confirmPasswordError.length!=0" class="el-icon-warning tip_icon"></span>{{form.confirmPasswordError}}</p>
          </el-form-item>
        </el-form>
        <el-dialog
          width="30%"
          title="密码修改成功！"
          :visible.sync="changeSuccessfully"
          append-to-body>
        </el-dialog>
        <div slot="footer" class="dialog-footer">
          <el-button @click="changePassword = false">取 消</el-button>
          <el-button type="primary" @click="changePsd()">确 定</el-button>
        </div>
      </el-dialog>
      <!--修改密码弹框 end-->
    </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'

export default {
  mixins: [ clickaway ],
  name: 'index-header',
  data: function () {
    const ihData = {
      messageContainer: false,
      mineContainer: false,
      activeTab: 'unread',
      unreadMes: 0,
      allMes: 1,
      messageNum: 0,
      settingContent: false,
      activeIndex: '1',
      changePassword: false,
      changeSuccessfully: false,
      form: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        oldPasswordError: '',
        newPasswordError: '',
        confirmPasswordError: ''
      }
    }
    return ihData
  },
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  methods: {
    messageToggle: function () {
      this.messageContainer = !this.messageContainer
    },
    mineToggle: function () {
      this.mineContainer = !this.mineContainer
    },
    tabClick: function (event) {
      this.activeTab = event.target.getAttribute('tit')
      if (this.activeTab === 'unread') {
        this.messageNum = this.unreadMes
      } else {
        this.messageNum = this.allMes
      }
    },
    settingToggle: function () {
      this.settingContent = !this.settingContent
    },
    hideModal: function () {
      this.messageContainer = false
      this.mineContainer = false
    },
    handleSelect (key, keyPath) {
      let menu = 'mine'
      if (key === '1') {
        menu = 'mine'
      } else {
        menu = 'recommend'
      }
      this.$emit('menu', menu)
    },
    changePsd: function () {
      this.form.oldPasswordError = ''
      this.form.newPasswordError = ''
      this.form.confirmPasswordError = ''
      let that = this
      this.$http({
        url: '/api/user/getUser',
        method: 'get',
        headers: {
          'Content-Type': 'x-www-from-urlencoded'
        },
        params: {
          userId: that.userId
        }
      }).then(function (response) {
        if (response.data[0].password === that.form.oldPassword) {
          if (that.form.newPassword === that.form.confirmPassword) {
            let that = this
            let params = {
              userId: that.userId,
              password: that.form.newPassword
            }
            console.log(params)
            this.$http.post('/api/user/editPassword', params)
              .then((res) => {
                if (res.status === 200) {
                  that.changeSuccessfully = true
                  that.changePassword = false
                }
              })
          } else {
            that.form.confirmPasswordError = '两次密码不一致！'
          }
        } else {
          that.form.oldPasswordError = '密码错误！'
        }
      })
    }
  }
}
</script>

<style scoped>
  .header_container{
    box-shadow: 0 3px 2px -2px rgba(200,200,200,.15);
    height: 50px;
    border-bottom: 1px solid #e5e5e5;
    /*display: flex;*/
    /*align-items: center;*/
    /*justify-content: flex-end;*/
    position: relative;
    background-color: #fff;
  }
  .message_item{
    font-size: 18px;
    color: #888;
    margin: 0 10px;
    outline: none;
  }
  .message_container{
    position: absolute;
    right: 2px;
    top: 50px;
    width: 350px;
    min-height: 400px;
    max-height: 583px;
    letter-spacing: .8px;
    box-sizing: border-box;
    z-index: 999;
    background: #fff;
    padding: 10px 15px;
    border-radius: 3px;
    box-shadow: 1px 1px 4px #ddd;
    min-width: 150px;
    border: 1px solid #ddd;
    transition: all .2s ease-in-out;
    overflow: hidden;
  }
  .message_head{
    height: 35px;
    line-height: 24px;
  }
  .message_nav{
    height: 100%;
    text-align: left;
  }
  .message_content{
    min-height: 400px;
    max-height: 510px;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    transition: all .3s;
    line-height: 24px;
    font-size: 14px;
  }
  .message_content .empty-link {
    text-align: center;
    line-height: 400px;
  }
  .message_tab{
    display: inline-block;
    font-size: 12px;
    padding: 4px 14px;
    border-bottom: 2px solid transparent;
    margin-left: 6px;
    color: #666;
    height: 100%;
    border-radius: 0;
    cursor: pointer;
  }
  .message_tab.active{
    border-bottom: 2px solid #4386f5;
    color: #333;
  }
  .setting{
    float: right;
    margin-top: 3px;
    color: #666;
    font-size: 15px;
    line-height: 24px;
  }
  .menu{
    position: absolute;
    min-width: 140px;
    background: #fff;
    z-index: 1;
    border: 1px solid #ddd;
    box-shadow: 0 1px 6px #ccc;
    border-radius: 3px;
    width: auto;
    font-size: 12px;
  }
  .menu li:first-child {
    margin-top: 8px;
  }
  .menu li:last-child {
    margin-bottom: 8px;
  }
  .menu li a,.menu li button{
    display: block;
    padding: 7px 10px;
    cursor: default;
    color: #444;
    line-height: 20px;
    ground-color: #ddd;
    width: 100%;
    box-sizing: border-box;
  }
  .mine_item{
    margin: 0 10px;
    background-color: transparent;
    outline: none;
  }
  .user_pic{
    width: 30px;
    height: 30px;
    border: 5px solid #fff;
    border-radius: 50%;
  }
  .user_pic:hover{
    border-color: #c6c6c6;
  }
  .default_user{
    display: block;
    background: url('../assets/images/default-user.png') no-repeat center;
    background-size: contain;
    background-color: #888;
  }
  .mine_container{
    position: absolute;
    min-width: 140px;
    background: #fff;
    border: 1px solid #ddd;
    box-shadow: 0 1px 6px #ccc;
    border-radius: 3px;
    margin-top: 4px;
    padding-bottom: 6px;
    width: 140px;
    z-index: 4;
    top: 45px;
    right: 2px;
  }
  .user_item{
    font-size: 13px;
  }
  .user_item .icon{
    margin-right: 6px;
    font-size: 16px;
  }
  .el-menu{
    position: absolute;
    left: 50%;
    transform: translate(-50%,0);
  }
  .el-menu-item{
    height: 50px;
    line-height: 50px;
  }
  .right_btn{
    float: right;
  }
  .mine_btn>button{
    padding: 4px 0;
  }
  .message_btn>button{
    padding: 15px 0;
  }
  .error_tip{
    color: #F56C6C;
    text-align: left;
  }
  .tip_icon{
    margin-right: 10px;
  }
</style>
