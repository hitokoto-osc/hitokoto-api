const request = require('supertest')
describe('GET /ping', () => {
  test('check response', (done) => {
    request('http://127.0.0.1:8000')
      .get('/ping')
      .set('Accept', 'application/json')
      .send()
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.status).toBe(200)
        expect(response.body.message).toBe('ok')
        done()
      })
      .catch((err) => done(err))
  })
})
