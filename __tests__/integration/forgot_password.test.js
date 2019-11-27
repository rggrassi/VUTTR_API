const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Token = require('../../src/models/Token');
const crypto = require('crypto');
const subDays = require('date-fns/subDays');
const subHours = require('date-fns/subHours');

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

    const { tokens } = await User.findById(user._id).populate({
      path: 'tokens',
      match: { type: 'forgot' },
      options: { 
        sort: { createdAt: -1 },
        limit: 1
      }
    });

    expect(tokens[0]).toMatchObject({
      type: 'forgot',
      user: user._id
    });
    expect(response.status).toBe(204);

    done();
  });

  it('should not be able to change passwords without first registering with the app ', async (done) => {
    const response = await request(app)
      .post('/forgot')
      .send({ email: 'user404@email.com', redirect: 'https://vuttr.com.br' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');

    done();
  });

  it('should be able to confirm password change', async (done) => {
    const token = await Token.create({
      token: crypto.randomBytes(32).toString('hex'),
      type: 'forgot',
      user: user._id,
      createdAt: new Date()
    })
    user.tokens.push(token);
    await user.save();

    const response = await request(app)
      .put(`/forgot/${token.token}`)
      .send({ 
        password: 'root12345',
        confirmPassword: 'root12345'
      });

    expect(response.status).toBe(204); 
    
    done();
  });

  it('should not be able to confirm the change without checking with the confirmation password', async (done) => {
    const token = await Token.create({
      token: crypto.randomBytes(32).toString('hex'),
      type: 'forgot',
      user: user._id,
      createdAt: new Date()
    })
    user.tokens.push(token);
    await user.save();

    const response = await request(app)
    .put(`/forgot/${token.token}`)
    .send({ 
      password: 'root12345',
      confirmPassword: 'root123'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation fails');

    done();
  })
  
  it('should not be able to confirm password change without a valid token', async (done) => {
    const token = await Token.create({
      token: crypto.randomBytes(32).toString('hex'),
      type: 'forgot',
      user: user._id,
      createdAt: new Date()
    })
    user.tokens.push(token);
    await user.save();

    const token400 = 'invalid-token';
    const response = await request(app)
    .put(`/forgot/${token400}`)
    .send({ 
      password: 'root12345',
      confirmPassword: 'root12345'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Token not valid');

    done();
  });

  it('should not be able to confirm password with a revoked token', async (done) => {
    const revokedToken = await Token.create({
      token: crypto.randomBytes(32).toString('hex'),
      type: 'forgot',
      user: user._id,
      createdAt: subHours(new Date(), 2)
    });
    user.tokens.push(revokedToken);
    await user.save();

    const latestToken = await Token.create({
      token: crypto.randomBytes(32).toString('hex'),
      type: 'forgot',
      user: user._id,
      createdAt: new Date()
    })
    user.tokens.push(latestToken);
    await user.save();

    const response = await request(app)
    .put(`/forgot/${revokedToken.token}`)
    .send({ 
      password: 'root12345',
      confirmPassword: 'root12345'
    });  

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('This password reset link can no longer be used');

    done();
  });

  it('should not be able to confirm password change with an expired token', async (done) => {
    const token = await Token.create({
      token: crypto.randomBytes(32).toString('hex'),
      type: 'forgot',
      user: user._id,
      createdAt: subDays(new Date(), 3)
    })
    user.tokens.push(token);
    await user.save();

    const response = await request(app)
      .put(`/forgot/${token.token}`)
      .send({ 
        password: 'root12345',
        confirmPassword: 'root12345'
    });    

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Recovery token is expired');

    done();
  });  
});