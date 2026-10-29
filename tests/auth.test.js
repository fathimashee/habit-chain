const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');

describe('Security & Admin Authentication Guard Tests', () => {
  it('should redirect unauthenticated users accessing /admin/dashboard to /admin/login', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.status).to.equal(302);
    expect(res.headers.location).to.include('/admin/login');
  });

  it('should redirect unauthenticated users accessing /admin/resources to /admin/login', async () => {
    const res = await request(app).get('/admin/resources');
    expect(res.status).to.equal(302);
    expect(res.headers.location).to.include('/admin/login');
  });

  it('should redirect unauthenticated users accessing /admin/semesters to /admin/login', async () => {
    const res = await request(app).get('/admin/semesters');
    expect(res.status).to.equal(302);
    expect(res.headers.location).to.include('/admin/login');
  });

  it('should serve /admin/login with status 200 and CSRF token', async () => {
    const res = await request(app).get('/admin/login');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('name="_csrf"');
  });

  it('should fail authentication on invalid credentials and redirect back to /admin/login', async () => {
    const agent = request.agent(app);
    const getRes = await agent.get('/admin/login');
    const csrfMatch = getRes.text.match(/name="_csrf" value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const postRes = await agent
      .post('/admin/login')
      .send({
        email: 'invalid@example.com',
        password: 'WrongPassword!',
        _csrf: csrfToken
      });

    expect(postRes.status).to.equal(302);
    expect(postRes.headers.location).to.equal('/admin/login');
  });
});

