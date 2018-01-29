const preStart = require('../prestart')
preStart.load()
const expect = require('chai').expect

describe('Test Mail', () => {
  const mail = require('../../src/mail')
  it('should be connect successful', async () => {
    const result = !!(await mail.connect())
    expect(result).to.be.true
  })
  it('Should be send successful', async() => {
    mail.send({
      to: 'a632079@gmail.com',
      title: 'Hello',
      body: 'Happy New Year!',
    })
      .then(res => {
        console.log(res)
        expect(!!res).to.be.true
      })
      .catch(err => {
        console.log(err)
        expect(false).to.be.true
      })
    // 
  })
})
