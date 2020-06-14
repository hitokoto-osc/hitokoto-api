'use strict'
const nconf = require('nconf')
const winston = require('winston')
const bluebird = require('bluebird')
const nodemailer = require('nodemailer')
const pkg = require('../package')
const htmlEscape = require('./utils').htmlEscape
class mail {
  static async connect () {
    if (this.smtp) {
      return this.smtp
    } else {
      const config = {
        pool: true, // use pool
        host: nconf.get('mail:host'),
        port: nconf.get('mail:port') || 465,
        secure: nconf.get('mail:ssl'), // use TLS
        auth: {
          user: nconf.get('mail:username'),
          pass: nconf.get('mail:password')
        },
        tls: { rejectUnauthorized: false }
      }
      const transporter = nodemailer.createTransport(config)
      await transporter.verify((err, success) => {
        if (err) {
          winston.error(err)
          process.exit(1)
        } else {
          winston.verbose('SMTP Connection Pool is ready.')
        }
      })
      this.smtp = bluebird.promisifyAll(transporter)
      return this.smtp
    }
  }

  /*
  * msg - Object
  *   -- to To Mail (String)
  *   -- title Mail Title (String)
  *   -- body Mail Body (String)
  *   -- html is HTML Text (Bool)
  */
  static async send (params) {
    await this.connect()
    const msg = params
    msg.subject = msg.title
    msg.from = pkg.name + ' <' + nconf.get('mail:username') + '>'
    msg.html ? msg.html = msg.body : msg.text = msg.body
    delete msg.body
    delete msg.title
    return this.smtp.sendMailAsync(msg)
  }

  static error (errStruct) {
    // Send Error to Admins
    const admin = nconf.get('admin')
    const to = Array.isArray(admin) ? admin.join(',') : admin
    let html = htmlEscape(errStruct.e.stack)
    html = `
<h1>错误报告！</h1>
<small>这是一个由于控制器处理时发生错误而产生的邮件。 </small>
<p>节点编号: ${errStruct.clientId}</p>
<p>触发时间: ${new Date().toISOString()} （零时区）</p>
<p>请求路径: ${errStruct.request.url}</p>
<p>请求 IP: ${errStruct.request.ip}</p>
<p>请求细节:</p>
<pre>
  <code>
  ${JSON.stringify(errStruct.request)}
  </code>
</pre> 
<p>错误细节:</p>
<pre>
  <code>${html}</code>
</pre>
`
    return this.send({
      title: '发生意外错误！ 请进行修复！',
      to: to,
      body: html,
      html: true
    })
  }
}
module.exports = mail
