/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-26 16:25:40
 * @LastEditTime: 2021-08-26 16:31:34
 */
let { sqlall, sqldata, sqlonly } = require('./sqlite')
let { createWindow } = require("./BrowserWin")  //主要窗口
//登录记住密码
export let userLogin = async (e) => {
    let cz = `select id from user where email=? ORDER BY "logintime" DESC`
    let d = await sqlonly(cz, [e.email])
    if (d && d.length > 0) {
        let sel = `UPDATE user SET area=?, email=?, employ=?, img=?, logintime=?, name=?, phone=?, signin=?, token=?, uuid=?, vocational=?, upwd=?,checks=?,motto=?,type=? WHERE id = ?`
        await sqlonly(sel, [e.area, e.email, e.employ, e.img, e.logintime, e.name, e.phone, e.signin, e.token, e.uuid, e.vocational, e.upwd, e.checks, e.motto, e.type, d[0].id])
    } else {
        let sq = `INSERT INTO user(id, area, email, employ, img, logintime, name, phone, signin, token, uuid, vocational, upwd,checks,motto,type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        await sqlonly(sq, [e.id, e.area, e.email, e.employ, e.img, e.logintime, e.name, e.phone, e.signin, e.token, e.uuid, e.vocational, e.upwd, e.checks, e.motto, e.type])

    }
    await createWindow("002", winURL + "#/index?id=" + e.uuid, 300, 700, winobj)
    // winobj.get("002").webContents.openDevTools({
    //   activate: true
    // })
    await winobj.get("001").close()
    winobj.delete("001")
}
//获取最后登录的账号回显
export let loginRecord = async () => {
    let cz = `select email,upwd,checks,img,type,uuid from user ORDER BY logintime DESC`
    let d = await sqlall(cz)
    winobj.get("001").send('message', { type: "loginRecord", data: d[0] })
}
//获取用户信息
export let getAppuser = async () => {
    let sql = "select email,upwd,img,name,uuid,type from user ORDER BY logintime DESC"
    let res = await sqlonly(sql)
    winobj.get("001").send("message", { type: "getAppuser", data: res })
}
//关闭自动登录
export let setNoLgoin = async () => {
    let cz = `select id,checks from user ORDER BY "logintime" DESC`
    let d = await sqlonly(cz, [])
    if (d && d.length > 0) {
        let checks = JSON.parse(d[0].checks)
        checks[1].is = false
        let sel = `UPDATE user SET checks=? WHERE id = ?`
        await sqlonly(sel, [JSON.stringify(checks), d[0].id])
    }
}
//退出登录
export let userEsclogin = async (d) => {
    let ins = `UPDATE user SET checks = ?,logintime=? WHERE id = ?`
    let data = JSON.parse(d.checks)
    data[1].is = false
    let sd = await sqlonly(ins, [JSON.stringify(data), +new Date() + "", d.id])
    if (sd) {
        createWindow("001", winURL, 360, 500, winobj)
        setTimeout(() => {
            winobj.forEach((e, i) => {
                if (i != "001") {
                    winobj.get(i).close()
                    winobj.delete(i)
                }
            })
            winobj.get("001").focus()
        })
    }
}