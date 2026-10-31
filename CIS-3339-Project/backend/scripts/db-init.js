// D1 - Idempotent database initialization and seed (OPS1)
//
//   npm run db:init     create whatever is missing; safe to run any number of times
//   npm run db:reset    delete THIS organization's data first, then seed it again
//
// What it does, in order:
//   1. checks the configuration (.env) and exits with code 1 if anything is wrong
//   2. connects to MongoDB (exits with code 1 if it cannot)
//   3. creates the organization from ORG_ID, a viewer, an editor, clients, services,
//      events (with registrations) and the indexes the app needs
//   4. prints a summary of what was created and what already existed
//
// It never overwrites or deletes existing data unless --reset is passed, and --reset
// only touches documents that belong to ORG_ID. Passwords come from environment
// variables and are hashed with bcrypt before they are written.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { orgs, users, clients, services, events } = require('../models/models');

// same setting app.js uses, to avoid the Mongoose 6 deprecation notice
mongoose.set('strictQuery', false);

const RESET = process.argv.includes('--reset');

// ---------------------------------------------------------------------------
// 1. Configuration check
// ---------------------------------------------------------------------------
const REQUIRED_ENV = [
  'MONGO_URL',
  'ORG_ID',
  'JWT_SECRET',
  'SEED_VIEWER_USERNAME',
  'SEED_VIEWER_PASSWORD',
  'SEED_EDITOR_USERNAME',
  'SEED_EDITOR_PASSWORD'
];

function checkConfig() {
  const problems = [];
  for (const key of REQUIRED_ENV) {
    if (!process.env[key] || !process.env[key].trim()) {
      problems.push(`${key} is missing or empty`);
    }
  }
  if (process.env.ORG_ID && !/^[0-9a-fA-F]{24}$/.test(process.env.ORG_ID.trim())) {
    problems.push('ORG_ID must be a 24-character hexadecimal ObjectId');
  }
  if (
    process.env.SEED_VIEWER_USERNAME &&
    process.env.SEED_VIEWER_USERNAME === process.env.SEED_EDITOR_USERNAME
  ) {
    problems.push('SEED_VIEWER_USERNAME and SEED_EDITOR_USERNAME must be different');
  }
  return problems;
}

// ---------------------------------------------------------------------------
// 2. Seed data
// ---------------------------------------------------------------------------
// Event dates are relative to today so the dashboard (which shows the last two
// months of events) always has something to display.
function daysFromToday(days) {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days));
}

const SERVICES = [
  { name: 'Flu Vaccination', description: 'Seasonal flu shots for adults and children', status: 'Active' },
  { name: 'Health Screening', description: 'Blood pressure, glucose and cholesterol checks', status: 'Active' },
  { name: 'Nutrition Counseling', description: 'One-on-one meal planning and healthy eating advice', status: 'Active' },
  { name: 'Mental Health Support', description: 'Counseling referrals and support groups', status: 'Active' },
  { name: 'Legacy Transport Program', description: 'Ride assistance program that has been discontinued', status: 'Inactive' }
];

// phone numbers use the reserved 555-01xx range, e-mails use example.com
const CLIENTS = [
  { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@example.com', phone: '7135550101', line1: '120 Oak St', city: 'Rosenberg', county: 'Fort Bend', zip: '77471' },
  { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@example.com', phone: '7135550102', line1: '88 Pine Ave', city: 'Rosenberg', county: 'Fort Bend', zip: '77471' },
  { firstName: 'Linh', lastName: 'Nguyen', email: 'linh.nguyen@example.com', phone: '7135550103', line1: '45 Cedar Ln', city: 'Sugar Land', county: 'Fort Bend', zip: '77478' },
  { firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.hassan@example.com', phone: '7135550104', line1: '9 Maple Ct', city: 'Sugar Land', county: 'Fort Bend', zip: '77478' },
  { firstName: 'Sofia', middleName: 'Elena', lastName: 'Martinez', email: 'sofia.martinez@example.com', phone: '7135550105', line1: '300 Elm Dr', city: 'Richmond', county: 'Fort Bend', zip: '77407' },
  { firstName: 'Daniel', lastName: 'Brown', email: 'daniel.brown@example.com', phone: '7135550106', line1: '17 Birch Rd', city: 'Richmond', county: 'Fort Bend', zip: '77407' },
  { firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@example.com', phone: '7135550107', line1: '502 Willow Way', city: 'Houston', county: 'Harris', zip: '77002' },
  { firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.johnson@example.com', phone: '7135550108', line1: '71 Spruce St', city: 'Houston', county: 'Harris', zip: '77002' },
  { firstName: 'Elena', lastName: 'Rossi', email: 'elena.rossi@example.com', phone: '7135550109', line1: '210 Aspen Blvd', city: 'Rosenberg', county: 'Fort Bend', zip: '77471' },
  { firstName: 'Tomas', lastName: 'Novak', email: 'tomas.novak@example.com', phone: '7135550110', line1: '63 Poplar Pl', city: 'Houston', county: 'Harris', zip: '77003' }
];

// attendees are listed by client e-mail, services by service name
const EVENTS = [
  {
    name: 'Community Flu Shot Clinic', daysFromToday: -40, services: ['Flu Vaccination'],
    description: 'Free flu shots for the whole family.',
    address: { line1: '1 Community Way', city: 'Rosenberg', county: 'Fort Bend', zip: '77471' },
    attendees: ['maria.garcia@example.com', 'james.wilson@example.com', 'linh.nguyen@example.com', 'sofia.martinez@example.com']
  },
  {
    name: 'Health Screening Day', daysFromToday: -21, services: ['Health Screening', 'Nutrition Counseling'],
    description: 'Walk-in blood pressure, glucose and cholesterol checks.',
    address: { line1: '25 Wellness Dr', city: 'Sugar Land', county: 'Fort Bend', zip: '77478' },
    attendees: ['ahmed.hassan@example.com', 'daniel.brown@example.com', 'priya.patel@example.com', 'maria.garcia@example.com', 'marcus.johnson@example.com']
  },
  {
    name: 'Nutrition Workshop', daysFromToday: -5, services: ['Nutrition Counseling'],
    description: 'Hands-on class about budget-friendly healthy meals.',
    address: { line1: '1 Community Way', city: 'Rosenberg', county: 'Fort Bend', zip: '77471' },
    attendees: ['elena.rossi@example.com', 'linh.nguyen@example.com']
  },
  {
    name: 'Mental Health Awareness Night', daysFromToday: 9, services: ['Mental Health Support'],
    description: 'Information session and support group introduction.',
    address: { line1: '400 Harmony Ave', city: 'Houston', county: 'Harris', zip: '77002' },
    attendees: ['tomas.novak@example.com']
  },
  {
    name: 'Winter Wellness Fair', daysFromToday: 30, services: ['Flu Vaccination', 'Health Screening'],
    description: 'Open registration is still available for this event.',
    address: { line1: '1 Community Way', city: 'Rosenberg', county: 'Fort Bend', zip: '77471' },
    attendees: []
  }
];

// ---------------------------------------------------------------------------
// 3. Helpers
// ---------------------------------------------------------------------------
const summary = {};
function count(label, kind) {
  summary[label] = summary[label] || { created: 0, existing: 0 };
  summary[label][kind]++;
}

// Look for a document first and only create it when it is missing. Existing
// documents are never modified, so rerunning cannot overwrite anyone's edits.
async function ensure(Model, label, filter, doc) {
  const found = await Model.findOne(filter);
  if (found) {
    count(label, 'existing');
    return found;
  }
  const created = await Model.create(doc);
  count(label, 'created');
  return created;
}

async function createIndexes() {
  const warnings = [];
  const wanted = [
    [users, { username: 1, org: 1 }, { unique: true }],
    [clients, { orgs: 1, lastName: 1, firstName: 1 }, {}],
    [clients, { orgs: 1, 'phoneNumber.primary': 1 }, {}],
    [events, { org: 1, date: 1 }, {}],
    [events, { org: 1, name: 1 }, {}],
    [services, { org: 1, name: 1 }, {}]
  ];
  for (const [Model, keys, options] of wanted) {
    try {
      await Model.collection.createIndex(keys, options); // creating an existing index is a no-op
    } catch (err) {
      warnings.push(`index ${Model.collection.name} ${JSON.stringify(keys)}: ${err.message}`);
    }
  }
  return warnings;
}

async function resetOrg(orgId) {
  // only documents that belong to this organization are removed
  const removed = {
    users: (await users.deleteMany({ org: orgId })).deletedCount,
    clients: (await clients.deleteMany({ orgs: orgId })).deletedCount,
    events: (await events.deleteMany({ org: orgId })).deletedCount,
    services: (await services.deleteMany({ org: orgId })).deletedCount,
    org: (await orgs.deleteMany({ _id: orgId })).deletedCount
  };
  console.log('Reset: removed', JSON.stringify(removed), 'for this organization');
}

// ---------------------------------------------------------------------------
// 4. Main
// ---------------------------------------------------------------------------
async function main() {
  const problems = checkConfig();
  if (problems.length > 0) {
    console.error('db:init stopped: the configuration is not valid.');
    problems.forEach((p) => console.error('  - ' + p));
    console.error('Fix backend/.env and run the command again.');
    process.exit(1);
  }

  const orgId = new mongoose.Types.ObjectId(process.env.ORG_ID.trim());

  try {
    await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    console.error('db:init stopped: could not connect to MongoDB (' + err.message + ')');
    console.error('Is MongoDB running, and is MONGO_URL correct?');
    process.exit(1);
  }

  console.log(`Connected to ${mongoose.connection.name}${RESET ? ' (RESET mode)' : ''}`);
  if (RESET) await resetOrg(orgId);

  // organization
  await ensure(orgs, 'organization', { _id: orgId }, {
    _id: orgId,
    name: (process.env.SEED_ORG_NAME || 'Community Health Partners').trim()
  });

  // users: passwords are read from the environment and hashed before they are saved
  const accounts = [
    { username: process.env.SEED_VIEWER_USERNAME.trim(), password: process.env.SEED_VIEWER_PASSWORD, role: 'viewer' },
    { username: process.env.SEED_EDITOR_USERNAME.trim(), password: process.env.SEED_EDITOR_PASSWORD, role: 'editor' }
  ];
  for (const account of accounts) {
    const found = await users.findOne({ username: account.username, org: orgId });
    if (found) {
      count('users', 'existing');
      continue;
    }
    await users.create({
      _id: new mongoose.Types.ObjectId(),
      username: account.username,
      password: await bcrypt.hash(account.password, 10),
      role: account.role,
      org: orgId
    });
    count('users', 'created');
  }

  // services
  const serviceIds = {};
  for (const s of SERVICES) {
    const doc = await ensure(services, 'services', { name: s.name, org: orgId }, { ...s, org: orgId });
    serviceIds[s.name] = doc._id;
  }

  // clients
  const clientIds = {};
  for (const c of CLIENTS) {
    const doc = await ensure(clients, 'clients', { email: c.email, orgs: orgId }, {
      firstName: c.firstName,
      middleName: c.middleName,
      lastName: c.lastName,
      email: c.email,
      phoneNumber: { primary: c.phone },
      address: { line1: c.line1, city: c.city, county: c.county, zip: c.zip },
      orgs: [orgId]
    });
    clientIds[c.email] = doc._id;
  }

  // events, including registrations (attendees are client ids)
  for (const e of EVENTS) {
    await ensure(events, 'events', { name: e.name, org: orgId }, {
      org: orgId,
      name: e.name,
      description: e.description,
      date: daysFromToday(e.daysFromToday),
      address: e.address,
      services: e.services.map((name) => serviceIds[name]),
      attendees: e.attendees.map((email) => clientIds[email])
    });
  }

  const indexWarnings = await createIndexes();

  // summary
  console.log('\nSummary (created / already existed):');
  for (const [label, s] of Object.entries(summary)) {
    console.log(`  ${label.padEnd(13)} ${s.created} created, ${s.existing} already existed`);
  }
  const registrations = await events.aggregate([
    { $match: { org: orgId } },
    { $group: { _id: null, total: { $sum: { $size: '$attendees' } } } }
  ]);
  console.log(`  registrations ${registrations.length ? registrations[0].total : 0} in total`);
  console.log(`\nAccounts: ${accounts.map((a) => `${a.username} (${a.role})`).join(', ')}`);
  if (indexWarnings.length) {
    console.log('\nWarnings:');
    indexWarnings.forEach((w) => console.log('  - ' + w));
  }
  console.log('\nDatabase initialization finished.');

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('db:init failed: ' + err.message);
  try { await mongoose.disconnect(); } catch (e) { /* ignore */ }
  process.exit(1);
});
