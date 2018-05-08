<template>
  <div class="main-index">
    <div class="main_title" v-if="titleShow">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">我的文件</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="operation_container">
        <div>
          <el-tooltip class="item" effect="dark" content="搜索" placement="bottom">
            <span class="el-icon-search operation_item" @click="searchToggle"></span>
          </el-tooltip>
        </div>
        <div v-on-clickaway="hideSort">
          <el-tooltip class="item" effect="dark" content="排序" placement="bottom">
            <span class="el-icon-flowchart-sort operation_item" @click.stop="sortToggle"></span>
          </el-tooltip>
        </div>
        <!--<div>-->
          <!--<el-tooltip class="item" effect="dark" content="列表" placement="bottom">-->
            <!--<span class="el-icon-flowchart-list operation_item" style="margin-right: 0;"></span>-->
          <!--</el-tooltip>-->
        <!--</div>-->
      </div>
      <div class="search_part" :class="{'active_input': searchFlag}">
        <input type="text" class="search_input" placeholder="请输入搜索内容"  @click="searchFile()"/>
      </div>
      <ul class="sort_menu menu" v-if="sortContainer">
        <li><a href="javascript:;" @click="sortSelect(1)"><span class="icon" :class="{'el-icon-check': sortType == '1' ? true : false}"></span>标题</a></li>
        <li><a href="javascript:;" @click="sortSelect(2)"><span class="icon" :class="{'el-icon-check': sortType == '2' ? true : false}"></span>最后修改时间</a></li>
      </ul>
    </div>
    <div class="main_content">
      <div class="file_list" :class="{recommend_list: menu==='recommend'?true:false}">
        <!--带缩略图 file_item start-->
        <div v-if="listType == '1'" class="file_item recommend" :class="{active: item.menuFlag}" v-for="item in showFiles" :key="item.fileId">
          <div class="file_img_container" @click="fileDetail(item)">
            <img :src="item.fileThumb" />
            <div class="social_contact">
              <div class="like_part">
                <span class="icon el-icon-flowchart-like-off"></span>
                <span class="like_num">({{item.like}})</span>
              </div>
              <div class="collect_part">
                <span class="icon el-icon-star-off"></span>
                <span class="collect_num">({{item.collect}})</span>
              </div>
            </div>
          </div>
          <div class="file_title">
            <a href="javascript:;"><span class="file_type el-icon-flowchart-flowchart"></span><span class="file-name" :editTime="item.editTime">{{item.fileName}}</span></a>
          </div>
          <div v-if="!socialFlag" v-on-clickaway="hideModal" class="op_container"><span class="el-icon-more op" @click.stop="menuToggle(item)"></span></div>
          <div class="file_menu menu">
            <ul class="menu_list">
              <li>
                <a href="javascript:;" @click="renameFun(item)"><span class="el-icon-edit rename"></span>重命名</a>
              </li>
              <li v-if="content === 'recycle'">
                <a href="javascript:;" @click="recoverFun(item)"><span class="el-icon-refresh delete"></span>恢复</a>
              </li>
              <li v-if="content === 'recycle'">
                <a href="javascript:;" @click="deleteFun(item)"><span class="el-icon-delete delete"></span>彻底删除</a>
              </li>
              <li v-else>
                <a href="javascript:;" @click="deleteFun(item)"><span class="el-icon-delete delete"></span>删除</a>
              </li>
            </ul>
          </div>
        </div>
        <!--带缩略图 file_item end-->
      </div>
    </div>
    <!--文件重命名弹框 start-->
    <el-dialog title="文件重命名" :visible.sync="rename">
      <el-form :model="selectFile">
        <el-form-item label="文件名称" label-width="120px">
          <el-input v-model="selectFile.fileName" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rename = false">取 消</el-button>
        <el-button type="primary" @click="changeName()">确 定</el-button>
      </div>
    </el-dialog>
    <!--文件重命名弹框 end-->
    <!--文件删除确认框 start-->
    <el-dialog title="确认信息" :visible.sync="deleteFlag">
      <span>{{deleteText}}</span>
      <el-dialog
        width="30%"
        title="删除成功"
        :visible.sync="deleteConfirm"
        append-to-body>
      </el-dialog>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteFlag = false">取 消</el-button>
        <el-button type="primary" @click="deleteFile()">确定</el-button>
      </div>
    </el-dialog>
    <!--文件删除确认框 end-->
    <!--推荐文件大图弹出框 start-->
    <el-dialog :title="selectFile.fileName" :visible.sync="recommendPic" width="60%">
      <div class="img_container">
        <img class="recommend_pic" :src="selectFile.fileThumb"/>
      </div>
      <span slot="footer" class="dialog-footer">
        <div class="operation">
          <el-button type="text" class="like_btn" @click="likeIt()"><span v-if="liked" class="icon el-icon-flowchart-like-on"></span><span v-else class="icon el-icon-flowchart-like-off"></span>点赞</el-button>
          <el-button type="text" class="collect_btn" @click="collectIt()"><span v-if="collected" class="icon el-icon-star-on"></span><span v-else class="icon el-icon-star-off"></span>收藏</el-button>
        </div>
      </span>
    </el-dialog>
    <!--推荐文件大图弹出框 end-->
  </div>
</template>

<script>
import $ from 'jquery'
import { mixin as clickaway } from 'vue-clickaway'
export default {
  mixins: [ clickaway ],
  name: 'index-content',
  data: function () {
    return {
      sortContainer: false,
      sortType: '1',
      searchFlag: false,
      listType: '1',
      files: [],
      rename: false,
      download: false,
      deleteFlag: false,
      deleteConfirm: false,
      myFile: [],
      delFile: [],
      latestFile: [],
      collectFile: [],
      selectFile: {
        fileId: '',
        fileName: '',
        editTime: '',
        menuFlag: true,
        fileThumb: '',
        like: 0,
        collect: 0,
        fileStatus: 'available'
      },
      showFiles: [],
      recommendFiles: [],
      titleShow: true,
      recommendPic: false,
      liked: false,
      collected: false,
      collectRecord: '',
      likeRecord: '',
      socialFlag: false,
      deleteText: '是否确认删除该文件？'
    }
  },
  props: {
    userId: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    menu: {
      type: String,
      required: true
    }
  },
  watch: {
    'content': {
      handler: function (val, oldVal) {
        if (val === 'recycle') {
          this.showFiles = this.delFile
        } else if (val === 'latest') {
          this.showFiles = this.latestFile
        } else if (val === 'collection') {
          this.showFiles = this.collectFile
          console.log(this.showFiles)
        } else {
          this.showFiles = this.myFile
        }
        this.socialChange()
      },
      deep: true
    },
    'menu': {
      handler: function (val, oldVal) {
        if (val === 'mine') {
          this.titleShow = true
          this.showFiles = this.myFile
          this.content = 'myFile'
        } else {
          this.titleShow = false
          this.showFiles = this.recommendFiles
        }
        this.socialChange()
      },
      deep: true
    }
  },
  methods: {
    menuToggle: function (targetObj) {
      targetObj.menuFlag = !targetObj.menuFlag
    },
    hideModal: function () {
      this.files.forEach(function (item) {
        item.menuFlag = false
      })
    },
    sortTime: function (a, b) {
      return b - a
    },
    sortSelect: function (type) { // type:1-标题 2-时间
      this.sortContainer = false
      if (type === '1') {
        this.showFiles = this.showFiles.sort()
      } else {
        this.showFiles = this.showFiles.sort(this.sortTime)
      }
    },
    sortToggle: function () {
      this.sortContainer = !this.sortContainer
    },
    hideSort: function () {
      this.sortContainer = false
    },
    searchToggle: function () {
      this.searchFlag = !this.searchFlag
    },
    searchFile: function () {
      $('.search_input').on('keyup change', function () {
        var sea = $('.search_input').val()
        $('.file-name').each(function () {
          if ($(this).html().indexOf(sea) !== -1) {
            $(this).parents('.file_item').show()
          } else {
            $(this).parents('.file_item').hide()
          }
        })
      })
    },
    getLatestTime: function () {
      let timestamp = new Date().getTime()
      let latestTime = timestamp - 7 * 24 * 3600 * 1000
      return latestTime
    },
    renameFun: function (item) {
      this.selectFile.fileId = item.fileId
      this.selectFile.fileName = item.fileName
      this.selectFile.editTime = Date.parse(new Date()).toString()
      this.selectFile.menuFlag = item.menuFlag
      this.selectFile.like = item.like
      this.selectFile.collect = item.collect
      this.selectFile.fileThumb = item.fileThumb
      this.rename = true
    },
    changeName: function () {
      let that = this
      let params = {
        editProps: 'name',
        id: this.selectFile.fileId,
        fileName: this.selectFile.fileName,
        editTime: this.selectFile.editTime
      }
      this.$http.post('/api/file/editFile', params)
        .then((res) => {
          if (res.status === 200) {
            this.files.forEach(function (item) {
              if (item.fileId === that.selectFile.fileId) {
                item.fileName = that.selectFile.fileName
              }
            })
            this.$message('文件重命名成功！')
          }
        })
      this.rename = false
    },
    deleteFun: function (item) {
      this.selectFile.fileId = item.fileId
      this.selectFile.fileName = item.fileName
      this.selectFile.editTime = Date.parse(new Date()).toString()
      this.selectFile.menuFlag = item.menuFlag
      this.selectFile.like = item.like
      this.selectFile.collect = item.collect
      this.selectFile.fileThumb = item.fileThumb
      this.deleteFlag = true
    },
    deleteFile: function () {
      let that = this
      if (that.content === 'recycle') {
        that.deleteText = '是否确认彻底删除该文件？'
        this.$http.get('/api/file/deleteFile', {fileId: this.selectFile.fileId})
          .then((res) => {
            if (res.status === 200) {
              that.delFile.forEach(function (item, index) {
                if (item.fileId === file.fileId) {
                  that.delFile.splice(index, 1)
                }
              })
              that.showFiles = that.delFile
              this.$message('文件已被彻底删除！')
            }
          })
      } else {
        that.deleteText = '是否确认删除该文件？'
        let params = {
          editProps: 'status',
          id: this.selectFile.fileId,
          fileStatus: 'unavailable',
          editTime: this.selectFile.editTime
        }
        this.$http.post('/api/file/editFile', params)
          .then((res) => {
            console.log(res)
            if (res.status === 200) {
              that.deleteConfirm = true
              that.deleteFlag = false
              that.myFile.forEach(function (item, index) {
                if (item.fileId === that.selectFile.fileId) {
                  item.fileStatus = that.selectFile.fileStatus
                  that.myFile.splice(index, 1)
                  that.delFile.push(item)
                }
              })
              that.showFiles = that.myFile
              this.$message('文件已被删除，可在回收站中恢复！')
            }
          })
      }
    },
    editFile: function (item) {
      let path = '/draw/' + item.fileId
      this.$router.push({path: path})
    },
    recoverFun: function (file) {
      let that = this
      let params = {
        editProps: 'status',
        id: file.fileId,
        fileStatus: 'available',
        editTime: Date.parse(new Date()).toString()
      }
      this.$http.post('/api/file/editFile', params)
        .then((res) => {
          console.log(res)
          if (res.status === 200) {
            that.delFile.forEach(function (item, index) {
              if (item.fileId === file.fileId) {
                item.fileStatus = file.fileStatus
                that.delFile.splice(index, 1)
                that.myFile.push(item)
              }
            })
            this.$message('文件恢复成功！')
            that.showFiles = that.delFile
          }
        })
    },
    showPic: function (item) {
      this.selectFile.fileId = item.fileId
      this.selectFile.fileName = item.fileName
      this.selectFile.editTime = Date.parse(new Date()).toString()
      this.selectFile.menuFlag = item.menuFlag
      this.selectFile.like = item.like
      this.selectFile.collect = item.collect
      this.selectFile.fileThumb = item.fileThumb
      this.recommendPic = true
      this.liked = false
      this.collected = false
      let params = {
        userId: this.userId,
        fileId: this.selectFile.fileId
      }
      this.$http({
        url: '/api/collect/getCollectionByAll',
        method: 'get',
        headers: {
          'Content-Type': 'x-www-from-urlencoded'
        },
        params: params
      }).then((res) => {
        if (res.data.length > 0) {
          this.collected = true
          this.collectRecord = res.data._id
        }
      })
      this.$http({
        url: '/api/like/getLikeByAll',
        method: 'get',
        headers: {
          'Content-Type': 'x-www-from-urlencoded'
        },
        params: params
      }).then((res) => {
        console.log(res)
        if (res.data.length > 0) {
          this.liked = true
          this.likeRecord = res.data._id
        }
      })
    },
    fileDetail: function (item) {
      if ((this.menu === 'mine') && (this.content !== 'collection')) {
        this.editFile(item)
      } else {
        this.showPic(item)
      }
    },
    likeIt: function () {
      let that = this
      if (that.liked) {
        let likeParams = {
          id: that.likeRecord
        }
        this.$http.get('/api/like/deleteLike', likeParams)
          .then((res) => {
            if (res.status === 200) {
              that.liked = false
              that.selectFile.like--
              this.$message('文件取消点赞成功！')
            }
          })
      } else {
        let likeParams = {
          userId: that.userId,
          fileId: that.selectFile.fileId
        }
        this.$http.post('/api/like/createLike', likeParams)
          .then((res) => {
            if (res.status === 200) {
              that.liked = true
              that.selectFile.like++
              this.$message('文件点赞成功！')
            }
          })
      }
      let editLike = {
        editProps: 'like',
        id: that.selectFile.fileId,
        like: that.selectFile.like
      }
      this.$http.post('/api/file/editFile', editLike)
        .then((res) => {
          if (res.status === 200) {
            that.recommendFiles.forEach(function (item, index) {
              if (item.fileId === that.selectFile.fileId) {
                item.like = that.selectFile.like
              }
            })
            that.showFiles = that.recommendFiles
          }
        })
    },
    collectIt: function () {
      let that = this
      if (that.collected) {
        let collectParams = {
          id: that.collectRecord
        }
        this.$http.get('/api/collect/deleteCollection', collectParams)
          .then((res) => {
            if (res.status === 200) {
              that.collectFile.forEach(function (item, index) {
                if (item.fileId === that.selectFile.fileId) {
                  that.collectFile.splice(index, 1)
                }
              })
              that.collected = false
              that.selectFile.collect--
              this.$message('文件取消收藏成功！')
            }
          })
      } else {
        let collectParams = {
          userId: that.userId,
          fileId: that.selectFile.fileId
        }
        this.$http.post('/api/collect/createCollection', collectParams)
          .then((res) => {
            if (res.status === 200) {
              this.collectFile.push(that.selectFile)
              that.collected = true
              that.selectFile.collect++
              this.$message('文件收藏成功！')
            }
          })
      }
      let params = {
        editProps: 'collect',
        id: that.selectFile.fileId,
        collect: that.selectFile.collect
      }
      this.$http.post('/api/file/editFile', params)
        .then((res) => {
          if (res.status === 200) {
            that.recommendFiles.forEach(function (item, index) {
              if (item.fileId === that.selectFile.fileId) {
                item.collect = that.selectFile.collect
              }
            })
            that.showFiles = that.recommendFiles
          }
        })
    },
    socialChange: function () {
      console.log(this.menu, this.content)
      if (this.menu === 'recommend') {
        this.socialFlag = true
      } else if (this.content === 'collection') {
        this.socialFlag = true
      } else {
        this.socialFlag = false
      }
    }
  },
  mounted: function () {
    let latestTime = this.getLatestTime()
    let that = this
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
      for (let i = 0; i < response.data.length; i++) {
        let file = {}
        file.fileId = response.data[i]._id
        file.fileName = response.data[i].fileName
        file.editTime = response.data[i].editTime
        file.fileStatus = response.data[i].fileStatus
        file.menuFlag = false
        if (response.data[i].fileThumb) {
          file.fileThumb = response.data[i].fileThumb
        } else {
          file.fileThumb = '../static/images/file_thumb.png'
        }
        if (response.data[i].like) {
          file.like = response.data[i].like
        } else {
          file.like = 0
        }
        if (response.data[i].collect) {
          file.collect = response.data[i].collect
        } else {
          file.collect = 0
        }
        this.files.push(file)
        if (file.fileStatus === 'available') {
          this.myFile.push(file)
        } else if (file.fileStatus === 'unavailable') {
          this.delFile.push(file)
        }
        if (file.editTime > latestTime) {
          this.latestFile.push(file)
        }
      }
      this.showFiles = this.myFile
      this.sortSelect('1')
    })
    this.$http({
      url: '/api/file/getAllFile',
      method: 'get',
      headers: {
        'Content-Type': 'x-www-from-urlencoded'
      }
    }).then((res) => {
      for (let i = 0; i < res.data.length; i++) {
        let file = {}
        file.fileId = res.data[i]._id
        file.fileName = res.data[i].fileName
        file.editTime = res.data[i].editTime
        file.fileStatus = res.data[i].fileStatus
        file.menuFlag = false
        if (res.data[i].fileThumb) {
          file.fileThumb = res.data[i].fileThumb
        } else {
          file.fileThumb = '../static/images/file_thumb.png'
        }
        if (res.data[i].like) {
          file.like = res.data[i].like
        } else {
          file.like = 0
        }
        if (res.data[i].collect) {
          file.collect = res.data[i].collect
        } else {
          file.collect = 0
        }
        this.recommendFiles.push(file)
      }
    })
    this.$http({
      url: '/api/collect/getCollection',
      method: 'get',
      headers: {
        'Content-Type': 'x-www-from-urlencoded'
      },
      params: {
        userId: this.userId
      }
    }).then((res) => {
      for (let i = 0; i < res.data.length; i++) {
        this.$http({
          url: '/api/file/getFileByFileid',
          method: 'get',
          headers: {
            'Content-Type': 'x-www-from-urlencoded'
          },
          params: {
            id: res.data[i].fileId
          }
        }).then(function (response) {
          let file = {}
          file.fileId = response.data[0]._id
          file.fileName = response.data[0].fileName
          file.editTime = response.data[0].editTime
          file.fileStatus = response.data[0].fileStatus
          file.menuFlag = false
          if (response.data[0].fileThumb) {
            file.fileThumb = response.data[0].fileThumb
          } else {
            file.fileThumb = '../static/images/file_thumb.png'
          }
          if (response.data[0].like) {
            file.like = response.data[0].like
          } else {
            file.like = 0
          }
          if (response.data[0].collect) {
            file.collect = response.data[0].collect
          } else {
            file.collect = 0
          }
          that.collectFile.push(file)
        })
      }
    })
  }
}
</script>

<style scoped>
  [class*=" el-icon-"], [class^=el-icon-] {
    font-size: 18px;
  }
  .menu{
    position: absolute;
    min-width: 140px;
    background: #fff;
    z-index: 1;
    border: 1px solid #ddd;
    box-shadow: 0 1px 6px #ccc;
    border-radius: 3px;
    display: none;
  }
  .menu:before {
    position: absolute;
    left: 50%;
    margin-left: -8px;
    top: -16px;
    border: 8px solid transparent;
    border-bottom: 8px solid #ccc;
    content: "";
    width: 0;
    height: 0;
  }
  .menu:after {
    position: absolute;
    left: 50%;
    margin-left: -8px;
    top: -15px;
    border: 8px solid transparent;
    border-bottom: 8px solid #fff;
    content: "";
    width: 0;
    height: 0;
  }
  .menu li>a{
    display: block;
    text-align: left;
    padding: 7px 10px;
    color: #444;
    line-height: 20px;
  }
  .menu li>a:first-child {
    margin-top: 8px;
  }
  .menu li>a:last-child {
    margin-bottom: 4px;
  }
  .menu li>a>span{
    margin-right: 10px;
  }
  .menu li:hover{
    background:#e7e7e7;
    color:#000
  }
  .main_title{
    color: #666;
    height: 28px;
    line-height: 28px;
    font-size: 12px;
    position: fixed;
    width: calc(100% - 200px);
    z-index: 3;
    box-sizing: border-box;
    padding-right: 28px;
    background: #f2f2f2;
    margin-bottom: 10px;
  }
  .breadcrumb{
    float: left;
    line-height: 28px;
  }
  .operation_container{
    background: #f2f2f2;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 28px;
  }
  .operation_item {
    cursor: pointer;
    vertical-align: middle;
    margin: 0 10px;
  }
  .search_part{
    position: absolute;
    width: 0;
    right: calc(28px + 18px + 10px + 10px + 18px + 10px + 10px + 18px );
    z-index: -2;
    top: 0;
    -webkit-transition: all 1s;
    -moz-transition: all 1s;
    -ms-transition: all 1s;
    -o-transition: all 1s;
    transition: all 1s;
  }
  .search_input{
    width: 100%;
    height: 25px;
    line-height: 25px;
    border: none;
    border-bottom: 1px solid #9f9f9f;
    background-color: transparent;
    padding-left: 20px;
    box-sizing: border-box;
  }
  .search_part.active_input{
    -webkit-transition: all 1s;
    -moz-transition: all 1s;
    -ms-transition: all 1s;
    -o-transition: all 1s;
    transition: all 1s;
    width: 200px;
    z-index: 2;
  }
  .sort_menu{
    display: block;
    right: calc(28px + 18px + 10px + 10px + 10px + 9px - 70px);
    top: 30px;
  }
  .sort_menu>li>a .icon{
    font-size: 15px;
    display: inline-block;
    width: 30px;
  }
  .main_content{
    overflow-y: scroll;
    padding-top: calc(28px + 10px + 5px);
    width: 100%;
    text-align: center;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  .file_item{
    vertical-align: top;
    position: relative;
    display: inline-block;
    border-radius: 3px;
    min-width: 130px;
    max-width: 200px;
    margin:0  8px 15px;
    -webkit-transition: all .4s;
    -moz-transition: all .4s;
    -ms-transition: all .4s;
    -o-transition: all .4s;
    transition: all .4s;
    z-index: 1;
    cursor: pointer;
    float: left;
  }
  .file_item.active{
    z-index:3
  }
  .file_item:hover{
    z-index:2;
    -webkit-transform:translateY(-4px);
    -moz-transform:translateY(-4px);
    -ms-transform:translateY(-4px);
    -o-transform:translateY(-4px);
    transform:translateY(-4px)
  }
  .file_item>.file_img_container{
    position: relative;
    width: 200px;
    height: 200px;
    background-color: #fff;
  }
  .file_item>.file_img_container>img{
    display: block;
    min-height: 170px;
    height: 100%;
    width: 100%;
    border-radius: 5px;
    border: 1px solid #e6e6e6;
    box-shadow: 1px 1px 0 #dfdfdf;
  }
  .file_item>.file_title{
    display: block;
    text-align: center;
    font-size: 12px;
    margin-top: 4px;
    margin-bottom: 4px;
    line-height: 16px;
    max-height: 32px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: bold;
  }
  .file_title>a{
    color: #333;
    font-size: 13px;
    text-decoration: none;
  }
  .file_item>.op_container{
    position: absolute;
    width: 24px;
    height: 24px;
    right: -10px;
    top: -10px;
    background: #fff;
    font-size: 12px;
    text-align: center;
    line-height: 24px;
    -webkit-border-radius: 50%;
    color: #333;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    -webkit-box-shadow: 0 1px 1px rgba(0,0,0,.1);
    box-shadow: 0 1px 1px rgba(0,0,0,.1);
  }
  .op_container>.op{
    font-size: 12px;
    line-height: 24px;
    width: 100%;
    height: 100%;
  }
  .file_item:hover .op_container{
    display:inline-block
  }
  .file_item.active .op_container{
    display:inline-block
  }
  .file_item>.file_menu{
    top: 24px;
    right: -70px;
  }
  .file_title .file_type{
    color: #409EFF;
    font-size: 15px;
    margin-right: 5px;
  }
  .file_item.active .file_menu{
    display: block;
  }
  .file_list{
    width: calc(218px * 5);
    margin: 0 auto;
  }
  .recommend_list{
    width: calc(218px * 6);
  }
  .recommend{
    background-color: #fff;
    border-radius: 5px;
    border: 1px solid #e6e6e6;
    -webkit-box-shadow: 1px 1px 0 #dfdfdf;
    box-shadow: 1px 1px 0 #dfdfdf;
  }
  .recommend .file_img_container{
    width: 90%;
    margin: 5px auto;
  }
  .recommend .file_img_container>img{
    border: none;
    box-shadow: none;
    width: 100%;
    height: 180px;
  }
  .recommend .social_contact{
    display: flex;
    align-items: center;
    justify-content: space-around;
    font-size: 12px;
    color: #999;
  }
  .recommend .social_contact .like_part,.recommend .social_contact .collect_part{
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .recommend .social_contact .like_part .icon,.recommend .social_contact .collect_part .icon{
    margin-right: 5px;
  }
  .recommend_pic{
    width: 80%;
    margin: 0 auto;
  }
  .operation{
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .operation>button>span{
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .operation>button .icon{
    margin-right: 5px;
  }
  .operation .collect_btn{
    color: #E6A23C;
  }
  .operation .like_btn{
    color: #F56C6C;
  }
</style>
