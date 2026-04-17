/**
 * KidneyHub.id — Seed Dummy Accounts
 * Membuat akun dummy doctor dan hospital_staff via Firebase REST API
 * Jalankan: node seed-dummy-accounts.js
 */

const https = require('https');

// ── Config (dari .env.local) ─────────────────────────────────
const API_KEY      = 'AIzaSyCdP84cjZjQAEuyvhBEmD6hzuMTLe70qFI';
const DATABASE_URL = 'https://kidneyhub-id-default-rtdb.asia-southeast1.firebasedatabase.app';

// ── Akun dummy yang akan dibuat ───────────────────────────────
const ACCOUNTS = [
  // ── Dokter ──────────────────────────────────────────────────
  {
    email: 'dr.ahmad@kidneyhub.id',
    password: 'Doctor@123',
    profile: {
      name: 'dr. Ahmad Fauzi, SpPD-KGH',
      role: 'doctor',
      phone: '081234567890',
      isEmailVerified: true,
    },
  },
  {
    email: 'dr.siti@kidneyhub.id',
    password: 'Doctor@123',
    profile: {
      name: 'dr. Siti Rahayu, Sp.U',
      role: 'doctor',
      phone: '081234567891',
      isEmailVerified: true,
    },
  },
  // ── Rumah Sakit ──────────────────────────────────────────────
  {
    email: 'rscm@kidneyhub.id',
    password: 'Hospital@123',
    profile: {
      name: 'Staff RSCM',
      role: 'hospital_staff',
      phone: '02114000600',
      isEmailVerified: true,
    },
  },
  {
    email: 'siloam@kidneyhub.id',
    password: 'Hospital@123',
    profile: {
      name: 'Staff Siloam ASRI',
      role: 'hospital_staff',
      phone: '02179183000',
      isEmailVerified: true,
    },
  },
];

// ── Helper: HTTPS POST ────────────────────────────────────────
function httpsPost(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch { resolve(raw); }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Helper: HTTPS PUT (untuk Realtime DB)
function httpsPut(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname,
        path,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch { resolve(raw); }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(55));
  console.log('  KidneyHub.id — Seed Dummy Accounts');
  console.log('='.repeat(55));

  for (const acc of ACCOUNTS) {
    process.stdout.write(`\n[${acc.profile.role.toUpperCase()}] ${acc.email} ... `);

    // 1. Buat user di Firebase Auth
    const authRes = await httpsPost(
      'identitytoolkit.googleapis.com',
      `/v1/accounts:signUp?key=${API_KEY}`,
      { email: acc.email, password: acc.password, returnSecureToken: true }
    );

    if (authRes.error) {
      // Jika sudah ada, coba login untuk dapat UID
      if (authRes.error.message === 'EMAIL_EXISTS') {
        const loginRes = await httpsPost(
          'identitytoolkit.googleapis.com',
          `/v1/accounts:signInWithPassword?key=${API_KEY}`,
          { email: acc.email, password: acc.password, returnSecureToken: true }
        );
        if (loginRes.error) {
          console.log(`SKIP (${loginRes.error.message})`);
          continue;
        }
        const uid = loginRes.localId;
        // Update profil di DB saja
        const dbHost = DATABASE_URL.replace('https://', '');
        await httpsPut(dbHost, `/users/${uid}.json`, {
          ...acc.profile,
          email: acc.email,
          createdAt: new Date().toISOString(),
        });
        console.log(`OK (sudah ada, profil diperbarui, uid: ${uid})`);
      } else {
        console.log(`ERROR: ${authRes.error.message}`);
      }
      continue;
    }

    const uid = authRes.localId;

    // 2. Simpan profil ke Realtime DB
    const dbHost = DATABASE_URL.replace('https://', '');
    await httpsPut(dbHost, `/users/${uid}.json`, {
      ...acc.profile,
      email: acc.email,
      createdAt: new Date().toISOString(),
    });

    console.log(`BERHASIL (uid: ${uid})`);
  }

  console.log('\n' + '='.repeat(55));
  console.log('  RINGKASAN AKUN DUMMY');
  console.log('='.repeat(55));
  console.log('\n  DOKTER');
  console.log('  ─────────────────────────────────────────────');
  console.log('  Email    : dr.ahmad@kidneyhub.id');
  console.log('  Password : Doctor@123');
  console.log('  Nama     : dr. Ahmad Fauzi, SpPD-KGH');
  console.log('  Role     : doctor');
  console.log();
  console.log('  Email    : dr.siti@kidneyhub.id');
  console.log('  Password : Doctor@123');
  console.log('  Nama     : dr. Siti Rahayu, Sp.U');
  console.log('  Role     : doctor');
  console.log('\n  RUMAH SAKIT');
  console.log('  ─────────────────────────────────────────────');
  console.log('  Email    : rscm@kidneyhub.id');
  console.log('  Password : Hospital@123');
  console.log('  Nama     : Staff RSCM');
  console.log('  Role     : hospital_staff');
  console.log();
  console.log('  Email    : siloam@kidneyhub.id');
  console.log('  Password : Hospital@123');
  console.log('  Nama     : Staff Siloam ASRI');
  console.log('  Role     : hospital_staff');
  console.log('='.repeat(55));
  console.log('  CATATAN: Akun ini untuk keperluan dummy/testing.');
  console.log('  Jangan gunakan di production.');
  console.log('='.repeat(55) + '\n');
}

main().catch(console.error);
