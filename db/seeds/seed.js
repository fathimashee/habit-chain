const bcrypt = require('bcrypt');
const { getDb } = require('../connection');
const { runMigrations } = require('../migrate');
require('dotenv').config();

function seedDatabase() {
  runMigrations();
  const db = getDb();
  console.log('Seeding initial data...');

  // 1. Seed / Synchronize Admin User
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  const existingAdmin = db.prepare('SELECT admin_id, password_hash FROM admins WHERE email = ?').get(adminEmail);
  const saltRounds = 10;
  const passwordHash = bcrypt.hashSync(adminPassword, saltRounds);

  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO admins (name, email, password_hash, role)
      VALUES (?, ?, ?, 'super_admin')
    `).run(adminName, adminEmail, passwordHash);
    console.log(`Seeded admin user: ${adminEmail}`);
  } else {
    db.prepare('UPDATE admins SET password_hash = ?, name = ? WHERE admin_id = ?').run(passwordHash, adminName, existingAdmin.admin_id);
    console.log(`Synchronized password for admin user: ${adminEmail}`);
  }

  // 2. Seed Resource Types
  const types = [
    { name: 'Notes', slug: 'notes' },
    { name: 'Question Paper', slug: 'question-paper' },
    { name: 'Lab Manual', slug: 'lab-manual' },
    { name: 'Program', slug: 'program' },
    { name: 'Other', slug: 'other' }
  ];

  const insertType = db.prepare(`
    INSERT OR IGNORE INTO resource_types (name, slug)
    VALUES (?, ?)
  `);

  for (const t of types) {
    insertType.run(t.name, t.slug);
  }
  console.log('Seeded resource types.');

  // 3. Seed Full Curriculum (Semesters 1 through 8)
  const insertSemester = db.prepare('INSERT INTO semesters (name, display_order) VALUES (?, ?)');
  const insertSubject = db.prepare('INSERT INTO subjects (semester_id, code, name, description) VALUES (?, ?, ?, ?)');
  const insertModule = db.prepare('INSERT INTO modules (subject_id, module_number, title, description) VALUES (?, ?, ?, ?)');

  const semData = [
    {
      order: 1,
      name: 'Semester 1',
      subjects: [
        {
          code: 'BCA101', name: 'Digital Electronics', desc: 'Fundamentals of digital circuits, logic gates, and Boolean algebra.',
          modules: [
            { num: 1, title: 'Number Systems and Boolean Logic', desc: 'Binary, octal, hex codes and logic gate fundamentals.' },
            { num: 2, title: 'Combinational Logic Circuits', desc: 'Adders, subtractors, decoders, encoders, and multiplexers.' },
            { num: 3, title: 'Sequential Logic Circuits', desc: 'Flip-flops, registers, and counters.' },
            { num: 4, title: 'Memory and Programmable Logic', desc: 'RAM, ROM, and PLA architectures.' }
          ]
        },
        {
          code: 'BCA102', name: 'Structured Programming using C', desc: 'Procedural programming, data types, control flow, arrays, and pointers in C.',
          modules: [
            { num: 1, title: 'Introduction to C & Control Structures', desc: 'Variables, data types, operators, and loops.' },
            { num: 2, title: 'Functions and Arrays', desc: 'Modular programming, 1D & 2D arrays, parameter passing.' },
            { num: 3, title: 'Pointers and Dynamic Memory', desc: 'Memory addresses, pointers, and malloc/free.' },
            { num: 4, title: 'Structures, Unions and File I/O', desc: 'Custom types and persistent file handling.' }
          ]
        },
        {
          code: 'BCA103L', name: 'C Programming Laboratory', desc: 'Hands-on laboratory exercises and experiments in C programming.',
          modules: [
            { num: 1, title: 'Core Lab Experiments', desc: 'Standard laboratory assignments and problem statements.' }
          ]
        }
      ]
    },
    {
      order: 2,
      name: 'Semester 2',
      subjects: [
        {
          code: 'BCA201', name: 'Data Structures', desc: 'Linear and non-linear data structures: stacks, queues, trees, and graphs.',
          modules: [
            { num: 1, title: 'Linear Data Structures - Arrays & Linked Lists', desc: 'Singly, doubly, and circular linked lists.' },
            { num: 2, title: 'Stacks and Queues', desc: 'Stack applications, infix/postfix conversions, circular queues.' },
            { num: 3, title: 'Non-linear Structures - Trees', desc: 'Binary trees, BST traversal, heaps.' },
            { num: 4, title: 'Graphs and Sorting Algorithms', desc: 'DFS, BFS, quicksort, mergesort, complexity analysis.' }
          ]
        },
        {
          code: 'BCA202', name: 'Object Oriented Programming using Java', desc: 'OOP principles: encapsulation, inheritance, polymorphism, abstraction in Java.',
          modules: [
            { num: 1, title: 'Java Fundamentals and Classes', desc: 'Syntax, JVM, classes, and object instantiation.' },
            { num: 2, title: 'Inheritance and Interfaces', desc: 'Superclasses, polymorphism, and interface implementation.' },
            { num: 3, title: 'Exception Handling and Multithreading', desc: 'Try-catch blocks, threads, synchronization.' },
            { num: 4, title: 'Java Collections & Streams', desc: 'List, Set, Map, and I/O streams.' }
          ]
        },
        {
          code: 'BCA203L', name: 'Data Structures Lab', desc: 'Implementation of data structures and algorithms in C/Java.',
          modules: [
            { num: 1, title: 'Data Structures Experiments', desc: 'Standard practical programs and manual.' }
          ]
        }
      ]
    },
    {
      order: 3,
      name: 'Semester 3',
      subjects: [
        {
          code: 'BCA301', name: 'Database Management Systems', desc: 'Relational database model, SQL queries, normalization, ER diagrams, and transactions.',
          modules: [
            { num: 1, title: 'Introduction to DBMS & Relational Model', desc: 'Architecture, schema, keys, and relational algebra.' },
            { num: 2, title: 'SQL & Query Processing', desc: 'DDL, DML, joins, subqueries, and views.' },
            { num: 3, title: 'Database Design & Normalization', desc: 'Functional dependencies, 1NF, 2NF, 3NF, BCNF.' },
            { num: 4, title: 'Transaction Management & Concurrency', desc: 'ACID properties, serializability, and locking protocols.' }
          ]
        },
        {
          code: 'BCA302', name: 'Operating Systems', desc: 'Process management, memory management, file systems, and CPU scheduling.',
          modules: [
            { num: 1, title: 'OS Concepts & Structures', desc: 'Dual-mode operation, system calls, OS architectures.' },
            { num: 2, title: 'Process & CPU Scheduling', desc: 'Threads, scheduling algorithms: FCFS, SJF, Round Robin.' },
            { num: 3, title: 'Process Synchronization & Deadlocks', desc: 'Semaphores, monitors, deadlock prevention and avoidance.' },
            { num: 4, title: 'Memory & Storage Management', desc: 'Paging, segmentation, virtual memory, page replacement.' }
          ]
        },
        {
          code: 'BCA303L', name: 'DBMS Laboratory', desc: 'Practice with relational queries, joins, triggers, and stored procedures.',
          modules: [{ num: 1, title: 'SQL Lab Experiments', desc: 'Table creation, queries, joins, and integrity constraints.' }]
        }
      ]
    },
    {
      order: 4,
      name: 'Semester 4',
      subjects: [
        {
          code: 'BCA401', name: 'Design and Analysis of Algorithms', desc: 'Divide and conquer, greedy methods, dynamic programming, backtracking, and complexity.',
          modules: [
            { num: 1, title: 'Algorithm Analysis & Divide-and-Conquer', desc: 'Asymptotic notation, recurrence relations, merge sort.' },
            { num: 2, title: 'Greedy Method', desc: 'Fractional knapsack, Prim and Kruskal MST, Huffman coding.' },
            { num: 3, title: 'Dynamic Programming', desc: '0/1 knapsack, LCS, Floyd-Warshall shortest paths.' },
            { num: 4, title: 'Backtracking & Branch-and-Bound', desc: 'N-Queens, TSP, NP-completeness introduction.' }
          ]
        },
        {
          code: 'BCA402', name: 'Software Engineering', desc: 'SDLC methodologies, Agile processes, UML modeling, testing, and project management.',
          modules: [
            { num: 1, title: 'Software Process & Methodologies', desc: 'Waterfall, Spiral, Agile Scrum, requirement engineering.' },
            { num: 2, title: 'System Modeling & Architectural Design', desc: 'Use cases, class diagrams, sequence diagrams.' },
            { num: 3, title: 'Software Testing & Quality Assurance', desc: 'Black-box, white-box, unit, and integration testing.' },
            { num: 4, title: 'Project Management & Maintenance', desc: 'Cost estimation, COCOMO, risk management.' }
          ]
        },
        {
          code: 'BCA403L', name: 'Algorithms Lab', desc: 'Implementation and benchmarking of sorting, searching, and graph algorithms.',
          modules: [{ num: 1, title: 'Algorithm Implementations', desc: 'Standard lab programs and experiment manuals.' }]
        }
      ]
    },
    {
      order: 5,
      name: 'Semester 5',
      subjects: [
        {
          code: 'BCA501', name: 'Computer Networks', desc: 'OSI and TCP/IP protocol suites, IP addressing, routing algorithms, and transport protocols.',
          modules: [
            { num: 1, title: 'Physical & Data Link Layers', desc: 'Network topologies, framing, error detection and correction.' },
            { num: 2, title: 'Network Layer & IP Addressing', desc: 'IPv4, IPv6, CIDR, distance vector and link-state routing.' },
            { num: 3, title: 'Transport Layer Protocols', desc: 'TCP, UDP, congestion control, flow control window.' },
            { num: 4, title: 'Application Layer & Network Security', desc: 'DNS, HTTP, SMTP, SSL/TLS, firewalls.' }
          ]
        },
        {
          code: 'BCA502', name: 'Web Technologies & Development', desc: 'Client and server web development, JavaScript, Node.js, and RESTful APIs.',
          modules: [
            { num: 1, title: 'HTML5, CSS3 & Responsive Design', desc: 'Semantic tags, Flexbox, CSS Grid, media queries.' },
            { num: 2, title: 'Modern JavaScript (ES6+)', desc: 'DOM manipulation, closures, promises, async/await.' },
            { num: 3, title: 'Backend with Node.js & Express', desc: 'Server setup, routing, middleware, REST architectures.' },
            { num: 4, title: 'API Integration & Security', desc: 'Authentication tokens, CORS, web security best practices.' }
          ]
        },
        {
          code: 'BCA503L', name: 'Web Development Lab', desc: 'Full-stack application practicals and responsive design.',
          modules: [{ num: 1, title: 'Web Application Practicals', desc: 'Responsive site design and API creation.' }]
        }
      ]
    },
    {
      order: 6,
      name: 'Semester 6',
      subjects: [
        {
          code: 'BCA601', name: 'Cloud Computing & DevOps', desc: 'Cloud deployment models, virtualization, Docker containers, and CI/CD pipelines.',
          modules: [
            { num: 1, title: 'Cloud Infrastructure & Models', desc: 'IaaS, PaaS, SaaS, AWS/GCP architecture overviews.' },
            { num: 2, title: 'Virtualization & Containerization', desc: 'Hypervisors, Docker containers, images, and registries.' },
            { num: 3, title: 'Continuous Integration & Delivery', desc: 'Git workflows, GitHub Actions, automated builds.' },
            { num: 4, title: 'Microservices & Monitoring', desc: 'Decoupled services, logging, metrics, resilience.' }
          ]
        },
        {
          code: 'BCA602', name: 'Mobile Application Development', desc: 'Native and cross-platform mobile architectures, UI components, states, and apps.',
          modules: [
            { num: 1, title: 'Mobile Ecosystem & SDK Setup', desc: 'App lifecycle, project structure, layout systems.' },
            { num: 2, title: 'UI Components & Event Handling', desc: 'Interactive views, navigation drawers, state hooks.' },
            { num: 3, title: 'Data Persistence & Background Tasks', desc: 'SQLite/Room, async workers, push notifications.' },
            { num: 4, title: 'Packaging & Publishing', desc: 'App signing, deployment guidelines, permissions.' }
          ]
        },
        {
          code: 'BCA603L', name: 'Cloud & Mobile Lab', desc: 'Containerizing services and building interactive mobile applications.',
          modules: [{ num: 1, title: 'Practicals & Deployments', desc: 'Docker workflows and mobile app projects.' }]
        }
      ]
    },
    {
      order: 7,
      name: 'Semester 7',
      subjects: [
        {
          code: 'BCA701', name: 'Artificial Intelligence & Machine Learning', desc: 'Supervised and unsupervised learning, regression, classification, and neural networks.',
          modules: [
            { num: 1, title: 'Foundations of AI & Search', desc: 'State-space search, heuristic search: A*, minimax.' },
            { num: 2, title: 'Supervised Learning Algorithms', desc: 'Linear regression, decision trees, support vector machines.' },
            { num: 3, title: 'Unsupervised Learning & Clustering', desc: 'K-Means, PCA dimensionality reduction, metrics.' },
            { num: 4, title: 'Neural Networks & Deep Learning', desc: 'Perceptrons, backpropagation, CNN fundamentals.' }
          ]
        },
        {
          code: 'BCA702', name: 'Information Security & Cryptography', desc: 'Symmetric/asymmetric encryption, hashing, digital signatures, and application security.',
          modules: [
            { num: 1, title: 'Security Principles & Classical Ciphers', desc: 'CIA triad, substitution and transposition ciphers.' },
            { num: 2, title: 'Symmetric & Asymmetric Encryption', desc: 'AES, DES, RSA, Diffie-Hellman key exchange.' },
            { num: 3, title: 'Integrity, Hashes & Digital Signatures', desc: 'SHA-256, HMAC, public key infrastructure, certificates.' },
            { num: 4, title: 'Network Attacks & Defenses', desc: 'MitM, phishing, SQL injection, XSS, firewalls, IDS.' }
          ]
        },
        {
          code: 'BCA703L', name: 'AI & Security Laboratory', desc: 'Practical experiments in Python ML pipelines and cryptographic implementations.',
          modules: [{ num: 1, title: 'Machine Learning & Crypto Lab', desc: 'Jupyter notebooks, scikit-learn, crypto exercises.' }]
        }
      ]
    },
    {
      order: 8,
      name: 'Semester 8',
      subjects: [
        {
          code: 'BCA801', name: 'Major Capstone Project', desc: 'End-to-end software engineering project lifecycle: design, development, documentation, and viva.',
          modules: [
            { num: 1, title: 'Problem Formulation & Literature Survey', desc: 'Requirements specification and domain analysis.' },
            { num: 2, title: 'System Architecture & Detailed Design', desc: 'Database schema, UML diagrams, tech stack finalization.' },
            { num: 3, title: 'Implementation & Testing', desc: 'Core module coding, integration, and user testing.' },
            { num: 4, title: 'Project Report & Final Defense', desc: 'Final dissertation report, presentation, and demonstration.' }
          ]
        },
        {
          code: 'BCA802', name: 'Professional Ethics & Intellectual Property', desc: 'Cyber laws, IT Act, intellectual property rights, patents, software licensing, and ethics in AI.',
          modules: [
            { num: 1, title: 'Professional Ethics in Computing', desc: 'Codes of ethics, data privacy, social responsibility.' },
            { num: 2, title: 'Cyber Laws & IT Regulations', desc: 'IT Act, cybercrimes, liability of intermediaries.' },
            { num: 3, title: 'Intellectual Property Rights (IPR)', desc: 'Copyrights, patents, trademarks, open-source licenses.' },
            { num: 4, title: 'Emerging Ethical Issues in AI', desc: 'Algorithmic bias, automated decision making, governance.' }
          ]
        }
      ]
    }
  ];

  for (const sem of semData) {
    const existing = db.prepare('SELECT semester_id FROM semesters WHERE display_order = ?').get(sem.order);
    if (!existing) {
      const sRes = insertSemester.run(sem.name, sem.order);
      const semId = sRes.lastInsertRowid;
      for (const sub of sem.subjects) {
        const subRes = insertSubject.run(semId, sub.code, sub.name, sub.desc);
        const subId = subRes.lastInsertRowid;
        for (const mod of sub.modules) {
          insertModule.run(subId, mod.num, mod.title, mod.desc);
        }
      }
    }
  }

  console.log('Database seeding complete with Semesters 1 to 8!');
}

if (require.main === module) {
  try {
    seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

module.exports = { seedDatabase };
