let fs = require('fs')
let path = require('path')
let os = require('os')
let userInfo = os.userInfo().homedir
let isdb = path.join(userInfo, 'guangVideo/data/config.db')
let sqlite3 = require('sqlite3').verbose()
let { filecopy } = require("./file")
//创建数据文件夹
export let sqldata = val => {
    var sql = new sqlite3.Database(isdb)
    sql.serialize(function () {
        //serialize   call.
        //creat a table student
        sql.run(val)
    })
    sql.close() //close 
}
export let sqlonly = (sql, val) => {
    let db = new sqlite3.Database(isdb)
    if (val == undefined) val = []
    return new Promise((resolve, reject) => {
        db.all(sql, val, (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
        db.close() //close
    })
}
export let sqlall = sql => {
    let db = new sqlite3.Database(isdb)
    return new Promise((resolve, reject) => {
        db.all(sql, (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
        db.close() //close
    })
}
let configFile = async () => {    /**
    * uuid: randomWord(false, 9, 9, 1), 
     uupwd: randomWord(false, 6, 6),
     list:[]
    */
    filecopy()
    setTimeout(() => {
        sqldata(`
     CREATE TABLE "user" (
         "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
         "area" text,
        "email" text,
        "employ" text,
        "img" text,
        "logintime" text,
        "name" text,
        "phone" text,
        "signin" text,
        "token" text,
        "uuid" text,
        "vocational" text,
        "upwd" text,
        "motto" text,
        "checks" text,
        type text
       );
     `)
    }, 100)
    setTimeout(() => {
        sqldata(`
     CREATE TABLE "list" (
         "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
         "value" text,
         "startDate" text
       );
     `)
    }, 100)
}
if (!fs.existsSync(isdb)) {
    configFile()
}