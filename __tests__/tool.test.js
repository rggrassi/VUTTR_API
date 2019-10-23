const request = require('supertest');
const app = require('../src/app');
const Tool = require('../src/models/Tool');
const User = require('../src/models/User');

describe('Tool', () => {   
  let token = '';
  let user = {};

  beforeAll(async () => {
    await User.deleteMany({});
    await Tool.deleteMany({});

    user = await User.create({
      name: 'Robert Ryan',
      email: 'robert.ryan@email.com',
      password: '123456'
    })

    const auth = await request(app)
      .post('/session')
      .send({
        email: 'robert.ryan@email.com',
        password: '123456'
      })

    token = auth.body.token
  })

  it('should be able to register a new tool', async (done) => {
    const response = await request(app)
      .post('/tools')
      .set('Authorization', `Bearer: ${token}`)
      .send({
        title: 'Yup',
        link: 'https://github.com/jquense/yup',
        description: 'Dead simple Object schema validation',
        tags:  ['validation', 'javascript']
      })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');

    done();
  })

  it('should not be able to register a tool with invalid data', async (done) => {
    const response = await request(app)
      .post('/tools')
      .set('Authorization', `Bearer: ${token}`)
      .send({
        title: '',
        link: '',
        description: ''
      })

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation fails');

    done();
  })

  describe('List of tools', () => {
    beforeAll(async () => {
      await Tool.deleteMany({});

      await Tool.create({
        title: 'Yup',
        link: 'https://github.com/jquense/yup',
        description: 'Dead simple Object schema validation',
        tags:  ['validation', 'javascript'],
        user: user._id  
      })
  
      await Tool.create({
        title: 'Jest',
        link: 'https://jestjs.io/',
        description: 'Jest is a delightful JavaScript Testing Framework with a focus on simplicity',
        tags:  ['test', 'javascript', 'node'],
        user: user._id
      })
  
      await Tool.create({
        title: 'SuperTest',
        link: 'https://jestjs.io/',
        description: 'Super-agent driven library for testing node.js HTTP servers using a fluent API',
        tags:  ['test', 'http', 'javascript'],
        user: user._id   
      })  
    })

    it('should be able to list all tools', async (done) => {
      const response = await request(app)
        .get('/tools')
        .set('Authorization', `Bearer: ${token}`)
        .expect('Content-Type', /json/);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      
      done();
    })
  
    it('it should be possible to filter tools using a tag search', async (done) => {
      const response = await request(app)
        .get('/tools')
        .query({ tag: 'test,node' })
        .set('Authorization', `Bearer: ${token}`)
        .expect('Content-Type', /json/);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      
      done();
    })
  })
})
