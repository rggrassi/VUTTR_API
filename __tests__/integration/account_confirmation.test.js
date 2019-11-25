const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Token = require('../../src/models/Token');
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
      .post('/account')
      .send({ email: user.email, redirect: 'https://vuttr.com.br' });

    const { tokens } = await User.findById(user._id).populate({
      path: 'tokens',
      match: { type: 'account' },
      options: { 
        sort: { createdAt: -1 },
        limit: 1
      }
    });

    expect(tokens[0]).toMatchObject({
      type: 'account',
      user: user._id
    });  
    expect(response.status).toBe(204);

    done();
  });

  it('should not be able to verify your account without first registering with the app', async (done) => {
    const response = await request(app)
      .post('/account')
      .send({ email: 'user404@email.com', redirect: 'https://vuttr.com.br' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');

    done();
  });

  it('should be able to confirm the creation of a new account', async (done) => {
    const token = await Token.create({
      token: crypto.randomBytes(32).toString('hex'),
      type: 'account',
      user: user._id
    }); 
    user.tokens.push(token);
    await user.save();

    const response = await request(app)
      .put(`/account/${token.token}`);
      
    expect(response.status).toBe(204); 
    
    done();
  });
  
  it('should not be able to confirm the creation of a new account without a valid token', async (done) => {
    const token = await Token.create({
      token: crypto.randomBytes(32).toString('hex'),
      type: 'account',
      user: user._id
    }); 
    user.tokens.push(token);
    await user.save();

    const token400 = 'invalid-token';
    const response = await request(app)
      .put(`/account/${token400}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Token not valid');

    done();
  });

  it('should not be able to confirm the creation of a new account with an expired token', async (done) => {
    const token = await Token.create({
      token: crypto.randomBytes(32).toString('hex'),
      type: 'account',
      user: user._id,
      createdAt: subDays(new Date(), 3)
    }); 
    user.tokens.push(token);
    await user.save();

    const response = await request(app)
      .put(`/account/${token.token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Mail cofirmation token is expired');

    done();
  });
});