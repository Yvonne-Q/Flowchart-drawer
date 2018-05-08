<template>
  <el-row>
    <el-col :span="24">
      <div class="grid-content">
        <div class="logo"></div>
        <div class="operation">
          <router-link class="operation_item" :to="{ path: 'enter', query: { type: '0' }}">注册</router-link>
          <router-link class="operation_item" :to="{ path: 'enter', query: { type: '1' }}">登录</router-link>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'top'
}
</script>

<style scoped>
  .el-col{
    height: 100%;
    box-shadow: 0 3px 2px -2px rgba(200,200,200,.15);
  }
  .grid-content{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
  }
  .operation_item{
    text-decoration: none;
    color: #888;
    display: inline-block;
    padding: 0 22px;
  }
  .operation_item:hover{
    color: #333;
    position: relative;
  }
  .operation_item:hover::after{
    content: "";
    display: inline-block;
    position: absolute;
    bottom: 15px;
    left: calc(50% - 7px);
    width: 14px;
    height: 4px;
    background: #409eff;
  }
</style>
