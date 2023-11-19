const request = require('supertest')

function baseCheckHitokoto(response, minLength, maxLength) {
  expect(response.body.id).toBeNumber()
  expect(response.body.uuid).toBeString()
  expect(response.body.hitokoto).toBeString()
  expect(response.body.type).toBeString()
  expect(response.body.from).toBeString()
  if (typeof response.body.from_who === 'object') {
    expect(response.body.from_who).toBeNull()
  } else {
    expect(typeof response.body.from_who).toBeString()
  }
  expect(response.body.creator).toBeString()
  expect(response.body.creator_uid).toBeNumber()
  expect(response.body.reviewer).toBeNumber()
  expect(response.body.commit_from).toBeString()
  expect(response.body.created_at).toBeString()
  expect(response.body.length).toBeNumber()

  // logic assert
  expect(response.body.id).toBeGreaterThan(0)
  expect(response.body.uuid).toHaveLength(36)
  expect(response.body.hitokoto.length).toBeGreaterThanOrEqual(minLength)
  expect(response.body.hitokoto.length).toBeLessThanOrEqual(maxLength)
}
describe('GET /', () => {
  test('check response', (done) => {
    request('http://127.0.0.1:8000')
      .get('/')
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        // type assert
        baseCheckHitokoto(response, 0, 30)
        done()
      })
      .catch((err) => done(err))
  })
})

describe('GET /?charset=gbk', () => {
  test('check response', (done) => {
    request('http://127.0.0.1:8000')
      .get('/?charset=gbk')
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/)
      .expect('Content-Type', /gbk/)
      .expect(200)
      .then((response) => {
        // type assert
        baseCheckHitokoto(response, 0, 1000) // TODO: fix gbk length test
        done()
      })
      .catch((err) => done(err))
  })
})

describe('GET /?c=a', () => {
  test('check response', (done) => {
    request('http://127.0.0.1:8000')
      .get('/?c=a')
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        baseCheckHitokoto(response, 0, 30)
        done()
      })
      .catch((err) => done(err))
  })
})

describe('GET /?encode=js', () => {
  test('check response', (done) => {
    request('http://127.0.0.1:8000')
      .get('/?encode=js')
      .set('Accept', 'application/javascript')
      .send()
      .expect('Content-Type', /javascript/)
      .expect(200)
      .then((response) => {
        expect(response.text).toBeString()
        expect(response.text).toMatch(
          // eslint-disable-next-line no-useless-escape
          /\(function hitokoto\(\){var hitokoto="(.*)"\;var dom=document\.querySelector\('\.hitokoto'\);Array\.isArray\(dom\)\?dom\[0\]\.innerText=hitokoto:dom.innerText=hitokoto;}\)\(\)/,
        )
        done()
      })
      .catch((err) => done(err))
  })
})

describe('GET /?encode=js&select=%23hitokoto', () => {
  test('check response', (done) => {
    request('http://127.0.0.1:8000')
      .get('/?encode=js&select=%23hitokoto')
      .set('Accept', 'application/javascript')
      .send()
      .expect('Content-Type', /javascript/)
      .expect(200)
      .then((response) => {
        expect(response.text).toBeString()
        expect(response.text).toMatch(
          // eslint-disable-next-line no-useless-escape
          /\(function hitokoto\(\){var hitokoto="(.*)"\;var dom=document\.querySelector\('#hitokoto'\);Array\.isArray\(dom\)\?dom\[0\]\.innerText=hitokoto:dom.innerText=hitokoto;}\)\(\)/,
        )
        done()
      })
      .catch((err) => done(err))
  })
})

describe('GET /?encode=text', () => {
  test('check response', (done) => {
    request('http://127.0.0.1:8000')
      .get('/?encode=text')
      .set('Accept', 'text/plain')
      .send()
      .expect('Content-Type', /text\/plain/)
      .expect(200)
      .then((response) => {
        // type assert
        expect(response.text).toBeString()
        expect(response.text.length).toBeGreaterThanOrEqual(0)
        expect(response.text.length).toBeLessThanOrEqual(30)
        done()
      })
      .catch((err) => done(err))
  })
})

describe('GET /?callback=hitokoto', () => {
  test('check response', (done) => {
    request('http://127.0.0.1:8000')
      .get('/?callback=hitokoto')
      .set('Accept', 'text/javascript')
      .send()
      .expect('Content-Type', /text\/javascript/)
      .expect(200)
      .then((response) => {
        // type assert
        expect(response.text).toBeString()
        expect(response.text).toMatch(/;hitokoto\((.*)\);/)
        done()
      })
      .catch((err) => done(err))
  })
})

describe('GET /?min_length=50&max_length=100', () => {
  test('check response', (done) => {
    request('http://127.0.0.1:8000')
      .get('/?min_length=50&max_length=100')
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        // type assert
        baseCheckHitokoto(response, 50, 100)
        done()
      })
      .catch((err) => done(err))
  })
})
