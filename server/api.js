const models = require('./db')
const express = require('express')
const router = express.Router()
const fs = require('fs')
/**
 * ************ 创建(create) 读取(get) 更新(update) 删除(delete) ************
 * **/

// 创建账号接口
router.post('/api/user/createAccount', (req, res) => {
  // 这里的req.body能够使用就在index.js中引入了const bodyParser = require('body-parser')
  let newAccount = new models.User({
    account: req.body.account,
    password: req.body.password
  })
  // 保存数据newAccount数据进mongoDB
  newAccount.save((err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 获取已有账号接口
router.get('/api/user/getAccount', (req, res) => {
  // 通过模型去查找数据库
  models.User.find((err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 修改账号密码接口
router.post('/api/user/editPassword', (req, res) => {
  let id = req.body.userId
  let updatestr = {
    password: req.body.password
  }
  models.User.findByIdAndUpdate(id, updatestr, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 根据用户id获取该用户的账号密码
router.get('/api/user/getUser', (req, res) => {
// 通过模型去查找数据库中对应用户的文件
  let condition = { '_id': req.query.userId }
  models.User.find(condition, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 获取所有文件接口
router.get('/api/file/getAllFile', (req, res) => {
  // 通过模型去查找数据库
  models.File.find((err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 根据用户名获取该用户的所有文件
router.get('/api/file/getFile', (req, res) => {
// 通过模型去查找数据库中对应用户的文件
  let condition = { 'userId': req.query.userId }
  models.File.find(condition, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 根据文件id获取该用户的所有文件
router.get('/api/file/getFileByFileid', (req, res) => {
// 通过模型去查找数据库中对应用户的文件
  let condition = { '_id': req.query.id }
  models.File.find(condition, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 新建文件接口
router.post('/api/file/createFile', (req, res) => {
  let newFile = new models.File({
    userId: req.body.userId,
    fileName: req.body.fileName,
    editTime: req.body.editTime,
    fileStatus: req.body.fileStatus,
    fileThumb: req.body.fileThumb,
    like: req.body.like,
    collect: req.body.collect,
    cells: req.body.cells
  })
  // 保存数据newFile数据进mongoDB
  newFile.save((err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 删除文件接口
router.get('/api/file/deleteFile', (req, res) => {
// 通过模型去查找数据库中对应用户的文件
  let condition = { '_id': req.query.fileId }
  models.File.remove(condition, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 修改文件接口
router.post('/api/file/editFile', (req, res) => {
  let editProps = req.body.editProps
  let id = req.body.id
  let updatestr = {}
  if (editProps === 'name') {
    updatestr = {
      fileName: req.body.fileName,
      editTime: req.body.editTime
    }
  } else if (editProps === 'status') {
    updatestr = {
      fileStatus: req.body.fileStatus,
      editTime: req.body.editTime
    }
  } else if (editProps === 'like') {
    updatestr = {
      like: req.body.like
    }
  } else if (editProps === 'collect') {
    updatestr = {
      collect: req.body.collect
    }
  } else {
    updatestr = {
      userId: req.body.userId,
      fileName: req.body.fileName,
      editTime: req.body.editTime,
      fileStatus: req.body.fileStatus,
      fileThumb: req.body.fileThumb,
      cells: req.body.cells
    }
  }
  models.File.findByIdAndUpdate(id, updatestr, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// svg文件下载
router.get('/api/file/downloadSingle', (req, res) => {
  let fileName = req.query.fileName + '.svg'
  let path = './' + fileName
  let file = req.query.file
  fs.writeFile(path, file, function (err) {
    if (err) console.error(err)
    console.log('数据写入的数据')
    console.log('-------------------')
    setTimeout(function () {
      res.download(path, fileName, function (error) {
        console.log('download:  ' + error)
      })
    }, 1000)
  })
})
// 创建收藏接口
router.post('/api/collect/createCollection', (req, res) => {
  // 这里的req.body能够使用就在index.js中引入了const bodyParser = require('body-parser')
  let newCollection = new models.Collect({
    userId: req.body.userId,
    fileId: req.body.fileId
  })
  // 保存数据newAccount数据进mongoDB
  newCollection.save((err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 根据用户名获取该用户的所有收藏
router.get('/api/collect/getCollection', (req, res) => {
// 通过模型去查找数据库中对应用户的文件
  let condition = { 'userId': req.query.userId }
  models.Collect.find(condition, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 根据用户id和文件id获取收藏信息
router.get('/api/collect/getCollectionByAll', (req, res) => {
// 通过模型去查找数据库中对应用户的文件
  let condition = {'userId': req.query.userId, 'fileId': req.query.fileId}
  models.Collect.find(condition, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 取消收藏接口
router.get('/api/collect/deleteCollection', (req, res) => {
// 通过模型去查找数据库中对应用户的文件
  let condition = {'_id': req.query.id}
  models.Collect.remove(condition, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 创建点赞接口
router.post('/api/like/createLike', (req, res) => {
  // 这里的req.body能够使用就在index.js中引入了const bodyParser = require('body-parser')
  let newLike = new models.Like({
    userId: req.body.userId,
    fileId: req.body.fileId
  })
  // 保存数据newAccount数据进mongoDB
  newLike.save((err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 根据文件id获取点赞信息
router.get('/api/like/getLike', (req, res) => {
// 通过模型去查找数据库中对应用户的文件
  let condition = {'fileId': req.query.fileId}
  models.Like.find(condition, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 根据文件id获取点赞信息
router.get('/api/like/getLikeByAll', (req, res) => {
// 通过模型去查找数据库中对应用户的文件
  let condition = {'userId': req.query.userId, 'fileId': req.query.fileId}
  models.Like.find(condition, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
// 取消点赞接口
router.get('/api/like/deleteLike', (req, res) => {
// 通过模型去查找数据库中对应用户的文件
  let condition = {'_id': req.query.id}
  models.Like.remove(condition, function (err, data) {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
})
module.exports = router
