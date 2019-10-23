const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Session', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  })
    
  it('should be able to authenticate to the API', async () => {
    await User.create({  
      name: 'Rodrigo Grassi',
      email: 'rgrassi1@gmail.com',
      password: '123456'
    })

    const response = await request(app)
      .post('/session')
      .send({
        email: 'rgrassi1@gmail.com',
        password: '123456'
      })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('name');
    expect(response.body.user).toHaveProperty('email');
    expect(response.body.user).toHaveProperty('role');
  })

  it('should not be able to authenticate to the API with invalid data', async () => {
    await User.create({  
      name: 'Rodrigo Grassi',
      email: 'rgrassi1@gmail.com',
      password: '123456'
    });

    const response = await request(app)
      .post('/session')
      .send({
        email: 'rgrassi1$gmail.com',
        password: '12345'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation fails');    
  })

  it('should not be able to authenticate to the API without first registering', async (done) => {
    const response = await request(app)
      .post('/session')
      .send({
        email: 'usernotfound@email.com',
        password: '123456'
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Could not find your account');    

      done();
  })

  it('should not be able to authenticate to API without checking password', async () => {
    await User.create({  
      name: 'Rodrigo Grassi',
      email: 'rgrassi1@gmail.com',
      password: '123456'
    });

    const response = await request(app)
      .post('/session')
      .send({
        email: 'rgrassi1@gmail.com',
        password: '1234567'
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Wrong credentials');    
  })
})