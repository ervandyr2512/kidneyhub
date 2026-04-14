const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  ExternalHyperlink,
} = require('docx');
const fs = require('fs');

// ── Colours ─────────────────────────────────────────────────
const NAVY   = "1F3864";
const BLUE   = "2E75B6";
const TEAL   = "1F6B75";
const LGRAY  = "F2F2F2";
const MGRAY  = "D9D9D9";
const WHITE  = "FFFFFF";
const BLACK  = "000000";
const GREEN  = "375623";
const LGREEN = "E2EFDA";
const AMBER  = "843C0C";
const LAMBER = "FFF2CC";
const RED    = "843C0C";
const LRED   = "FCE4D6";

// ── Content width (A4 with 1-inch margins) ──────────────────
const CW = 9026; // DXA

// ── Border helper ────────────────────────────────────────────
const bdr = (color = "AAAAAA") => ({ style: BorderStyle.SINGLE, size: 1, color });
const borders = (c = "AAAAAA") => ({ top: bdr(c), bottom: bdr(c), left: bdr(c), right: bdr(c) });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: WHITE });
const noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() });

// ── Helpers ──────────────────────────────────────────────────
const sp = (before = 0, after = 0) => ({ spacing: { before, after } });
const blank = (sz = 120) => new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: sz } });

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 32, color: NAVY, font: "Arial" })],
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 4 } },
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 26, color: BLUE, font: "Arial" })],
    spacing: { before: 280, after: 120 },
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 24, color: TEAL, font: "Arial" })],
    spacing: { before: 200, after: 100 },
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Arial", color: "222222", ...opts })],
    spacing: { before: 60, after: 80 },
  });
}

function boldBody(text) {
  return bodyText(text, { bold: true });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    children: [new TextRun({ text, size: 22, font: "Arial" })],
    spacing: { before: 40, after: 40 },
  });
}

function codeBlock(lines) {
  return lines.map(line =>
    new Paragraph({
      children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "1E1E1E" })],
      spacing: { before: 0, after: 0 },
      indent: { left: 360 },
    })
  );
}

function codeSection(codeStr) {
  const lines = codeStr.split('\n');
  return [
    // grey background box simulated via shaded cell in a 1×1 table
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [CW],
      rows: [new TableRow({
        children: [new TableCell({
          borders: { top: bdr(BLUE), bottom: bdr(BLUE), left: bdr(BLUE), right: bdr(BLUE) },
          shading: { fill: "F0F0F0", type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          width: { size: CW, type: WidthType.DXA },
          children: lines.map(line => new Paragraph({
            children: [new TextRun({ text: line || " ", font: "Courier New", size: 17, color: "1E1E1E" })],
            spacing: { before: 0, after: 0 },
          })),
        })]
      })]
    }),
    blank(80),
  ];
}

// ── Status Table ─────────────────────────────────────────────
function statusTable() {
  const rows_data = [
    ["Infrastruktur & Konfigurasi", "Firebase config, types, utilities",              "Selesai",      "100%", LGREEN, GREEN],
    ["Sistem Autentikasi",          "Login, Register, AuthContext",                    "Selesai",      "100%", LGREEN, GREEN],
    ["Halaman Publik (6 halaman)",  "Home, RS, Dokter, Info, Tentang, Kontak",        "Selesai",      "100%", LGREEN, GREEN],
    ["REST API Routes",             "8 endpoint (donors, doctors, hospitals, records)","Selesai",      "100%", LGREEN, GREEN],
    ["Dashboard Admin",             "Overview, CRUD Donor, Dokter, RS",               "Selesai",      "100%", LGREEN, GREEN],
    ["Dashboard Dokter",            "Halaman screening workflow",                      "Selesai",      "100%", LGREEN, GREEN],
    ["Dashboard Rumah Sakit",       "Lab results management",                          "Selesai",      "100%", LGREEN, GREEN],
    ["Dashboard Donor",             "Profil, status, rekam medis",                    "Selesai",      "100%", LGREEN, GREEN],
    ["Komponen UI",                 "Button, Card, Modal, Input, Badge, StatsCard",   "Selesai",      "100%", LGREEN, GREEN],
    ["Form Komponen",               "DonorForm, DoctorForm, HospitalForm, LabResults","Selesai",      "100%", LGREEN, GREEN],
    ["Navigasi",                    "Navbar, Footer, Dashboard Sidebar",              "Selesai",      "100%", LGREEN, GREEN],
    ["Integrasi Testing",           "Unit test, E2E test",                            "Dalam Proses", "20%",  LAMBER, AMBER],
    ["Deployment & CI/CD",          "Vercel deployment, environment config",          "Dalam Proses", "60%",  LAMBER, AMBER],
    ["Fitur Notifikasi",            "Email notifikasi real-time",                     "Belum Dimulai","0%",   LRED,   RED],
  ];

  const headerRow = new TableRow({
    tableHeader: true,
    children: ["Modul", "Komponen", "Status", "%"].map((h, i) => {
      const widths = [2000, 4000, 1700, 700];
      return new TableCell({
        borders: borders(WHITE),
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        width: { size: widths[i], type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: h, bold: true, color: WHITE, size: 20, font: "Arial" })],
        })],
      });
    }),
  });

  const dataRows = rows_data.map(([modul, komponen, status, pct, bg, fg]) =>
    new TableRow({
      children: [
        [modul, 2000],
        [komponen, 4000],
        [status, 1700],
        [pct, 700],
      ].map(([text, w]) => new TableCell({
        borders: borders("CCCCCC"),
        shading: { fill: bg, type: ShadingType.CLEAR },
        width: { size: w, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text: String(text), size: 19, font: "Arial", color: fg })],
        })],
      })),
    })
  );

  return [
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [2000, 4000, 1700, 700],
      rows: [headerRow, ...dataRows],
    }),
    blank(160),
  ];
}

// ── Generic 2-col table ──────────────────────────────────────
function twoColTable(headers, rows_data, widths = [4500, 4526]) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: borders(WHITE),
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, color: WHITE, size: 20, font: "Arial" })],
      })],
    })),
  });
  const dataRows = rows_data.map(row => new TableRow({
    children: row.map((cell, i) => new TableCell({
      borders: borders("CCCCCC"),
      shading: { fill: i === 0 ? LGRAY : WHITE, type: ShadingType.CLEAR },
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: String(cell), size: 19, font: "Arial" })],
      })],
    })),
  }));
  return [
    new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: widths, rows: [headerRow, ...dataRows] }),
    blank(140),
  ];
}

function threeColTable(headers, rows_data, widths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: borders(WHITE),
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, color: WHITE, size: 20, font: "Arial" })],
      })],
    })),
  });
  const dataRows = rows_data.map(row => new TableRow({
    children: row.map((cell, i) => new TableCell({
      borders: borders("CCCCCC"),
      shading: { fill: i === 0 ? LGRAY : WHITE, type: ShadingType.CLEAR },
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: String(cell), size: 19, font: "Arial" })],
      })],
    })),
  }));
  return [
    new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: widths, rows: [headerRow, ...dataRows] }),
    blank(140),
  ];
}

// ── Document ─────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: TEAL },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [
    // ══════════════════════════════════════════════════════
    // SECTION 1 — COVER PAGE
    // ══════════════════════════════════════════════════════
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        blank(2000),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "LAPORAN KEMAJUAN PENGERJAAN WEBSITE", bold: true, size: 44, color: NAVY, font: "Arial" })],
          spacing: { before: 0, after: 240 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 4 } },
          children: [new TextRun({ text: "KidneyHub.id \u2014 Sistem Registry Donor Ginjal Nasional Indonesia", size: 28, color: BLUE, font: "Arial" })],
          spacing: { before: 0, after: 400 },
        }),
        blank(300),

        // info block
        ...[
          ["Mata Kuliah", "Modul 4 \u2013 ALP (Assignment Learning Project)"],
          ["Checkpoint", "2 (Target: 50% Penyelesaian)"],
          ["Tanggal", "12 April 2026"],
          ["Capaian Saat Ini", "52% \u2014 Selesai"],
          ["GitHub Repository", "https://github.com/ervandyr2512/kidneyhub"],
        ].map(([label, value]) =>
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `${label}: `, bold: true, size: 24, font: "Arial", color: NAVY }),
              new TextRun({ text: value, size: 24, font: "Arial", color: "333333" }),
            ],
            spacing: { before: 80, after: 80 },
          })
        ),

        blank(2000),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Ervandyr Rangganata", bold: true, size: 26, font: "Arial", color: NAVY })],
          spacing: { before: 0, after: 80 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "2026", size: 22, font: "Arial", color: "555555" })],
        }),
      ],
    },

    // ══════════════════════════════════════════════════════
    // SECTION 2 — MAIN CONTENT
    // ══════════════════════════════════════════════════════
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: "KidneyHub.id \u2014 Laporan Checkpoint 2", size: 18, color: "888888", font: "Arial" }),
              new TextRun({ text: "\t12 April 2026", size: 18, color: "888888", font: "Arial" }),
            ],
            tabStops: [{ type: "right", position: 9026 }],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MGRAY, space: 2 } },
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Halaman ", size: 18, color: "888888", font: "Arial" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888", font: "Arial" }),
              new TextRun({ text: " dari ", size: 18, color: "888888", font: "Arial" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "888888", font: "Arial" }),
            ],
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: MGRAY, space: 2 } },
          })],
        }),
      },
      children: [

        // ── 1. RINGKASAN EKSEKUTIF ──────────────────────────
        heading1("1. Ringkasan Eksekutif"),

        bodyText(
          "Pada Checkpoint 2 ini, pengembangan platform KidneyHub.id telah mencapai 52% penyelesaian dari total target. " +
          "Platform ini dibangun menggunakan Next.js 16 (App Router), TypeScript, Tailwind CSS, dan Firebase " +
          "(Realtime Database + Authentication). Total 47 file telah dibuat dengan lebih dari 3.100 baris kode."
        ),
        blank(80),

        heading2("1.1 Status Penyelesaian Per Modul"),
        ...statusTable(),

        // ── 2. FUNGSI-FUNGSI YANG TELAH SELESAI ────────────
        heading1("2. Fungsi-Fungsi yang Telah Selesai"),

        // 2.1
        heading2("2.1  Sistem Type Definitions"),
        new Paragraph({
          children: [new TextRun({ text: "File: ", bold: true, size: 21, font: "Courier New" }),
                     new TextRun({ text: "src/types/index.ts", size: 21, font: "Courier New", color: TEAL })],
          spacing: { before: 60, after: 60 },
        }),
        bodyText("Mendefinisikan seluruh tipe data TypeScript untuk semua entitas dalam platform. Menjadi kontrak data tunggal yang digunakan oleh seluruh lapisan aplikasi."),
        heading3("Fitur yang Selesai"),
        bullet("5 union types: UserRole, DonorStatus, ScreeningStatus, ScreeningResult, AssignmentStatus"),
        bullet("9 interface utama: User, Donor, Doctor, Hospital, Screening, MedicalRecord, PhysicalExam, LabResults, Assignment"),
        bullet("Form data types dengan Omit<> utility type untuk semua form"),
        bullet("DB_PATHS constants object untuk semua Firebase Realtime DB paths"),
        bullet("MedicalHistory interface dengan 12 field riwayat kesehatan"),
        blank(80),
        heading3("Potongan Kode"),
        ...codeSection(
`export type UserRole = 'admin' | 'doctor' | 'hospital_staff' | 'donor';

export type DonorStatus =
  | 'pending' | 'screening' | 'eligible'
  | 'assigned' | 'rejected';

export interface Donor {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  bloodType: 'A' | 'B' | 'AB' | 'O';
  rhesus: '+' | '-';
  medicalHistory: MedicalHistory;
  status: DonorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LabResults {
  hemoglobin?: number;
  creatinine?: number;
  gfr?: number;
  hlaTyping?: string;
  crossmatch?: 'positive' | 'negative' | 'pending';
  hivStatus?: 'reactive' | 'non-reactive' | 'pending';
}

export const DB_PATHS = {
  USERS: 'users', DONORS: 'donors', DOCTORS: 'doctors',
  HOSPITALS: 'hospitals', SCREENINGS: 'screenings',
  MEDICAL_RECORDS: 'medicalRecords', ASSIGNMENTS: 'assignments',
} as const;`
        ),

        // 2.2
        heading2("2.2  Firebase Authentication Helper"),
        new Paragraph({
          children: [new TextRun({ text: "File: ", bold: true, size: 21, font: "Courier New" }),
                     new TextRun({ text: "src/lib/firebase/auth.ts", size: 21, font: "Courier New", color: TEAL })],
          spacing: { before: 60, after: 60 },
        }),
        bodyText("Modul helper yang membungkus semua operasi autentikasi Firebase dengan cara yang bersih dan dapat diuji ulang."),
        heading3("Fungsi yang Selesai"),
        bullet("registerUser() — Daftar user baru, simpan profil ke Realtime DB, kirim email verifikasi"),
        bullet("signIn() — Login dengan email dan password"),
        bullet("signOut() — Logout user aktif"),
        bullet("getUserProfile() — Ambil profil user dari Realtime DB berdasarkan UID"),
        bullet("resendVerificationEmail() — Kirim ulang email verifikasi"),
        bullet("onAuthChange() — Subscribe perubahan state autentikasi (digunakan AuthContext)"),
        blank(80),
        heading3("Potongan Kode"),
        ...codeSection(
`export async function registerUser(
  email: string, password: string,
  name: string, role: UserRole = 'donor'
): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(
    auth, email, password
  );
  const user = credential.user;
  const userRecord: Omit<User, 'uid'> = {
    email, name, role, phone: '',
    isEmailVerified: false,
    createdAt: new Date().toISOString(),
  };
  await set(ref(db, \`\${DB_PATHS.USERS}/\${user.uid}\`), userRecord);
  await sendEmailVerification(user);
  return user;
}

export async function getUserProfile(
  uid: string
): Promise<User | null> {
  const snapshot = await get(
    ref(db, \`\${DB_PATHS.USERS}/\${uid}\`)
  );
  if (!snapshot.exists()) return null;
  return { uid, ...snapshot.val() } as User;
}`
        ),

        // 2.3
        heading2("2.3  Firebase Realtime Database CRUD Helper"),
        new Paragraph({
          children: [new TextRun({ text: "File: ", bold: true, size: 21, font: "Courier New" }),
                     new TextRun({ text: "src/lib/firebase/database.ts", size: 21, font: "Courier New", color: TEAL })],
          spacing: { before: 60, after: 60 },
        }),
        bodyText("Generic CRUD helpers berbasis TypeScript Generics serta entity-specific database wrappers untuk setiap koleksi Firebase."),
        heading3("Fungsi yang Selesai"),
        bullet("createRecord<T>() — Buat record baru dengan push key otomatis Firebase"),
        bullet("getRecord<T>() — Ambil satu record berdasarkan ID"),
        bullet("getAllRecords<T>() — Ambil semua record dari suatu path"),
        bullet("updateRecord<T>() — Update record secara parsial"),
        bullet("deleteRecord() — Hapus record berdasarkan ID"),
        bullet("subscribeToPath<T>() — Realtime listener untuk perubahan data"),
        bullet("Entity wrappers: donorDb, doctorDb, hospitalDb, screeningDb, medicalRecordDb, assignmentDb"),
        blank(80),
        heading3("Potongan Kode"),
        ...codeSection(
`export async function createRecord<T extends object>(
  path: string, data: T
): Promise<string> {
  const newRef = push(ref(db, path));
  await set(newRef, { ...data, createdAt: new Date().toISOString() });
  return newRef.key!;
}

export function subscribeToPath<T>(
  path: string,
  callback: (data: T[]) => void
): () => void {
  return onValue(ref(db, path), (snapshot) => {
    if (!snapshot.exists()) { callback([]); return; }
    const data = Object.entries(snapshot.val()).map(
      ([id, val]) => ({ id, ...(val as object) } as T)
    );
    callback(data);
  });
}

export const donorDb = {
  create: (data: WithoutIdAndDates<Donor>) =>
    createRecord<object>(DB_PATHS.DONORS, {
      ...data, updatedAt: new Date().toISOString(),
    }),
  get: (id: string) => getRecord<Donor>(DB_PATHS.DONORS, id),
  getAll: () => getAllRecords<Donor>(DB_PATHS.DONORS),
  update: (id: string, data: Partial<Donor>) =>
    updateRecord<Donor>(DB_PATHS.DONORS, id, data),
  delete: (id: string) => deleteRecord(DB_PATHS.DONORS, id),
  subscribe: (cb: (donors: Donor[]) => void) =>
    subscribeToPath<Donor>(DB_PATHS.DONORS, cb),
};`
        ),

        // 2.4
        heading2("2.4  AuthContext — Global State Management"),
        new Paragraph({
          children: [new TextRun({ text: "File: ", bold: true, size: 21, font: "Courier New" }),
                     new TextRun({ text: "src/contexts/AuthContext.tsx", size: 21, font: "Courier New", color: TEAL })],
          spacing: { before: 60, after: 60 },
        }),
        bodyText("React Context API untuk manajemen state autentikasi global. Membungkus seluruh aplikasi dalam root layout.tsx."),
        heading3("Fitur yang Selesai"),
        bullet("Interface AuthContextValue: firebaseUser, userProfile, loading, refreshProfile"),
        bullet("Auto-refresh profil pengguna saat auth state berubah (Firebase onAuthStateChanged)"),
        bullet("Provider wrapper AuthProvider yang melingkupi seluruh aplikasi"),
        bullet("Custom hook useAuth() untuk akses mudah dari komponen manapun"),
        blank(80),
        heading3("Potongan Kode"),
        ...codeSection(
`export function AuthProvider(
  { children }: { children: React.ReactNode }
) {
  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] =
    useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}`
        ),

        // 2.5
        heading2("2.5  REST API Routes (Next.js 16 Route Handlers)"),
        new Paragraph({
          children: [new TextRun({ text: "Path: ", bold: true, size: 21, font: "Courier New" }),
                     new TextRun({ text: "src/app/api/", size: 21, font: "Courier New", color: TEAL })],
          spacing: { before: 60, after: 60 },
        }),
        bodyText("Server-side API endpoints menggunakan Next.js 16 Route Handlers dengan pola async params terbaru."),
        heading3("Endpoint yang Selesai"),
        bullet("GET  /api/donors — List semua donor"),
        bullet("POST /api/donors — Buat donor baru"),
        bullet("GET  /api/donors/[id] — Detail donor (Next.js 16: async params)"),
        bullet("PUT  /api/donors/[id] — Update donor"),
        bullet("DELETE /api/donors/[id] — Hapus donor"),
        bullet("GET/POST /api/doctors — CRUD dokter"),
        bullet("GET/POST /api/hospitals — CRUD rumah sakit"),
        bullet("GET/POST /api/medical-records — CRUD rekam medis"),
        blank(80),
        heading3("Potongan Kode (Async Params — Next.js 16)"),
        ...codeSection(
`export const dynamic = 'force-dynamic';

// Next.js 16: params harus di-await sebagai Promise
type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  const donor = await donorDb.get(id);
  if (!donor)
    return NextResponse.json(
      { error: 'Donor not found' }, { status: 404 }
    );
  return NextResponse.json({ donor });
}

export async function PUT(req: Request, { params }: Context) {
  const { id } = await params;
  const body = await req.json();
  await donorDb.update(id, body);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: Context) {
  const { id } = await params;
  await donorDb.delete(id);
  return NextResponse.json({ success: true });
}`
        ),

        // 2.6
        heading2("2.6  Dashboard Admin — CRUD Lengkap"),
        new Paragraph({
          children: [new TextRun({ text: "Path: ", bold: true, size: 21, font: "Courier New" }),
                     new TextRun({ text: "src/app/dashboard/admin/", size: 21, font: "Courier New", color: TEAL })],
          spacing: { before: 60, after: 60 },
        }),
        bodyText("Admin panel komprehensif dengan manajemen penuh terhadap semua entitas sistem."),
        heading3("Halaman yang Selesai"),
        bullet("/dashboard/admin — Overview dengan 4 StatsCards (donor, dokter, RS, pending screening)"),
        bullet("/dashboard/admin/donors — Tabel donor: search, view, edit, delete via modal"),
        bullet("/dashboard/admin/doctors — Card-based CRUD untuk manajemen dokter"),
        bullet("/dashboard/admin/hospitals — Card-based CRUD untuk manajemen rumah sakit"),
        heading3("Fitur Utama"),
        bullet("StatsCards real-time menggunakan Firebase subscribeToPath()"),
        bullet("Search & filter multi-field (nama, email, kota)"),
        bullet("Modal konfirmasi sebelum delete dengan toast notifikasi"),
        bullet("Status badge dengan warna dinamis berdasarkan DonorStatus"),
        blank(80),
        heading3("Potongan Kode (Search & Delete)"),
        ...codeSection(
`const filtered = donors.filter((d) =>
  d.name.toLowerCase().includes(search.toLowerCase()) ||
  d.email.toLowerCase().includes(search.toLowerCase()) ||
  d.city.toLowerCase().includes(search.toLowerCase())
);

async function handleDelete(id: string) {
  if (!confirm('Hapus donor ini?')) return;
  await donorDb.delete(id);
  setDonors((prev) => prev.filter((d) => d.id !== id));
  toast.success('Donor berhasil dihapus');
}`
        ),

        // 2.7
        heading2("2.7  Dashboard Dokter — Screening Workflow"),
        new Paragraph({
          children: [new TextRun({ text: "File: ", bold: true, size: 21, font: "Courier New" }),
                     new TextRun({ text: "src/app/dashboard/doctor/screenings/page.tsx", size: 21, font: "Courier New", color: TEAL })],
          spacing: { before: 60, after: 60 },
        }),
        bodyText("Halaman untuk dokter (SpPD-KGH, Urologist, Forensic) melakukan penilaian screening terhadap calon donor."),
        heading3("Fitur yang Selesai"),
        bullet("Tabel semua screening yang ditugaskan ke dokter yang sedang login"),
        bullet("Modal input hasil screening: eligible / ineligible + catatan klinis"),
        bullet("Auto-update status donor setelah hasil screening disubmit"),
        bullet("Filter berdasarkan status screening (pending / scheduled / completed)"),
        blank(80),
        heading3("Potongan Kode (Auto-update Donor Status)"),
        ...codeSection(
`async function handleSubmitResult(
  screeningId: string,
  donorId: string
) {
  await screeningDb.update(screeningId, {
    result: resultForm.result,
    notes: resultForm.notes,
    status: 'completed',
    completedAt: new Date().toISOString(),
  });

  // Auto-update status donor berdasarkan hasil screening
  const newStatus: DonorStatus =
    resultForm.result === 'eligible' ? 'eligible' : 'rejected';
  await donorDb.update(donorId, { status: newStatus });

  toast.success('Hasil screening berhasil disimpan');
  setShowResultModal(false);
  loadScreenings();
}`
        ),

        // 2.8
        heading2("2.8  Form Lab Results — Pemeriksaan Laboratorium Lengkap"),
        new Paragraph({
          children: [new TextRun({ text: "File: ", bold: true, size: 21, font: "Courier New" }),
                     new TextRun({ text: "src/components/forms/LabResultsForm.tsx", size: 21, font: "Courier New", color: TEAL })],
          spacing: { before: 60, after: 60 },
        }),
        bodyText("Form paling kompleks dalam sistem — menangani 8 seksi pemeriksaan medis dengan lebih dari 30 field input."),
        heading3("Seksi Form yang Selesai"),
        bullet("Pemeriksaan Fisik: TB, BB, BMI (auto-kalkulasi), tekanan darah, nadi, suhu, SpO2"),
        bullet("Darah Lengkap / CBC: Hemoglobin, Hematokrit, Leukosit, Trombosit, Eritrosit"),
        bullet("Fungsi Ginjal: Ureum, Kreatinin, GFR (glomerular filtration rate)"),
        bullet("Elektrolit: Natrium (Na), Kalium (K), Klorida (Cl), Kalsium (Ca)"),
        bullet("Imunologi: HLA Typing, Golongan Darah, Crossmatch"),
        bullet("Penyakit Infeksi: HIV, Hepatitis B, Hepatitis C"),
        bullet("Genomik: opsional, hanya jika tersedia"),
        bullet("Kesimpulan: fit / unfit / pending + catatan dokter"),
        blank(80),
        heading3("Potongan Kode (BMI Auto-Kalkulasi)"),
        ...codeSection(
`const handlePhysicalChange = (
  field: keyof PhysicalExam,
  value: string
) => {
  const updated = {
    ...formData.physicalExam,
    [field]: parseFloat(value) || 0
  };
  if (field === 'height' || field === 'weight') {
    const h = (field === 'height'
      ? parseFloat(value)
      : formData.physicalExam.height) / 100;
    const w = field === 'weight'
      ? parseFloat(value)
      : formData.physicalExam.weight;
    if (h > 0 && w > 0) {
      updated.bmi = parseFloat((w / (h * h)).toFixed(1));
    }
  }
  setFormData((prev) => ({ ...prev, physicalExam: updated }));
};`
        ),

        // 2.9
        heading2("2.9  Protected Dashboard Layout (Role-Based Navigation)"),
        new Paragraph({
          children: [new TextRun({ text: "File: ", bold: true, size: 21, font: "Courier New" }),
                     new TextRun({ text: "src/app/dashboard/layout.tsx", size: 21, font: "Courier New", color: TEAL })],
          spacing: { before: 60, after: 60 },
        }),
        bodyText("Layout wrapper untuk semua halaman dashboard dengan proteksi autentikasi dan navigasi dinamis berdasarkan role."),
        heading3("Fitur yang Selesai"),
        bullet("Auto-redirect ke /login jika user tidak terautentikasi"),
        bullet("Role-based sidebar navigation (tampilan berbeda untuk admin, dokter, RS, donor)"),
        bullet("Mobile responsive dengan hamburger menu toggle"),
        bullet("Active link highlighting berdasarkan pathname saat ini"),
        bullet("User info di sidebar (nama, badge role berwarna)"),
        blank(80),
        heading3("Potongan Kode (Role Navigation Map)"),
        ...codeSection(
`const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Overview', href: '/dashboard/admin', icon: '📊' },
    { label: 'Data Donor', href: '/dashboard/admin/donors', icon: '👥' },
    { label: 'Data Dokter', href: '/dashboard/admin/doctors', icon: '👨‍⚕️' },
    { label: 'Rumah Sakit', href: '/dashboard/admin/hospitals', icon: '🏥' },
  ],
  doctor: [
    { label: 'Overview', href: '/dashboard/doctor', icon: '📋' },
    { label: 'Screening', href: '/dashboard/doctor/screenings', icon: '🔬' },
  ],
  hospital_staff: [
    { label: 'Overview', href: '/dashboard/hospital', icon: '🏥' },
    { label: 'Data Donor', href: '/dashboard/hospital/donors', icon: '👥' },
    { label: 'Rekam Medis', href: '/dashboard/hospital/records', icon: '📁' },
  ],
  donor: [
    { label: 'Dashboard', href: '/dashboard/donor', icon: '💚' },
    { label: 'Profil Saya', href: '/dashboard/donor/profile', icon: '👤' },
    { label: 'Rekam Medis', href: '/dashboard/donor/records', icon: '📋' },
  ],
};`
        ),

        // 2.10
        heading2("2.10  Halaman Publik — 6 Halaman"),
        new Paragraph({
          children: [new TextRun({ text: "Path: ", bold: true, size: 21, font: "Courier New" }),
                     new TextRun({ text: "src/app/(public)/", size: 21, font: "Courier New", color: TEAL })],
          spacing: { before: 60, after: 60 },
        }),
        bodyText("Enam halaman publik yang dapat diakses tanpa autentikasi, menggunakan Navbar dan Footer bersama."),
        blank(80),
        ...threeColTable(
          ["Halaman", "Path", "Konten Utama"],
          [
            ["Beranda", "/home", "Hero section, statistik, cara kerja, daftar RS mitra, CTA"],
            ["Rumah Sakit", "/rumah-sakit", "5 kartu RS mitra: RSCM, Fatmawati, Bunda, Siloam ASRI, Mandaya"],
            ["Dokter Kami", "/dokter-kami", "Profil dokter dikelompokkan per spesialisasi (SpPD-KGH, Urolog, Forensik)"],
            ["Informasi", "/informasi", "Edukasi donasi ginjal, kriteria kelayakan, panel lab, FAQ"],
            ["Tentang Kami", "/tentang-kami", "Visi, misi, nilai organisasi, timeline pengembangan"],
            ["Kontak Kami", "/kontak-kami", "Form kontak interaktif + kartu informasi kontak"],
          ],
          [2200, 2000, 5026]
        ),

        // ── 3. STRUKTUR FOLDER ──────────────────────────────
        heading1("3. Struktur Folder dan File"),
        bodyText("Seluruh 47 file yang telah dibuat mengikuti konvensi Next.js 16 App Router dengan Route Groups."),
        blank(80),
        ...codeSection(
`kidneyhub/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx             [SELESAI]
│   │   │   └── register/page.tsx          [SELESAI]
│   │   ├── (public)/
│   │   │   ├── home/page.tsx              [SELESAI]
│   │   │   ├── rumah-sakit/page.tsx       [SELESAI]
│   │   │   ├── dokter-kami/page.tsx       [SELESAI]
│   │   │   ├── informasi/page.tsx         [SELESAI]
│   │   │   ├── tentang-kami/page.tsx      [SELESAI]
│   │   │   └── kontak-kami/page.tsx       [SELESAI]
│   │   ├── api/
│   │   │   ├── donors/route.ts            [SELESAI]
│   │   │   ├── donors/[id]/route.ts       [SELESAI]
│   │   │   ├── doctors/route.ts           [SELESAI]
│   │   │   ├── hospitals/route.ts         [SELESAI]
│   │   │   └── medical-records/route.ts   [SELESAI]
│   │   └── dashboard/
│   │       ├── layout.tsx                 [SELESAI]
│   │       ├── admin/page.tsx             [SELESAI]
│   │       ├── admin/donors/page.tsx      [SELESAI]
│   │       ├── admin/doctors/page.tsx     [SELESAI]
│   │       ├── admin/hospitals/page.tsx   [SELESAI]
│   │       ├── doctor/page.tsx            [SELESAI]
│   │       ├── doctor/screenings/page.tsx [SELESAI]
│   │       ├── hospital/page.tsx          [SELESAI]
│   │       ├── hospital/donors/page.tsx   [SELESAI]
│   │       ├── hospital/records/page.tsx  [SELESAI]
│   │       ├── donor/page.tsx             [SELESAI]
│   │       ├── donor/profile/page.tsx     [SELESAI]
│   │       └── donor/records/page.tsx     [SELESAI]
│   ├── components/
│   │   ├── forms/
│   │   │   ├── DonorForm.tsx              [SELESAI]
│   │   │   ├── DoctorForm.tsx             [SELESAI]
│   │   │   ├── HospitalForm.tsx           [SELESAI]
│   │   │   └── LabResultsForm.tsx         [SELESAI]
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                 [SELESAI]
│   │   │   └── Footer.tsx                 [SELESAI]
│   │   └── ui/
│   │       ├── Badge.tsx                  [SELESAI]
│   │       ├── Button.tsx                 [SELESAI]
│   │       ├── Card.tsx                   [SELESAI]
│   │       ├── Input.tsx                  [SELESAI]
│   │       ├── Modal.tsx                  [SELESAI]
│   │       └── StatsCard.tsx              [SELESAI]
│   ├── contexts/AuthContext.tsx           [SELESAI]
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts                  [SELESAI]
│   │   │   ├── auth.ts                    [SELESAI]
│   │   │   ├── database.ts                [SELESAI]
│   │   │   └── admin.ts                   [SELESAI]
│   │   └── utils/cn.ts                    [SELESAI]
│   └── types/index.ts                     [SELESAI]
├── database.rules.json                    [SELESAI]
├── vercel.json                            [SELESAI]
└── firebase.json                          [SELESAI]`
        ),

        // ── 4. STATISTIK ────────────────────────────────────
        heading1("4. Statistik Pengerjaan"),
        blank(60),
        ...twoColTable(
          ["Metrik", "Nilai"],
          [
            ["Total file dibuat", "47 file"],
            ["Total baris kode", "> 3.100 baris"],
            ["Halaman publik", "6 halaman"],
            ["Halaman dashboard", "13 halaman"],
            ["API endpoints", "8 endpoint"],
            ["Komponen UI", "10 komponen"],
            ["Form komponen", "4 form"],
            ["Firebase collections", "7 collections"],
            ["TypeScript interfaces", "12 interface"],
          ],
          [4500, 4526]
        ),

        // ── 5. TEKNOLOGI ─────────────────────────────────────
        heading1("5. Teknologi yang Digunakan"),
        blank(60),
        ...threeColTable(
          ["Teknologi", "Versi", "Fungsi"],
          [
            ["Next.js", "16 (App Router)", "Framework utama (SSR + CSR hybrid)"],
            ["TypeScript", "5.x", "Type safety seluruh codebase"],
            ["Tailwind CSS", "4.x", "Styling utility-first"],
            ["Firebase Auth", "11.x", "Autentikasi pengguna + email verification"],
            ["Firebase Realtime DB", "11.x", "Database NoSQL (JSON tree)"],
            ["Firebase Admin SDK", "13.x", "Server-side token verification"],
            ["React Context API", "18.x", "Global state management"],
            ["react-hot-toast", "2.x", "Notifikasi UI"],
            ["clsx + tailwind-merge", "latest", "Utility class merging (cn())"],
          ],
          [2500, 2000, 4526]
        ),

        // ── 6. ARSITEKTUR ────────────────────────────────────
        heading1("6. Arsitektur Sistem"),
        bodyText(
          "Platform KidneyHub.id menggunakan arsitektur Serverless dengan Firebase Backend-as-a-Service (BaaS). " +
          "Seluruh logika bisnis dieksekusi di Next.js API Routes (serverless functions) yang berjalan di Vercel."
        ),
        blank(80),
        bullet("Frontend: Next.js 16 App Router (SSR + CSR hybrid, Singapore region)"),
        bullet("Database: Firebase Realtime Database (NoSQL JSON tree, asia-southeast1)"),
        bullet("Auth: Firebase Authentication (Email/Password + Email Link Verification)"),
        bullet("API: Next.js Route Handlers dengan Firebase Admin SDK untuk proteksi server-side"),
        bullet("Hosting: Vercel (region: sin1 / Singapore) — free tier"),
        bullet("Security: Firebase Security Rules + Role-Based Access Control (RBAC) di aplikasi"),
        blank(160),

        // ── 7. RENCANA SELANJUTNYA ───────────────────────────
        heading1("7. Rencana Pengerjaan Selanjutnya (50% Berikutnya)"),
        blank(60),
        ...twoColTable(
          ["Minggu", "Task"],
          [
            ["Minggu 1", "Implementasi unit test (Jest + React Testing Library)"],
            ["Minggu 2", "Finalisasi deployment Vercel + konfigurasi environment variables"],
            ["Minggu 3", "Fitur notifikasi email real-time untuk status donor"],
            ["Minggu 4", "Optimasi performa: lazy loading, image optimization, caching"],
            ["Minggu 5", "UAT (User Acceptance Testing) dengan minimal 5 pengguna"],
            ["Minggu 6", "Final bug fixes, QA, dan dokumentasi teknis lengkap"],
          ],
          [2000, 7026]
        ),

        // ── 8. LINK REFERENSI ────────────────────────────────
        heading1("8. Link Referensi"),
        blank(60),
        new Paragraph({
          children: [
            new TextRun({ text: "GitHub Repository: ", bold: true, size: 22, font: "Arial" }),
            new ExternalHyperlink({
              link: "https://github.com/ervandyr2512/kidneyhub",
              children: [new TextRun({ text: "https://github.com/ervandyr2512/kidneyhub", style: "Hyperlink", size: 22, font: "Arial" })],
            }),
          ],
          spacing: { before: 80, after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Firebase Console: ", bold: true, size: 22, font: "Arial" }),
            new ExternalHyperlink({
              link: "https://console.firebase.google.com/project/kidneyhub-id",
              children: [new TextRun({ text: "https://console.firebase.google.com/project/kidneyhub-id", style: "Hyperlink", size: 22, font: "Arial" })],
            }),
          ],
          spacing: { before: 80, after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Vercel Dashboard: ", bold: true, size: 22, font: "Arial" }),
            new ExternalHyperlink({
              link: "https://vercel.com/dashboard",
              children: [new TextRun({ text: "https://vercel.com/dashboard", style: "Hyperlink", size: 22, font: "Arial" })],
            }),
          ],
          spacing: { before: 80, after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Next.js 16 Docs: ", bold: true, size: 22, font: "Arial" }),
            new ExternalHyperlink({
              link: "https://nextjs.org/docs",
              children: [new TextRun({ text: "https://nextjs.org/docs", style: "Hyperlink", size: 22, font: "Arial" })],
            }),
          ],
          spacing: { before: 80, after: 80 },
        }),

        blank(300),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: MGRAY, space: 8 } },
          children: [new TextRun({ text: "Ervandyr Rangganata  \u2014  12 April 2026  \u2014  Checkpoint 2: 52% Selesai", size: 20, font: "Arial", color: "555555", italics: true })],
          spacing: { before: 200, after: 0 },
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(
    '/Users/ervandyrangganata/Downloads/kidneyhub/laporan-checkpoint2.docx',
    buffer
  );
  console.log('Laporan Checkpoint 2 berhasil dibuat: laporan-checkpoint2.docx');
});
