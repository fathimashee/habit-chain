import { useState } from 'react';
import { BookOpen, Layers, Plus, FileText, ArrowRight } from 'lucide-react';
import type { AppData, AdminView } from '@/types';

export function AdminSemesters({
  data,
  navigate,
}: {
  data: AppData;
  navigate: (view: AdminView) => void;
}) {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  const semString = `Semester ${selectedSemester}`;
  const subjectsInSem = data.subjects.filter((s) => s.semester === semString);
  const materialsInSem = data.materials.filter((m) => m.semester === semString);

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Curriculum Structure</p>
          <h1>Manage Semesters and Modules</h1>
          <p className="intro">
            Organize course progression across all 8 academic semesters, review module distributions, and inspect associated resources.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => navigate('upload')}
          type="button"
        >
          <Plus size={16} /> Upload to Semester
        </button>
      </section>

      {/* 8-Semester Selector Tabs */}
      <div className="semester-tabs-bar">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
          const semMaterialsCount = data.materials.filter((m) => m.semester === `Semester ${sem}`).length;
          const semSubjectsCount = data.subjects.filter((s) => s.semester === `Semester ${sem}`).length;
          const isActive = selectedSemester === sem;
          return (
            <button
              key={sem}
              className={`sem-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedSemester(sem)}
              type="button"
            >
              <strong>Semester {sem}</strong>
              <small>
                {semSubjectsCount} subjects · {semMaterialsCount} files
              </small>
            </button>
          );
        })}
      </div>

      {/* Selected Semester Overview Card */}
      <section className="panel sem-detail-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Academic Plan</p>
            <h3>Semester {selectedSemester} Overview</h3>
          </div>
          <div className="sem-stats-chips">
            <span className="status-chip reviewed">{subjectsInSem.length} Subjects</span>
            <span className="status-chip neutral">{materialsInSem.length} Study Materials</span>
          </div>
        </div>

        {/* Subjects & Modules in this semester */}
        <div className="sem-subjects-grid">
          {subjectsInSem.map((subject) => {
            const subjectMaterials = materialsInSem.filter((m) => m.subject_id === subject.id);
            return (
              <div className={`sem-subject-card ${subject.accent}`} key={subject.id}>
                <div className="sem-subject-head">
                  <div className="sem-subject-icon">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <span className="sem-code">{subject.code}</span>
                    <h4>{subject.name}</h4>
                  </div>
                </div>
                <div className="sem-module-tag">
                  <Layers size={13} /> {subject.module || 'General Module'}
                </div>
                <div className="sem-materials-summary">
                  <span>{subjectMaterials.length} files attached</span>
                  <button
                    className="text-button"
                    onClick={() => navigate('materials')}
                    type="button"
                  >
                    Manage <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
          {subjectsInSem.length === 0 && (
            <div className="empty-sem-state">
              <Layers size={32} />
              <strong>No subjects mapped to Semester {selectedSemester} yet</strong>
              <span>Add a subject assigned to Semester {selectedSemester} to organize module content.</span>
              <button
                className="primary-button"
                onClick={() => navigate('subjects')}
                type="button"
              >
                <Plus size={15} /> Add Subject for Semester {selectedSemester}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Materials cataloged under this semester */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Course Resources</p>
            <h3>Semester {selectedSemester} Materials</h3>
          </div>
          <button className="text-button" onClick={() => navigate('materials')} type="button">
            View in library <ArrowRight size={15} />
          </button>
        </div>

        <div className="sem-materials-list">
          {materialsInSem.map((mat) => (
            <div className="material-row" key={mat.id}>
              <div className="row-file blue">
                <FileText size={18} />
              </div>
              <div className="row-content">
                <strong>{mat.title}</strong>
                <span>{mat.module ?? 'General'} · {mat.downloads} downloads</span>
              </div>
              <span className="status-chip neutral">{mat.type}</span>
            </div>
          ))}
          {materialsInSem.length === 0 && (
            <div className="empty-sem-state">
              <span>No materials uploaded specifically for Semester {selectedSemester} yet.</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
