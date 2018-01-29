const preStart = require('./prestart')
preStart.load()
const db = require('./db')
function randomString (len) {
  len = len || 32
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const maxPos = chars.length
  let pwd = ''
  for (i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}
async function generateDate () {
  const hitokoto = await db.registerModel('hitokoto')
  // Generate 100 data
  for (let index = 0; index < 100; index++) {
    hitokoto.create({
      hitokoto: randomString(20),
      type: 'c',
      from: 'test',
      creator: 'hitokoto',
      owner: 'hitokoto'
    })
      .catch(err => {
        console.log(err)
        process.exit(1)
      })
  }
}
generateDate()
