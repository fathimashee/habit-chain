const bcrypt = require('bcrypt');
const { connectMongo } = require('../../src/models/mongo/connection');
const {
  Admin,
  Semester,
  Subject,
  Module,
  ResourceType
} = require('../../src/models/mongo/schemas');
require('dotenv').config();

async function seedMongo() {
  await connectMongo();
  console.log('[MongoSeed] Starting Atlas Database Seeding...');

  // 1. Seed / Sync Admin User
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  const passwordHash = bcrypt.hashSync(adminPassword, 10);
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await Admin.create({
      name: adminName,
      email: adminEmail,
      password_hash: passwordHash,
      role: 'super_admin'
    });
    console.log(`[MongoSeed] Seeded admin user: ${adminEmail}`);
  } else {
    existingAdmin.password_hash = passwordHash;
    existingAdmin.name = adminName;
    await existingAdmin.save();
    console.log(`[MongoSeed] Synchronized password for admin user: ${adminEmail}`);
  }

  // 2. Seed Resource Types
  const types = [
    { name: 'Notes', slug: 'notes' },
    { name: 'Question Paper', slug: 'question-paper' },
    { name: 'Lab Manual', slug: 'lab-manual' },
    { name: 'Program', slug: 'program' },
    { name: 'Other', slug: 'other' }
  ];

  for (const t of types) {
    await ResourceType.findOneAndUpdate(
      { slug: t.slug },
      { name: t.name, slug: t.slug },
      { upsert: true, new: true }
    );
  }
  console.log('[MongoSeed] Seeded Resource Types.');

  // 3. Seed Full Curriculum (Semesters 1 through 8)
  const semData = [
    {
      order: 1,
      name: 'Semester 1',
      subjects: [
        {
          code: 'BCA101', name: 'Digital Electronics', desc: 'Fundamentals of digital circuits, logic gates, and Boolean algebra.',
          modules: [
            { num: 1, title: 'Number Systems & Boolean Algebra', desc: 'Binary, octal, hex codes and logic simplification' },
            { num: 2, title: 'Combinational Logic', desc: 'Adders, subtractors, multiplexers and decoders' },
            { num: 3, title: 'Sequential Circuits', desc: 'Flip-flops, latches, shift registers and counters' }
          ]
        },
        {
          code: 'BCA102', name: 'Discrete Mathematics', desc: 'Set theory, mathematical logic, relations and graph theory.',
          modules: [
            { num: 1, title: 'Set Theory & Logic', desc: 'Propositions, truth tables and predicates' },
            { num: 2, title: 'Relations & Functions', desc: 'Equivalence relations, partial order and functions' }
          ]
        }
      ]
    },
    {
      order: 2,
      name: 'Semester 2',
      subjects: [
        {
          code: 'BCA201', name: 'Data Structures using C', desc: 'Arrays, linked lists, stacks, queues, trees, and graph algorithms.',
          modules: [
            { num: 1, title: 'Linear Data Structures', desc: 'Dynamic arrays, singly and doubly linked lists' },
            { num: 2, title: 'Stacks & Queues', desc: 'LIFO, FIFO algorithms, circular queues, infix to postfix' },
            { num: 3, title: 'Non-Linear Structures', desc: 'Binary trees, BST traversals, heaps, DFS, BFS graphs' }
          ]
        },
        {
          code: 'BCA202', name: 'Object Oriented Programming in C++', desc: 'Encapsulation, inheritance, polymorphism, and templates.',
          modules: [
            { num: 1, title: 'OOP Foundations', desc: 'Classes, objects, constructors, destructors' },
            { num: 2, title: 'Inheritance & Polymorphism', desc: 'Virtual functions, abstract base classes' }
          ]
        }
      ]
    },
    {
      order: 3,
      name: 'Semester 3',
      subjects: [
        {
          code: 'BCA301', name: 'Database Management Systems', desc: 'Relational data model, SQL, normalization, and ACID properties.',
          modules: [
            { num: 1, title: 'ER Modeling & Relational Algebra', desc: 'Entity-relationship diagrams, constraints, schema design' },
            { num: 2, title: 'Advanced SQL & Normalization', desc: 'Complex joins, subqueries, 1NF, 2NF, 3NF, BCNF' },
            { num: 3, title: 'Transactions & Concurrency', desc: 'ACID guarantees, locks, two-phase locking' }
          ]
        },
        {
          code: 'BCA302', name: 'Computer Architecture', desc: 'Instruction sets, CPU pipelining, memory hierarchies, and caches.',
          modules: [
            { num: 1, title: 'Instruction Set & CPU Design', desc: 'Addressing modes, ALU organization' },
            { num: 2, title: 'Memory Hierarchy & I/O', desc: 'Cache mapping, virtual memory, DMA controllers' }
          ]
        }
      ]
    },
    {
      order: 4,
      name: 'Semester 4',
      subjects: [
        {
          code: 'BCA401', name: 'Operating Systems', desc: 'Process scheduling, deadlocks, virtual memory, and file systems.',
          modules: [
            { num: 1, title: 'Process Management & Scheduling', desc: 'PCB, round-robin, priority scheduling, threads' },
            { num: 2, title: 'Synchronization & Deadlocks', desc: 'Semaphores, mutexes, Banker algorithm' },
            { num: 3, title: 'Memory & Storage Systems', desc: 'Paging, TLB, page replacement algorithms, inode file systems' }
          ]
        },
        {
          code: 'BCA402', name: 'Java Programming', desc: 'Core Java, JVM architecture, multithreading, and collections.',
          modules: [
            { num: 1, title: 'Java Syntax & OOP', desc: 'Packages, interfaces, exception handling' },
            { num: 2, title: 'Concurrency & Streams', desc: 'Thread life cycle, synchronization, Collections framework' }
          ]
        }
      ]
    },
    {
      order: 5,
      name: 'Semester 5',
      subjects: [
        {
          code: 'BCA501', name: 'Computer Networks', desc: 'OSI and TCP/IP stack, routing protocols, flow control, and DNS.',
          modules: [
            { num: 1, title: 'Network Layers & Physical Media', desc: 'Framing, error detection, CRC, sliding window protocols' },
            { num: 2, title: 'Network & Routing Algorithms', desc: 'IPv4, IPv6 addressing, Dijkstra link-state, distance-vector' },
            { num: 3, title: 'Transport & Application Layers', desc: 'TCP 3-way handshake, congestion control, HTTP, DNS, TLS' }
          ]
        },
        {
          code: 'BCA502', name: 'Software Engineering', desc: 'Agile methodologies, UML modeling, design patterns, and automated testing.',
          modules: [
            { num: 1, title: 'SDLC Models & Agile', desc: 'Waterfall, Spiral, Scrum sprints, user stories' },
            { num: 2, title: 'System Modeling & Testing', desc: 'UML diagrams, unit testing, black-box/white-box tests' }
          ]
        }
      ]
    },
    {
      order: 6,
      name: 'Semester 6',
      subjects: [
        {
          code: 'BCA601', name: 'Web Technologies & Frameworks', desc: 'Full-stack engineering with modern JavaScript, Node.js, and REST APIs.',
          modules: [
            { num: 1, title: 'Frontend Architecture & DOM', desc: 'HTML5, CSS3, modern ES6+, async/await, responsive layouts' },
            { num: 2, title: 'Backend Servers & REST APIs', desc: 'Node.js event loop, Express routing, middleware pipelines' },
            { num: 3, title: 'Web Security & Deployment', desc: 'Authentication, JWT, sessions, CORS, CSRF, production hosting' }
          ]
        },
        {
          code: 'BCA602', name: 'Information & Network Security', desc: 'Symmetric/asymmetric cryptography, firewalls, and hashing standards.',
          modules: [
            { num: 1, title: 'Cryptographic Primitives', desc: 'AES, RSA, public key infrastructure, SHA-256' },
            { num: 2, title: 'System Security & Defenses', desc: 'Firewalls, IDS/IPS, penetration testing, authentication guards' }
          ]
        }
      ]
    },
    {
      order: 7,
      name: 'Semester 7',
      subjects: [
        {
          code: 'BCA701', name: 'Cloud Computing & DevOps', desc: 'Virtualization, microservices, Docker, Kubernetes, and CI/CD automation.',
          modules: [
            { num: 1, title: 'Cloud Models & Virtualization', desc: 'IaaS, PaaS, SaaS, hypervisors, AWS/GCP architecture' },
            { num: 2, title: 'Containerization & Orchestration', desc: 'Docker images, multi-stage builds, Kubernetes pods, services' },
            { num: 3, title: 'Continuous Integration & Delivery', desc: 'GitHub Actions, automated test pipelines, production deployment' }
          ]
        },
        {
          code: 'BCA702', name: 'Artificial Intelligence & Machine Learning', desc: 'Heuristic search, supervised/unsupervised learning, and neural nets.',
          modules: [
            { num: 1, title: 'Knowledge Representation & Search', desc: 'A* search, minimax algorithm, propositional logic' },
            { num: 2, title: 'Statistical Machine Learning', desc: 'Linear regression, decision trees, k-means clustering' }
          ]
        }
      ]
    },
    {
      order: 8,
      name: 'Semester 8',
      subjects: [
        {
          code: 'BCA801', name: 'Distributed Systems & Microservices', desc: 'CAP theorem, consensus protocols, message brokers, and fault tolerance.',
          modules: [
            { num: 1, title: 'Distributed Fundamentals & CAP', desc: 'Network partitions, eventual consistency, Paxos and Raft' },
            { num: 2, title: 'Event-Driven Architectures', desc: 'Message queues, Kafka, RabbitMQ, resilient API gateways' },
            { num: 3, title: 'High Availability & Scaling', desc: 'Horizontal scaling, load balancing, health monitoring' }
          ]
        },
        {
          code: 'BCA802', name: 'Capstone Project & Industry Internship', desc: 'Full-lifecycle software engineering, documentation, testing, and deployment.',
          modules: [
            { num: 1, title: 'Requirement Engineering & Architecture', desc: 'System specifications, SRS, architecture blueprints' },
            { num: 2, title: 'Final Production Deployment', desc: 'Integration verification, user manuals, project defense' }
          ]
        }
      ]
    }
  ];

  for (const s of semData) {
    const semester = await Semester.findOneAndUpdate(
      { display_order: s.order },
      { name: s.name, display_order: s.order },
      { upsert: true, new: true }
    );

    for (const sub of s.subjects) {
      const subject = await Subject.findOneAndUpdate(
        { semester_id: semester._id, code: sub.code },
        {
          semester_id: semester._id,
          code: sub.code,
          name: sub.name,
          description: sub.desc
        },
        { upsert: true, new: true }
      );

      for (const mod of sub.modules) {
        await Module.findOneAndUpdate(
          { subject_id: subject._id, module_number: mod.num },
          {
            subject_id: subject._id,
            module_number: mod.num,
            title: mod.title,
            description: mod.desc
          },
          { upsert: true, new: true }
        );
      }
    }
  }

  console.log('[MongoSeed] Database seeding complete with Semesters 1 to 8 in MongoDB Atlas!');
}

if (require.main === module) {
  seedMongo()
    .then(() => {
      console.log('[MongoSeed] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[MongoSeed] Error:', err);
      process.exit(1);
    });
}

module.exports = { seedMongo };
