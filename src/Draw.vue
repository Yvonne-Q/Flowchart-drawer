<!--/Draw.vue-->
<template>
  <div class="draw_page">
    <el-container class="page_content">
      <el-header height="86px" class="draw_header">
        <div class="title_bar">
          <div class="row">
            <el-button type="text" class="back_btn" @click="goBack()"><span class="el-icon-back"></span></el-button>
            <h4 class="file_name">{{file.fileName}}</h4>
          </div>
          <div class="row menubar">
            <ul class="menu_list">
              <li class="menu_item">
                <el-dropdown @command="fileCommand">
                  <span class="el-dropdown-link">
                    文件
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="rename">重命名文件</el-dropdown-item>
                    <!--<el-dropdown-item divided>另存为</el-dropdown-item>-->
                    <el-dropdown-item command="download">下载为...</el-dropdown-item>
                    <!--<el-dropdown-item divided>关闭</el-dropdown-item>-->
                  </el-dropdown-menu>
                </el-dropdown>
              </li>
              <li class="menu_item">
                <el-dropdown @command="handleCommand">
                  <span class="el-dropdown-link">
                    编辑
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <!--<el-dropdown-item>撤销</el-dropdown-item>-->
                    <!--<el-dropdown-item>恢复</el-dropdown-item>-->
                    <!--<el-dropdown-item :disabled="activeToggle()">剪切</el-dropdown-item>-->
                    <el-dropdown-item command="copy" :disabled="activeToggle()">复制</el-dropdown-item>
                    <!--<el-dropdown-item :disabled="activeToggle()">粘贴</el-dropdown-item>-->
                    <!--<el-dropdown-item divided>全选</el-dropdown-item>-->
                    <el-dropdown-item divided command="delete" :disabled="activeToggle()">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </li>
              <li class="menu_item">
                <el-dropdown @command="handleScale">
                  <span class="el-dropdown-link">
                    视图
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="bigger">放大</el-dropdown-item>
                    <el-dropdown-item command="smaller">缩小</el-dropdown-item>
                    <el-dropdown-item command="0.5" divided>50%</el-dropdown-item>
                    <el-dropdown-item command="0.75">75%</el-dropdown-item>
                    <el-dropdown-item command="1">100%</el-dropdown-item>
                    <el-dropdown-item command="1.5">150%</el-dropdown-item>
                    <el-dropdown-item command="2">200%</el-dropdown-item>
                    <el-dropdown-item command="1" divided>重置缩放</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </li>
              <!--<li class="menu_item">-->
                <!--<el-dropdown>-->
                  <!--<span class="el-dropdown-link">-->
                    <!--插入-->
                  <!--</span>-->
                  <!--<el-dropdown-menu slot="dropdown">-->
                    <!--<el-dropdown-item>文本</el-dropdown-item>-->
                    <!--<el-dropdown-item>连线</el-dropdown-item>-->
                  <!--</el-dropdown-menu>-->
                <!--</el-dropdown>-->
              <!--</li>-->
              <li class="menu_item">
                <el-dropdown @command="handlePage">
                  <span class="el-dropdown-link">
                    页面
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item class="canvas_colorcontainer">
                      背景颜色
                      <el-color-picker class="canvas_colorpicker" v-model="canvasBg" show-alpha :predefine="predefineColors" size="mini"></el-color-picker>
                    </el-dropdown-item>
                    <el-dropdown-item command="direction">页面方向</el-dropdown-item>
                    <el-dropdown-item command="grid" divided><i v-if="showGrid" class="el-icon-check"></i>显示网格</el-dropdown-item>
                    <!--<el-dropdown-item>网格大小</el-dropdown-item>-->
                  </el-dropdown-menu>
                </el-dropdown>
              </li>
              <!--<li class="menu_item">-->
                <!--<el-dropdown>-->
                  <!--<span class="el-dropdown-link">-->
                    <!--排列-->
                  <!--</span>-->
                  <!--<el-dropdown-menu slot="dropdown">-->
                    <!--<el-dropdown-item>置于顶层</el-dropdown-item>-->
                    <!--<el-dropdown-item>置于底层</el-dropdown-item>-->
                    <!--<el-dropdown-item>上移一层</el-dropdown-item>-->
                    <!--<el-dropdown-item>下移一层</el-dropdown-item>-->
                    <!--<el-dropdown-item divided>图形对齐</el-dropdown-item>-->
                    <!--<el-dropdown-item>图形分布</el-dropdown-item>-->
                    <!--<el-dropdown-item>匹配大小</el-dropdown-item>-->
                    <!--<el-dropdown-item divided>锁定</el-dropdown-item>-->
                    <!--<el-dropdown-item>解锁</el-dropdown-item>-->
                    <!--<el-dropdown-item divided>组合</el-dropdown-item>-->
                    <!--<el-dropdown-item>取消组合</el-dropdown-item>-->
                  <!--</el-dropdown-menu>-->
                <!--</el-dropdown>-->
              <!--</li>-->
            </ul>
          </div>
          <div class="share_container">
            <el-button @click="downloadDialog = true">下载</el-button>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                <div class="user_info">
                  <img class="user_pic" src="./assets/images/default-user.png"/>
                  <span class="user_name">用户111</span>
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </div>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>我的文件</el-dropdown-item>
                <el-dropdown-item divided>退出</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-container class="main_content">
              <el-aside width="200px" height="100%">
                <div class="map_container">
                  <h3 class="map_title">基本图元</h3>
                  <div class="map_content">
                    <div id="map_component"></div>
                  </div>
                </div>
              </el-aside>
              <el-container>
                <el-main class="main_left">
                  <div class="canvas_container">
                    <div class="canvas_box">
                      <div id="canvas_content">
                      </div>
                    </div>
            </div>
            <div class="toolbar_container">
              <div class="tool_bar">
                <ul class="toolbar_list">
                  <el-tooltip class="item" effect="dark" content="度量" placement="bottom" :disabled="activeToggle()">
                    <li class="toolbar_item measure_item" @click="selectToggle($event)">
                      <i class="el-icon-edit-outline"></i>
                    </li>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="图形" placement="bottom" :disabled="activeToggle()">
                    <li class="toolbar_item presentation_item" @click="selectToggle($event)">
                      <i class="el-icon-edit"></i>
                    </li>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="端点样式" placement="bottom" :disabled="activeToggle()">
                    <li class="toolbar_item point_item" @click="selectToggle($event)">
                      <i class="el-icon-flowchart-endpoint"></i>
                    </li>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="字体加粗" placement="bottom" :disabled="activeToggle()">
                    <li class="toolbar_item" @click="fontBold($event)">
                      <i class="el-icon-flowchart-bold"></i>
                    </li>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="字体大小" placement="bottom" :disabled="activeToggle()">
                    <li class="toolbar_item" @click="selectToggle($event)">
                      <i class="el-icon-flowchart-color"></i>
                    </li>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="下划线" placement="bottom" :disabled="activeToggle()">
                    <li class="toolbar_item" @click="selectToggle($event)">
                      <i class="el-icon-flowchart-underline"></i>
                    </li>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="对齐方式" placement="bottom" :disabled="activeToggle()">
                    <li class="toolbar_item alignment_item" @click="selectToggle($event)">
                      <i class="el-icon-rank"></i>
                    </li>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="字体颜色" placement="bottom" :disabled="activeToggle()">
                    <li class="toolbar_item color_picker" @click="selectToggle($event)">
                      <el-color-picker v-model="activeCell.fontColor" show-alpha :predefine="predefineColors" size="mini">
                        <i class="el-icon-flowchart-color"></i>
                      </el-color-picker>
                    </li>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="连线颜色" placement="bottom" :disabled="activeToggle()">
                    <li class="toolbar_item color_picker" @click="selectToggle($event)">
                      <el-color-picker v-model="activeLink.connection" show-alpha :predefine="predefineColors" size="mini">
                        <i class="el-icon-flowchart-color"></i>
                      </el-color-picker>
                    </li>
                  </el-tooltip>
                </ul>
              </div>
            </div>
            <div class="property_panel" v-if="measurePanel || presentationPanel">
              <div class="style_operation">
                <div class="inspector-container">
                  <div class="measure" v-if="measurePanel">
                    <h4 class="style_head">度量</h4>
                    <el-form class="measure_form" label-width="80px">
                      <el-form-item label="位置X">
                        <el-input v-model="activeCell.x"></el-input>
                      </el-form-item>
                      <el-form-item label="位置Y">
                        <el-input v-model="activeCell.y"></el-input>
                      </el-form-item>
                      <el-form-item label="图形宽">
                        <el-input v-model="activeCell.width"></el-input>
                      </el-form-item>
                      <el-form-item label="图形高">
                        <el-input v-model="activeCell.height"></el-input>
                      </el-form-item>
                    </el-form>
                  </div>
                  <div class="presentation" v-if="presentationPanel">
                    <h4 class="style_head">图形</h4>
                    <el-form class="presentation_form" label-width="80px">
                      <el-form-item label="边框颜色">
                        <el-color-picker v-model="activeCell.borderColor" show-alpha :predefine="predefineColors" size="mini">
                        </el-color-picker>
                      </el-form-item>
                      <el-form-item label="边框样式">
                        <el-select id="outline-styles" placeholder="边框样式" v-model="activeCell.borderType">
                          <el-option label="solid" value="solid" data-style="0">solid</el-option>
                          <el-option label="dashed" value="dashed" data-style="2,5">dashed</el-option>
                          <el-option label="dotted" value="dotted" data-style="10,5">dotted</el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="边框粗细">
                        <el-input-number v-model="activeCell.borderWidth" id="outline-thickness" :min="1" :max="30" label="边框粗细"></el-input-number>
                      </el-form-item>
                      <el-form-item label="填充颜色">
                        <el-color-picker v-model="activeCell.fillColor" show-alpha :predefine="predefineColors" size="mini">
                        </el-color-picker>
                      </el-form-item>
                    </el-form>
                  </div>
                </div>
              </div>
            </div>
            <div class="alignment_panel" v-if="alignmentPanel">
              <!--横向-->
              <div class="horizontal_group">
                <el-tooltip class="horizontal_item" effect="dark" content="左对齐" placement="bottom">
                  <span class="el-icon-flowchart-left"></span>
                </el-tooltip>
                <el-tooltip class="horizontal_item" effect="dark" content="居中对齐" placement="bottom">
                  <span class="el-icon-flowchart-center"></span>
                </el-tooltip>
                <el-tooltip class="horizontal_item" effect="dark" content="右对齐" placement="bottom">
                  <span class="el-icon-flowchart-right"></span>
                </el-tooltip>
              </div>
              <!--纵向-->
              <div class="portrait_group">
                <el-tooltip class="portrait_item" effect="dark" content=" 上对齐" placement="bottom">
                  <span class="el-icon-flowchart-top"></span>
                </el-tooltip>
                <el-tooltip class="portrait_item" effect="dark" content="居中对齐" placement="bottom">
                  <span class="el-icon-flowchart-middle"></span>
                </el-tooltip>
                <el-tooltip class="portrait_item" effect="dark" content="下对齐" placement="bottom">
                  <span class="el-icon-flowchart-bottom"></span>
                </el-tooltip>
              </div>
            </div>
            <div class="point_panel" v-if="pointPanel">
              <!--起点-->
              <div class="start_group">
                <el-tooltip class="start_item" effect="dark" content="直线" placement="bottom">
                  <span class="el-icon-flowchart-line start_line" @click="pointStyle($event)"></span>
                </el-tooltip>
                <el-tooltip class="start_item" effect="dark" content="箭头" placement="bottom">
                  <span class="el-icon-flowchart-startarrow start_arrow" @click="pointStyle($event)"></span>
                </el-tooltip>
              </div>
              <!--终点-->
              <div class="end_group">
                <el-tooltip class="end_item" effect="dark" content="直线" placement="bottom">
                  <span class="el-icon-flowchart-line end_line" @click="pointStyle($event)"></span>
                </el-tooltip>
                <el-tooltip class="end_item" effect="dark" content="箭头" placement="bottom">
                  <span class="el-icon-flowchart-endarrow end_arrow" @click="pointStyle($event)"></span>
                </el-tooltip>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-container>
      <!--文件下载弹框 start-->
      <el-dialog title="下载格式" :visible.sync="downloadDialog">
        <el-form :model="downloadForm">
          <el-form-item label="">
            <el-radio-group v-model="downloadForm.format">
              <el-radio label="svg">SVG文件(*.svg) 导出为SVG矢量图形</el-radio>
              <el-radio label="png">图片文件(*.png) 将文件导出为图片</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="downloadDialog = false">取 消</el-button>
          <el-button type="primary" @click="downloadFile()">确定</el-button>
        </div>
      </el-dialog>
      <!--文件下载弹框 end-->
      <!--文件重命名弹框 start-->
      <el-dialog title="文件重命名" :visible.sync="rename">
        <el-form :model="selectFile">
          <el-form-item label="文件名称" label-width="120px">
            <el-input v-model="file.fileName" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="rename = false">取 消</el-button>
          <el-button type="primary" @click="changeName()">确 定</el-button>
        </div>
      </el-dialog>
      <!--文件重命名弹框 end-->
    </el-container>
  </div>
</template>

<script>
import drawObj from './assets/js/jointinit'
export default {
  name: 'draw',
  data () {
    return {
      deal_options: this.dealWidthOptions(), // 处理父组件传过来的参数
      isCollapse: true,
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577'
      ],
      propertyPanel: false,
      measurePanel: false,
      presentationPanel: false,
      pointPanel: false,
      alignmentPanel: false,
      activeCell: drawObj.activeCell,
      activeLink: drawObj.linkActive,
      canvasBg: drawObj.canvasBg,
      showGrid: true,
      file: {
        _id: this.$route.params.fileid,
        userId: '',
        fileName: '未命名文件',
        editTime: Date.parse(new Date()).toString(),
        fileStatus: 'available',
        fileThumb: '',
        cells: '',
        like: 0,
        collect: 0
      },
      downloadForm: {
        format: 'svg',
        tip: '下载成功！'
      },
      downloadDialog: false,
      rename: false
    }
  },
  watch: {
    'activeCell': {
      handler: function (val, oldVal) {
        drawObj.propertyPane(val)
      },
      deep: true
    },
    'activeLink': {
      handler: function (val, oldVal) {
        drawObj.linkPane(val)
      },
      deep: true
    },
    'canvasBg': {
      handler: function (val, oldVal) {
        drawObj.setPaperBackground(val)
      },
      deep: true
    }
  },
  computed: {

  },
  mounted () {
    if (typeof this.deal_options !== 'undefined') {
      drawObj.initPaper({
        'options': this.deal_options
      })
    } else {
      alert('参数值错误')
    }
    console.log(this.file._id)
    this.$http({
      url: '/api/file/getFileByFileid',
      method: 'get',
      headers: {
        'Content-Type': 'x-www-from-urlencoded'
      },
      params: {
        id: this.file._id
      }
    }).then((res) => {
      let file = res.body[0]
      this.file.userId = file.userId
      this.file.fileName = file.fileName
      this.file.editTime = file.editTime
      this.file.fileStatus = file.fileStatus
      this.file.fileThumb = file.fileThumb
      this.file.cells = file.cells
      this.file.like = file.like
      this.file.collect = file.collect
      if (this.file.cells) {
        drawObj.setSvgData(JSON.parse(this.file.cells))
      }
    })
  },
  methods: {
    dealWidthOptions () { // 处理父组件传过来的参数
      let newOptions = {
        'basic_attributes': true, // 其他 内容区块1
        'basic_figure': true, // 左边图库（定死）
        'action_buttons': true, // 清除，组合等按钮
        'add_attributes': true, // 其他内容区块2
        'style_operation': true, // 样式面板
        'thumbnail': false, // 缩略图
        'figure_buttons': true, // 图形操作按钮，拉伸，旋转等
        'single_click': false, // 单击图形事件
        'double_click': true, // 双击图形事件
        'label': true, // 图形名称和基本属性
        'move_figure': true, // 是否可移动中间画布图形
        'gallery': [], // 左边图库数据（请求数据）
        'refer_line': true, // 是否需要参考基线
        'layer': false,
        'isArea': false
      }
      return newOptions
    },
    selectToggle: function (trigger) {
      if (trigger.currentTarget.classList.contains('selected')) {
        trigger.currentTarget.classList.remove('selected')
        if (trigger.currentTarget.classList.contains('measure_item')) {
          this.measurePanel = false
        } else if (trigger.currentTarget.classList.contains('presentation_item')) {
          this.presentationPanel = false
        } else if (trigger.currentTarget.classList.contains('alignment_item')) {
          this.alignmentPanel = false
        } else if (trigger.currentTarget.classList.contains('point_item')) {
          this.pointPanel = false
        }
        return 'unselect'
      } else {
        trigger.currentTarget.classList.add('selected')
        if (trigger.currentTarget.classList.contains('measure_item')) {
          this.measurePanel = true
        } else if (trigger.currentTarget.classList.contains('presentation_item')) {
          this.presentationPanel = true
        } else if (trigger.currentTarget.classList.contains('alignment_item')) {
          this.alignmentPanel = true
        } else if (trigger.currentTarget.classList.contains('point_item')) {
          this.pointPanel = true
        }
        return 'selected'
      }
    },
    fontBold: function (trigger) {
      let flag = this.selectToggle(trigger)
      if (flag === 'unselect') {
        this.activeCell.fontWeight = 'normal'
      } else {
        this.activeCell.fontWeight = 'bold'
      }
    },
    pointStyle: function (trigger) {
      if (trigger.currentTarget.classList.contains('start_line')) {
        if (trigger.currentTarget.classList.contains('selected')) {
          trigger.currentTarget.classList.remove('selected')
          document.getElementsByClassName('start_arrow')[0].classList.add('selected')
          this.activeLink.source = 'arrow'
        } else {
          trigger.currentTarget.classList.add('selected')
          this.activeLink.source = 'line'
        }
      } else if (trigger.currentTarget.classList.contains('start_arrow')) {
        if (trigger.currentTarget.classList.contains('selected')) {
          trigger.currentTarget.classList.remove('selected')
          document.getElementsByClassName('start_line')[0].classList.add('selected')
          this.activeLink.source = 'line'
        } else {
          trigger.currentTarget.classList.add('selected')
          document.getElementsByClassName('start_line')[0].classList.remove('selected')
          this.activeLink.source = 'arrow'
        }
      } else if (trigger.currentTarget.classList.contains('end_line')) {
        if (trigger.currentTarget.classList.contains('selected')) {
          trigger.currentTarget.classList.remove('selected')
          document.getElementsByClassName('end_arrow')[0].classList.add('selected')
          this.activeLink.target = 'arrow'
        } else {
          trigger.currentTarget.classList.add('selected')
          document.getElementsByClassName('end_arrow')[0].classList.remove('selected')
          this.activeLink.target = 'line'
        }
      } else {
        if (trigger.currentTarget.classList.contains('selected')) {
          trigger.currentTarget.classList.remove('selected')
          document.getElementsByClassName('end_line')[0].classList.add('selected')
          this.activeLink.target = 'line'
        } else {
          trigger.currentTarget.classList.add('selected')
          document.getElementsByClassName('end_line')[0].classList.remove('selected')
          this.activeLink.target = 'arrow'
        }
      }
    },
    activeToggle: function () {
      return !drawObj.activeFlag
    },
    handleCommand: function (command) {
      if (command === 'copy') {
        drawObj.copySelf()
      } else if (command === 'delete') {
        drawObj.delSelf()
      }
    },
    fileCommand: function (command) {
      if (command === 'download') {
        this.downloadDialog = true
      } else if (command === 'rename') {
        this.rename = true
      }
    },
    handlePage: function (changeType) {
      if (changeType === 'direction') {
        let direction = drawObj.changeDirection()
        if (direction === 'horizontal') {
          this.$message('页面方向已设置为横向')
        } else {
          this.$message('页面方向已设置为竖向')
        }
      } else if (changeType === 'grid') {
        drawObj.gridToggle(this.showGrid)
        this.showGrid = !this.showGrid
      }
    },
    handleScale: function (scale) {
      let scaleStatus = drawObj.setPaperScale(scale)
      if (scaleStatus) {
        this.$message('画布缩放成功！')
      }
    },
    goBack: function () {
      let paperData = drawObj.centerGraph.getCells()
      drawObj.saveThumb()
      setTimeout(() => {
        let params = {
          editProps: 'all',
          userId: this.file.userId,
          fileName: this.file.fileName,
          editTime: Date.parse(new Date()).toString(),
          fileStatus: this.file.fileStatus,
          fileThumb: drawObj.thumb,
          cells: JSON.stringify(paperData),
          id: this.file._id,
          like: this.file.like,
          collect: this.file.collect
        }
        this.$http.post('/api/file/editFile', params)
          .then((res) => {
            if (res.status === 200) {
              const path = '/index/' + this.file.userId
              this.$router.push({path: path})
            }
          })
      }, 100)
    },
    downloadFile: function () {
      if (this.downloadForm.format === 'png') {
        drawObj.savePng(this.file.fileName)
      } else {
        let downloadA = document.createElement('a')
        downloadA.href = '/api/file/downloadSingle?fileName=' + this.file.fileName + '&file=' + drawObj.saveSvg()
        downloadA.download = this.file.fileName + '.svg'
        document.body.appendChild(downloadA)
        downloadA.click()
        document.body.removeChild(downloadA)
      }
      this.downloadDialog = false
    },
    changeName: function () {
      let that = this
      let params = {
        editProps: 'name',
        id: this.file._id,
        fileName: this.file.fileName,
        editTime: Date.parse(new Date()).toString()
      }
      this.$http.post('/api/file/editFile', params)
        .then((res) => {
          if (res.status === 200) {
            this.$message('文件重命名成功！')
          }
        })
      that.rename = false
    }
  }
}
</script>

<style>
  .draw_page{
    height: 100%;
  }
  .page_content{
    height: 100%;
  }
  .row{
    text-align: left;
  }
  .draw_header{
    padding-top: 10px;
    box-shadow: 0 3px 2px -2px rgba(0, 0, 0, 0.15);
    background-color: #f3f2f2;
  }
  .title_bar{
    /*border-bottom: 1px solid #F7F7F7;*/
  }
.back_btn{
  color: #333;
  padding: 12px;
}
.back_btn:hover{
  background-color: #eee;
}
.file_name{
  display: inline-block;
  height: 40px;
  line-height: 40px;
  padding: 0 10px;
  font-size: 20px;
  cursor: pointer;
}
  .file_name:hover{
    background-color: #eee;
  }
.menu_list{
  overflow: hidden;
}
.menu_item{
  float: left;
  cursor: pointer;
  padding: 10px 20px;
}
.share_container{
  float: right;
  display: flex;
  align-items: center;
  position: absolute;
  right: 20px;
  top: 18px;
}
.user_info{
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 20px;
}
  .user_pic{
    width: 30px;
    height: 30px;
    border: 5px solid #f3f2f2;
    border-radius: 50%;
    background-color: #888;
  }
  .main_content{
    height: calc(100% - 86px);
  }
  .map_container{
    border-right: 1px solid rgba(0, 0, 0, 0.15);
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .map_title{
    background-color: rgba(0, 0, 0, 0.1);
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    border-bottom: #cccccc solid 1px;
    cursor: default;
    box-shadow: 0 3px 2px -2px rgba(0, 0, 0, 0.15);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.33);
    flex: 30px 0 0;
    box-sizing: border-box;
  }
  .map_content{
    flex: 1 0 0;
    overflow-y: auto;
    background-color: #f3f2f2;
  }
  .main_left{
    display: flex;
    padding: 0;
    position: relative;
  }
  .toolbar_container{
    width: 65px;
    padding: 0;
    flex: 65px 0 0;
    background-color: rgba(0, 0, 0, 0.1);
    font-size: 12px;
    border-top: 1px solid #cbcccc;
    box-sizing: border-box;
  }
  .tool_bar{
    height: 100%;
    border-left: 1px solid #cbcccc;
    font-size: 12px;
    /*min-width: 840px;*/
    -webkit-box-shadow: inset 0 1px 0 0 #fff;
    -moz-box-shadow: inset 0 1px 0 0 #fff;
    box-shadow: inset 0 1px 0 0 #fff;
    background-color: #f5f5f5;
    background-image: -webkit-linear-gradient(top,#f5f5f5,#eee);
    background-image: -moz-linear-gradient(top,#f5f5f5,#eee);
    background-image: -ms-linear-gradient(top,#f5f5f5,#eee);
    background-image: -o-linear-gradient(top,#f5f5f5,#eee);
    background-image: linear-gradient(top,#f5f5f5,#eee);
    border-bottom: 1px solid #aaaaaa;
    box-sizing: border-box;
  }
  .toolbar-menu{
    border: none;
    background-color: #f5f5f5;
  }
  .canvas_container{
    flex: 1 0 0;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    overflow: scroll;
  }
  .canvas_box{
    background-color: rgb(242, 242, 242);
    box-shadow: 3px 3px 3px #888;
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1030px;
    margin: 0 auto;
  }
  #canvas_content{
    background-color: #fff;
    border: 1px solid rgb(242, 242, 242);
  }

  /*元素周围按钮*/
  #functionBtn, #dragBtn, #labelBox {
    display: none;
    position: absolute;
    /*禁用鼠标*/
    pointer-events: none;
  }

  #functionBtn {
    border: 1px solid #C390D4;
  }

  #functionBtn > div, #dragBtn > div {
    position: absolute;/*决定是否跟随元素一起动*/
    cursor: pointer;
    z-index: 100;
    pointer-events: auto;
    /*禁止选中文字*/
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -khtml-user-select: none;
    user-select: none;
  }

  .stretch-icon {
    width: 6px;
    height: 6px;
    background: #000;
  }

  #labelBox {
    background: #9093b1;
    padding: 5px;
    border-radius: 5px;
    color: #fff;
    font-size: 12px;
  }

  #toolTip {
    width: 60px;
    position: absolute;
    display: none;
    min-width: 48px;
    height: 16px;
    line-height: 16px;
    background: #9093b1;
    padding: 5px;
    border-radius: 5px;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    z-index: 11;
  }

  #toolTip p {
    margin: 0;
    text-align: center;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }

  #toolTip input {
    border: 0;
    background: transparent;
    width: 100%;
    color: #fff;
    text-align: center;
  }

  #toolTip:after {
    content: '';
    position: absolute;
    top: 26px;
    left: 50%;
    margin-left: -8px;
    border-right: 8px solid transparent;
    border-top: 8px solid #9093b1;
    border-left: 8px solid transparent;
  }
  .hidden {
    display: none;
  }
  .property_panel{
    position: absolute;
    right: 65px;
    top: 5px;
    width: 320px;
    background: #fff;
    z-index: 999;
  }
  .style_operation{
    background: #f5f5f5;
    border: 1px solid #999;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.33);
  }
  .style_head{
    border-top: #bfbfbf solid 1px;
    border-bottom: #666666 solid 1px;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.33);
    background-color: #a6a6a6;
    background-image: -webkit-linear-gradient(top,#b2b2b2,#9b9b9b);
    background-image: -moz-linear-gradient(top,#b2b2b2,#9b9b9b);
    background-image: -ms-linear-gradient(top,#b2b2b2,#9b9b9b);
    background-image: -o-linear-gradient(top,#b2b2b2,#9b9b9b);
    background-image: linear-gradient(top,#b2b2b2,#9b9b9b);
    padding: 0px 10px;
  }
  .toolbar_item{
    font-size: 14px;
    color: #303133;
    padding: 0 20px;
    cursor: pointer;
    transition: border-color .3s,background-color .3s,color .3s;
    box-sizing: border-box;
    height: 56px;
    line-height: 56px;
    position: relative;
    white-space: nowrap;
    list-style: none;
  }
  .toolbar_item>span{
    display: none;
  }
  .toolbar_item:focus,.toolbar_item:hover{
    outline: 0;
    background-color: #ecf5ff;
  }
  .toolbar_item.selected{
    box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
    background-color: #eee;
    background-image: -webkit-linear-gradient(top,#eee,#e0e0e0);
    background-image: -moz-linear-gradient(top,#eee,#e0e0e0);
    background-image: -ms-linear-gradient(top,#eee,#e0e0e0);
    background-image: -o-linear-gradient(top,#eee,#e0e0e0);
    background-image: linear-gradient(top,#eee,#e0e0e0);
    border-color: #ccc;
  }
  .toolbar_item.color_picker{
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .measure_form,.presentation_form{
    width: 80%;
    margin: 10px auto;
  }
  .measure_form input,.measure_form .el-form-item,.measure_form .el-form-item *,.presentation_form input,.presentation_form .el-form-item,.presentation_form .el-input{
    height: 30px;
    line-height: 30px;
  }
  .measure_form .el-form-item,.presentation_form .el-form-item{
    margin-bottom: 10px;
  }
  .presentation_form .el-input-number span{
    height: 28px;
    line-height: 28px;
  }
  .alignment_item{
    position: relative;
  }
  .alignment_panel{
    position: absolute;
    right: calc(65px + 5px);
    top: calc(56px * 6);
    width: 78px;
    height: 56px;
    background: #FFF;
    border-radius: 4px;
    border: 1px solid rgb(180,180,180);
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .alignment_panel span{
    width: 20px;
    height: 20px;
    line-height: 20px;
    padding: 1px;
    border-radius: 2px;
  }
  .alignment_panel span:hover,.alignment_panel span.selected{
    box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
    background-color: #eee;
    background-image: -webkit-linear-gradient(top,#eee,#e0e0e0);
    background-image: -moz-linear-gradient(top,#eee,#e0e0e0);
    background-image: -ms-linear-gradient(top,#eee,#e0e0e0);
    background-image: -o-linear-gradient(top,#eee,#e0e0e0);
    background-image: linear-gradient(top,#eee,#e0e0e0);
    border-color: #ccc;
  }
  #canvas_content>svg{
    z-index: 11;
  }
  .cell_content{
    position: absolute;
    padding: 0;
    border: none;
    background: transparent;
    opacity: 0;
    height: 0;
    overflow: hidden;
    width: 0;
    resize:none;
    wrap:soft;
    text-align: center;
    display: table-cell;
    vertical-align: middle;
    outline: #E6A23C;
  }
  .cell_content:focus{
    outline: #E6A23C;
  }
  text{
    text-anchor: middle;  /* 文本水平居中 */
    dominant-baseline: middle; /* 文本垂直居中 */
  }
  .refer_line_v{
    position: absolute;
    width: 1px;
    background: #E6A23C;
  }
  .refer_line_h{
    position: absolute;
    height: 1px;
    background: #E6A23C;
  }
  .point_panel{
    position: absolute;
    right: calc(65px + 5px);
    top: calc(56px * 3);
    width: 78px;
    height: 56px;
    background: #FFF;
    border-radius: 4px;
    border: 1px solid rgb(180,180,180);
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .point_panel span{
    width: 20px;
    height: 20px;
    line-height: 20px;
    padding: 1px;
    border-radius: 2px;color: #000;
  }
  .point_panel span:hover,.point_panel span.selected{
    box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
    background-color: #eee;
    background-image: -webkit-linear-gradient(top,#eee,#e0e0e0);
    background-image: -moz-linear-gradient(top,#eee,#e0e0e0);
    background-image: -ms-linear-gradient(top,#eee,#e0e0e0);
    background-image: -o-linear-gradient(top,#eee,#e0e0e0);
    background-image: linear-gradient(top,#eee,#e0e0e0);
    border-color: #ccc;
  }
  .canvas_colorcontainer{
    position: relative;
  }
  .canvas_colorpicker{
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  .canvas_colorpicker>div{
    width: 100% !important;
    height: 100% !important;
    opacity: 0;
  }
  .moving_box {
    display: none;
    position: absolute;
    border: 1px solid #1ABC9C;
    background: transparent;
    z-index: 1;
  }
</style>
