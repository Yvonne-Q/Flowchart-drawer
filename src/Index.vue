<!--/Index.vue-->
<template>
  <div class="index_page">
    <el-container class="index_container">
      <el-header>
        <index-header @menu="showMenu" v-bind:userId="userId"></index-header>
      </el-header>
      <el-container class="main_container">
        <el-aside :width="aside">
          <index-left v-bind:userId="userId" @showFile="showContent"></index-left>
        </el-aside>
        <el-main>
          <index-content v-bind:userId="userId" v-bind:content="content" v-bind:menu="menu"></index-content>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import IndexHeader from './components/IndexHeader'
import IndexLeft from './components/IndexLeft'
import IndexContent from './components/IndexContent'
export default {
  name: 'index',
  data: function () {
    return {
      userId: this.$route.params.userid,
      content: 'myFile',
      menu: 'mine',
      aside: '200px'
    }
  },
  watch: {
    'menu': {
      handler: function (val, oldVal) {
        if (val === 'mine') {
          this.aside = '200px'
        } else {
          this.aside = '0px'
        }
      },
      deep: true
    }
  },
  components: {
    IndexContent,
    IndexLeft,
    'index-header': IndexHeader,
    'index-left': IndexLeft,
    'index-content': IndexContent
  },
  methods: {
    showContent: function (data) {
      this.content = data
    },
    showMenu: function (data) {
      this.menu = data
    }
  }
}
</script>

<style scoped>
  .index_page{
    width: 100%;
    height: 100%;
    background: #f2f2f2;
  }
  .index_container{
    height: 100%;
  }
  .el-header,.el-main{
    padding: 0;
  }
  .el-main{
    width: calc(100% - 200px);
  }
  .main_container{
    padding-top: 30px;
  }
</style>
