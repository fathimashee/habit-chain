/*
# Allow lab study materials

1. Database change
- Extends the existing study material type check to support `lab` resources alongside notes, question papers, and guides.

2. Security
- No access rules are widened; the existing authenticated student and admin policies remain in force.
*/

ALTER TABLE study_materials DROP CONSTRAINT IF EXISTS study_materials_type_check;
ALTER TABLE study_materials ADD CONSTRAINT study_materials_type_check CHECK (type IN ('note', 'question_paper', 'guide', 'lab'));