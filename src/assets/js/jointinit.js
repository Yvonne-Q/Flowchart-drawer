import 'jointjs/css/layout.css'
import $ from 'jquery'
import joint from 'jointjs'
import Draggabilly from 'draggabilly'
import saveSvgAsPng from 'save-svg-as-png'

const drawObj = {
  centerGraph: null, // 中间画布
  centerPaper: null,
  leftGraph: null, // 左边画布
  leftPaper: null,
  view: null,
  idUp: '',
  idDown: '',
  hover: null,
  angle: {}, // 所有图形角度
  initialAngle: {},
  cells: [], // 选中框中的图形
  options: {}, // 接收的参数
  groups: [], // 存储组合图形
  store: null, // 用于与vuex数据存储
  activeCell: { // 单击选中的图形
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    borderColor: '#8792c3',
    borderType: 'solid',
    borderWidth: 1,
    fillColor: '#fff',
    fontColor: '#000',
    font: 'Arial, helvetica, sans-serif',
    fontSize: 14,
    fontWeight: 'normal',
    horizontal: 'middle',
    portrait: 'middle'
  },
  inputCell: null,
  linkActive: { // 单击选中的图形
    connection: '#8792c3',
    source: 'arrow',
    target: 'arrow'
  },
  link: null,
  linkArr: [], // 连线数组
  linkFlag: false, // 画线标识符
  linkedCell: null, // 连接至图形
  activeFlag: false, // 是否选中图形标识符
  canvasBg: '#ffffff', // 中间画布背景颜色
  pageDirection: 'horizontal', // 画布方向，默认为横向
  canvasZoom: 1, // 画布缩放比例
  thumb: '',
  // 初始化整个画布
  initPaper (param) {
    this.options = param.options
    this.store = param.store
    // 样式面板和缩略图
    // if (this.options.thumbnail || this.options.style_operation) {
    //   $('.main_left').append('<div class="property_panel"></div>')
    //   if (this.options.style_operation) {
    //     $('.property_panel').append('<div class="style_operation"></div>')
    //   }
    //   if (this.options.thumbnail) {
    //     $('.property_panel').append('<div class="thumbnail"></div>')
    //   }
    // }
    // 根据jointjs API初始化左边图库，中间画布，绑定属性面板上的事件
    this.initLeftPaper().initCenterPaper().loadPropertyPane()
  },
  savePaper () { // 保存画布
    // let paperData = this.centerGraph.getCells()
  },
  getSvgData () { // 导出svg数据
    return this.centerGraph.getCells().length && this.centerGraph.getCells()
  },
  setSvgData (svg) { // 导入svg数据
    if ($('#functionBtn')[0]) {
      $('#functionBtn').hide()
      $('#dragBtn').hide()
      $('#labelBox').hide()
      $('#toolTip').hide()
    }
    this.view = null
    this.hover = null
    this.idUp = ''
    this.idDown = ''
    this.angle = {}
    this.initialAngle = {}
    this.cells = []
    this.groups = []
    this.store = null
    for (let i = 0; i < svg.length; i++) {
      if (svg[i].hasOwnProperty('embeds') && svg[i].embeds.length !== 0) {
        this.groups.push({parent: svg[i].id, childs: []})
      }
      this.angle[svg[i].id] = svg[i].angle
      // 组合后的初始角度未保存
    }
    for (let i = 0; i < svg.length; i++) {
      for (let j = 0; j < this.groups.length; j++) {
        if (svg[i].parent === this.groups[j].parent) {
          this.groups[j].childs.push(svg[i])
        }
      }
    }
    this.centerGraph.clear()
    this.centerGraph.addCells(svg)
  },
  setSvgStyle (svg, attr, style) { // 外部内容改图形数据，可略
    this.centerGraph.getCell(svg.id).attr(attr, style)
  },
  // 加载周围按钮，删除，旋转，复制，拉伸
  loadBtn (cellView) {
    let that = this
    if (this.options.figure_buttons) {
      $('#canvas_content').append(`
          <div id="functionBtn">
            <div id="delSelf" class="left_top"><i class="el-icon-delete" title="删除"></i></div>
            <div id="rotateSelf" class="left_bottom"><i class="el-icon-refresh" title="旋转"></i></div>
            <div id="copySelf" class="right_top"><i class="el-icon-edit-outline" title="复制"></i></div>
            <div id="linkTo" class="right_bottom"><i class="el-icon-flowchart-link" title="连线"></i></div>
          </div>
        `)
      for (let i = 0; i < 8; i++) {
        $('#functionBtn').append('<div id="stretchSelf' + i + '" class="stretch-icon"></div>')
      }
      $('.main_content').on('click', '#delSelf', function () {
        that.delSelf()
      })
      $('.main_content').on('click', '#copySelf', function () {
        that.copySelf()
      })
      $('.main_content').on('mousedown', '#linkTo', function () {
        that.linkTo()
      })
      $('.main_content').on('mousedown', '#rotateSelf', function () {
        that.rotateSelf(this)
      })
      $('.main_content').on('mousedown', '.stretch-icon', function () {
        that.stretchSelf(this)
      })
      // 改变外加按钮的位置，使之跟随当前元素移动
      this.creatWrapper(cellView, this.centerPaper)
    }
    if (this.options.label) {
      $('#canvas_content').append(`
          <div id="labelBox"></div>
          <div id="toolTip"></div>
        `)
      $('#canvas_content').on('dblclick', '#toolTip', function () {
        $('#toolTip p').addClass('hidden').next().removeClass('hidden').focus()
      })
      $('#canvas_content').on('blur', '#toolTip input', function () {
        if ($(this).val().trim()) {
          that.hover.model.attributes.defaultName = $(this).val().trim()
          $(this).addClass('hidden').prev().text($(this).val().trim()).attr('title', $(this).val().trim()).removeClass('hidden')
          that.getCenterGraphCells()
        }
      })
      // 改变外加按钮的位置，使之跟随当前元素移动
      this.creatWrapper(cellView, this.centerPaper)
    }
  },
  saveEquip () {
    return [1, 2, 3]
  },
  // 将localStorage中的数据显示出来，以id和对应的cell存储
  // 不用for in遍历的理由：localStorage中还有其他属性如length
  // loadStorage() {
  //   for (let i = 0 i < localStorage.length i++) {
  //     let key = localStorage.key(i)
  //  // 跳过groups属性
  //     if (key === 'groups' || key === 'loglevel:webpack-dev-server') {
  //       continue
  //     }
  //     // this.angle[key] = JSON.parse(localStorage.getItem(key)).angle
  //  // this.size[key] = {'width': JSON.parse(localStorage.getItem(key)).size.width, 'height': JSON.parse(localStorage.getItem(key)).size.height}
  //     this.centerGraph.addCells([JSON.parse(localStorage.getItem(key))])
  //   }
  //   return this
  // },
  loadPropertyPane () {
    if (!this.options.figure_buttons) {
      return
    }
    let styleOperation = this.options.style_operation ? `` : ``
    let that = this
    $('.style_operation').prepend(styleOperation)
    $('.main_content').on('click', '.clear_paper', function () {
      that.clearPaper()
    })
    $('.main_content').on('click', '.group_figure', function () {
      that.embed()
    })
    $('.main_content').on('click', '.ungroup_figure', function () {
      that.unembed()
    })
    $('.main_content').on('click', '.front_figure', function () {
      that.frontAndBack(this)
    })
    $('.main_content').on('click', '.back_figure', function () {
      that.frontAndBack(this)
    })
    if ($('.main_content .tool_map_right').length !== 0) {
      let drag = new Draggabilly('.tool_map_right', {
        containment: 'body'
      })
      console.log(drag)
    }
    return this
  },
  /* 加off()防止多次绑定
   *obj  操作的input
   * min, max 值区间
   * type 形状类型 rect, circle, ellipse
   * data_obj 改变颜色的类型 fill, outline, fill */
  propertyPane (val) {
    if (this.view) {
      let type = this.view.model.get('type').split('.')[1].toLowerCase()
      this.view.model.position(val.x, val.y)
      this.view.model.size(val.width, val.height)
      this.view.model.attr(type + '/stroke-width', val.borderWidth)
      this.view.model.attr(type + '/stroke', val.borderColor)
      this.view.model.attr(type + '/fill', val.fillColor)
      this.view.model.attr('text/fill', val.fontColor)
      if (val.borderType === 'solid' || val.borderType === 0) {
        this.view.model.attr(type + '/stroke-dasharray', '0')
      } else if (val.borderType === 'dashed') {
        this.view.model.attr(type + '/stroke-dasharray', '2,5')
      } else if (val.borderType === 'dotted') {
        this.view.model.attr(type + '/stroke-dasharray', '10,5')
      }
      this.view.model.attr('text/font-family', val.font)
      this.view.model.attr('text/font-size', val.fontSize)
      this.view.model.attr('text/font-weight', val.fontWeight)
    }
  },
  linkPane (val) {
    if (this.link) {
      this.link.connection = val.connection
      this.link.source = val.source
      this.link.target = val.target
      let source = ''
      let target = ''
      if (val.source === 'arrow') {
        source = 'M 10 0 L 0 5 L 10 10 z'
      } else {
        source = ''
      }
      if (val.target === 'arrow') {
        target = 'M 10 0 L 0 5 L 10 10 z'
      } else {
        target = ''
      }
      this.link.attr({
        '.connection': { stroke: val.connection },
        '.marker-source': { fill: val.connection, d: source },
        '.marker-target': { fill: val.connection, d: target }
      })
    }
  },
  setPaperBackground (color) {
    // 设置画布背景
    this.centerPaper.drawBackground({
      color: color
    })
  },
  changeDirection () {
  //  将画布方向切换
    let newWidth = this.centerPaper.options.height
    let newHeight = this.centerPaper.options.width
    if (newWidth < newHeight) {
      this.pageDirection = 'vertical'
    }
    this.centerPaper.setDimensions(newWidth, newHeight)
    $('.canvas_box').css({width: newWidth + 30 + 'px', height: newHeight + 30 + 'px'})
    return this.pageDirection
  },
  gridToggle (showGrid) {
    if (showGrid) {
      this.centerPaper.clearGrid()
    } else {
      this.centerPaper.drawGrid({name: 'dot'})
    }
  },
  setPaperScale (scale) {
    let that = this
    // 画布比例尺
    switch (scale) {
      case 'bigger':
        if (that.canvasZoom >= 2) {
          that.canvasZoom = 2
        } else {
          that.canvasZoom = parseFloat(that.canvasZoom) + 0.5
        }
        break
      case 'smaller':
        if (that.canvasZoom <= 0.5) {
          that.canvasZoom = 0.5
        } else {
          that.canvasZoom = parseFloat(that.canvasZoom) - 0.5
        }
        break
      default:
        that.canvasZoom = scale
    }
    that.centerPaper.scale(parseFloat(that.canvasZoom), parseFloat(that.canvasZoom))
    let newWidth = 0
    let newHeight = 0
    if (that.pageDirection === 'horizontal') {
      newWidth = 1000 * that.canvasZoom
      newHeight = 707 * that.canvasZoom
    } else {
      newWidth = 707 * that.canvasZoom
      newHeight = 1000 * that.canvasZoom
    }
    that.centerPaper.setDimensions(newWidth, newHeight)
    $('.canvas_box').css({width: newWidth + 30 + 'px', height: newHeight + 30 + 'px'})
    return true
  },
  initLeftPaper () {
    if (!this.options.basic_figure) {
      return this
    }
    // 初始化元素样式
    let ElementView = this.getLeftElementView()
    // let LinkView = this.getLeftLinkView()           // 初始化线段样式
    // 生成画板
    this.leftGraph = new joint.dia.Graph()
    // 生成画布
    this.leftPaper = new joint.dia.Paper({
      el: $('#map_component'),
      width: 200 - 13,
      height: 960,
      model: this.leftGraph,
      gridSize: 1,
      elementView: ElementView,
      interactive: false
    })
    if (this.options.gallery.length === 0) { // 如果没有设备数据则用默认图形
      this.leftGraph.addCells([this.getShape(1), this.getShape(2), this.getShape(3), this.getShape(4), this.getShape(5), this.getShape(6), this.getShape(7), this.getShape(8), this.getShape(9), this.getShape(10), this.getShape(11), this.getShape(12), this.getShape(13), this.getShape(14), this.getShape(15), this.getShape(16), this.getShape(17), this.getShape(18), this.getShape(19), this.getShape(20), this.getShape(21), this.getShape(22)])
    } else {
      for (let i = 0; i < this.options.gallery.length; i++) {
        let svgs = JSON.parse(this.options.gallery[i].svg)
        for (let j = 0; j < svgs.length; j++) {
          if (svgs[j].hasOwnProperty('embeds') && svgs[j].hasOwnProperty('embeds').length !== 0 && svgs[j].hasOwnProperty('parent') === false) {
            // 判断是每个设备的终极父级图形
            svgs[j].equipId = this.options.gallery[i].equipment.id
          }
        }
        this.leftGraph.addCells(svgs)
      }
      this.generateShapes()
    }
    // 添加paper事件
    this.addLeftPaperEvent(this.leftPaper)
    // // 区域
    // // 生成画板
    // let graph = new joint.dia.Graph()
    // // 生成画布
    // let paper = new joint.dia.Paper({
    //   el: $('#link'),
    //   width: 120,
    //   height: 180,
    //   model: graph,
    //   gridSize: 1,
    //   elementView: ElementView
    // })
    // graph.addCells([this.getShape(6), this.getShape(7)])
    // let allCells = graph.getCells()
    // for (let i = 0; i < allCells.length; i++) {
    //   allCells[i].attributes.link = true
    // }
    // // 添加paper事件
    // this.addLeftPaperEvent(paper)
    // 线
    // let graph1 = new joint.dia.Graph()        // 生成画板
    // let paper1 = new joint.dia.Paper({       // 生成画布
    //   el: $('#line'),
    //   width: 120,
    //   height: 200,
    //   model: graph1,
    //   gridSize: 1,
    //   linkView: LinkView
    // })
    // graph1.addCells([this.getShape(6)])
    // this.addLeftPaperEvent(paper1)  // 添加paper事件
    return this
  },
  initCenterPaper () {
    // let width = $('.canvas_container').width()
    // let height = $('.canvas_container').height()
    // if (this.options.basic_figure) {
    //   width -= 125
    // }
    // if (this.options.add_attributes) {
    //   width -= 275
    // }
    // if (this.options.gallery.length !== 0) {
    //   width -= 18
    // }
    let that = this
    // let ElementView = this.getLeftElementView()     // 初始化元素样式
    // 生成画板
    this.centerGraph = new joint.dia.Graph()
    this.centerGraph.on('change', function (cell) {
      that.angle[cell.id] = cell.attributes.angle
      // localStorage.setItem(cell.id, JSON.stringify(cell))
    })
    this.centerGraph.on('add', function (cell) {
      that.angle[cell.id] = cell.attributes.angle
      that.getCenterGraphCells()
      localStorage.setItem(cell.id, JSON.stringify(cell))
    })
    this.centerGraph.on('remove', function (cell) {
      delete that.angle[cell.id]
      that.getCenterGraphCells()
    })
    // 生成画布
    this.centerPaper = new joint.dia.Paper({
      el: $('#canvas_content'),
      width: 1000,
      height: 707,
      model: this.centerGraph,
      drawGrid: {
        name: 'dot',
        args: [
          { color: '#999', thickness: 1 } // settings for the primary mesh
        ]},
      gridSize: 10,
      restrictTranslate: true, // 不超出paper边框
      padding: 5,
      drawBackground: {
        color: this.canvasBg
      },
      highlighting: {
        'default': {
          name: 'stroke',
          options: {
            attrs: {
              'stroke-width': 1,
              stroke: '#1ABC9C',
              'stroke-dasharray': '2, 5'
            }

          }
        }
      },
      interactive: !this.options.move_figure ? {elementMove: false} : true // false不可移动
    })
    $('#canvas_content').append(`<textarea class="cell_content" id="cell_content"></textarea>`)
    if (this.options.thumbnail) {
      let paperSmall = new joint.dia.Paper({
        el: $('.thumbnail'),
        width: 320,
        height: 155,
        model: this.centerGraph,
        gridSize: 1
      })
      paperSmall.scale(0.5)
      paperSmall.$el.css('pointer-events', 'none')
    }
    this.addCenterPaperEvent(this.centerPaper)
    return this
  },
  getCenterGraphCells () {
    if (!this.options.add_attributes) {
      return false
    }
    let options = []
    for (let i = 0; i < this.centerGraph.getCells().length; i++) {
      options.push(this.centerGraph.getCells()[i].attributes.defaultName)
    }
    $('.choose_figure').empty()
    for (let j = 0; j < options.length; j++) {
      $('.choose_figure').append(`<option>` + options[j] + `</option>`)
    }
  },
  /**
   *根据序号获取图形
   *index   序号
   *addnew   true 用于右侧新增样式
   *
   */
  getShape (index) {
    let cell
    if (index === 1) {
      cell = this.getProcess(...[25, 30, '#fff', '', 70, 60, 3])
    } else if (index === 2) {
      cell = this.getJudge(...[105, 30, '#fff', '', 70, 60, 5])
    } else if (index === 3) {
      cell = this.getStartend(...[25, 110, '#fff', '', 70, 60, 10, 10])
    } else if (index === 4) {
      cell = this.getDocument(...[105, 110, '#fff', '', 60, 60, 0])
    } else if (index === 5) {
      cell = this.getData(...[25, 190, '#fff', '', 60, 60, 0])
    } else if (index === 6) {
      cell = this.getSubprocess(...[105, 190, '#fff', '', 60, 60, '2,5'])
    } else if (index === 7) {
      cell = this.getExdata(...[25, 270, '#fff', '', 60, 60, '2,5'])
    } else if (index === 8) {
      cell = this.getStorein(...[105, 270, '#fff', '', 60, 60, '2,5'])
    } else if (index === 9) {
      cell = this.getQueuedata(...[25, 350, '#fff', '', 60, 60, '2,5'])
    } else if (index === 10) {
      cell = this.getDatabase(...[101, 352, '#fff', '', 60, 60, '2,5'])
    } else if (index === 11) {
      cell = this.getCard(...[25, 430, '#fff', '', 60, 60, '2,5'])
    } else if (index === 12) {
      cell = this.getManualoutput(...[105, 430, '#fff', '', 60, 60, '2,5'])
    } else if (index === 13) {
      cell = this.getCard(...[25, 510, '#fff', '', 60, 60, '2,5'])
    } else if (index === 14) {
      cell = this.getType(...[105, 510, '#fff', '', 60, 60, '2,5'])
    } else if (index === 15) {
      cell = this.getDisplay(...[25, 590, '#fff', '', 60, 60, '2,5'])
    } else if (index === 16) {
      cell = this.getManualOperation(...[105, 590, '#fff', '', 60, 60, '2,5'])
    } else if (index === 17) {
      cell = this.getReady(...[25, 670, '#fff', '', 60, 60, '2,5'])
    } else if (index === 18) {
      cell = this.getParallelmodel(...[105, 670, '#fff', '', 60, 60, '2,5'])
    } else if (index === 19) {
      cell = this.getLoop(...[25, 750, '#fff', '', 60, 60, '2,5'])
    } else if (index === 20) {
      cell = this.getInpagereference(...[105, 750, '#fff', '', 60, 60, '2,5'])
    } else if (index === 21) {
      cell = this.getOutpagereference(...[25, 830, '#fff', '', 60, 60, '2,5'])
    } else if (index === 22) {
      cell = this.getAnnotation(...[105, 830, '#fff', '', 60, 60, '2,5'])
    }
    return cell
  },
  addLeftPaperEvent (paper) {
    // 给所有左侧元素添加点击事件
    let that = this
    paper.on('cell:pointerdown', function (cellView, evt, x, y) {
      paper.off('cell:pointerdown')
      paper.on('cell:pointerup', function (cellView1, evt1, x1, y1) {
        let parentX = $('#canvas_content').offset().left
        let parentY = $('#canvas_content').offset().top - $('#map_component').offset().top
        // 添加中间画图板内容通过clone()
        let role = that.judgeRole(cellView1)
        if (JSON.stringify(role) === '{}') {
          let clone = cellView1.model.clone()
          let cellWidth = clone.size().width
          let cellHeight = clone.size().height
          let positionX = x1 - parentX - (cellWidth / 2)
          let positionY = y1 - parentY - (cellHeight / 2)
          // 复制时z也是一样，要重新修复
          clone.attributes['defaultName'] = '图形' + (that.centerGraph.getCells().length + 1)
          clone.set('z', that.centerGraph.getCells().length + 1)
          clone.position(positionX, positionY)
          that.centerGraph.addCells(clone)
        } else {
          let clone = role.parent.clone({deep: true})
          that.centerGraph.addCells(clone)
          // let allCells = that.getAllCells(cellView)
          // let size = []
          let getBorderXY = that.getBorder(that.centerPaper.findViewByModel(clone[0]), that.centerPaper)
          let minX = getBorderXY.min_x
          let minY = getBorderXY.min_y
          // for (let i = 0 i < allCells.length i++) {
          //   size.push(that.size[allCells[i].id])
          // }
          // clone[0].resize(size[0].width, size[0].height)
          for (let i = 0; i < clone.length; i++) {
            clone[i].set('z', that.centerGraph.getCells().length + i + 1)
            clone[i].attributes['defaultName'] = '图形' + (that.centerGraph.getCells().length + i + 1)
            if (clone[i].attributes.hasOwnProperty('equipId')) {
              // 判断是每个设备的终极父级图形
              that.store.commit('changeEquipments', {
                'id': clone[i].attributes.equipId,
                'add': true
              })
            }
            // clone[i].resize(size[i].width, size[i].height)
            // clone[i].position(size[i].disX + clone[0].position().x, size[i].disY + clone[0].position().y)
          }
          clone[0].position(clone[0].position().x - minX + 10, clone[0].position().y - minY + 10, {deep: true})
        }
      })
    })
  },
  // 中间画板元素事件
  addCenterPaperEvent (paper) {
    // 组合时选中框的起始点和终点坐标
    let [that, intervalTimer, sx, sy, ex, ey] = [this]
    // 单击画布空白部分时
    paper.on('blank:pointerdown', function (evt, x, y) {
      // 取消选中的图形
      that.clearActiveCell()
      // 取消选中的连线
      that.clearActiveLink()
      // 取消文字输入事件
      that.clearInputCell()
      // Unhighlight all cells.
      that.unHighLight()
      // 隐藏外加按钮
      $('#functionBtn').hide()
      $('#dragBtn').hide()
      $('#labelBox').hide()
      $('#toolTip').hide()
      $('#canvas_content').on('blur', '#toolTip input', function () {
        if ($(this).val().trim()) {
          that.hover.model.attributes.defaultName = $(this).val().trim()
          $(this).addClass('hidden').prev().text($(this).val().trim()).attr('title', $(this).val().trim()).removeClass('hidden')
          that.getCenterGraphCells()
        }
      })
      sx = x
      sy = y
      // 生成选中框
      $(document).off('mousemove').on('mousemove', function (event) {
        // 控制坐标在画布范围内
        let pageXY = that.paperRange(event.pageX, event.pageY)
        let minX = $('#canvas_content').offset().left
        let minY = $('#canvas_content').offset().top
        if ($('.moving_box')[0]) {
          $('.moving_box').css({
            'left': sx + 'px',
            'top': sy + 'px',
            'width': (pageXY.px - minX - sx) + 'px',
            'height': (pageXY.py - minY - sy) + 'px',
            'display': 'block'
          })
        } else {
          $('#canvas_content').append('<div class="moving_box"></div>')
          $('.moving_box').css({
            'left': sx + 'px',
            'top': sy + 'px',
            'display': 'block'
          })
        }
      })
    })
    paper.on('blank:pointerup', function (evt, x, y) {
      $(document).off('mousemove')
      $('.moving_box').hide()
      ex = x
      ey = y
      // 排除一开始不是点击在画布的空白地方的情况, sx,sy是undefined
      if (typeof sx === 'undefined' || typeof sy === 'undefined') {
        return
      }
      // 获得最大最小x,y
      let maxX = ex > sx ? ex : sx
      let maxY = ey > sy ? ey : sy
      let minX = ex > sx ? sx : ex
      let minY = ey > sy ? sy : ey
      that.cells = []
      // 将在鼠标范围内的cell push进数组中，必须包含整个cell
      for (let i = 0, len = that.centerGraph.getCells().length; i < len; i++) {
        // console.log(that.centerGraph.getCells()[i])
        if (that.centerGraph.getCells()[i].get('type') !== 'link') {
          let width = that.centerGraph.getCells()[i].getBBox().width
          let height = that.centerGraph.getCells()[i].getBBox().height
          let x = that.centerGraph.getCells()[i].getBBox().x
          let y = that.centerGraph.getCells()[i].getBBox().y
          if ((x >= minX) && (x + width <= maxX) && (y >= minY) && (y + height <= maxY)) {
            // 判断这个cell是否为父cell or 子cell,或者只是单个cell
            let role = that.judgeRole(that.centerPaper.findViewByModel(that.centerGraph.getCells()[i]))
            if (JSON.stringify(role) === '{}') {
              if (!that.cells.includes(that.centerGraph.getCells()[i])) {
                that.cells.push(that.centerGraph.getCells()[i])
                // that.highlightedCellViews.push(that.centerPaper.findViewByModel(that.centerGraph.getCells()[i]))
                // that.centerPaper.findViewByModel(that.centerGraph.getCells()[i]).highlight()
              }
            } else {
              // 不是单个cell的话找到该cell的终极祖先元素，然后把祖先元素本身和祖先元素的所有子元素全部push
              if (!that.cells.includes(role.parent)) {
                that.cells.push(role.parent)
                // that.highlightedCellViews.push(that.centerPaper.findViewByModel(role.parent))
                // that.centerPaper.findViewByModel(role.parent).highlight()
              }
              let allChilds = role.parent.getEmbeddedCells({deep: true})
              for (let j = 0; j < allChilds.length; j++) {
                if (!that.cells.includes(allChilds[j])) {
                  that.cells.push(allChilds[j])
                  // that.highlightedCellViews.push(that.centerPaper.findViewByModel(allChilds[j]))
                  // that.centerPaper.findViewByModel(allChilds[j]).highlight()
                }
              }
            }
          }
        }
        if (that.cells.length !== 0) {
          for (let i = 0; i < that.cells.length; i++) {
            that.centerPaper.findViewByModel(that.cells[i]).highlight()
          }
        }
        [ex, ey, sy, sx] = []
      }
    })
    paper.on('cell:pointerdblclick', function (cellView) {
      console.log('dbclick')
      let posX = cellView.model.position().x
      let posY = cellView.model.position().y
      let widthText = cellView.model.size().width
      let heightText = cellView.model.size().height
      $('#cell_content').css({top: posY, left: posX, width: widthText, height: heightText, opacity: 1, zIndex: 99}).val(cellView.model.attr('text/text'))
      cellView.model.attr('text/text', '')
      that.inputCell = cellView.model
      if (cellView.model.attributes.hasOwnProperty('link') && cellView.model.attributes.link) {
        clearTimeout(intervalTimer)
        if (that.options.double_click === true) {
          that.doubleClick()
        }
      }
    })
    paper.on('cell:pointerdown', function (cellView, evt, x, y) {
      // console.log('cell-click')
      clearTimeout(intervalTimer) // 取消上次延时未执行的方法
      intervalTimer = setTimeout(function () {
        if (that.options.single_click === true) {
          that.singleClick(cellView)
        }
      }, 300)
      if (that.linkFlag) {
        console.log('连线')
        that.linkedCell = cellView.model
        let link = new joint.dia.Link({
          source: { id: that.view.model.id },
          target: {id: that.linkedCell.id}
        })
        link.attributes['defaultName'] = '连线' + (that.centerGraph.getCells().length + 1)
        link.set('smooth', true)
        link.attr({
          '.connection': { stroke: '#8792c3' },
          '.marker-source': { fill: '#8792c3', d: 'M 10 0 L 0 5 L 10 10 z' },
          '.marker-target': { fill: '#8792c3', d: 'M 10 0 L 0 5 L 10 10 z' }
        })
        that.centerGraph.addCells(link)
        that.link = link
        that.linkActive.connection = link.attr('.connection').stroke
        if (link.attr('.marker-source').d === 'M 10 0 L 0 5 L 10 10 z') {
          that.linkActive.source = 'arrow'
        } else {
          that.linkActive.source = 'line'
        }
        if (link.attr('.marker-target').d === 'M 10 0 L 0 5 L 10 10 z') {
          that.linkActive.target = 'arrow'
        } else {
          that.linkActive.target = 'line'
        }
        that.linkFlag = false
      } else if (cellView.model.get('type') === 'link') {
        console.log('线条选中')
        that.link = cellView.model
        that.linkActive.connection = that.link.attr('.connection').stroke
        if (that.link.attr('.marker-source').d === 'M 10 0 L 0 5 L 10 10 z') {
          that.linkActive.source = 'arrow'
        } else {
          that.linkActive.source = 'line'
        }
        if (that.link.attr('.marker-target').d === 'M 10 0 L 0 5 L 10 10 z') {
          that.linkActive.target = 'arrow'
        } else {
          that.linkActive.target = 'line'
        }
        that.link.attr({
          '.connection': { stroke: '#E6A23C' },
          '.marker-source': { stroke: '#E6A23C' },
          '.marker-target': { stroke: '#E6A23C' }
        })
      } else {
        console.log('图形选中')
        // 判断元素是否为同一个
        that.idDown = cellView.id
        if ($('#functionBtn').length === 0 && that.options.move_figure) {
          that.loadBtn(cellView)
        } else {
          that.creatWrapper(cellView, that.centerPaper)
        }
        // 改变当前点击的设备的id
        if (cellView.model.attributes.hasOwnProperty('equipId')) {
          that.store.commit('changeEquipmentId', cellView.model.attributes.equipId)
        }
        that.unHighLight()
        let parent = cellView.model.getAncestors()[cellView.model.getAncestors().length - 1]
        if (parent) {
          // 取消子元素的移动
          cellView.pointerup(evt)
          // 将当前被拖动的元素替换为父元素
          that.centerPaper.sourceView = that.centerPaper.findViewByModel(parent)
          // 获取父元素的位置
          let localPoint = that.centerPaper.snapToGrid({x: evt.clientX, y: evt.clientY})
          that.centerPaper.findViewByModel(parent).pointerdown(evt, localPoint.x, localPoint.y)
        }
        // 点击cell右侧属性面板显示对应的数据
        // cell类型
        let type = cellView.model.get('type').split('.')[1].toLowerCase()
        let cell = cellView.model
        that.activeCell.x = cell.position().x
        that.activeCell.y = cell.position().y
        that.activeCell.width = cell.size().width
        that.activeCell.height = cell.size().height
        that.activeCell.borderColor = cell.attr('' + type + '/stroke')
        that.activeCell.borderWidth = cell.attr('' + type + '/stroke-width')
        that.activeCell.fillColor = cell.attr('' + type + '/fill')
        that.activeCell.fontColor = cell.attr('text/fill')
        that.activeCell.font = cell.attr('text/font-family')
        that.activeCell.fontSize = cell.attr('text/font-size')
        that.activeCell.fontWeight = cell.attr('text/font-weight')
        that.activeCell.horizontal = cell.attr('text/text-anchor')
        that.activeCell.portrait = cell.attr('text/y-alignment')
        that.view = cellView
        if (cell.attr('' + type + '/stroke-dasharray') === '2,5') {
          that.activeCell.borderType = 'dashed'
        } else if (cell.attr('' + type + '/stroke-dasharray') === '10ss,5') {
          that.activeCell.borderType = 'dotted'
        } else {
          that.activeCell.borderType = 'solid'
        }
        that.activeFlag = true
      }
    })
    paper.on('cell:pointermove', function (cellView) {
      // 参考线
      if (that.options.refer_line) {
        that.referLine(cellView)
      }
      let validX = 0
      let validY = 0
      if (cellView.getBBox().origin().x <= 0) {
        validX = 0
      } else if (cellView.getBBox().origin().x >= $('#canvas_content').width()) {
        validX = $('#canvas_content').width() - cellView.model.size().width
      } else {
        validX = cellView.getBBox().origin().x
      }
      if (cellView.getBBox().origin().Y <= 0) {
        validY = 0
      } else if (cellView.getBBox().origin().y >= $('#canvas_content').height()) {
        validY = $('#canvas_content').height() - cellView.model.size().height
      } else {
        validY = cellView.getBBox().origin().y
      }
      // 曲线控制点跟随图形一起移动
      $('#toolTip').css({
        'left': validX + 'px',
        'top': (validY - 50) + 'px'
      })
      that.creatWrapper(cellView, that.centerPaper)
      that.activeCell.x = validX
      that.activeCell.y = validY
    })
    paper.on('cell:pointerup', function (cellView) {
      $('.refer_line_v').hide()
      $('.refer_line_h').hide()
    })
    paper.on('cell:contextmenu', function (cellView, evt, x, y) {
      if ($('#toolTip')[0]) {
        $('#toolTip').css({
          'left': cellView.getBBox().origin().x + 'px',
          'top': (cellView.model.getBBox().origin().y - 50) + 'px'
        })
      } else {
        that.loadToolTip(cellView)
      }
      that.contextMenu = cellView
      $('#toolTip').show().empty().append('<p title="' + cellView.model.attributes.defaultName + '">' + cellView.model.attributes.defaultName + '</p><input type="text" class="hidden" placeholder="' + cellView.model.attributes.defaultName + '">')
    })
    paper.on('cell:pointerup', function (cellView) {
      that.idUp = cellView.id
    })
    paper.on('cell:mouseenter', function (cellView) {
      $('#toolTip').css({
        'left': cellView.getBBox().origin().x + 'px',
        'top': (cellView.getBBox().origin().y - 50) + 'px'
      })
      $('#toolTip').show().empty().append('<p title="' + cellView.model.attributes.defaultName + '">' + cellView.model.attributes.defaultName + '</p><input type="text" class="hidden" placeholder="' + cellView.model.attributes.defaultName + '">')
    })
    paper.on('cell:mouseleave', function (cellView) {
      that.hover = cellView
    })
  },
  getOtherCellsPos (cellView) {
    let cells = []
    if (this.options.layer) {
      let nowLayer = joint.V(this.centerPaper.viewport).find('.layerNum' + this.currentLayer)[0]
      if (nowLayer) {
        for (let i = 0; i < nowLayer.children().length; i++) {
          cells.push(this.centerGraph.getCell(nowLayer.children()[i].attr('model-id')))
        }
      }
    } else if (this.options.isArea) {
      let device = joint.V(this.centerPaper.viewport).find('.dg')
      for (let i = 0; i < device.length; i++) {
        let layer1 = device[i].find('.deviceLayer1')[0]
        for (let j = 0; j < layer1.children().length; j++) {
          cells.push(this.centerGraph.getCell(layer1.children()[j].attr('model-id')))
        }
      }
    } else {
      cells = this.centerGraph.getCells()
    }
    // 排除当前cell和其后代元素
    let result = cells.filter(function (cell) {
      if (cellView) {
        return cell.id !== cellView.model.id && !cell.isEmbeddedIn(cellView.model)
      } else {
        return cell
      }
    })
    let repeatParent = []
    for (let i = 0; i < result.length; i++) {
      repeatParent.push(this.getParent(result[i]).id)
    }
    // 获取非当前点击元素的各个parent
    let parent = Array.from(new Set(repeatParent))
    let otherPos = []
    // 获取非当前点击元素的最大最小x,y
    for (let i = 0; i < parent.length; i++) {
      let sPos = this.getBorder(this.centerPaper.findViewByModel(this.centerGraph.getCell(parent[i])), this.centerPaper)
      otherPos.push({min_x: sPos.min_x, max_x: sPos.max_x, min_y: sPos.min_y, max_y: sPos.max_y, center_x: (sPos.max_x - sPos.min_x) / 2 + sPos.min_x, center_y: (sPos.max_y - sPos.min_y) / 2 + sPos.min_y})
    }
    $('.refer_line_h').hide()
    $('.refer_line_v').hide()
    return otherPos
  },
  // 参考线位置
  referLine (cellView) {
    let pos = this.getBorder(cellView, this.centerPaper)
    let [minX, maxX, minY, maxY] = [pos.min_x, pos.max_x, pos.min_y, pos.max_y]
    let otherPos = this.getOtherCellsPos(cellView)
    for (let i = 0; i < otherPos.length; i++) {
      // 竖线
      if (Math.abs(parseInt(otherPos[i].min_x - minX)) < 2 || Math.abs(parseInt(otherPos[i].min_x - maxX)) < 2) { // 左边对齐
        this.generateLine('v', $('#canvas_content').height(), otherPos[i].min_x)
      } else if (Math.abs(parseInt(otherPos[i].max_x - minX)) < 2 || Math.abs(parseInt(otherPos[i].max_x - maxX)) < 2) { // 右边对齐
        this.generateLine('v', $('#canvas_content').height(), otherPos[i].max_x)
      } else if (Math.abs(parseInt(otherPos[i].center_x - (maxX - minX) / 2 - minX)) < 2) { // 中间对齐
        this.generateLine('v', $('#canvas_content').height(), otherPos[i].center_x)
      }
      // 横线
      if (Math.abs(parseInt(otherPos[i].min_y - minY)) < 2 || Math.abs(parseInt(otherPos[i].min_y - maxY)) < 2) {
        this.generateLine('h', $('#canvas_content').width(), otherPos[i].min_y)
      } else if (Math.abs(parseInt(otherPos[i].max_y - minY)) < 2 || Math.abs(parseInt(otherPos[i].max_y - maxY)) < 2) {
        this.generateLine('h', $('#canvas_content').width(), otherPos[i].max_y)
      } else if (Math.abs(parseInt(otherPos[i].center_y - (maxY - minY) / 2 - minY)) < 2) {
        this.generateLine('h', $('#canvas_content').width(), otherPos[i].center_y)
      }
    }
  },
  generateLine (type, param1, param2) {
    // 生成参考线
    if (type === 'v') {
      if ($('.refer_line_v')[0]) {
        $('.refer_line_v').css({
          'display': 'block',
          'height': param1,
          'left': param2
        })
      } else {
        $('#canvas_content').append('<div class="refer_line_v forbidden"></div>')
        $('.refer_line_v').css({
          'display': 'block',
          'height': param1,
          'left': param2
        })
      }
    } else {
      if ($('.refer_line_h')[0]) {
        $('.refer_line_h').css({
          'display': 'block',
          'width': param1,
          'top': param2
        })
      } else {
        $('#canvas_content').append('<div class="refer_line_h forbidden"></div>')
        $('.refer_line_h').css({
          'display': 'block',
          'width': param1,
          'top': param2
        })
      }
    }
  },
  singleClick (cellView) {
    // 图形单击表示选中图形
    console.log('singleclick')
  },
  doubleClick () {
    // 链接图形双击出现链接编辑弹框
    console.log('double')
    if (this.store) {
      this.store.commit('changeLinkAttr', {
        'link': true
      })
    }
  },
  arrEquals (arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false
    } else {
      // let id1 = [], id2 = []
      let [id1, id2] = [[], []]
      for (let i = 0; i < arr1.length; i++) {
        id1.push(arr1[i].id)
      }
      for (let j = 0; j < arr2.length; j++) {
        id2.push(arr2[j].id)
      }
      for (let k = 0; k < id2.length; k++) {
        if (!id1.includes(id2[k])) {
          return false
        }
      }
      for (let m = 0; m < id1.length; m++) {
        if (!id2.includes(id1[m])) {
          return false
        }
      }
    }
    return true
  },
  /* getCells获取到的cell顺序是根据z,z越小，越早获取到
   第一次把获取到的第一个cell作为父cell,{parent: cell[0].id, childs: []},
   多次组合的话判断第一个cell是否有parent，如果没有说明该cell是单个cell，或者终极祖先cell，
   把他作为父cell,如果有parent的话，把该cell的终极祖先cell作为父cell,并且embed之前还要把父cell
   的所有子cell全部排除，防止再次embed,并且排除其他不相关cell的子cell，防止embed从属关系错乱，剩下的
   则是此次要embed的cell */
  embed () {
    // var copyCell = cells.slice(0)
    if (this.cells.length === 0) {
      alert('未选中任何元素')
      return
    }
    // 取消元素高亮
    this.unHighLight()
    if (this.cells.length === 1) {
      alert('只选中了一个元素，无法组合')
      return
    }
    let parent = this.getParent(this.cells[0])
    let ids = []
    for (let j = 0; j < this.groups.length; j++) {
      ids.push(this.groups[j].parent)
    }
    if (!ids.includes(parent.id) && parent.getEmbeddedCells({deep: true}).length !== 0) {
      alert('该图形是组合过的模板图形')
      return
    }
    let newCells = []
    for (let j = 0; j < this.cells.length; j++) {
      if (this.cells[j].id === parent.id) {
        continue
      }
      newCells.push(this.cells[j])
    }
    // 查找groups中的数据，判断其中所有的cell的id是否相同判断是否已经组合过
    for (let k = this.groups.length - 1; k >= 0; k--) {
      if (this.groups[k].parent === parent.id) {
        if (this.arrEquals(this.groups[k].childs, newCells)) {
          alert('已经组合过')
          return
        }
      }
    }
    for (let i = 0; i < this.cells.length; i++) {
      this.initialAngle[this.cells[i].id] = this.cells[i].attributes.angle
    }
    // 删除parent下的所有子cell
    let allChilds = parent.getEmbeddedCells({deep: true})
    if (allChilds) {
      for (let j = 0; j < allChilds.length; j++) {
        if (this.cells.includes(allChilds[j])) {
          delete this.cells[this.cells.indexOf(allChilds[j])]
        }
      }
    }
    if (this.cells.length > 1) {
      this.groups.push({parent: parent.id, childs: []})
      for (let i = 0; i < this.cells.length; i++) {
        // 如果剩下的元素有祖先元素，删除其本身，直接embed该祖先元素
        if (this.cells[i]) {
          if (this.cells[i].getAncestors().length !== 0) {
            delete this.cells[i]
          }
        }
        if (this.cells[i]) {
          if (this.cells[i].id === parent.id) {
            continue
          }
          parent.embed(this.cells[i])
          this.groups[this.groups.length - 1].childs.push(this.cells[i])
        }
      }
      // localStorage.setItem('groups', JSON.stringify(this.groups))
    }
    this.cells = []
  },
  /* 解绑是unembed获取选中的所有cell上的最后一步组合操作 */
  unembed () {
    this.unHighLight()
    // 要判断是否还能解绑，完全解绑后所有元素都没有祖先元素
    let count = 0
    for (let m = 0; m < this.cells.length; m++) {
      if (this.cells[m].getAncestors().length === 0) {
        count++
      }
    }
    if (count === this.cells.length) {
      alert('所有元素都已解绑！')
      return
    }
    let parent = this.getParent(this.cells[0])
    let ids = []
    for (let j = 0; j < this.groups.length; j++) {
      ids.push(this.groups[j].parent)
    }
    if (!ids.includes(parent.id)) {
      alert('该图形是模板图形，不能解绑')
      return
    }
    // var copyCell = cells.slice(0)
    let index
    let matches
    // 获取最后一步操作的记录
    for (let i = this.groups.length - 1; i >= 0; i--) {
      if (this.groups[i].parent === parent.id) {
        index = i
        matches = this.groups[i].childs
        break
      }
    }
    if (index !== undefined) {
      for (let l = 0; l < matches.length; l++) {
        parent.unembed(this.centerGraph.getCell(matches[l].id))
      }
      this.groups.splice(index, 1)
      // localStorage.setItem('groups', JSON.stringify(this.groups))
    }
    this.cells = []
  },
  // 判断该cell的角色，单个cell，既是父cell,也是子cell,只是子cell,只是父cell
  judgeRole (cellView) {
    let parent = cellView.model.getAncestors()[cellView.model.getAncestors().length - 1]
    let child = cellView.model.getEmbeddedCells({deep: true})
    if (parent) {
      return {'parent': parent}
    } else {
      if (child.length !== 0) {
        return {'parent': cellView.model}
      } else {
        return {}
      }
    }
  },
  delSelf () {
    // 除删除cell之外，还要删除与之相关的groups中的数据（根据每个cell的父cell的id），localstorage中的数据，angle的数据
    console.log('delete')
    let parent = this.getParent(this.view.model)
    // let allCells = this.getAllCells(this.view)
    let ids = []
    // this.allCellsId = []
    let allChilds = parent.getEmbeddedCells({deep: true})
    for (let j = 0; j < allChilds.length; j++) {
      if (allChilds[j].getAncestors().length !== 0) {
        ids.push(allChilds[j].getAncestors()[0].id)
      }
    }
    for (let k = 0; k < this.groups.length; k++) {
      if (ids.includes(this.groups[k].parent)) {
        this.groups.splice(k--, 1)
      }
    }
    // for (let i = 0 i < allCells.length i++) {
    //   allCellsId.push(allCells[i].id)
    // }
    // this.allCellsId = allCellsId
    // console.log(this.allCellsId)
    // localStorage.setItem('groups', JSON.stringify(this.groups))
    if (parent.attributes.hasOwnProperty('equipId')) {
      this.store.commit('changeEquipments', {
        'id': parent.attributes.equipId,
        'add': false
      })
    }
    parent.remove()
    $('#functionBtn').hide()
    $('#dragBtn').hide()
    $('#labelBox').hide()
    $('#toolTip').hide()
  },
  copySelf () {
    console.log('copy')
    // 获取所有cell如果组合过，则包含所有父cell和子cell
    let allCells = this.getAllCells(this.view)
    let clone = this.centerPaper.findViewByModel(allCells[0]).model.clone({deep: true})
    for (let i = 0; i < clone.length; i++) {
      clone[i].attributes['defaultName'] = '图形' + (this.centerGraph.getCells().length + i + 1)
      clone[i].position((clone[i].position().x + 5), (clone[i].position().y + 5))
    }
    this.centerGraph.addCells(clone)
    let apIds = []// 所有被clone的有关cell的id
    let childsIndex = []
    let nGroups = []// 所有被clone的有关的groups中的数据
    for (let k = 0; k < allCells.length; k++) {
      apIds.push(allCells[k].id)
    }
    for (let n = 0; n < this.groups.length; n++) {
      if (apIds.includes(this.groups[n].parent)) {
        nGroups.push(this.groups[n])
      }
    }
    // 因为clone和被clone的所有cells在数组中相对应的index相同，所以根据被clone的
    // cell的位置来写clone出来的位置
    for (let l = 0; l < nGroups.length; l++) {
      let parentIndex = apIds.indexOf(nGroups[l].parent)
      this.groups.push({parent: clone[parentIndex].id, childs: []})
      childsIndex.push([])
      for (let m = 0; m < nGroups[l].childs.length; m++) {
        childsIndex[l].push(apIds.indexOf(nGroups[l].childs[m].id))
      }
    }

    let index = 0
    for (let j = this.groups.length - childsIndex.length; j < this.groups.length; j++) {
      for (let i = 0; i < childsIndex[index].length; i++) {
        this.groups[j].childs.push(clone[childsIndex[index][i]])
      }
      index++
    }
    // localStorage.setItem('groups', JSON.stringify(this.groups))
    /* 因为通过clone()方法获得的元素没有angle属性所以要经过处理 */
    /* 如果被克隆的元素没有angle，可能是曾经克隆出来的元素或者创建的没有经过旋转的元素 */
    if (this.view.model.changed.angle === undefined) {
      /* 是曾经克隆出来的元素,其旋转角度存在angle对象中 */
      if (this.angle[this.view.model.id]) {
        for (let i = 0; i < clone.length; i++) {
          this.angle[clone[i].id] = this.angle[this.view.model.id]
        }
      } else {
        /* 是没有经过旋转的元素 */
        for (let i = 0; i < clone.length; i++) {
          this.angle[clone[i].id] = 0
        }
      }
    } else {
      /* 如果被克隆的元素有angle */
      for (let i = 0; i < clone.length; i++) {
        this.angle[clone[i].id] = this.view.model.changed.angle
      }
    }
  },
  linkTo (e) {
    console.log('link')
    this.linkFlag = true
  },
  rotateSelf (e) {
    let that = this
    this.unHighLight()
    let allCells = this.getAllCells(this.view)
    // 右下角按钮在中间画布的位置
    let rx = $('#rotateSelf').offset().left - $('#canvas_content').offset().left
    let ry = $('#rotateSelf').offset().top - $('#canvas_content').offset().top
    // 鼠标在中间画布的位置
    let px
    let py
    // 已转角度
    let angled = []
    for (let j = 0; j < allCells.length; j++) {
      angled.push(allCells[j].attributes.angle ? allCells[j].attributes.angle : 0)
    }
    // 旋转角度等于（鼠标位置与中心点的角度angle2 - 按钮位置与中心点的角度angle1 + 已经转过的角度）
    $(document).off('mousemove').on('mousemove', function (event) {
      let oPos = that.creatWrapper(that.centerPaper.findViewByModel(allCells[0]), that.centerPaper)
      let ox = (oPos.max_x - oPos.min_x) / 2 + oPos.min_x
      let oy = (oPos.max_y - oPos.min_y) / 2 + oPos.min_y
      // 旋转中心在中间画布的位置
      px = event.pageX - $('#canvas_content').offset().left
      py = event.pageY - $('#canvas_content').offset().top
      let angle1 = Math.atan(((ry - oy) / (rx - ox))) * 180 / Math.PI
      let angle2 = Math.atan(((py - oy) / (px - ox))) * 180 / Math.PI
      /* 一四象限角度需要经过处理 */
      if (px > ox && py > oy) {
        angle2 = angle2 - 180
      } else if (px > ox && py < oy) {
        angle2 = angle2 + 180
      }
      for (let i = 0; i < allCells.length; i++) {
        /* true表示不是对上一个角度的累加而是一个绝对角度 */
        allCells[i].rotate(angle1 - angle2 - angled[i], true, {x: ox, y: oy})
        allCells[i].attr('text/transform', 'rotate(' + (angle1 - angle2 - angled[i]) + ')')
      }
    })
    $(document).on('mouseup', function (event) {
      $(document).off('mousemove')
    })
  },
  stretchSelf (e) {
    console.log('stretch')
    this.unHighLight()
    let that = this
    let allCells = this.getAllCells(this.view)
    // 拉伸按钮位置
    let px = $(e).offset().left + 3
    let py = $(e).offset().top + 3
    // 根据元素id来判断元素方位，拉伸方式不同
    /* 0: 向左上角拉伸，
     1：向上拉伸，
     2：向右上角拉伸，
     3：向左拉伸，
     4：向右拉伸，
     5：向左下角拉伸，
     6：向下拉伸，
     7：向右下角拉伸 */
    // 元素高宽
    let [width, height, disX, disY] = [[], [], [], []]
    for (let i = 0; i < allCells.length; i++) {
      width.push(allCells[i].size().width)
      height.push(allCells[i].size().height)
      if (i === 0) {
        continue
      }
      disX.push(allCells[i].getBBox().origin().x - allCells[0].getBBox().origin().x)
      disY.push(allCells[i].getBBox().origin().y - allCells[0].getBBox().origin().y)
    }
    /* 拉伸原理： 鼠标位置与当前拉伸按钮位置的差 + 元素的宽高即为拉伸后的宽高 */
    let id = parseInt($(e).attr('id').substr($(e).attr('id').length - 1))
    $(document).off('mousemove').on('mousemove', function (event) {
      // 放大宽高
      let [scaleX, scaleY] = []
      /* 拉伸按钮id依次为
       0 1 2
       3   4
       5 6 7 */
      // scaleX
      // 控制鼠标在画布范围内
      let pageXY = that.paperRange(event.pageX, event.pageY)
      if (id === 0 || id === 3 || id === 5) {
        scaleX = px - pageXY.px
      } else if (id === 2 || id === 4 || id === 7) {
        scaleX = pageXY.px - px
      } else if (id === 1 || id === 6) {
        scaleX = 0
      }
      // scaleY
      if (id === 0 || id === 1 || id === 2) {
        scaleY = py - pageXY.py
      } else if (id === 5 || id === 6 || id === 7) {
        scaleY = pageXY.py - py
      } else if (id === 3 || id === 4) {
        scaleY = 0
      }
      // 设置最小变形后的高宽为20*20
      let first = that.minWidthAndHeight(width[0] + scaleX, height[0] + scaleY)
      allCells[0].resize(first.scaleX, first.scaleY, {direction: that.judgeDirection(id)})
      let [ratioX, ratioY] = [first.scaleX / width[0], first.scaleY / height[0]]
      for (let j = 1; j < allCells.length; j++) {
        allCells[j].resize(ratioX * width[j], ratioY * height[j], {direction: that.judgeDirection(id)})
        allCells[j].position(ratioX * disX[j - 1], ratioY * disY[j - 1], {parentRelative: true})
        // 拉伸时只显示当前按钮
        $('.stretch-icon').hide()
        $('#stretchSelf' + id).show()
      }
      let cellMeasure = that.creatWrapper(that.centerPaper.findViewByModel(allCells[0]), that.centerPaper)
      that.activeCell.width = cellMeasure.max_x - cellMeasure.min_x
      that.activeCell.height = cellMeasure.max_y - cellMeasure.min_y
    })
    // 鼠标松开解除mousemove事件
    $(document).on('mouseup', function (event) {
      $(document).off('mousemove')
      $('.stretch-icon').show()
    })
  },
  paperRange (x, y) {
    let [maxX, minX, maxY, minY] = [$('#canvas_content').offset().left + $('#canvas_content').width(), $('#canvas_content').offset().left, $('#canvas_content').offset().top + $('#canvas_content').height(), $('#canvas_content').offset().top]
    if (x <= minX) {
      x = minX
    } else if (x >= maxX) {
      x = maxX
    }
    if (y <= minY) {
      y = minY
    } else if (y >= maxY) {
      y = maxY
    }
    return {px: x, py: y}
  },
  judgeDirection (index) {
    if (index === 0) {
      return 'top-left'
    } else if (index === 1) {
      return 'top'
    } else if (index === 2) {
      return 'top-right'
    } else if (index === 3) {
      return 'left'
    } else if (index === 4 || index === 6 || index === 7) {
      return ''
    } else {
      return 'bottom-left'
    }
  },
  minWidthAndHeight (scaleX, scaleY) {
    if (scaleX <= 20) {
      scaleX = 20
    }
    if (scaleY <= 20) {
      scaleY = 20
    }
    return {scaleX: scaleX, scaleY: scaleY}
  },
  // 清空选中图形
  clearActiveCell () {
    this.activeCell.x = 0
    this.activeCell.y = 0
    this.activeCell.width = 0
    this.activeCell.height = 0
    this.activeCell.borderColor = '#8792c3'
    this.activeCell.borderType = 'solid'
    this.activeCell.borderWidth = 1
    this.activeCell.fillColor = '#fff'
    this.activeCell.fontColor = '#000'
    this.activeCell.font = 'Arial, helvetica, sans-serif'
    this.activeCell.fontSize = 14
    this.activeCell.fontWeight = 'normal'
    this.activeCell.horizontal = 'center'
    this.activeCell.portrait = 'center'
    // 清空选中的view
    this.view = null
    this.activeFlag = false
  },
  // 清空选中连线
  clearActiveLink () {
    this.linkActive.connection = '#8792c3'
    this.linkActive.source = 'M 10 0 L 0 5 L 10 10 z'
    this.linkActive.target = 'M 10 0 L 0 5 L 10 10 z'
    if (this.link) {
      this.link.attr({
        '.connection': { stroke: this.link.connection },
        '.marker-source': { stroke: this.link.connection },
        '.marker-target': { stroke: this.link.connection }
      })
    }
    this.link = null
  },
  // 取消图形文本内容输入
  clearInputCell () {
    if (this.inputCell) {
      $('#cell_content').blur().css({top: 0, left: 0, width: 0, height: 0, opacity: 0, zIndex: 10})
      this.inputCell.attr('text/text', $('#cell_content').val())
      $('#cell_content').val('')
      this.inputCell = null
    }
  },
  // 获取元素初始化样式,鼠标的事件
  getLeftElementView () {
    let ElementView = joint.dia.ElementView.extend({
      // pointerdown: function () {
      //   this._click = true
      //   // joint.dia.ElementView.prototype.pointerdown.apply(this, arguments)
      // },
      // pointermove: function (evt, x, y) { // 左侧画板元素能否移动
      //   // this._click = false
      //   // joint.dia.ElementView.prototype.pointermove.apply(this, arguments)
      // },
      // pointerup: function (evt, x, y) {
      //   if (this._click) {
      //     // triggers an event on the paper and the element itself
      //     this.notify('cell:click', evt, x, y)
      //   } else {
      //     joint.dia.ElementView.prototype.pointerup.apply(this, arguments)
      //   }
      // }
    })
    return ElementView
  },
  // getImage(px, py, pwidth, pheight) {
  //   let cell = new joint.shapes.basic.Image({
  //     position: {
  //       x: px,
  //       y: py
  //     },
  //     size: {
  //       width: pwidth,
  //       height: pheight
  //     },
  //     attrs: {
  //       // attr SVG attr      prop- custom data
  //       image: {
  //         'xlink:href': 'url(http://localhost:8888/src/assets/img/logo.png)'
  //       }
  //     }
  //   })
  //   return cell
  // },
  /**
   * 生成椭圆
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   * prx    短轴值
   * pry    长轴值
   */
  /* getEllipse(px, py, pbackground, ptext, pwidth, pheight) {
   let cell = new joint.shapes.basic.Ellipse({
   position: {
   x: px,
   y: py
   },
   size: {
   width: pwidth,
   height: pheight
   },
   attrs: {
   // attr SVG attr      prop- custom data
   ellipse: {
   fill: pbackground,
   'stroke': '#8792c3',
   'stroke-width': 1,
   'stroke-dasharray': 0
   },
   text: {
   text: ptext,
   fill: 'black',
   'font-weight': 'normal'
   }
   }
   })
   return cell
   }, */
  /**
   * 流程（process）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getProcess (px, py, pbackground, ptext, pwidth, pheight) {
    let cell = new joint.shapes.basic.Rect({
      position: {
        x: px,
        y: py
      },
      size: {
        width: pwidth,
        height: pheight
      },
      attrs: {
        // attr SVG attr      prop- custom data
        rect: {
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 判定（judge）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getJudge (px, py, pbackground, ptext, pwidth, pheight) {
    let points = '50,0 0,35 50,70,100,35'
    let cell = new joint.shapes.basic.Polygon({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        polygon: {
          points: points,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 开始/结束（startend）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   * rx 矩形圆角
   * ry 矩形圆角
   */
  getStartend (px, py, pbackground, ptext, pwidth, pheight, rx, ry) {
    let cell = new joint.shapes.basic.Rect({
      position: {
        x: px,
        y: py
      },
      size: {
        width: pwidth,
        height: pheight
      },
      attrs: {
        // attr SVG attr      prop- custom data
        rect: {
          rx: rx,
          ry: ry,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 文档（document）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getDocument (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'm0.620544,0.864589l0,0c98.365389,0.17142 92.812422,0.06669 98.999916,0l0,67.2c0,-4.63919 -11.080943,-8.4 -24.749975,-8.4c-13.66904,0 -20.508564,4.72855 -24.749991,8.4c-4.241426,3.67145 -11.080935,8.4 -24.749967,8.4c-13.66904,0 -24.749983,-3.76081 -24.749983,-8.4l0,-67.2z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 数据（data）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getData (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'm0.902505,69.823491l19.592158,-69.117657l78.368624,0l-19.592158,69.117657l-78.368624,0z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 子流程（subprocess）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getSubprocess (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M100 0 l0 70 l-25 0 l0 -70 l-50 0 l0 70 l-25 0 l0 -70 l25 0 l0 70 l50 0 l0 -70 Z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 外部数据（exdata）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getExdata (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'm17.052057,-0.25l81.510293,0c-9.003378,0 -16.302057,15.600056 -16.302057,34.843695c0,19.243642 7.298679,34.843693 16.302057,34.843693l-81.510293,0l0,0c-9.003378,0 -16.302057,-15.600054 -16.302057,-34.843693c0,-19.243639 7.298679,-34.843695 16.302057,-34.843695z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 内部存储（storein）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getStorein (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M100 0 l0 70 l-100 0 l0 -70 l100 0 l0 20 l-100 0 l0 -20 l20 0 l0 70 l80 0 Z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 队列数据（queuedata）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getQueuedata (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'm31.88136,60.053631l0,0c-17.070619,0 -30.909088,-13.187244 -30.909088,-29.454543l0,0c0,-16.267295 13.83847,-29.454543 30.909088,-29.454543l0,0c8.197601,0 16.059447,3.103238 21.856024,8.627034c5.796578,5.5238 9.053065,13.015676 9.053065,20.827509l0,0c0,7.811831 -3.256486,15.303709 -9.053065,20.827505l9.053065,0l0,8.627038l-30.909088,0z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 数据库（database）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getDatabase (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M15.0 0.0L93.33333333333333 0.0C108.18181818181819 0.0 108.18181818181819 70.0 93.33333333333333 70.0L20.0 70.0C0.0 70.0 0.0 0.0 20.0 0.0ZM93.33333333333333 0.0C78.75 0.0 78.75 70.0 93.33333333333333 70.0C78.75 70.0 78.75 0.0 93.33333333333333 0.0'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 卡片（card）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getCard (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'm82.79471,69.64126l16.39077,-11.51538l-16.39077,11.51538l-81.95194,0l0,-69.09088l98.34272,0l0,57.48239'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0,
          transform: 'rotate(-180 50.014129638671875,35.095821380615234)'
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 人工输出（manualoutput）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getManualoutput (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M0.0 16.666666666666668L100.0 0.0L100.0 70.0L0.0 70.0L0.0 16.666666666666668Z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 条带（type）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getType (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'm0.75,7.580762l0,0c0,3.772525 11.080935,6.830762 24.749961,6.830762c13.669019,0 24.749951,-3.058238 24.749951,-6.830762l0,0c0,-3.772527 11.080938,-6.830762 24.749964,-6.830762c13.669026,0 24.749951,3.058238 24.749951,6.830762l0,54.6461c0,-3.772525 -11.080928,-6.830767 -24.749951,-6.830767c-13.669026,0 -24.749964,3.05824 -24.749964,6.830767c0,3.772522 -11.080931,6.83076 -24.749951,6.83076c-13.669026,0 -24.749961,-3.058238 -24.749961,-6.83076l0,-54.6461z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 展示（display）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getDisplay (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'm0.42402,34.840511l16.456134,-34.315737l65.824283,0c9.088527,0 16.456279,15.36366 16.456279,34.315737c0,18.951877 -7.367752,34.315741 -16.456279,34.315741l-65.824283,0l-16.456134,-34.315741z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 人工操作（ManualOperation）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getManualOperation (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M0.0 0.0L100.0 0.0L83.33333333333333 70.0L16.666666666666668 70.0L0.0 0.0Z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 预备（ready）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getReady (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M0.0 0.0L100.0 0.0L83.33333333333333 70.0L16.666666666666668 70.0L0.0 0.0Z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 并行模式（parallelmodel）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getParallelmodel (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M0.0 0.0L100.0 0.0L100.0 70.0L0.0 70.0L0.0 0.0Z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 循环限值（loop）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getLoop (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M0.0 16.666666666666668L16.666666666666668 0.0L83.33333333333333 0.0L100.0 16.666666666666668L100.0 70.0L0.0 70.0L0.0 16.666666666666668Z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 页面内引用（inpagereference）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getInpagereference (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M0.0 35.0C0.0 -11.666666666666666 70.0 -11.666666666666666 70.0 35.0C70.0 81.66666666666667 0.0 81.66666666666667 0.0 35.0Z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 跨页引用（outpagereference）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getOutpagereference (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M0.0 0.0L70.0 0.0L70.0 40.0L35.0 60.0L0.0 40.0L0.0 0.0Z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /**
   * 注释（annotation）
   * px  x 坐标
   * py  y 坐标
   * pbackground   背景色
   * ptext  显示文本
   * pwidth 宽带
   * pheight 高度
   */
  getAnnotation (px, py, pbackground, ptext, pwidth, pheight) {
    let path = 'M0.0 0.0L100.0 0.0L100.0 70.0L0.0 70.0Z'
    let cell = new joint.shapes.basic.Path({
      size: {
        width: pwidth,
        height: pheight
      },
      position: {
        x: px,
        y: py
      },
      attrs: {
        path: {
          d: path,
          fill: pbackground,
          'stroke': '#8792c3',
          'stroke-width': 1,
          'stroke-dasharray': 0
        },
        text: {
          text: ptext,
          fill: 'black',
          'font-weight': 'normal',
          'ref-dy': null,
          'ref-y': 0.5
        }
      }
    })
    return cell
  },
  /* getCustom(sx, sy, pbackground, pwidth, pheight, plabel) {
   // 创建自定义矩形
   joint.shapes.basic.Rect = joint.shapes.basic.Generic.extend({
   markup: '<g class="rotatable"><g class="scalable"><rect/></g><text/></g>',
   defaults: joint.util.deepSupplement({
   type: 'basic.Rect',
   attrs: {
   'rect': {fill: pbackground, stroke: '#8792c3', 'stroke-width': 1, 'stroke-dasharray': 0, 'follow-scale': true, width: 80, height: 40, 'font-weight': 'normal'},
   'text': {'font-size': 14, 'ref-x': 0.5, 'ref-y': 0.5, ref: 'rect', 'y-alignment': 'middle', 'x-alignment': 'middle', fill: 'black'}
   }
   }, joint.shapes.basic.Generic.prototype.defaults)
   })
   let custom = new joint.shapes.basic.Rect({  // 绘制元素
   position: {x: sx, y: sy},
   size: {width: pwidth, height: pheight},
   attrs: {
   text: {text: plabel}
   }
   })

   return custom
   }, */
  // 清除
  clearPaper () {
    this.centerGraph.clear()
    $('#functionBtn').hide()
    $('#dragBtn').hide()
    $('#label').hide()
    $('#toolTip').hide()
    this.groups = []
    this.cells = []
    // localStorage.setItem('groups', JSON.stringify(this.groups))
  },
  // 设置z
  frontAndBack (e) {
    if (this.view) {
      let role = this.judgeRole(this.view)
      if ($(e).hasClass('front_figure')) {
        if (JSON.stringify(role) === '{}') {
          this.view.model.toFront()
        } else {
          role.parent.toFront({'deep': true})
        }
      } else if ($(e).hasClass('back_figure')) {
        if (JSON.stringify(role) === '{}') {
          this.view.model.toBack()
        } else {
          role.parent.toBack({'deep': true})
        }
      }
    }
  },
  // 生成设备库
  generateShapes () {
    // 先获取所有终极父级元素，得到每个设备的宽高,每个设备间距10
    $('#component').css({
      'height': this.options.gallery.length * 120
    })
    let parentId = []
    for (let i = 0; i < this.options.gallery.length; i++) {
      let svgs = JSON.parse(this.options.gallery[i].svg)
      for (let j = 0; j < svgs.length; j++) {
        if (svgs[j].hasOwnProperty('embeds') && svgs[j].hasOwnProperty('embeds').length !== 0 && svgs[j].hasOwnProperty('parent') === false) {
          // 判断是每个设备的终极父级图形
          parentId.push(svgs[j].id)
        }
      }
    }
    // 如果组合图形宽高比大于100/100，以宽为主按比例缩小，否则以高为主缩小
    for (let k = 0; k < this.leftGraph.getCells().length; k++) {
      if (parentId.includes(this.leftGraph.getCells()[k].id)) {
        // 获取一个设备的所有图形
        let allCells = this.getAllCells(this.leftPaper.findViewByModel(this.leftGraph.getCells()[k]))
        // 获取设备的边界
        let border = this.getBorder(this.leftPaper.findViewByModel(this.leftGraph.getCells()[k]), this.leftPaper)
        let [maxX, minX, maxY, minY] = [border.max_x, border.min_x, border.max_y, border.min_y]
        let [disX, disY] = [[], []]
        for (let i = 1; i < allCells.length; i++) {
          disX.push(this.leftPaper.findViewByModel(allCells[i]).getBBox().origin().x - this.leftPaper.findViewByModel(allCells[0]).getBBox().origin().x)
          disY.push(this.leftPaper.findViewByModel(allCells[i]).getBBox().origin().y - this.leftPaper.findViewByModel(allCells[0]).getBBox().origin().y)
        }
        let ratio = 0
        if ((maxX - minX) / (maxY - minY) >= 1) {
          // 以宽为主
          ratio = 100 / (maxX - minX)
        } else {
          // 以高为主
          ratio = 100 / (maxY - minY)
        }
        allCells[0].resize(ratio * allCells[0].size().width, ratio * allCells[0].size().height)
        for (let i = 1; i < allCells.length; i++) {
          allCells[i].resize(ratio * allCells[i].size().width, ratio * allCells[i].size().height)
        }
        // 缩小后的图形的边界
        let border1 = this.getBorder(this.leftPaper.findViewByModel(this.leftGraph.getCells()[k]), this.leftPaper)
        // (allCells[0].position().y - minY) * ratio + 10 + k * 100
        allCells[0].position(10 + (allCells[0].position().x - border1.min_x) * ratio, (120 - (border1.max_y - border1.min_y)) / 2 + (allCells[0].position().y - border1.min_y) * ratio + k * 120)
        for (let i = 1; i < allCells.length; i++) {
          allCells[i].position(ratio * disX[i - 1] + allCells[0].getBBox().origin().x, ratio * disY[i - 1] + allCells[0].getBBox().origin().y)
        }
      }
    }
  },
  /* generateShapes() {
   if (this.cells.length < 2) {
   alert('不是组合图形')
   return
   }
   this.unHighLight()
   // 选中的不是一个组合
   let parent = this.getParent(this.cells[0])
   let allChilds = parent.getEmbeddedCells({deep: true})
   let ids = []
   for (let i = 0 i < allChilds.length i++) {
   ids.push(allChilds[i].id)
   }
   for (let j = 0 j < this.cells.length j++) {
   if (this.cells[j].id === parent.id) {
   continue
   }
   if (!ids.includes(this.cells[j].id)) {
   alert('无法生成模板图形')
   return
   }
   }
   // 是模板图形不能再次生成模板图形
   let gIds = []
   for (let j = 0 j < this.groups.length j++) {
   gIds.push(this.groups[j].parent)
   }
   if (!gIds.includes(parent.id)) {
   alert('该图形是模板图形，不能再次生成模板图形')
   return
   }
   let clone = parent.clone({deep: true})
   let allCells = this.getAllCells(this.centerPaper.findViewByModel(parent))
   let [disX, disY] = [[], []]
   this.leftGraph.addCells(clone)
   let oPos = this.getBorder(this.leftPaper.findViewByModel(clone[0]), this.leftPaper)
   let ox = (oPos.max_x - oPos.min_x) / 2 + oPos.min_x
   let oy = (oPos.max_y - oPos.min_y) / 2 + oPos.min_y
   for (let i = 0 i < allCells.length i++) {
   clone[i].rotate(this.initialAngle[allCells[i].id], true, {x: ox, y: oy})
   clone[i].attr('text/transform', 'rotate(' + (0 - this.initialAngle[allCells[i].id]) + ')')
   // this.size[clone[i].id] = {'width': clone[i].size().width, 'height': clone[i].size().height, 'disX': clone[i].getBBox().origin().x - clone[0].getBBox().origin().x, 'disY': clone[i].getBBox().origin().y - clone[0].getBBox().origin().y}
   if (i === 0) {
   continue
   }
   disX.push(this.leftPaper.findViewByModel(clone[i]).getBBox().origin().x - this.leftPaper.findViewByModel(clone[0]).getBBox().origin().x)
   disY.push(this.leftPaper.findViewByModel(clone[i]).getBBox().origin().y - this.leftPaper.findViewByModel(clone[0]).getBBox().origin().y)
   }
   // 角度还原重新计算
   let oPos1 = this.getBorder(this.leftPaper.findViewByModel(clone[0]), this.leftPaper)
   let ratioX = 100 / (oPos1.max_x - oPos1.min_x)
   clone[0].resize(ratioX * clone[0].size().width, ratioX * clone[0].size().height)
   clone[0].position(20 + (clone[0].position().x - oPos1.min_x) * ratioX, $('#component').height() + (clone[0].position().y - oPos1.min_y) * ratioX)
   for (let i = 1 i < clone.length i++) {
   clone[i].resize(ratioX * clone[i].size().width, ratioX * clone[i].size().height)
   clone[i].position(ratioX * disX[i - 1] + clone[0].getBBox().origin().x, ratioX * disY[i - 1] + clone[0].getBBox().origin().y)
   }
   for (let j = 0 j < clone.length j++) {
   clone[j].set('z', this.leftGraph.getCells().length + j + 1)
   }
   let oPos2 = this.getBorder(this.leftPaper.findViewByModel(clone[0]), this.leftPaper)
   $('#component').css('height', ($('#component').height() + oPos2.max_y - oPos2.min_y + 20) + 'px')
   this.cells = []
   }, */
  // 获取元素的最大最小x,y
  getBorder (cellView, paper) {
    let childs = cellView.model.getEmbeddedCells({deep: true})
    let BBox = cellView.getBBox()
    let pointXArr = [BBox.corner().x, BBox.origin().x]
    let pointYArr = [BBox.corner().y, BBox.origin().y]
    for (let i = 0; i < childs.length; i++) {
      let childBBox = paper.findViewByModel(childs[i]).getBBox()
      pointXArr.splice(pointXArr.length, 0, childBBox.corner().x, childBBox.origin().x)
      pointYArr.splice(pointYArr.length, 0, childBBox.corner().y, childBBox.origin().y)
    }
    let extremeX = this.getExtreme(pointXArr)
    let extremeY = this.getExtreme(pointYArr)
    let maxX = extremeX.max
    let minX = extremeX.min
    let minY = extremeY.min
    let maxY = extremeY.max
    return {max_x: maxX, min_x: minX, max_y: maxY, min_y: minY}
  },
  // 获取数组中的最大最小值
  getExtreme (arr) {
    return {max: Math.max(...arr), min: Math.min(...arr)}
  },
  // 获取终极祖先cell
  getParent (cell) {
    return cell.getAncestors().length !== 0 ? cell.getAncestors()[cell.getAncestors().length - 1] : cell
  },
  // 根据当前view获取与之组合过的cell
  getAllCells (view) {
    let parent = view.model.getAncestors()[view.model.getAncestors().length - 1]
    let allCells = []
    if (parent) {
      // 如果是子元素
      allCells = parent.getEmbeddedCells({deep: true})
      allCells.unshift(parent)
    } else {
      // 如果不是子元素
      allCells = view.model.getEmbeddedCells({deep: true})
      allCells.unshift(view.model)
    }
    return allCells
  },

  unHighLight () {
    for (let i = 0; i < this.cells.length; i++) {
      this.centerPaper.findViewByModel(this.cells[i]).unhighlight()
    }
  },
  creatWrapper (cellView, centerPaper) {
    if (cellView.model.get('type') !== 'link') {
      let getBorderXY = this.getBorder(cellView, centerPaper)
      let maxX = getBorderXY.max_x
      let minX = getBorderXY.min_x
      let maxY = getBorderXY.max_y
      let minY = getBorderXY.min_y
      // 三个按钮定位
      let leftTop = {
        left: '-25px',
        top: '-25px'
      }
      let leftBottom = {
        left: '-25px',
        bottom: '-25px'
      }
      let rightTop = {
        right: '-25px',
        top: '-25px'
      }
      let rightBottom = {
        right: '-25px',
        bottom: '-25px'
      }
      // 八个拉伸按钮定位
      let location = [
        {
          'left': '-3px',
          'top': '-3px',
          'cursor': 'nw-resize'
        },
        {
          'left': ((maxX - minX) / 2 - 3) + 'px',
          'top': '-3px',
          'cursor': 'n-resize'
        },
        {
          'right': '-3px',
          'top': '-3px',
          'cursor': 'ne-resize'
        },
        {
          'left': '-3px',
          'top': ((maxY - minY) / 2 - 3) + 'px',
          'cursor': 'w-resize'
        },
        {
          'right': '-3px',
          'top': ((maxY - minY) / 2 - 3) + 'px',
          'cursor': 'e-resize'
        },
        {
          'left': '-3px',
          'bottom': '-3px',
          'cursor': 'sw-resize'
        },
        {
          'left': ((maxX - minX) / 2 - 3) + 'px',
          'bottom': '-3px',
          'cursor': 's-resize'
        },
        {
          'right': '-3px',
          'bottom': '-3px',
          'cursor': 'se-resize'
        }
      ]
      for (let i = 0; i < 8; i++) {
        $('.stretch-icon').eq(i).css(location[i])
      }
      $('.left_top').css(leftTop)

      $('.left_bottom').css(leftBottom)

      $('.right_top').css(rightTop)

      $('.right_bottom').css(rightBottom)

      $('#functionBtn').css({
        'width': (maxX - minX) + 'px',
        'height': (maxY - minY) + 'px',
        'left': minX + 'px',
        'top': minY + 'px',
        'display': 'block'
      })
      $('#dragBtn').css({
        'width': (maxX - minX) + 'px',
        'height': (maxY - minY) + 'px',
        'left': minX + 'px',
        'top': minY + 'px',
        'display': 'block'
      })
      $('#labelBox').css({
        'width': (maxX - minX + 20) + 'px',
        'left': (minX - 15) + 'px',
        'top': (maxY + 25) + 'px',
        'display': 'block'
      })
      // $('#toolTip').css({
      //   'width': (maxX - minX - 10) + 'px',
      //   'left': minX + 'px',
      //   'top': (minY - 50) + 'px'
      // })
      let angle = this.initialAngle[cellView.model.id] ? this.angle[cellView.model.id] - this.initialAngle[cellView.model.id] : this.angle[cellView.model.id]
      $('#labelBox').empty().append('宽：' + parseInt(maxX - minX) + '，高：' + parseInt(maxY - minY) + '，x：' + parseInt(minX) + '，y：' + parseInt(minY) + '，angle：' + parseInt(angle))
      // $('#toolTip').show().empty().append('<p title="' + cellView.model.attributes.defaultName + '">' + cellView.model.attributes.defaultName + '</p><input type="text" class="hidden" placeholder="' + cellView.model.attributes.defaultName + '">')
      return {max_x: maxX, min_x: minX, min_y: minY, max_y: maxY}
    }
  },
  /**
   *定义连线
   *sx 开始x坐标
   *sy 开始y坐标
   *ex 结束x坐标
   *ey 结束y坐标
   *strokecolor 线条颜色
   *scolor 头部分填充颜色
   *sstyle 头部分样式
   *ecolor 尾部分填充颜色
   *estyle 尾部分样式
   *pstrokewidth  连线的粗
   *sstroke    头部边框颜色
   *estroke   尾部分的边框颜色
   */
  /* getLink(sx, sy, ex, ey, scolor, sstyle, ecolor, estyle, strokecolor, pstrokewidth, sstroke, estroke, plabel) {
    let link = new joint.dia.Link({
      source: { x: sx, y: sy },
      target: { x: ex, y: ey },
      attrs: {
        '.connection': {stroke: strokecolor, 'stroke-width': pstrokewidth, 'stroke-dasharray': 0},
        '.marker-source': {fill: scolor, stroke: sstroke, d: sstyle},
        '.marker-target': {fill: ecolor, stroke: estroke, d: estyle}
      },
      // 10, 25, 110, 25, #31d0c6, M 10 0 L 0 5 L 10 10 z, #fe854f, M 10 0 L 0 5 L 10 10 z, #222138, 1, none, #7c68fc, ''
      // '.connection': { stroke: '#222138' },
      // '.marker-source': { fill: '#31d0c6', stroke: 'none', d: 'M 10 0 L 0 5 L 10 10 z' },
      // '.marker-target': { fill: '#fe854f', stroke: '#7c68fc', d: 'M 10 0 L 0 5 L 10 10 z' }
      labels: [
        {position: 0.5, attrs: {text: {text: plabel}}}
      ]
    })
    return link
  }, */
  // 获取线段初始化样式
  /* getLeftLinkView() {
    let LinkView = joint.dia.LinkView.extend({
      addVertex: function(evt, x, y) {},
      removeVertex: function(endType) {},
      pointerdown: function(evt, x, y) {
        this._click = true
        joint.dia.ElementView.prototype.pointerdown.apply(this, arguments)
      },
      pointerup: function(evt, x, y) {
        if (this._click) {
          // triggers an event on the paper and the element itself
          this.notify('cell:click', evt, x, y)
        } else {
          joint.dia.ElementView.prototype.pointerup.apply(this, arguments)
        }
      }
    })
    return LinkView
  } */
  //  文件下载为png
  savePng (fileName) {
    let name = fileName + '.png'
    saveSvgAsPng.saveSvgAsPng($('#canvas_content>svg')[0], name)
    return true
  },
  //  文件下载为svg
  saveSvg () {
    let svg = $('#canvas_content>svg')[0].outerHTML
    let file = `<?xml version="1.0" standalone="no"?>
      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
      "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">` + svg
    return file
  },
  saveThumb (file) {
    let that = this
    saveSvgAsPng.svgAsPngUri($('#canvas_content>svg')[0], {}, function (uri) {
      that.thumb = uri
    })
  }
}
export default drawObj
