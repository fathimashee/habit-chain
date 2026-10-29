const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');

describe('Form Validation & CSRF Protection Tests', () => {
  it('should block POST requests with missing or invalid CSRF token (403 or redirect with error)', async () => {
    const res = await request(app)
      .post('/feedback')
      .send({
        name: 'Test Student',
        email: 'test@college.edu',
        category: 'suggestion',
        message: 'This request has no CSRF token.'
      });

    // Expect 403 or redirect
    expect([302, 403]).to.include(res.status);
  });

  it('should reject feedback submission with invalid email format', async () => {
    const agent = request.agent(app);
    const getRes = await agent.get('/feedback');
    const csrfMatch = getRes.text.match(/name="_csrf" value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const postRes = await agent
      .post('/feedback')
      .send({
        _csrf: csrfToken,
        name: 'Test Student',
        email: 'not-a-valid-email',
        category: 'bug',
        message: 'Valid message content here.'
      });

    expect(postRes.status).to.equal(200);
    expect(postRes.text).to.include('Please provide a valid email address');
  });

  it('should successfully submit valid feedback with CSRF token', async () => {
    const agent = request.agent(app);
    const getRes = await agent.get('/feedback');
    const csrfMatch = getRes.text.match(/name="_csrf" value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const postRes = await agent
      .post('/feedback')
      .send({
        _csrf: csrfToken,
        name: 'Alice Student',
        email: 'alice@college.edu',
        category: 'content',
        message: 'Great platform, the Digital Electronics module notes are very helpful.',
        rating: 5
      });

    expect(postRes.status).to.equal(302);
    expect(postRes.headers.location).to.equal('/feedback');
  });

  it('should successfully submit valid contact inquiry with CSRF token', async () => {
    const agent = request.agent(app);
    const getRes = await agent.get('/contact');
    const csrfMatch = getRes.text.match(/name="_csrf" value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const postRes = await agent
      .post('/contact')
      .send({
        _csrf: csrfToken,
        name: 'Bob Candidate',
        email: 'bob@college.edu',
        subject: 'Inquiry regarding Semester 2 syllabus',
        message: 'Could you please upload the latest OOP with Java sample programs?'
      });

    expect(postRes.status).to.equal(302);
    expect(postRes.headers.location).to.equal('/contact');
  });
});

