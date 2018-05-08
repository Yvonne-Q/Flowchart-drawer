const fs = require('fs')
const fileObj = {
  // 新建文件方法
  createFile (fileName, fileContent) {
    console.log('准备写入文件')
    fs.writeFile(fileName + '.svg', fileContent, function (err) {
      if (err) console.error(err)
      console.log('数据写入的数据')
      console.log('-------------------')
    })
  }
}
export default fileObj
// console.log('读取写入的数据')
// fs.readFile('input.txt', function (err, data) {
//   if (err) console.error(err)
//   console.log('异步读取文件数据：' + data.toString())
// })
