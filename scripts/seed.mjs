/**
 * Seeds a demo organization, users, and tickets for local API demos.
 * Safe to re-run: removes prior seed data identified by marker emails.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Organization from '../src/models/Organization.js';
import User from '../src/models/User.js';
import Ticket from '../src/models/Ticket.js';

const SEED_MARKER = '@seed.smartsupport.demo';
const DEMO_PASSWORD = 'Demo1234!';

const usersSpec = [
  { name: 'Seed Admin', email: `admin${SEED_MARKER}`, role: 'admin' },
  { name: 'Seed Moderator', email: `moderator${SEED_MARKER}`, role: 'moderator', skills: ['Node.js', 'billing', 'API'] },
  { name: 'Seed User', email: `user${SEED_MARKER}`, role: 'user' },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Copy .env.example to .env and configure MongoDB.');
    process.exit(1);
  }

  await mongoose.connect(uri);

  await User.deleteMany({ email: { $regex: SEED_MARKER } });
  const oldOrgs = await Organization.find({ name: 'SmartSupport Demo (seed)' });
  for (const o of oldOrgs) {
    await Ticket.deleteMany({ orgId: o._id });
    await Organization.deleteOne({ _id: o._id });
  }

  const org = await Organization.create({
    name: 'SmartSupport Demo (seed)',
    plan: 'pro',
    seats: 10,
  });

  const createdUsers = [];
  for (const spec of usersSpec) {
    const passwordHash = await User.hashPassword(DEMO_PASSWORD);
    const u = await User.create({
      name: spec.name,
      email: spec.email,
      passwordHash,
      role: spec.role,
      orgId: org._id,
      skills: spec.skills ?? [],
    });
    createdUsers.push(u);
  }

  const [admin, mod, endUser] = createdUsers;

  const ticketSpecs = [
    {
      title: 'Seed: API rate limit question',
      description: 'How do we read X-RateLimit-Remaining from responses?',
      status: 'open',
      priority: 'medium',
      category: 'technical',
      createdBy: endUser._id,
      assignedTo: mod._id,
    },
    {
      title: 'Seed: Billing export',
      description: 'Need CSV of invoices for Q1.',
      status: 'in_progress',
      priority: 'high',
      category: 'billing',
      createdBy: endUser._id,
      assignedTo: mod._id,
    },
    {
      title: 'Seed: SSO test',
      description: 'SAML metadata exchange with Okta.',
      status: 'open',
      priority: 'low',
      category: 'technical',
      skills: ['SSO'],
      createdBy: endUser._id,
      assignedTo: null,
    },
  ];

  for (const spec of ticketSpecs) {
    await Ticket.create({
      ...spec,
      orgId: org._id,
    });
  }

  console.log('\n--- SmartSupport seed complete ---\n');
  console.log(`Organization ID: ${org._id}`);
  console.log(`Organization name: ${org.name}`);
  console.log('\nLog in (any account uses the same password):\n');
  console.log(`  Password: ${DEMO_PASSWORD}`);
  for (const u of createdUsers) {
    console.log(`  ${u.role.padEnd(12)} ${u.email}`);
  }
  console.log('\nAPI base (default): http://localhost:3000');
  console.log('Web app: set NEXT_PUBLIC_API_URL and use these credentials at /login.\n');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
