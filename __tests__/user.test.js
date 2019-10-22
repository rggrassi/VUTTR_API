const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('User', () => {
  const user = {
    name: 'Rodrigo Grassi',
    email: 'rgrassi1@gmail.com',
    password: '123456'
  }

  beforeEach(async () => {
    await User.deleteMany({});
  })

  it('should be able to register', async () => {
    const response = await request(app)
      .post('/users')
      .send(user)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('role');
    expect(response.body.role).toBe('user');
    expect(response.status).toBe(201);
  })

  it('should not be able register an user with email already used', async () => {
    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400); 
  })

  describe('User authenticated', () => {
    let token = '';
    let idUser = '';
    beforeEach(async () => {
      const { _id } = await User.create(user);
      idUser = _id;

      const auth = await request(app)
        .post('/session')
        .send({ email: 'rgrassi1@gmail.com', password: '123456' });
      token = auth.body.token;  
    })

    it('should be able to update your registration', async () => {
      const response = await request(app)
        .put(`/users/${idUser}`)
        .set('Authorization', `Bearer: ${token}`)
        .send({
          name: 'Rodrigo Antonio Grassi',
          email: 'rodrigo@gmail.com'
        })
        .expect('Content-Type', /json/);
    
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Rodrigo Antonio Grassi'); 
      expect(response.body.email).toBe('rodrigo@gmail.com');
    })
  })
})