const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');

describe('Student Portal Hierarchical Browsing Flow (<= 4 clicks)', () => {
  it('Step 0: Home page loads successfully (status 200)', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Habit Chain');
  });

  it('Step 1 (Click 1): Semesters list page loads successfully', async () => {
    const res = await request(app).get('/semesters');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Academic Semesters');
    expect(res.text).to.include('Semester 1');
  });

  it('Step 2 (Click 2): Semester detail page displays subjects and resource count', async () => {
    const res = await request(app).get('/semesters/1');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Semester 1 - Subjects');
    expect(res.text).to.include('BCA101');
  });

  it('Step 3 (Click 3): Subject detail page displays modules and categories', async () => {
    const res = await request(app).get('/subjects/1');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Digital Electronics');
    expect(res.text).to.include('Syllabus Modules');
    expect(res.text).to.include('Module 1');
  });

  it('Step 4 (Click 4): Module detail page displays downloadable learning materials', async () => {
    const res = await request(app).get('/modules/1');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Learning Materials & Files');
    expect(res.text).to.include('/resources/');
  });

  it('Laboratory section (/lab) renders grouped subjects and materials', async () => {
    const res = await request(app).get('/lab');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Laboratory Resources & Practical Code');
  });

  it('Previous year question papers section (/question-papers) renders filtered papers', async () => {
    const res = await request(app).get('/question-papers');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Previous Year Question Papers');
  });
});
