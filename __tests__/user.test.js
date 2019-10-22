const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('User', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  it('should be able to register', async () => {
    const user = {
      name: 'Rodrigo Grassi',
      email: 'rgrassi1@gmail.com',
      password: '123456'
    }
    const response = await request(app)
      .post('/users')
      .send(user)
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('role');
      expect(response.body.role).toBe('user');
  })

  it('should not register an user with email already used', async () => {
    await request(app)
      .post('/users')
      .send({
        name: 'Rodrigo Grassi',
        email: 'rgrassi1@gmail.com',
        password: '123456'
      })

    const response = await request(app)
      .post('/users')
      .send({
        name: 'Rodrigo Grassi',
        email: 'rgrassi1@gmail.com',
        password: '123456'
      })
    expect(response.status).toBe(400);    
  })
})