const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const crypto = require('crypto');
const subDays = require('date-fns/subDays');

describe('Forgot Password', () => {
  let user = null;
  beforeEach(async() => {
    await User.deleteMany({});
    user = await User.create({
      name: 'Rodrigo Grassi',
      email: 'rgrassi1@gmail.com',
      password: 'root1234'
    });
  });
 
  it('should be able to request password change', async (done) => {
    const response = await request(app)
      .post('/forgot')
      .send({ email: user.email, redirect: 'https://vuttr.com.br' });

    expect(response.status).toBe(204);

    done();
  });

  it('should not be able to change passwords without first registering with the app ', async (done) => {
    const response = await request(app)
      .post('/forgot')
      .send({ email: 'user404@email.com' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');

    done();
  });

  it('should be able to confirm password change', async (done) => {
    user.token = crypto.randomBytes(32).toString('hex');
    user.token_created_at = new Date(); 

    await user.save();

    const response = await request(app)
      .put(`/forgot/${user.token}`)
      .send({ password: 'root12345' });

    expect(response.status).toBe(204); 
    
    done();
  });

  it('should not be able to confirm password change without a valid token', async (done) => {
    user.token = crypto.randomBytes(32).toString('hex');
    user.token_created_at = new Date();

    await user.save();

    const token = 'invalid-token';
    const response = await request(app)
      .put(`/forgot/${token}`)      
      .send({ password: 'root12345' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Token not valid');

    done();
  });

  it('should not be able to confirm password change with an expired token', async (done) => {
    user.token = crypto.randomBytes(32).toString('hex');
    user.token_created_at = subDays(new Date(), 3);

    await user.save();

    const response = await request(app)
      .put(`/forgot/${user.token}`)      
      .send({ password: 'root12345' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Recovery token is expired');

    done();
  });
});