'use strict'
const nconf = require('nconf')
const winston = require('winston')
const bluebird = require('bluebird')
const nodemailer = require('nodemailer')

class mail {
  static async connect () {
    const config = {
      pool: true, // use pool
      host: nconf.get('mail:host'),
      port: nconf.get('mail:port') || 465,
      secure: nconf.get('mail:ssl'), // use TLS
      auth: {
        user: nconf.get('mail:username'),
        pass: nconf.get('mail:password')
      }
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
    return true
  }
  /*
  * msg - Object
  *   -- to To Mail (String)
  *   -- title Mail Title (String)
  *   -- body Mail Body (String)
  *   -- html is HTML Text (Bool)
  */
  static send (params) {
    this.connect()
    const msg = params
    msg.subject = msg.title
    msg.from = nconf.get('mail:username')
    msg.html ? msg.html = msg.body : msg.text = msg.body
    delete msg.body
    delete msg.title
    return this.smtp.sendMailAsync(msg)
  }
  static error (err) {
    // Send Error to Admins
    const admin = nconf.get('admin')
    return this.send({
      title: 'Crash! Error Report!',
      to: admin,
      body: JSON.stringify(err)
    })
  }
}

