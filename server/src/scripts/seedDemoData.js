import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Delivery from '../models/Delivery.js';
import Donation from '../models/Donation.js';
import DonationRequest from '../models/DonationRequest.js';
import User from '../models/User.js';

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error('Set MONGO_URI in server/.env before running seed-demo');
  process.exit(1);
}

async function upsertUser({ name, email, password, role, organizationName, address, phone, verificationStatus = 'verified' }) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      organizationName: organizationName || '',
      address: address || '',
      phone: phone || '',
      verificationStatus,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return user;
}

async function upsertDonation({ donor, title, description, category, quantity, unit, pickupAddress, pickupBy, status = 'available' }) {
  return Donation.findOneAndUpdate(
    { donor, title },
    {
      donor,
      title,
      description,
      category,
      quantity,
      totalQuantity: quantity,
      unit,
      pickupAddress,
      pickupBy,
      status,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertRequest({ donation, ngo, quantity, note, status = 'pending' }) {
  return DonationRequest.findOneAndUpdate(
    { donation, ngo },
    {
      donation,
      ngo,
      quantity,
      note,
      status,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertDelivery({ request, donation, volunteer, status = 'available' }) {
  return Delivery.findOneAndUpdate(
    { request },
    {
      request,
      donation,
      volunteer,
      status,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function main() {
  await mongoose.connect(MONGO_URI);

  const donors = await Promise.all([
    upsertUser({
      name: 'Green Valley Kitchen',
      email: 'greenvalley.kitchen@demo.com',
      password: 'DemoDonor123!',
      role: 'donor',
      organizationName: 'Green Valley Kitchen',
      address: '12 Market Road, Bengaluru',
      phone: '9876543210',
      verificationStatus: 'verified',
    }),
    upsertUser({
      name: 'Sunrise Catering Hub',
      email: 'sunrise.catering@demo.com',
      password: 'DemoDonor456!',
      role: 'donor',
      organizationName: 'Sunrise Catering Hub',
      address: '22 Temple Street, Mysuru',
      phone: '9876543211',
      verificationStatus: 'verified',
    }),
  ]);

  const ngos = await Promise.all([
    upsertUser({
      name: 'Hunger Relief Network',
      email: 'hungerrelief@demo.com',
      password: 'DemoNgo123!',
      role: 'ngo',
      organizationName: 'Hunger Relief Network',
      address: '8 Community Lane, Bengaluru',
      phone: '9123456780',
      verificationStatus: 'verified',
    }),
    upsertUser({
      name: 'City Care Collective',
      email: 'citycare@demo.com',
      password: 'DemoNgo456!',
      role: 'ngo',
      organizationName: 'City Care Collective',
      address: '44 School Road, Hubballi',
      phone: '9123456781',
      verificationStatus: 'verified',
    }),
  ]);

  const volunteer = await upsertUser({
    name: 'Volunteer Demo',
    email: 'volunteer.demo@demo.com',
    password: 'DemoVolunteer123!',
    role: 'volunteer',
    organizationName: '',
    address: '9 Service Road, Bengaluru',
    phone: '9000012345',
    verificationStatus: 'verified',
  });

  const donations = await Promise.all([
    upsertDonation({
      donor: donors[0]._id,
      title: 'Fresh vegetable trays',
      description: 'Healthy meal trays with vegetables, rice, and salads ready for distribution.',
      category: 'produce',
      quantity: 30,
      unit: 'meals',
      pickupAddress: '12 Market Road, Bengaluru',
      pickupBy: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      status: 'available',
    }),
    upsertDonation({
      donor: donors[1]._id,
      title: 'Bakery and snack packs',
      description: 'Fresh bread, pastries, and snack boxes from the evening prep session.',
      category: 'bakery',
      quantity: 18,
      unit: 'boxes',
      pickupAddress: '22 Temple Street, Mysuru',
      pickupBy: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      status: 'available',
    }),
  ]);

  const approvedRequest = await upsertRequest({
    donation: donations[0]._id,
    ngo: ngos[0]._id,
    quantity: 12,
    note: 'Needed for the weekend community meal drive.',
    status: 'approved',
  });

  const pendingRequest = await upsertRequest({
    donation: donations[1]._id,
    ngo: ngos[1]._id,
    quantity: 8,
    note: 'We can collect before evening distribution.',
    status: 'pending',
  });

  await upsertDelivery({
    request: approvedRequest._id,
    donation: donations[0]._id,
    volunteer: volunteer._id,
    status: 'assigned',
  });

  console.log('Demo data ready.');
  console.log('Donor logins:');
  console.log('  - greenvalley.kitchen@demo.com / DemoDonor123!');
  console.log('  - sunrise.catering@demo.com / DemoDonor456!');
  console.log('NGO logins:');
  console.log('  - hungerrelief@demo.com / DemoNgo123!');
  console.log('  - citycare@demo.com / DemoNgo456!');
  console.log('Volunteer login:');
  console.log('  - volunteer.demo@demo.com / DemoVolunteer123!');

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Demo data seeding failed:', error.message);
  process.exitCode = 1;
});
