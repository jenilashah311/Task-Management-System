import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Start fresh on every seed run so the data is predictable
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // All seed users share the same password so demo login is painless
  const hashedPassword = await bcrypt.hash('password123', 10);

  const [alice, bob, carol, dave] = await Promise.all([
    prisma.user.create({
      data: { name: 'Alice Johnson', email: 'alice@example.com', password: hashedPassword, role: 'ADMIN' },
    }),
    prisma.user.create({
      data: { name: 'Bob Smith', email: 'bob@example.com', password: hashedPassword, role: 'MEMBER' },
    }),
    prisma.user.create({
      data: { name: 'Carol Williams', email: 'carol@example.com', password: hashedPassword, role: 'MEMBER' },
    }),
    prisma.user.create({
      data: { name: 'Dave Martinez', email: 'dave@example.com', password: hashedPassword, role: 'MEMBER' },
    }),
  ]);

  const tasks = [
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment to staging and production.',
      status: 'DONE', priority: 'HIGH',
      createdById: alice.id, assignedToId: alice.id,
      dueDate: new Date('2024-12-01'),
    },
    {
      title: 'Design database schema',
      description: 'Create an ERD and finalize the normalized schema for the task management system.',
      status: 'DONE', priority: 'HIGH',
      createdById: alice.id, assignedToId: bob.id,
      dueDate: new Date('2024-12-05'),
    },
    {
      title: 'Implement authentication flow',
      description: 'Build login, logout, and JWT token handling on both frontend and backend.',
      status: 'IN_PROGRESS', priority: 'HIGH',
      createdById: alice.id, assignedToId: carol.id,
      dueDate: new Date('2024-12-20'),
    },
    {
      title: 'Build task list UI',
      description: 'Create the main task board with filtering, sorting, and pagination.',
      status: 'IN_PROGRESS', priority: 'MEDIUM',
      createdById: bob.id, assignedToId: dave.id,
      dueDate: new Date('2024-12-22'),
    },
    {
      title: 'Mobile responsive layout',
      description: 'Ensure the app works well on screens smaller than 768px.',
      status: 'IN_PROGRESS', priority: 'MEDIUM',
      createdById: carol.id, assignedToId: carol.id,
      dueDate: new Date('2024-12-25'),
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints with request/response examples.',
      status: 'TODO', priority: 'MEDIUM',
      createdById: alice.id, assignedToId: bob.id,
      dueDate: new Date('2024-12-30'),
    },
    {
      title: 'Add unit tests for services',
      description: 'Write Jest tests for the task and auth services covering happy and error paths.',
      status: 'TODO', priority: 'MEDIUM',
      createdById: bob.id, assignedToId: carol.id,
      dueDate: new Date('2025-01-05'),
    },
    {
      title: 'Security audit',
      description: 'Review code for common vulnerabilities: SQL injection, XSS, CSRF, insecure deps.',
      status: 'TODO', priority: 'HIGH',
      createdById: alice.id, assignedToId: alice.id,
      dueDate: new Date('2025-01-15'),
    },
    {
      title: 'Performance optimization',
      description: 'Profile API response times and add caching where it makes sense.',
      status: 'TODO', priority: 'LOW',
      createdById: alice.id, assignedToId: dave.id,
      dueDate: new Date('2025-01-10'),
    },
    {
      title: 'User onboarding flow',
      description: 'Guided first-time experience that introduces key features to new users.',
      status: 'TODO', priority: 'LOW',
      createdById: bob.id, assignedToId: null,
      dueDate: new Date('2025-01-20'),
    },
    {
      title: 'Email notification system',
      description: 'Send emails when tasks are assigned or their status changes.',
      status: 'TODO', priority: 'LOW',
      createdById: alice.id, assignedToId: null,
      dueDate: null,
    },
    {
      title: 'Export tasks to CSV',
      description: 'Allow users to download filtered task lists as CSV for reporting.',
      status: 'TODO', priority: 'LOW',
      createdById: dave.id, assignedToId: dave.id,
      dueDate: new Date('2025-02-01'),
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log(`Done. Created 4 users and ${tasks.length} tasks.`);
  console.log('\nTest credentials (password: password123)');
  console.log('  Admin:  alice@example.com');
  console.log('  Member: bob@example.com');
  console.log('  Member: carol@example.com');
  console.log('  Member: dave@example.com');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
