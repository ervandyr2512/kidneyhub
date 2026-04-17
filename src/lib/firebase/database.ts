// ============================================================
// KidneyHub - Firebase Realtime Database CRUD Helpers
// Generic helpers + entity-specific functions
// ============================================================

import {
  ref,
  set,
  get,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  onValue,
  type DatabaseReference,
} from 'firebase/database';
import { db as _db } from './config';
const db = _db!; // Only null at build time without env vars
import type { Donor, Doctor, Hospital, Screening, MedicalRecord, Assignment } from '@/types';
import { DB_PATHS } from '@/types';

// ── Generic helpers ──────────────────────────────────────────

/**
 * Recursively strip undefined values from an object.
 * Firebase Realtime Database rejects any payload containing undefined.
 */
function stripUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(stripUndefined) as unknown as T;
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    ) as T;
  }
  return obj;
}

/** Create a new record and return its generated key */
export async function createRecord<T extends object>(path: string, data: T): Promise<string> {
  const listRef = ref(db, path);
  const newRef = push(listRef);
  await set(newRef, stripUndefined({ ...data, createdAt: new Date().toISOString() }));
  return newRef.key!;
}

// Internal type helper to allow passing data without createdAt
type WithoutIdAndDates<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/** Read a single record by ID */
export async function getRecord<T>(path: string, id: string): Promise<T | null> {
  const snapshot = await get(ref(db, `${path}/${id}`));
  if (!snapshot.exists()) return null;
  return { id, ...snapshot.val() } as T;
}

/** Read all records under a path */
export async function getAllRecords<T>(path: string): Promise<T[]> {
  const snapshot = await get(ref(db, path));
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...(val as object) } as T));
}

/** Update a record partially */
export async function updateRecord<T extends object>(
  path: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  await update(ref(db, `${path}/${id}`), stripUndefined({ ...data, updatedAt: new Date().toISOString() }));
}

/** Delete a record by ID */
export async function deleteRecord(path: string, id: string): Promise<void> {
  await remove(ref(db, `${path}/${id}`));
}

/** Subscribe to realtime updates on a path */
export function subscribeToPath<T>(
  path: string,
  callback: (data: T[]) => void
): () => void {
  const dbRef = ref(db, path);
  const unsubscribe = onValue(dbRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = Object.entries(snapshot.val()).map(
      ([id, val]) => ({ id, ...(val as object) } as T)
    );
    callback(data);
  });
  return unsubscribe;
}

// ── Donor-specific ───────────────────────────────────────────

export const donorDb = {
  create: (data: WithoutIdAndDates<Donor>) =>
    createRecord<object>(DB_PATHS.DONORS, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),
  get: (id: string) => getRecord<Donor>(DB_PATHS.DONORS, id),
  getAll: () => getAllRecords<Donor>(DB_PATHS.DONORS),
  update: (id: string, data: Partial<Donor>) =>
    updateRecord<Donor>(DB_PATHS.DONORS, id, data),
  delete: (id: string) => deleteRecord(DB_PATHS.DONORS, id),
  subscribe: (cb: (donors: Donor[]) => void) =>
    subscribeToPath<Donor>(DB_PATHS.DONORS, cb),
};

// ── Doctor-specific ──────────────────────────────────────────

export const doctorDb = {
  create: (data: Omit<Doctor, 'id' | 'createdAt'>) =>
    createRecord<object>(DB_PATHS.DOCTORS, data),
  get: (id: string) => getRecord<Doctor>(DB_PATHS.DOCTORS, id),
  getAll: () => getAllRecords<Doctor>(DB_PATHS.DOCTORS),
  update: (id: string, data: Partial<Doctor>) =>
    updateRecord<Doctor>(DB_PATHS.DOCTORS, id, data),
  delete: (id: string) => deleteRecord(DB_PATHS.DOCTORS, id),
};

// ── Hospital-specific ────────────────────────────────────────

export const hospitalDb = {
  create: (data: Omit<Hospital, 'id' | 'createdAt'>) =>
    createRecord<object>(DB_PATHS.HOSPITALS, data),
  get: (id: string) => getRecord<Hospital>(DB_PATHS.HOSPITALS, id),
  getAll: () => getAllRecords<Hospital>(DB_PATHS.HOSPITALS),
  update: (id: string, data: Partial<Hospital>) =>
    updateRecord<Hospital>(DB_PATHS.HOSPITALS, id, data),
  delete: (id: string) => deleteRecord(DB_PATHS.HOSPITALS, id),
};

// ── Screening-specific ───────────────────────────────────────

export const screeningDb = {
  create: (data: Omit<Screening, 'id' | 'createdAt'>) =>
    createRecord<object>(DB_PATHS.SCREENINGS, data),
  get: (id: string) => getRecord<Screening>(DB_PATHS.SCREENINGS, id),
  getAll: () => getAllRecords<Screening>(DB_PATHS.SCREENINGS),
  getByDonor: async (donorId: string): Promise<Screening[]> => {
    const all = await getAllRecords<Screening>(DB_PATHS.SCREENINGS);
    return all.filter((s) => s.donorId === donorId);
  },
  update: (id: string, data: Partial<Screening>) =>
    updateRecord<Screening>(DB_PATHS.SCREENINGS, id, data),
};

// ── Medical Record-specific ──────────────────────────────────

export const medicalRecordDb = {
  create: (data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) =>
    createRecord<object>(DB_PATHS.MEDICAL_RECORDS, {
      ...data,
      updatedAt: new Date().toISOString(),
    }),
  get: (id: string) => getRecord<MedicalRecord>(DB_PATHS.MEDICAL_RECORDS, id),
  getAll: () => getAllRecords<MedicalRecord>(DB_PATHS.MEDICAL_RECORDS),
  getByDonor: async (donorId: string): Promise<MedicalRecord[]> => {
    const all = await getAllRecords<MedicalRecord>(DB_PATHS.MEDICAL_RECORDS);
    return all.filter((r) => r.donorId === donorId);
  },
  update: (id: string, data: Partial<MedicalRecord>) =>
    updateRecord<MedicalRecord>(DB_PATHS.MEDICAL_RECORDS, id, data),
};

// ── Assignment-specific ──────────────────────────────────────

export const assignmentDb = {
  create: (data: Omit<Assignment, 'id'>) =>
    createRecord<Omit<Assignment, 'id'>>(DB_PATHS.ASSIGNMENTS, data),
  get: (id: string) => getRecord<Assignment>(DB_PATHS.ASSIGNMENTS, id),
  getAll: () => getAllRecords<Assignment>(DB_PATHS.ASSIGNMENTS),
  update: (id: string, data: Partial<Assignment>) =>
    updateRecord<Assignment>(DB_PATHS.ASSIGNMENTS, id, data),
};
