const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('User', () => {
  const userAux = {
    name: 'Rodrigo Grassi',
    email: 'rgrassi1@gmail.com',
    password: '123456'
  }
  const userAux2 = {
    name: 'Robert Ryan',
    email: 'robert@email.com',
    password: '123456'
  }

  beforeEach(async () => {
    await User.deleteMany({});
  })

  it('should be able to register', async(done) => {
    const response = await request(app)
      .post('/users')
      .send(userAux)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('role');
    expect(response.body.role).toBe('user');
    expect(response.status).toBe(201);

    done();
  })

  it('should not be able to register with invalid data', async(done) => {
    const response = await request(app)
      .post('/users')
      .send({
        name: '',
        email: 'rgrassi1$email.com',
        password: '12345',        
      }) 
      .expect('Content-Type', /json/); 

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation fails');    

    done();
  })

  it('should encrypt the password when a new user created or password changed', async(done) => {
    const user = await User.create(userAux);
    const compareHash = await user.checkPassword(userAux.password);

    expect(compareHash).toBe(true);

    done();
  })

  it('should not be able register with email already used', async(done) => {    
    await User.create(userAux);  

    const response = await request(app)
      .post('/users')
      .send(userAux)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400); 
    expect(response.body.message).toBe('User not available');

    done();
  })

  describe('User authenticated', () => {
    let token = '';
    let userNew = {};
    let userNew2 = {};

    beforeEach(async () => {
      userNew = await User.create(userAux);
      userNew2 = await User.create(userAux2);

      const auth = await request(app)
        .post('/session')
        .send({ email: userAux.email, password: userAux.password });
      token = auth.body.token;  
    })

    it('should be able to update your registration', async (done) => {
      const response = await request(app)
        .put(`/users/${userNew._id}`)
        .set('Authorization', `Bearer: ${token}`)
        .send({
          name: 'Rodrigo Antonio Grassi',
          email: 'rodrigo@gmail.com'
        })
        .expect('Content-Type', /json/);
    
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Rodrigo Antonio Grassi'); 
      expect(response.body.email).toBe('rodrigo@gmail.com');

      done();
    })

    it('should not be able to update with invalid data', async(done) => {
      const response = await request(app)
        .put(`/users/${userNew._id}`)
        .set('Authorization', `Bearer: ${token}`)
        .send({
          email: 'rgrassi1$email.com',
          password: '12345',        
        })  
  
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation fails');    

      done();
    })  

    it('should return 404 if the user is not found for update', async(done) => {
      const response = await request(app)
        .put('/users/000000000000ffffffffffff')
        .set('Authorization', `Bearer: ${token}`)
        .send({
          name: 'User not found',
          email: 'notfound@email.com'
        })
        .expect('Content-Type', /json/);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');

        done();
    })

    it('should not be able to update other records without administrator role', async (done) => {
      const response = await request(app)
        .put(`/users/${userNew2._id}`)
        .set('Authorization', `Bearer: ${token}`)
        .send({
          name: 'Admin Rodrigo Grassi',
          email: 'rgrassi1@gmail.com',
          role: 'admin'
        })
        .expect('Content-Type', /json/);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Only admins can update any user');    

        done();
    })

    it('should not be able update with a registered email', async (done) => {    
      const response = await request(app)
        .put(`/users/${userNew._id}`)
        .set('Authorization', `Bearer: ${token}`)
        .send({
          name: 'Rodrigo Antonio Grassi',
          email: 'robert@email.com',
        })
        .expect('Content-Type', /json/);
  
      expect(response.status).toBe(400); 
      expect(response.body.message).toBe('User not available');

      done();
    })
  
    it('should not be able to change the password without checking the old one', async (done) => {
      const response = await request(app)
        .put(`/users/${userNew._id}`)
        .set('Authorization', `Bearer: ${token}`)
        .send({
          oldPassword: '1234567',
          password: 'root1234',
          confirmPassword: 'root1234'
        })
        .expect('Content-Type', /json/);
  
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Wrong credentials')

        done();
    })
  })
})