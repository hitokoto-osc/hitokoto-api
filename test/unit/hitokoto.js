// Test Hitokoto Database Connection
const expect = require('chai').expect
const path = require('path')
const srcDir = path.join(__dirname, '../../src/')
const testDir = path.join(__dirname, '../')
const prestart = require(testDir + 'prestart')
prestart.load()
describe('Hitokoto Datebase Test', () => {
  const db = require(testDir + 'db')
  it('DB Connection should be true', async () => {
    const result = !!await db.connect()
    expect(result).to.be.true  
  })
  it('Register Model should be true', async() => {
    const result = !!await db.registerModel('hitokoto')
    expect(result).to.be.true 
  })
  it('Try get data from database', async () => {
    const hitokoto = await db.registerModel('hitokoto')
    const data = await hitokoto.findOne()
    expect(!!data).to.be.true
  })
  after(()=>{
    process.exit()
  })
})
