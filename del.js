const rimraf = require('rimraf');
let data = ["./node_modules"]
data.map(e => {
  rimraf(e, function (err) { // 删除当前目录下的 data
    console.log(err);
  });
})