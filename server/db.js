// Schema、Model、Entity或者Documents的关系请牢记，Schema生成Model，Model创造Entity，Model和Entity都可对数据库操作造成影响，但Model比Entity更具操作性。
const mongoose = require('mongoose')
// 连接数据库 如果不自己创建 默认test数据库会自动生成
mongoose.connect('mongodb://localhost/flowchart')

// 为这次连接绑定事件
const db = mongoose.connection
db.once('error', () => console.log('Mongo connection error'))
db.once('open', () => console.log('Mongo connection successed'))
/**
  * ************ 定义模式userSchema ************
 * **/
const userSchema = mongoose.Schema({
  account: String,
  password: String
})

/**
 * ************ 定义模式fileSchema ************
 * **/
const fileSchema = mongoose.Schema({
  userId: String,
  fileName: String,
  editTime: String,
  fileStatus: String,
  fileThumb: String,
  cells: String,
  like: 0,
  collect: 0
})

/**
 * ************ 定义模式collectSchema ************
 * **/
const collectSchema = mongoose.Schema({
  userId: String,
  fileId: String
})

/**
 * ************ 定义模式likeSchema ************
 * **/
const likeSchema = mongoose.Schema({
  userId: String,
  fileId: String
})

/**
 * ************ 定义模型Model ************
 * **/
const Models = {
  User: mongoose.model('User', userSchema),
  File: mongoose.model('File', fileSchema),
  Collect: mongoose.model('Collect', collectSchema),
  Like: mongoose.model('Like', likeSchema)
}

module.exports = Models
