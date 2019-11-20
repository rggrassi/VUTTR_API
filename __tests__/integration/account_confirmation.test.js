const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const crypto = require('crypto');
const subDays = require('date-fns/subDays');

describe('Verify Mail', () => {
  let user = null;
  beforeEach(async() => {
    await User.deleteMany({});
    user = await User.create({
      name: 'Rodrigo Grassi',
      email: 'rgrassi1@gmail.com',
      password: 'root1234'
    });
  });
 
  it('should be able to request new account verification', async (done) => {
    const response = await request(app)
      .post('/account-confirmation')
      .send({ email: user.email, redirect_url: 'https://vuttr.com.br' });

    expect(response.status).toBe(204);

    done();
  });

  it('should not be able to verify your account without first registering with the app', async (done) => {
    const response = await request(app)
      .post('/account-confirmation')
      .send({ email: 'user404@email.com' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');

    done();
  });

  it('should be able to confirm the creation of a new account', async (done) => {
    user.token = crypto.randomBytes(32).toString('hex');
    user.token_created_at = new Date();  
    await user.save();

    const response = await request(app)
      .put(`/account-confirmation/${user.token}`);
    expect(response.status).toBe(204); 
    
    done();
  });

  it('should not be able to confirm the creation of a new account without a valid token', async (done) => {
    user.token = crypto.randomBytes(32).toString('hex');
    user.token_created_at = new Date();  
    await user.save();

    const token = 'invalid-token';
    const response = await request(app)
      .put(`/account-confirmation/${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Token not valid');

    done();
  });

  it('should not be able to confirm the creation of a new account with an expired token', async (done) => {
    user.token = crypto.randomBytes(32).toString('hex');
    user.token_created_at = subDays(new Date(), 3);
    await user.save();

    const response = await request(app)
      .put(`/account-confirmation/${user.token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Mail cofirmation token is expired');

    done();
  });
});