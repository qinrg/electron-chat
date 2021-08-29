/*
 * @Author: qinruiguang
 * @LastEditors: qinruiguang
 * @Date: 2021-08-26 16:16:04
 * @LastEditTime: 2021-08-26 16:16:05
 */
/*
     限制用户只允许单开
     */
  // let gotTheLock = app.requestSingleInstanceLock()
  // if (!gotTheLock) {
  //   app.quit()
  // } else {
  //   app.on('second-instance', (event, commandLine, workingDirectory) => {
  //     // 当运行第二个实例时,将会聚焦到myWindow这个窗口
  //     // if (win) {
  //     //   win.get("002").focus()
  //     // }
  //     let cz = `select id from user where email=? ORDER BY "logintime" DESC`
  //     let d = await sqlonly(cz, [e.email])
  //     if (d && d.length > 0) {
  //       let sel = `UPDATE user SET area=?, email=?, employ=?, img=?, logintime=?, name=?, phone=?, signin=?, token=?, uuid=?, vocational=?, upwd=?,checks=?,motto=? WHERE id = ?`
  //       await sqlonly(sel, [e.area, e.email, e.employ, e.img, e.logintime, e.name, e.phone, e.signin, e.token, e.uuid, e.vocational, e.upwd, e.checks, e.motto, d[0].id])
  //     }
  //   })
  // }