const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');

describe('Upload Validation & Security Restrictions', () => {
  let agent;
  let csrfToken;

  before(async () => {
    agent = request.agent(app);
    const getRes = await agent.get('/admin/login');
    const csrfMatch = getRes.text.match(/name="_csrf" value="([^"]+)"/);
    csrfToken = csrfMatch ? csrfMatch[1] : '';

    // Log in as seeded administrator
    await agent.post('/admin/login').send({
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      _csrf: csrfToken
    });
  });

  it('should reject uploads with disallowed extensions (.exe / .bat)', async () => {
    // Get fresh token
    const formPage = await agent.get('/admin/resources/new');
    const token = formPage.text.match(/name="_csrf" value="([^"]+)"/)[1];

    const tempExe = path.join(__dirname, 'test-malicious.exe');
    fs.writeFileSync(tempExe, 'MZ9999');

    try {
      const res = await agent
        .post('/admin/resources/new')
        .field('_csrf', token)
        .field('title', 'Malicious File Test')
        .field('subject_id', '1')
        .field('type_id', '1')
        .attach('file', tempExe);

      // Multer filter error renders 500 error or redirect with flash
      expect(res.text).to.satisfy(text => 
        text.includes('is not supported') || text.includes('Server Error')
      );
    } finally {
      if (fs.existsSync(tempExe)) fs.unlinkSync(tempExe);
    }
  });

  it('should accept valid PDF uploads and persist them', async () => {
    const formPage = await agent.get('/admin/resources/new');
    const token = formPage.text.match(/name="_csrf" value="([^"]+)"/)[1];

    const tempPdf = path.join(__dirname, 'valid-notes.pdf');
    fs.writeFileSync(tempPdf, '%PDF-1.4 sample pdf content for unit testing');

    try {
      const res = await agent
        .post('/admin/resources/new')
        .field('_csrf', token)
        .field('title', 'Unit Test Notes Upload')
        .field('subject_id', '1')
        .field('module_id', '1')
        .field('type_id', '1')
        .attach('file', tempPdf);

      expect(res.status).to.equal(302);
      expect(res.headers.location).to.equal('/admin/resources');
    } finally {
      if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
    }
  });
});

