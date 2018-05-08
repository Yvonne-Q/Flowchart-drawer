<template>
  <div class="left_container">
    <el-button type="primary" class="new_btn" @click="newFile">新建文件</el-button>
    <el-menu default-active="1" class="el-menu-vertical-demo">
      <el-menu-item index="1" @click="defaultfile()">
        <i class="el-icon-menu"></i>
        <span slot="title">我的文件</span>
      </el-menu-item>
      <el-menu-item index="2" @click="latestEdit()">
        <i class="el-icon-time"></i>
        <span slot="title">最近修改</span>
      </el-menu-item>
      <el-menu-item index="3" @click="collection()">
        <i class="el-icon-star-off"></i>
        <span slot="title">我的收藏</span>
      </el-menu-item>
      <el-menu-item index="4" @click="recycle()">
        <i class="el-icon-delete"></i>
        <span slot="title">回收站</span>
      </el-menu-item>
    </el-menu>
    <div class="files_info" style="display: block;">
      <div class="bars-des">
        <span class="filecount">文件数  <span class="my_file">{{myFile}}</span> / <span class="all_file">{{allFile}}</span></span>
      </div>
      <div class="bars">
        <div class="bars-before" style="width: 71.4286%;"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'index-left',
  data: function () {
    const ilData = {
      myFile: 0,
      delFile: 0,
      allFile: 0
    }
    return ilData
  },
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  methods: {
    fileCount: function () {
      this.allFile = this.myFile + this.delFile
      return this.allFile
    },
    newFile: function () {
      let file = {
        userId: this.userId,
        fileName: '未命名文件',
        editTime: Date.parse(new Date()).toString(),
        fileStatus: 'available',
        fileThumb: '',
        cells: [],
        like: 0,
        collect: 0
      }
      this.$http.post('/api/file/createFile', file)
        .then((res) => {
          if (res.status === 200) {
            let fileId = res.data._id
            let path = '/draw/' + fileId
            this.$router.push({path: path})
          }
        })
    },
    recycle: function () {
      this.$emit('showFile', 'recycle')
    },
    defaultfile: function () {
      this.$emit('showFile', 'myFile')
    },
    latestEdit: function () {
      this.$emit('showFile', 'latest')
    },
    collection: function () {
      this.$emit('showFile', 'collection')
    }
  },
  mounted: function () {
    this.$http({
      url: '/api/file/getFile',
      method: 'get',
      headers: {
        'Content-Type': 'x-www-from-urlencoded'
      },
      params: {
        userId: this.userId
      }
    }).then(function (response) {
      this.allFile = response.data.length
      for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].fileStatus === 'unavailable') {
          this.delFile++
        }
      }
      this.myFile = this.allFile - this.delFile
      let barWidth = this.myFile / this.allFile * 100
      $('.bars-before').css({width: barWidth + '%'})
    })
  }
}
</script>

<style scoped>
  .left_container{
    position: relative;
    height: 100%;
  }
  .el-menu{
    border: none;
    margin-top: 10px;
    background: transparent;
  }
  .el-menu-item:hover{
    background-color: transparent;
  }
  .el-menu-item.is-active {
    background-color: transparent;
  }
  .files_info{
    position: absolute;
    bottom: 70px;
    left: 18px;
    width: 175px;
    z-index: 2;
  }
  .files_info .bars-des {
    position: absolute;
    left: 0;
    top: -22px;
    z-index: 2;
    font-size: 12px;
    color: #666;
    display: block;
    width: 100%;
    text-align: left;
  }
  .files_info .bars {
    height: 8px;
    border: 1px solid #ddd;
    border-radius: 2px;
  }
  .files_info .bars-before {
    width: 0;
    position: absolute;
    left: 0;
    transition: width .5s;
    top: 0;
    z-index: 2;
    height: 8px;
    background: #4386f5;
    border: 1px solid #4386f5;
    border-radius: 2px;
    max-width: 175px;
  }
</style>
