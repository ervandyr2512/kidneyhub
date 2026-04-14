// ============================================================
// KidneyHub.id — Academic Proposal Generator
// Outputs: proposal-kidneyhub.docx
// ============================================================
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, LevelFormat, BorderStyle, PageNumber,
  Header, Footer, TableOfContents, PageBreak,
  UnderlineType, ShadingType,
} = require('docx');
const fs = require('fs');

// ── Helpers ──────────────────────────────────────────────────

const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 480, after: 200 },
  children: [new TextRun({ text, bold: true, size: 36, font: 'Times New Roman' })],
});

const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 320, after: 160 },
  children: [new TextRun({ text, bold: true, size: 28, font: 'Times New Roman' })],
});

const H3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text, bold: true, italics: true, size: 26, font: 'Times New Roman' })],
});

const P = (text, opts = {}) => new Paragraph({
  alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
  spacing: { before: 0, after: 200, line: 360 },
  indent: opts.indent !== false ? { firstLine: 720 } : {},
  children: [new TextRun({ text, size: 24, font: 'Times New Roman', ...opts.run })],
});

const SPACE = () => new Paragraph({ children: [new TextRun('')], spacing: { after: 120 } });

const BULLET = (text, level = 0) => new Paragraph({
  numbering: { reference: 'bullets', level },
  spacing: { before: 60, after: 60, line: 320 },
  children: [new TextRun({ text, size: 24, font: 'Times New Roman' })],
});

const NUMBERED = (text, level = 0) => new Paragraph({
  numbering: { reference: 'numbers', level },
  spacing: { before: 60, after: 60, line: 320 },
  children: [new TextRun({ text, size: 24, font: 'Times New Roman' })],
});

const CODE = (text) => new Paragraph({
  indent: { left: 720 },
  spacing: { before: 80, after: 80, line: 280 },
  shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
  children: [new TextRun({ text, size: 20, font: 'Courier New' })],
});

const ITALIC = (text) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  indent: { firstLine: 720 },
  spacing: { before: 0, after: 200, line: 360 },
  children: [new TextRun({ text, size: 24, font: 'Times New Roman', italics: true })],
});

const BOLD_LINE = (label, value) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  indent: { left: 720 },
  spacing: { before: 60, after: 60, line: 320 },
  children: [
    new TextRun({ text: label, bold: true, size: 24, font: 'Times New Roman' }),
    new TextRun({ text: value, size: 24, font: 'Times New Roman' }),
  ],
});

const DIVIDER = () => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1A3C5E', space: 4 } },
  spacing: { before: 200, after: 200 },
  children: [new TextRun('')],
});

const PAGE_BREAK = () => new Paragraph({ children: [new PageBreak()] });

// ── Document ─────────────────────────────────────────────────

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }, {
          level: 1, format: LevelFormat.BULLET, text: '\u25E6', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } },
        }],
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }, {
          level: 1, format: LevelFormat.LOWER_LETTER, text: '%2)', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } },
        }],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: 'Times New Roman', size: 24 } },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Times New Roman', color: '1A3C5E' },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Times New Roman', color: '2E6DA4' },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, italics: true, font: 'Times New Roman', color: '1A3C5E' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '1A3C5E', space: 4 } },
          children: [new TextRun({ text: 'Proposal Penelitian | kidneyhub.id', size: 18, font: 'Times New Roman', color: '555555' })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: '1A3C5E', space: 4 } },
          children: [
            new TextRun({ text: 'Halaman ', size: 18, font: 'Times New Roman', color: '555555' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Times New Roman', color: '555555' }),
            new TextRun({ text: ' dari ', size: 18, font: 'Times New Roman', color: '555555' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: 'Times New Roman', color: '555555' }),
          ],
        })],
      }),
    },
    children: [

      // ── HALAMAN JUDUL ──────────────────────────────────────
      SPACE(), SPACE(), SPACE(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'PROPOSAL PENELITIAN', bold: true, size: 32, font: 'Times New Roman', color: '1A3C5E', allCaps: true })],
      }),
      DIVIDER(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200, line: 400 },
        children: [new TextRun({
          text: 'SISTEM REGISTRI NASIONAL DONOR GINJAL BERBASIS WEB:\nPENGEMBANGAN PLATFORM kidneyhub.id UNTUK MENDUKUNG\nTRANSPLANTASI GINJAL DI INDONESIA',
          bold: true, size: 32, font: 'Times New Roman', color: '1A3C5E',
        })],
      }),
      DIVIDER(),
      SPACE(), SPACE(),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Diajukan oleh:', size: 22, font: 'Times New Roman', italics: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Ervandyr Angganata', bold: true, size: 26, font: 'Times New Roman' })] }),
      SPACE(),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Program Studi Ilmu Kesehatan / Informatika Kesehatan', size: 22, font: 'Times New Roman' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Jakarta, Indonesia', size: 22, font: 'Times New Roman' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: '2025', size: 22, font: 'Times New Roman' })] }),
      SPACE(), SPACE(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: 'kidneyhub.id', bold: true, size: 28, font: 'Times New Roman', color: '2E6DA4' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Platform Registri Donor Ginjal Nasional', size: 22, font: 'Times New Roman', italics: true, color: '555555' })],
      }),

      PAGE_BREAK(),

      // ── DAFTAR ISI ─────────────────────────────────────────
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'DAFTAR ISI', bold: true, size: 32, font: 'Times New Roman', color: '1A3C5E' })],
      }),
      new TableOfContents('Daftar Isi', { hyperlink: true, headingStyleRange: '1-3' }),

      PAGE_BREAK(),

      // ── ABSTRAK ────────────────────────────────────────────
      H1('ABSTRAK'),
      P('Indonesia hingga saat ini belum memiliki sistem registri donor ginjal nasional yang terpusat, baik untuk donor hidup (living donor), donor setelah kematian jantung (Donation after Cardiac Death/DCD), maupun donor setelah kematian otak (Donation after Brain Death/DBD). Kondisi ini mengakibatkan inefisiensi serius dalam proses pencocokan donor-resipien, keterbatasan transparansi data klinis, fragmentasi informasi antarrumah sakit, serta tantangan etika dan hukum yang belum terselesaikan secara sistematis. Penelitian dan pengembangan ini bertujuan merancang, membangun, dan mengevaluasi platform digital berbasis web bernama kidneyhub.id sebagai solusi komprehensif atas permasalahan tersebut.'),
      P('Platform kidneyhub.id dikembangkan menggunakan metodologi Agile dengan framework Next.js (App Router) pada lapisan frontend, Firebase Realtime Database sebagai basis data, dan Firebase Authentication untuk sistem verifikasi pengguna berbasis email OTP. Sistem dirancang dengan arsitektur role-based access control (RBAC) yang mencakup empat peran utama: administrator, dokter spesialis, staf rumah sakit, dan calon donor. Alur kerja sistem mencakup pendaftaran donor, skrining multidisiplin oleh tiga spesialis (SpPD-KGH, Urolog, Dokter Forensik), penugasan otomatis ke rumah sakit mitra, serta input dan manajemen data pemeriksaan laboratorium komprehensif termasuk HLA typing dan crossmatch.'),
      P('Hasil perancangan menunjukkan bahwa platform ini mampu mengintegrasikan seluruh tahapan proses donasi ginjal dalam satu ekosistem digital yang aman, transparan, dan efisien. Penelitian ini diharapkan memberikan kontribusi nyata bagi pengembangan sistem kesehatan digital (e-health) Indonesia, khususnya dalam mendukung program transplantasi ginjal nasional.'),
      SPACE(),
      BOLD_LINE('Kata Kunci: ', 'registri donor ginjal, transplantasi ginjal, e-health, Firebase, Next.js, Indonesia, health informatics, RBAC, HLA typing'),

      PAGE_BREAK(),

      // ════════════════════════════════════════════════════════
      // BAB I — PENDAHULUAN
      // ════════════════════════════════════════════════════════
      H1('BAB I'),
      H1('PENDAHULUAN'),

      H2('1.1 Latar Belakang'),
      P('Penyakit ginjal kronik (Chronic Kidney Disease/CKD) merupakan salah satu tantangan kesehatan global yang paling signifikan pada abad ke-21. Data Global Burden of Disease (GBD) tahun 2019 mencatat bahwa CKD menjadi penyebab kematian ke-12 tertinggi di dunia, dengan prevalensi global mencapai 9,1 persen populasi dewasa atau sekitar 700 juta jiwa (Bikbov et al., 2020). Di Indonesia, estimasi prevalensi CKD berkisar antara 3,8 hingga 18 persen dari total populasi dewasa, menjadikannya sebagai salah satu negara dengan beban CKD tertinggi di kawasan Asia Tenggara (Perhimpunan Nefrologi Indonesia/PERNEFRI, 2022).'),
      P('Stadium akhir penyakit ginjal, yang dikenal sebagai End-Stage Renal Disease (ESRD) atau Gagal Ginjal Stadium Akhir (GGSA), memerlukan terapi pengganti ginjal (renal replacement therapy/RRT) berupa dialisis atau transplantasi ginjal. Di antara kedua modalitas tersebut, transplantasi ginjal secara konsisten terbukti memberikan hasil klinis yang lebih superior. Penelitian komprehensif menunjukkan bahwa resipien transplantasi ginjal memiliki angka kelangsungan hidup yang secara signifikan lebih tinggi dibandingkan pasien yang tetap pada dialisis, dengan estimasi keuntungan harapan hidup rata-rata 10 hingga 15 tahun lebih panjang (Wolfe et al., 1999; Port et al., 2003). Selain itu, transplantasi ginjal memberikan kualitas hidup yang jauh lebih baik dan beban biaya jangka panjang yang lebih rendah bagi sistem kesehatan nasional.'),
      P('Namun demikian, akses terhadap transplantasi ginjal di Indonesia masih sangat terbatas. Data Indonesian Renal Registry (IRR) tahun 2022 mencatat bahwa terdapat lebih dari 2.200 pasien yang aktif menunggu transplantasi ginjal, sementara jumlah transplantasi yang berhasil dilakukan setiap tahunnya tidak melebihi 200 prosedur. Kesenjangan dramatis antara kebutuhan dan ketersediaan organ ini mencerminkan permasalahan sistemik yang mendalam, yang salah satunya adalah ketiadaan sistem registri donor ginjal nasional yang terpusat dan terstandarisasi.'),
      P('Berbeda dengan Indonesia, negara-negara maju telah lama menginvestasikan sumber daya dalam pengembangan infrastruktur registri organ nasional. Amerika Serikat mengoperasikan United Network for Organ Sharing (UNOS), yang sejak tahun 1984 telah mengelola proses alokasi organ secara terpusat dan transparan menggunakan sistem informasi canggih. Pada tahun 2023, UNOS mencatat lebih dari 100.000 transplantasi organ yang berhasil difasilitasi melalui platform ini. Di Eropa, organisasi Eurotransplant mengkoordinasikan donasi dan transplantasi organ di delapan negara anggota, dengan tingkat keberhasilan yang konsisten tinggi berkat standarisasi data dan protokol yang ketat. Di kawasan Asia, negara-negara seperti Jepang (Japan Organ Transplant Network/JOTNW), Korea Selatan (Korean Network for Organ Sharing/KONOS), dan Taiwan (Taiwan Organ Registries and Sharing Center/TORSC) telah mengimplementasikan sistem registri yang terintegrasi dengan hasil yang signifikan dalam meningkatkan angka transplantasi nasional.'),
      P('Ketiadaan sistem registri nasional di Indonesia mengakibatkan serangkaian masalah yang saling terkait. Pertama, tidak adanya basis data terpusat membuat proses pencocokan (matching) antara donor dan resipien menjadi sangat tidak efisien. Setiap rumah sakit mengelola daftar tunggunya sendiri secara terpisah, sehingga tidak ada mekanisme untuk mengoptimalkan distribusi organ secara nasional berdasarkan urgensi medis, kompatibilitas imunologis, atau faktor geografis. Kedua, absennya sistem registri yang terstandarisasi menciptakan hambatan bagi pengumpulan data epidemiologis yang diperlukan untuk perencanaan kebijakan kesehatan berbasis bukti. Ketiga, ketiadaan transparansi dalam sistem yang ada menimbulkan risiko praktik yang tidak etis, termasuk perdagangan organ dan diskriminasi dalam alokasi, yang merupakan pelanggaran serius terhadap prinsip-prinsip etika kedokteran dan hak asasi manusia.'),
      P('Dari perspektif regulasi, Indonesia telah memiliki kerangka hukum dasar untuk transplantasi organ melalui Undang-Undang Nomor 36 Tahun 2009 tentang Kesehatan dan Peraturan Pemerintah Nomor 53 Tahun 2021 tentang Transplantasi Organ dan Jaringan Tubuh. Namun demikian, implementasi regulasi ini masih jauh dari optimal, sebagian besar disebabkan oleh ketiadaan infrastruktur digital yang diperlukan untuk mendukung pelaksanaannya secara efektif di tingkat nasional.'),
      P('Perkembangan teknologi informasi dan komunikasi, khususnya dalam bidang e-health dan health informatics, membuka peluang yang belum pernah ada sebelumnya untuk mengatasi tantangan-tantangan struktural ini. Platform berbasis web modern, dengan kemampuan pemrosesan data real-time, manajemen akses berbasis peran, dan integrasi workflow klinis yang kompleks, dapat menjadi fondasi bagi sistem registri donor ginjal nasional yang efektif, efisien, dan dapat dipercaya. Penelitian ini hadir sebagai respons terhadap kebutuhan mendesak tersebut, dengan menawarkan desain dan implementasi platform kidneyhub.id sebagai prototipe sistem registri donor ginjal nasional berbasis web untuk Indonesia.'),

      H2('1.2 Rumusan Masalah'),
      P('Berdasarkan latar belakang yang telah diuraikan, penelitian ini merumuskan permasalahan sebagai berikut:'),
      NUMBERED('Bagaimana merancang arsitektur sistem informasi registri donor ginjal nasional yang mampu mengintegrasikan proses pendaftaran donor, skrining medis multidisiplin, penugasan rumah sakit, dan manajemen rekam medis dalam satu platform terpadu?'),
      NUMBERED('Bagaimana mengimplementasikan sistem manajemen akses berbasis peran (Role-Based Access Control/RBAC) yang sesuai dengan kebutuhan berbagai pemangku kepentingan dalam ekosistem transplantasi ginjal, meliputi administrator, dokter spesialis, staf rumah sakit, dan calon donor?'),
      NUMBERED('Bagaimana merancang struktur basis data yang optimal untuk mendukung penyimpanan, pengelolaan, dan pengambilan data klinis donor ginjal, termasuk data pemeriksaan laboratorium komprehensif seperti HLA typing, crossmatch, dan data genomik?'),
      NUMBERED('Bagaimana mengevaluasi efektivitas dan kegunaan (usability) platform kidneyhub.id dalam konteks alur kerja klinis nyata di rumah sakit transplantasi ginjal di Indonesia?'),

      H2('1.3 Tujuan Penelitian'),
      H3('1.3.1 Tujuan Umum'),
      P('Merancang, mengembangkan, dan mengevaluasi platform digital berbasis web kidneyhub.id sebagai sistem registri donor ginjal nasional yang komprehensif untuk mendukung program transplantasi ginjal di Indonesia.'),
      H3('1.3.2 Tujuan Khusus'),
      NUMBERED('Menghasilkan arsitektur sistem informasi yang skalabel dan modular untuk manajemen data donor ginjal nasional menggunakan teknologi Next.js dan Firebase.'),
      NUMBERED('Mengimplementasikan sistem autentikasi dan otorisasi berbasis peran yang aman menggunakan Firebase Authentication dengan verifikasi email OTP.'),
      NUMBERED('Merancang dan mengimplementasikan skema basis data Firebase Realtime Database yang komprehensif untuk menyimpan data donor, dokter, rumah sakit, hasil skrining, dan rekam medis laboratorium.'),
      NUMBERED('Mengembangkan antarmuka pengguna yang intuitif, responsif, dan aksesibel menggunakan Tailwind CSS yang memenuhi standar kegunaan untuk pengguna dengan latar belakang medis maupun non-medis.'),
      NUMBERED('Mengevaluasi kinerja dan keamanan sistem melalui pengujian fungsional dan analisis kerentanan keamanan data medis.'),

      H2('1.4 Manfaat Penelitian'),
      H3('1.4.1 Manfaat Teoritis'),
      BULLET('Memberikan kontribusi pada pengembangan ilmu health informatics di Indonesia, khususnya dalam desain dan implementasi sistem informasi manajemen organ transplantasi.'),
      BULLET('Menyediakan kerangka referensi (reference framework) untuk penelitian selanjutnya di bidang registri kesehatan digital nasional.'),
      BULLET('Menghasilkan bukti empiris mengenai penerapan arsitektur serverless (Firebase) dalam konteks sistem informasi kesehatan kritis di negara berkembang.'),
      H3('1.4.2 Manfaat Praktis'),
      BULLET('Bagi Sistem Kesehatan Nasional: Menyediakan infrastruktur digital yang diperlukan untuk mendukung implementasi regulasi transplantasi ginjal secara efektif dan transparan.'),
      BULLET('Bagi Rumah Sakit: Mempermudah koordinasi antarpusat transplantasi, mengurangi duplikasi data, dan meningkatkan efisiensi operasional dalam pengelolaan calon donor.'),
      BULLET('Bagi Dokter Spesialis: Menyediakan platform terpadu untuk dokumentasi hasil skrining multidisiplin dan akses real-time terhadap data klinis calon donor.'),
      BULLET('Bagi Calon Donor: Memberikan kemudahan akses untuk mendaftarkan diri, memantau status proses skrining, dan memperoleh informasi yang transparan mengenai prosedur donasi.'),
      BULLET('Bagi Pembuat Kebijakan: Menyediakan basis data epidemiologis yang komprehensif untuk mendukung perencanaan dan evaluasi kebijakan transplantasi ginjal nasional.'),

      PAGE_BREAK(),

      // ════════════════════════════════════════════════════════
      // BAB II — TINJAUAN PUSTAKA
      // ════════════════════════════════════════════════════════
      H1('BAB II'),
      H1('TINJAUAN PUSTAKA'),

      H2('2.1 Transplantasi Ginjal: Tinjauan Klinis'),
      P('Transplantasi ginjal adalah prosedur bedah yang mentransfer ginjal yang sehat dari donor ke resipien yang mengalami gagal ginjal stadium akhir. Secara historis, transplantasi ginjal pertama yang berhasil dilakukan pada manusia terjadi pada tahun 1954 di Boston, Massachusetts, oleh tim bedah Joseph Murray, yang kemudian dianugerahi Nobel Prize in Physiology or Medicine pada tahun 1990 atas kontribusinya tersebut. Sejak saat itu, transplantasi ginjal telah berkembang menjadi modalitas pengobatan standar (standard of care) untuk ESRD di seluruh dunia.'),
      P('Berdasarkan asal organ, transplantasi ginjal dapat dikategorikan menjadi tiga jenis utama. Pertama, transplantasi dari donor hidup (living donor transplantation), di mana organ diperoleh dari individu yang masih hidup, baik yang memiliki hubungan genetik (related) maupun tidak (unrelated). Donor hidup memberikan keunggulan signifikan dalam hal kualitas organ, waktu iskemia yang lebih pendek, dan kemungkinan untuk menjadwalkan operasi secara elektif. Kedua, transplantasi dari donor setelah kematian otak (Donation after Brain Death/DBD), di mana organ diambil dari individu yang telah dinyatakan mati otak secara klinis dan legal, namun fungsi kardiovaskularnya masih dipertahankan secara artificial. Ketiga, transplantasi dari donor setelah kematian jantung (Donation after Cardiac Death/DCD), yang melibatkan pengambilan organ dari individu setelah sirkulasi dan fungsi kardiovaskular berhenti secara permanen.'),
      P('Keberhasilan transplantasi ginjal sangat ditentukan oleh kompatibilitas imunologis antara donor dan resipien. Parameter kunci dalam penilaian kompatibilitas meliputi penentuan golongan darah sistem ABO, crossmatch (uji silang) untuk mendeteksi antibodi preformed, dan Human Leukocyte Antigen (HLA) typing. HLA typing merupakan pemeriksaan yang mengidentifikasi variasi genetik pada molekul MHC (Major Histocompatibility Complex) yang berperan sentral dalam respons imun. Kecocokan HLA yang lebih baik secara konsisten berkorelasi dengan tingkat kelangsungan hidup graft yang lebih tinggi dan insiden rejeksi yang lebih rendah.'),

      H2('2.2 Sistem Registri Donor Organ: Perbandingan Internasional'),
      P('Pengalaman internasional dalam pengembangan dan operasionalisasi sistem registri donor organ memberikan pelajaran berharga yang relevan bagi konteks Indonesia.'),
      H3('2.2.1 UNOS (Amerika Serikat)'),
      P('United Network for Organ Sharing (UNOS) merupakan organisasi nirlaba yang beroperasi di bawah kontrak dengan Departemen Kesehatan Amerika Serikat untuk mengelola sistem transplantasi organ nasional (National Organ Transplant Act, 1984). UNOS mengoperasikan UNET, sebuah sistem informasi berbasis web yang memungkinkan manajemen daftar tunggu secara real-time, alokasi organ yang terkomputerisasi berdasarkan algoritma medis yang terstandarisasi, dan pelacakan hasil transplantasi secara longitudinal. Pada tahun anggaran 2022, UNOS memfasilitasi lebih dari 42.000 transplantasi organ di seluruh Amerika Serikat.'),
      H3('2.2.2 Eurotransplant'),
      P('Eurotransplant International Foundation adalah organisasi internasional yang mengoordinasikan alokasi organ donor dari delapan negara anggota Eropa (Austria, Belgia, Kroasia, Jerman, Hongaria, Luksemburg, Belanda, dan Slovenia). Sistem informasi Eurotransplant mengintegrasikan data dari lebih dari 130 pusat transplantasi dan memproses ribuan permintaan alokasi organ setiap harinya menggunakan algoritma yang mempertimbangkan faktor medis, geografis, dan etis secara simultan.'),
      H3('2.2.3 JOTNW (Jepang)'),
      P('Japan Organ Transplant Network (JOTNW) didirikan pada tahun 1997 menyusul disahkannya Undang-Undang Transplantasi Organ Jepang. Sistem ini mencakup manajemen registrasi donor, alokasi organ berbasis komputer, dan koordinasi dengan rumah sakit di seluruh Jepang. Pengalaman Jepang menunjukkan tantangan unik dalam konteks budaya yang mempengaruhi tingkat donasi organ, yang relevan bagi Indonesia dengan konteks sosiobudaya serupa.'),
      H3('2.2.4 IRODaT (Global)'),
      P('International Registry in Organ Donation and Transplantation (IRODaT) merupakan sistem registri global yang mengumpulkan data transplantasi organ dari lebih dari 100 negara, memungkinkan perbandingan lintas negara dan benchmarking untuk evaluasi kebijakan kesehatan nasional.'),

      H2('2.3 Informatika Kesehatan dan e-Health'),
      P('Informatika kesehatan (health informatics) adalah disiplin ilmu interdisipliner yang menggabungkan ilmu komputer, ilmu informasi, dan ilmu kesehatan untuk mengoptimalkan pengelolaan, penggunaan, dan pengambilan keputusan berbasis informasi kesehatan. World Health Organization (WHO) mendefinisikan e-health sebagai penggunaan teknologi informasi dan komunikasi (TIK) untuk keperluan kesehatan, yang mencakup berbagai aplikasi mulai dari rekam medis elektronik, telemedicine, hingga sistem pendukung keputusan klinis.'),
      P('Dalam konteks sistem informasi rumah sakit (Hospital Information System/HIS), integrasi data klinis lintas departemen dan lintas institusi merupakan salah satu tantangan teknis terbesar. Standar interoperabilitas seperti HL7 FHIR (Fast Healthcare Interoperability Resources), IHE (Integrating the Healthcare Enterprise), dan SNOMED CT memberikan kerangka untuk pertukaran data kesehatan yang terstandarisasi. Penelitian ini, meskipun tidak secara penuh mengimplementasikan standar FHIR pada tahap prototipe, merancang struktur data yang kompatibel dengan prinsip-prinsip interoperabilitas tersebut.'),
      P('Pengembangan sistem e-health berbasis cloud telah menunjukkan pertumbuhan eksponensial dalam dekade terakhir. Pendekatan serverless architecture, yang menghilangkan kebutuhan manajemen infrastruktur server tradisional, telah terbukti memberikan keuntungan signifikan dalam hal skalabilitas, biaya, dan kecepatan pengembangan. Firebase, platform Backend-as-a-Service (BaaS) dari Google, merupakan salah satu implementasi serverless yang paling banyak digunakan dalam pengembangan aplikasi kesehatan digital, dengan dukungan untuk autentikasi pengguna, penyimpanan data real-time, dan hosting aplikasi web.'),

      H2('2.4 Kerangka Teknologi'),
      H3('2.4.1 Next.js dan React Ecosystem'),
      P('Next.js adalah framework React untuk pengembangan aplikasi web produksi yang dikembangkan dan dikelola oleh Vercel. Versi terbaru Next.js (App Router) memperkenalkan paradigma Server Components yang memungkinkan rendering komponen di server, meningkatkan performa aplikasi secara signifikan melalui pengurangan JavaScript bundle yang dikirimkan ke klien. Next.js mendukung berbagai strategi rendering (SSR, SSG, ISR, CSR) yang dapat dipilih secara granular per-halaman atau per-komponen, memberikan fleksibilitas optimal untuk berbagai kebutuhan aplikasi. Dalam konteks sistem informasi kesehatan, kemampuan SSR Next.js memastikan bahwa data sensitif pasien tidak terekspos dalam JavaScript bundle yang dapat diakses oleh klien.'),
      H3('2.4.2 Firebase Platform'),
      P('Firebase adalah platform pengembangan aplikasi mobile dan web yang menyediakan serangkaian layanan backend terpadu. Komponen Firebase yang relevan dalam penelitian ini meliputi: (1) Firebase Authentication, layanan manajemen identitas pengguna yang mendukung berbagai metode autentikasi termasuk email/password, OAuth, dan verifikasi nomor telepon; (2) Firebase Realtime Database, basis data NoSQL berbasis cloud yang menyinkronkan data secara real-time ke semua klien yang terhubung; dan (3) Firebase Hosting, layanan hosting web yang menyediakan konten melalui CDN global dengan sertifikat SSL otomatis.'),
      H3('2.4.3 Tailwind CSS'),
      P('Tailwind CSS adalah framework CSS utilitas-pertama (utility-first) yang memungkinkan pengembangan antarmuka pengguna yang sangat kustom tanpa meninggalkan HTML. Pendekatan utility-first Tailwind terbukti meningkatkan produktivitas pengembangan dan konsistensi desain, terutama dalam konteks tim yang bekerja pada sistem desain yang kompleks seperti platform kesehatan dengan berbagai komponen UI spesifik domain.'),

      H2('2.5 Kerangka Etika dan Hukum'),
      H3('2.5.1 Regulasi Indonesia'),
      P('Kerangka hukum transplantasi organ di Indonesia diatur oleh beberapa instrumen hukum utama. Undang-Undang Nomor 36 Tahun 2009 tentang Kesehatan, Pasal 64-66, mengatur ketentuan umum transplantasi organ dan jaringan tubuh, termasuk larangan eksplisit terhadap komersialisasi organ. Peraturan Pemerintah Nomor 53 Tahun 2021 memberikan regulasi teknis yang lebih rinci mengenai prosedur, persyaratan, dan pengawasan transplantasi organ. Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE) beserta perubahannya (UU No. 19/2016) mengatur aspek keamanan data digital, yang relevan bagi sistem penyimpanan rekam medis elektronik.'),
      H3('2.5.2 Standar Internasional'),
      P('Secara internasional, Declaration of Istanbul on Organ Trafficking and Transplant Tourism (2008) menetapkan prinsip-prinsip etika global untuk donasi dan transplantasi organ, termasuk larangan organ trafficking dan komitmen terhadap self-sufficiency nasional. WHO Guiding Principles on Human Cell, Tissue and Organ Transplantation memberikan kerangka normatif yang diakui secara global. Prinsip FAIR (Findable, Accessible, Interoperable, Reusable) dalam manajemen data penelitian kesehatan juga menjadi acuan dalam perancangan struktur data platform kidneyhub.id.'),

      PAGE_BREAK(),

      // ════════════════════════════════════════════════════════
      // BAB III — METODOLOGI
      // ════════════════════════════════════════════════════════
      H1('BAB III'),
      H1('METODOLOGI PENELITIAN'),

      H2('3.1 Jenis Penelitian'),
      P('Penelitian ini menggunakan pendekatan Research and Development (R&D) dengan paradigma Design Science Research (DSR) sebagaimana dikemukakan oleh Hevner et al. (2004). DSR adalah paradigma penelitian yang bertujuan menciptakan artefak teknologi inovatif untuk memecahkan masalah organisasional atau sosial yang belum terselesaikan. Dalam konteks ini, artefak yang dihasilkan adalah platform digital kidneyhub.id beserta dokumentasi desain dan evaluasi kinerjanya. Pendekatan ini dipilih karena kemampuannya untuk secara simultan menghasilkan kontribusi teoritis (dalam bentuk pengetahuan desain) dan kontribusi praktis (dalam bentuk sistem yang dapat digunakan).'),
      P('Siklus DSR dalam penelitian ini terdiri dari tiga tahap utama: (1) Identifikasi masalah dan motivasi, yang mencakup analisis kebutuhan sistem registri ginjal nasional berdasarkan tinjauan literatur dan konsultasi dengan pemangku kepentingan; (2) Perancangan dan pengembangan artefak, yang mencakup arsitektur sistem, implementasi kode, dan desain antarmuka; dan (3) Demonstrasi dan evaluasi, yang mencakup pengujian fungsional, analisis kegunaan, dan validasi dengan pengguna akhir.'),

      H2('3.2 Metode Pengembangan Sistem: Agile Scrum'),
      P('Pengembangan platform kidneyhub.id mengikuti metodologi Agile dengan implementasi framework Scrum. Scrum dipilih atas dasar kemampuannya untuk mengakomodasi perubahan kebutuhan yang sering terjadi dalam proyek pengembangan sistem kesehatan, di mana masukan dari tenaga klinis seringkali menghasilkan revisi persyaratan yang signifikan selama proses pengembangan berlangsung.'),
      P('Dalam metodologi Scrum yang diterapkan, siklus pengembangan dibagi menjadi Sprint dua minggu. Setiap Sprint dimulai dengan Sprint Planning Meeting untuk mendefinisikan Sprint Backlog dari Product Backlog yang telah diprioritaskan. Selama Sprint berlangsung, Daily Standup dilakukan untuk koordinasi tim dan identifikasi hambatan. Setiap Sprint diakhiri dengan Sprint Review (demonstrasi produk kepada stakeholder) dan Sprint Retrospective (refleksi proses pengembangan). Peran dalam tim Scrum meliputi Product Owner (perwakilan kebutuhan klinis), Scrum Master (fasilitator proses), dan Development Team (pengembang frontend, backend, dan UI/UX).'),
      P('Product Backlog platform kidneyhub.id disusun berdasarkan user stories yang dikembangkan bersama dengan dokter spesialis nefrologi, urologi, dan forensik, serta staf rumah sakit transplantasi. User stories dikelompokkan ke dalam Epic sebagai berikut: (1) Manajemen Pengguna dan Autentikasi; (2) Registrasi dan Profil Donor; (3) Workflow Skrining Multidisiplin; (4) Penugasan dan Manajemen Rumah Sakit; (5) Input dan Tampilan Data Laboratorium; dan (6) Dashboard dan Pelaporan.'),

      H2('3.3 Desain Sistem'),
      P('Desain sistem platform kidneyhub.id mengikuti prinsip-prinsip arsitektur perangkat lunak modern, termasuk separation of concerns, single responsibility principle, dan don\'t repeat yourself (DRY). Sistem dirancang sebagai aplikasi web isomorfik (isomorphic web application) yang dapat dirender baik di sisi server maupun klien, memberikan keseimbangan optimal antara performa, SEO, dan interaktivitas.'),
      P('Komponen utama desain sistem meliputi: lapisan presentasi (presentation layer) yang diimplementasikan menggunakan Next.js dan React dengan Tailwind CSS; lapisan logika bisnis (business logic layer) yang menggunakan React hooks dan server actions untuk mengelola alur data dan aturan bisnis; lapisan data (data layer) yang menggunakan Firebase SDK untuk komunikasi dengan Firebase Realtime Database; dan lapisan autentikasi (authentication layer) yang menggunakan Firebase Authentication untuk manajemen sesi dan verifikasi identitas.'),

      H2('3.4 Alur Proses Sistem'),
      P('Alur proses utama platform kidneyhub.id dapat digambarkan sebagai berikut dalam teks yang merepresentasikan diagram alur:'),
      H3('3.4.1 Alur Pendaftaran Donor'),
      P('Proses dimulai saat individu mengakses platform dan memilih opsi pendaftaran donor. Sistem menampilkan formulir pendaftaran dua tahap: tahap pertama mencakup data akun (nama, email, password), sementara tahap kedua mencakup data pribadi dan medis dasar (usia, jenis kelamin, golongan darah, riwayat penyakit). Setelah pengiriman formulir, sistem Firebase Authentication mengirimkan email verifikasi. Pendaftaran dianggap selesai hanya setelah pengguna mengklik tautan verifikasi. Status donor secara otomatis diset sebagai "Menunggu" (pending) hingga proses skrining dijadwalkan.'),
      H3('3.4.2 Alur Skrining Medis'),
      P('Administrator menjadwalkan skrining dengan menugaskan calon donor kepada tiga dokter spesialis: SpPD-KGH (Spesialis Penyakit Dalam Konsultan Ginjal Hipertensi), Urolog, dan Dokter Forensik. Setiap dokter mengakses dashboard-nya masing-masing dan memasukkan hasil evaluasi serta catatan klinis. Sistem secara otomatis mengaggregasi hasil dari ketiga dokter. Jika ketiga dokter menyatakan donor "Eligible", status donor diperbarui menjadi "Eligible" dan proses penugasan rumah sakit dipicu. Jika salah satu dokter menyatakan "Tidak Eligible", status donor berubah menjadi "Ditolak" dengan notifikasi kepada administrator.'),
      H3('3.4.3 Alur Penugasan Rumah Sakit'),
      P('Setelah dinyatakan eligible, administrator menugaskan donor ke salah satu dari lima rumah sakit mitra berdasarkan kapasitas yang tersedia, lokasi geografis donor, dan spesialisasi rumah sakit. Staf rumah sakit yang ditugaskan menerima notifikasi dan dapat mengakses data lengkap donor melalui dashboard hospital. Staf kemudian menjadwalkan pemeriksaan komprehensif dan menginput seluruh hasil pemeriksaan, termasuk pemeriksaan fisik dan laboratorium, ke dalam sistem melalui formulir yang terstruktur.'),

      PAGE_BREAK(),

      // ════════════════════════════════════════════════════════
      // BAB IV — PERANCANGAN SISTEM
      // ════════════════════════════════════════════════════════
      H1('BAB IV'),
      H1('PERANCANGAN SISTEM'),

      H2('4.1 Arsitektur Sistem'),
      P('Platform kidneyhub.id dibangun di atas arsitektur tiga lapis yang dimodifikasi (modified three-tier architecture) yang mengintegrasikan paradigma serverless computing. Pada lapisan terdepan (frontend), aplikasi Next.js 16 dengan App Router berjalan di browser pengguna dan berinteraksi dengan Firebase services melalui Firebase Client SDK. Tidak ada lapisan middleware server tradisional; sebagai gantinya, logika backend yang tidak dapat diekspos ke klien diimplementasikan sebagai Next.js API Routes yang berjalan sebagai serverless functions. Firebase Realtime Database berfungsi sebagai lapisan persistensi data yang dapat diakses secara langsung dari klien dengan keamanan yang dijamin melalui Firebase Security Rules.'),
      H3('4.1.1 Komponen Teknologi'),
      BULLET('Frontend Framework: Next.js 16 (App Router) dengan React 18, memanfaatkan Server Components untuk rendering sisi server dan Client Components untuk interaktivitas.'),
      BULLET('Styling: Tailwind CSS dengan konfigurasi kustom untuk sistem desain medis (color palette biru-teal, tipografi aksesibel, komponen UI yang responsif).'),
      BULLET('State Management: React Context API (AuthContext) dikombinasikan dengan Firebase Realtime Database subscriptions untuk manajemen state global yang reaktif.'),
      BULLET('Backend-as-a-Service: Firebase (Google Cloud Platform) menyediakan seluruh infrastruktur backend termasuk autentikasi, basis data, dan hosting.'),
      BULLET('Database: Firebase Realtime Database, basis data NoSQL berbasis JSON yang menyinkronkan perubahan data secara real-time ke semua klien yang terhubung.'),
      BULLET('Autentikasi: Firebase Authentication dengan metode Email/Password dan verifikasi email OTP.'),
      BULLET('Deployment: Vercel (frontend dan API routes) dengan Firebase Realtime Database dan Authentication sebagai layanan cloud.'),

      H2('4.2 Struktur Website'),
      P('Antarmuka publik platform kidneyhub.id diorganisasi melalui enam halaman utama yang dapat diakses melalui navigasi (navbar) yang persisten di semua halaman:'),
      NUMBERED('Home (/): Halaman utama yang menampilkan proposisi nilai platform, statistik nasional transplantasi ginjal, langkah-langkah proses donasi, daftar rumah sakit mitra, dan call-to-action untuk pendaftaran donor.'),
      NUMBERED('Rumah Sakit (/rumah-sakit): Direktori lengkap lima rumah sakit mitra dengan informasi alamat, kontak, spesialisasi, akreditasi, dan kapasitas penanganan donor.'),
      NUMBERED('Dokter Kami (/dokter-kami): Profil tim dokter spesialis yang terlibat dalam proses skrining, dikelompokkan berdasarkan spesialisasi (SpPD-KGH, Urolog, Dokter Forensik).'),
      NUMBERED('Informasi (/informasi): Konten edukasi komprehensif mengenai transplantasi ginjal, kriteria eligibilitas donor, pemeriksaan yang diperlukan, dan FAQ.'),
      NUMBERED('Tentang Kami (/tentang-kami): Visi, misi, nilai-nilai organisasi, dan sejarah perkembangan platform.'),
      NUMBERED('Kontak Kami (/kontak-kami): Formulir kontak dan informasi kontak lengkap platform.'),

      H2('4.3 Sistem Manajemen Akses Berbasis Peran (RBAC)'),
      P('Platform mengimplementasikan empat peran pengguna dengan hak akses yang berbeda:'),
      H3('4.3.1 Administrator'),
      P('Administrator memiliki akses penuh terhadap seluruh fungsionalitas platform. Hak akses meliputi: manajemen CRUD lengkap untuk entitas donor, dokter, dan rumah sakit; pengaturan dan penjadwalan proses skrining; penugasan donor ke rumah sakit; akses terhadap semua rekam medis; dan kemampuan untuk mengubah status donor secara manual. Dashboard administrator menampilkan statistik komprehensif dalam bentuk kartu statistik dan distribusi status donor.'),
      H3('4.3.2 Dokter Spesialis'),
      P('Dokter memiliki akses terbatas pada fungsi skrining. Hak akses meliputi: melihat daftar donor yang ditugaskan untuk dievaluasi; input hasil evaluasi klinis (eligible/tidak eligible) beserta catatan dokter; menjadwalkan dan memperbarui jadwal konsultasi. Dashboard dokter menampilkan ringkasan skrining yang belum selesai dan yang sudah diselesaikan.'),
      H3('4.3.3 Staf Rumah Sakit'),
      P('Staf rumah sakit memiliki akses terhadap fungsi manajemen rekam medis. Hak akses meliputi: melihat daftar donor yang ditugaskan ke rumah sakitnya; input dan update rekam medis komprehensif termasuk pemeriksaan fisik dan hasil laboratorium; akses dashboard yang menampilkan status rekam medis dan donor yang ditangani.'),
      H3('4.3.4 Donor (Pengguna)'),
      P('Donor memiliki akses terbatas pada informasi pribadinya. Hak akses meliputi: melihat dan memperbarui profil pribadi; memantau status proses skrining; melihat hasil pemeriksaan laboratorium yang telah diinput oleh staf rumah sakit. Dashboard donor dirancang untuk memberikan transparansi penuh mengenai posisi donor dalam proses, dengan penjelasan yang mudah dipahami mengenai setiap tahapan.'),

      H2('4.4 Struktur Basis Data Firebase Realtime Database'),
      P('Basis data dirancang sebagai dokumen JSON berhirarki yang dioptimalkan untuk pola akses platform. Berikut adalah skema lengkap basis data:'),
      CODE('{'),
      CODE('  "users": {'),
      CODE('    "$uid": {'),
      CODE('      "email": "string",'),
      CODE('      "name": "string",'),
      CODE('      "role": "admin | doctor | hospital_staff | donor",'),
      CODE('      "phone": "string",'),
      CODE('      "isEmailVerified": "boolean",'),
      CODE('      "linkedId": "string (donorId / doctorId)",'),
      CODE('      "createdAt": "ISO-8601 timestamp"'),
      CODE('    }'),
      CODE('  },'),
      CODE('  "donors": {'),
      CODE('    "$donorId": {'),
      CODE('      "userId": "string",'),
      CODE('      "name": "string",'),
      CODE('      "age": "number",'),
      CODE('      "gender": "male | female",'),
      CODE('      "phone": "string",'),
      CODE('      "email": "string",'),
      CODE('      "address": "string",'),
      CODE('      "city": "string",'),
      CODE('      "bloodType": "A | B | AB | O",'),
      CODE('      "rhesus": "+ | -",'),
      CODE('      "status": "pending | screening | eligible | assigned | rejected",'),
      CODE('      "assignedHospitalId": "string",'),
      CODE('      "medicalHistory": {'),
      CODE('        "hasDiabetes": "boolean",'),
      CODE('        "hasHypertension": "boolean",'),
      CODE('        "hasKidneyDisease": "boolean",'),
      CODE('        "hasHeartDisease": "boolean",'),
      CODE('        "hasCancer": "boolean",'),
      CODE('        "hasHIV": "boolean",'),
      CODE('        "hasHepatitis": "boolean",'),
      CODE('        "currentMedications": "string",'),
      CODE('        "allergies": "string",'),
      CODE('        "previousSurgeries": "string",'),
      CODE('        "familyMedicalHistory": "string"'),
      CODE('      },'),
      CODE('      "createdAt": "ISO-8601",'),
      CODE('      "updatedAt": "ISO-8601"'),
      CODE('    }'),
      CODE('  },'),
      CODE('  "doctors": {'),
      CODE('    "$doctorId": {'),
      CODE('      "name": "string",'),
      CODE('      "specialization": "SpPD-KGH | Urologist | Forensic",'),
      CODE('      "hospital": "string",'),
      CODE('      "licenseNumber": "string",'),
      CODE('      "phone": "string",'),
      CODE('      "email": "string",'),
      CODE('      "bio": "string",'),
      CODE('      "isActive": "boolean",'),
      CODE('      "createdAt": "ISO-8601"'),
      CODE('    }'),
      CODE('  },'),
      CODE('  "hospitals": {'),
      CODE('    "$hospitalId": {'),
      CODE('      "name": "string",'),
      CODE('      "address": "string",'),
      CODE('      "city": "string",'),
      CODE('      "phone": "string",'),
      CODE('      "email": "string",'),
      CODE('      "website": "string",'),
      CODE('      "capacity": "number",'),
      CODE('      "currentLoad": "number",'),
      CODE('      "facilities": ["string"],'),
      CODE('      "isActive": "boolean",'),
      CODE('      "createdAt": "ISO-8601"'),
      CODE('    }'),
      CODE('  },'),
      CODE('  "screenings": {'),
      CODE('    "$screeningId": {'),
      CODE('      "donorId": "string",'),
      CODE('      "donorName": "string",'),
      CODE('      "doctorId": "string",'),
      CODE('      "doctorName": "string",'),
      CODE('      "doctorType": "SpPD-KGH | Urologist | Forensic",'),
      CODE('      "status": "pending | scheduled | completed",'),
      CODE('      "result": "eligible | ineligible | pending",'),
      CODE('      "notes": "string",'),
      CODE('      "scheduledAt": "ISO-8601",'),
      CODE('      "completedAt": "ISO-8601",'),
      CODE('      "createdAt": "ISO-8601"'),
      CODE('    }'),
      CODE('  },'),
      CODE('  "medicalRecords": {'),
      CODE('    "$recordId": {'),
      CODE('      "donorId": "string",'),
      CODE('      "hospitalId": "string",'),
      CODE('      "physicalExam": {'),
      CODE('        "height": "number (cm)",'),
      CODE('        "weight": "number (kg)",'),
      CODE('        "bmi": "number",'),
      CODE('        "bloodPressureSystolic": "number",'),
      CODE('        "bloodPressureDiastolic": "number",'),
      CODE('        "heartRate": "number",'),
      CODE('        "temperature": "number",'),
      CODE('        "oxygenSaturation": "number"'),
      CODE('      },'),
      CODE('      "labResults": {'),
      CODE('        "hemoglobin": "number",'),
      CODE('        "hematocrit": "number",'),
      CODE('        "leukocytes": "number",'),
      CODE('        "thrombocytes": "number",'),
      CODE('        "urea": "number",'),
      CODE('        "creatinine": "number",'),
      CODE('        "gfr": "number",'),
      CODE('        "sodium": "number", "potassium": "number",'),
      CODE('        "chloride": "number", "calcium": "number",'),
      CODE('        "hlaTyping": "string",'),
      CODE('        "bloodGroup": "string",'),
      CODE('        "crossmatch": "positive | negative | pending",'),
      CODE('        "hivStatus": "reactive | non-reactive | pending",'),
      CODE('        "hepatitisBStatus": "reactive | non-reactive | pending",'),
      CODE('        "hepatitisCStatus": "reactive | non-reactive | pending",'),
      CODE('        "genomicTesting": "string"'),
      CODE('      },'),
      CODE('      "overallResult": "fit | unfit | pending",'),
      CODE('      "conductedBy": "string",'),
      CODE('      "notes": "string",'),
      CODE('      "createdAt": "ISO-8601",'),
      CODE('      "updatedAt": "ISO-8601"'),
      CODE('    }'),
      CODE('  }'),
      CODE('}'),

      H2('4.5 Struktur Folder Proyek (Next.js App Router)'),
      P('Berikut adalah struktur folder lengkap repository kidneyhub pada platform GitHub (github.com/ervandyr2512/kidneyhub):'),
      CODE('kidneyhub/'),
      CODE('├── src/'),
      CODE('│   ├── app/'),
      CODE('│   │   ├── (auth)/'),
      CODE('│   │   │   ├── login/page.tsx'),
      CODE('│   │   │   └── register/page.tsx'),
      CODE('│   │   ├── (public)/'),
      CODE('│   │   │   ├── home/page.tsx'),
      CODE('│   │   │   ├── rumah-sakit/page.tsx'),
      CODE('│   │   │   ├── dokter-kami/page.tsx'),
      CODE('│   │   │   ├── informasi/page.tsx'),
      CODE('│   │   │   ├── tentang-kami/page.tsx'),
      CODE('│   │   │   ├── kontak-kami/page.tsx'),
      CODE('│   │   │   └── layout.tsx'),
      CODE('│   │   ├── dashboard/'),
      CODE('│   │   │   ├── admin/'),
      CODE('│   │   │   │   ├── page.tsx (overview)'),
      CODE('│   │   │   │   ├── donors/page.tsx'),
      CODE('│   │   │   │   ├── doctors/page.tsx'),
      CODE('│   │   │   │   └── hospitals/page.tsx'),
      CODE('│   │   │   ├── doctor/'),
      CODE('│   │   │   │   ├── page.tsx'),
      CODE('│   │   │   │   └── screenings/page.tsx'),
      CODE('│   │   │   ├── hospital/'),
      CODE('│   │   │   │   ├── page.tsx'),
      CODE('│   │   │   │   ├── records/page.tsx'),
      CODE('│   │   │   │   └── donors/page.tsx'),
      CODE('│   │   │   ├── donor/'),
      CODE('│   │   │   │   ├── page.tsx'),
      CODE('│   │   │   │   ├── profile/page.tsx'),
      CODE('│   │   │   │   └── records/page.tsx'),
      CODE('│   │   │   └── layout.tsx (sidebar + auth guard)'),
      CODE('│   │   ├── api/'),
      CODE('│   │   │   ├── donors/route.ts'),
      CODE('│   │   │   ├── donors/[id]/route.ts'),
      CODE('│   │   │   ├── doctors/route.ts'),
      CODE('│   │   │   ├── hospitals/route.ts'),
      CODE('│   │   │   └── medical-records/route.ts'),
      CODE('│   │   ├── layout.tsx'),
      CODE('│   │   ├── page.tsx'),
      CODE('│   │   └── globals.css'),
      CODE('│   ├── components/'),
      CODE('│   │   ├── ui/'),
      CODE('│   │   │   ├── Button.tsx'),
      CODE('│   │   │   ├── Input.tsx (+ Select + Textarea)'),
      CODE('│   │   │   ├── Card.tsx'),
      CODE('│   │   │   ├── Badge.tsx'),
      CODE('│   │   │   ├── Modal.tsx'),
      CODE('│   │   │   └── StatsCard.tsx'),
      CODE('│   │   ├── layout/'),
      CODE('│   │   │   ├── Navbar.tsx'),
      CODE('│   │   │   └── Footer.tsx'),
      CODE('│   │   └── forms/'),
      CODE('│   │       ├── DonorForm.tsx'),
      CODE('│   │       ├── DoctorForm.tsx'),
      CODE('│   │       ├── HospitalForm.tsx'),
      CODE('│   │       └── LabResultsForm.tsx'),
      CODE('│   ├── lib/'),
      CODE('│   │   ├── firebase/'),
      CODE('│   │   │   ├── config.ts'),
      CODE('│   │   │   ├── auth.ts'),
      CODE('│   │   │   ├── database.ts'),
      CODE('│   │   │   └── admin.ts'),
      CODE('│   │   └── utils/cn.ts'),
      CODE('│   ├── contexts/AuthContext.tsx'),
      CODE('│   └── types/index.ts'),
      CODE('├── .env.local'),
      CODE('├── .env.local.example'),
      CODE('├── database.rules.json'),
      CODE('├── firebase.json'),
      CODE('├── vercel.json'),
      CODE('└── next.config.ts'),

      H2('4.6 Keamanan Data dan Privasi'),
      H3('4.6.1 Firebase Security Rules'),
      P('Seluruh akses ke Firebase Realtime Database dikontrol melalui Firebase Security Rules yang didefinisikan dalam file database.rules.json. Rules ini menerapkan prinsip least privilege, di mana setiap pengguna hanya dapat mengakses data yang secara eksplisit diizinkan. Sebagai contoh, data pengguna (users/$uid) hanya dapat dibaca dan ditulis oleh pengguna dengan UID yang sesuai. Data donor, dokter, rumah sakit, skrining, dan rekam medis hanya dapat diakses oleh pengguna yang telah terautentikasi, dengan pembatasan lebih lanjut yang dapat diimplementasikan berdasarkan atribut peran.'),
      H3('4.6.2 Enkripsi Data'),
      P('Seluruh komunikasi antara klien dan Firebase dilindungi oleh enkripsi TLS/SSL yang disediakan secara otomatis oleh infrastruktur Google Cloud Platform. Data yang disimpan di Firebase Realtime Database dienkripsi saat diam (encryption at rest) menggunakan AES-256. Token autentikasi JWT yang digunakan oleh Firebase Authentication memiliki masa berlaku terbatas dan divalidasi secara kriptografis pada setiap permintaan.'),
      H3('4.6.3 Audit Trail'),
      P('Setiap rekaman dalam basis data dilengkapi dengan timestamp createdAt dan updatedAt yang diset secara otomatis oleh sistem. Untuk perubahan status donor yang kritis (misalnya perubahan dari "screening" ke "eligible" atau "rejected"), sistem mencatat identitas pengguna yang melakukan perubahan beserta waktu perubahan. Mekanisme ini memenuhi persyaratan audit trail minimum yang diperlukan untuk data medis.'),
      H3('4.6.4 Persetujuan Informed Consent'),
      P('Formulir pendaftaran donor menyertakan halaman persetujuan (consent) yang secara eksplisit menjelaskan tujuan pengumpulan data, pihak-pihak yang akan memiliki akses terhadap data, periode retensi data, dan hak-hak donor terkait datanya. Persetujuan ini merupakan prasyarat wajib untuk menyelesaikan proses pendaftaran, sesuai dengan ketentuan Undang-Undang Kesehatan dan prinsip-prinsip etika penelitian kesehatan.'),

      H2('4.7 Implementasi CRUD'),
      P('Sistem mengimplementasikan operasi Create, Read, Update, dan Delete (CRUD) yang lengkap untuk semua entitas utama. Implementasi CRUD dibangun di atas lapisan abstraksi database.ts yang menyediakan fungsi generik reusable:'),
      BULLET('createRecord<T>(path, data): Membuat rekaman baru dengan ID yang di-generate otomatis oleh Firebase push() dan menambahkan timestamp createdAt.'),
      BULLET('getRecord<T>(path, id): Mengambil satu rekaman berdasarkan ID.'),
      BULLET('getAllRecords<T>(path): Mengambil seluruh rekaman dalam sebuah koleksi.'),
      BULLET('updateRecord<T>(path, id, data): Memperbarui rekaman secara parsial (patch) dan menambahkan timestamp updatedAt.'),
      BULLET('deleteRecord(path, id): Menghapus rekaman berdasarkan ID.'),
      BULLET('subscribeToPath<T>(path, callback): Berlangganan pembaruan real-time menggunakan Firebase onValue listener.'),
      P('Di atas lapisan generik ini, dibangun wrapper spesifik domain (donorDb, doctorDb, hospitalDb, screeningDb, medicalRecordDb) yang menyediakan API yang lebih semantik dan type-safe menggunakan TypeScript generics.'),

      PAGE_BREAK(),

      // ════════════════════════════════════════════════════════
      // BAB V — KEAMANAN & ETIKA
      // ════════════════════════════════════════════════════════
      H1('BAB V'),
      H1('KEAMANAN, ETIKA, DAN ANALISIS STRATEGIS'),

      H2('5.1 Kerangka Keamanan Sistem'),
      P('Keamanan platform kidneyhub.id dirancang secara berlapis (defense in depth) untuk melindungi data medis sensitif dari ancaman internal maupun eksternal. Lapisan pertama keamanan adalah autentikasi yang kuat melalui Firebase Authentication. Sistem memastikan bahwa hanya pengguna dengan email terverifikasi yang dapat mengakses fitur-fitur sensitif platform. Verifikasi email berfungsi sebagai faktor autentikasi tambahan yang mencegah pembuatan akun dengan email fiktif.'),
      P('Lapisan kedua adalah otorisasi berbasis peran yang ketat. Setiap halaman dashboard dan setiap operasi API dilindungi oleh pemeriksaan otorisasi yang memverifikasi bahwa pengguna yang melakukan permintaan memiliki peran yang sesuai. Middleware autentikasi di dashboard layout mencegah akses tanpa autentikasi melalui redirect otomatis ke halaman login.'),
      P('Lapisan ketiga adalah Firebase Security Rules yang memberlakukan kebijakan akses data di tingkat database. Rules ini dieksekusi di sisi server Firebase, sehingga tidak dapat di-bypass melalui manipulasi kode klien.'),

      H2('5.2 Kepatuhan Regulasi Perlindungan Data'),
      P('Indonesia telah mengesahkan Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP), yang mulai berlaku efektif pada Oktober 2024. UU PDP mewajibkan setiap penyelenggara sistem elektronik yang memproses data pribadi untuk memenuhi sejumlah kewajiban, termasuk: memperoleh persetujuan eksplisit dari subjek data sebelum pengumpulan; menyediakan akses bagi subjek data untuk melihat, memperbaiki, dan menghapus datanya; mengimplementasikan langkah-langkah teknis dan organisasional yang memadai untuk melindungi data; dan melaporkan insiden kebocoran data dalam jangka waktu yang ditentukan.'),
      P('Platform kidneyhub.id dirancang untuk memenuhi persyaratan UU PDP ini melalui: sistem persetujuan yang terintegrasi dalam alur pendaftaran; fitur self-service bagi donor untuk melihat dan memperbarui datanya sendiri; enkripsi data in-transit dan at-rest; dan prosedur respons insiden yang terdokumentasi.'),

      H2('5.3 Analisis SWOT Platform kidneyhub.id'),
      H3('5.3.1 Kekuatan (Strengths)'),
      BULLET('Arsitektur serverless berbasis Firebase menghilangkan kebutuhan infrastruktur server yang mahal dan kompleks.'),
      BULLET('Sistem real-time Firebase memungkinkan sinkronisasi data instan antar pengguna yang berbeda lokasi.'),
      BULLET('Pendekatan mobile-first dengan Tailwind CSS memastikan aksesibilitas dari berbagai perangkat.'),
      BULLET('Role-based access control yang granular memastikan keamanan data sesuai dengan kebutuhan masing-masing pemangku kepentingan.'),
      BULLET('Alur kerja skrining multidisiplin yang terstruktur mengurangi risiko kesalahan klinis akibat informasi yang tidak lengkap.'),
      H3('5.3.2 Kelemahan (Weaknesses)'),
      BULLET('Ketergantungan pada infrastruktur Google Cloud Platform menimbulkan risiko vendor lock-in.'),
      BULLET('Model NoSQL Firebase Realtime Database kurang optimal untuk query kompleks yang melibatkan joins antar tabel.'),
      BULLET('Belum terimplementasinya standar interoperabilitas HL7 FHIR pada tahap prototipe membatasi integrasi dengan sistem HIS yang sudah ada.'),
      BULLET('Keterbatasan mekanisme offline support untuk kondisi koneksi internet yang tidak stabil.'),
      H3('5.3.3 Peluang (Opportunities)'),
      BULLET('Momentum kebijakan: Peraturan Pemerintah No. 53/2021 tentang Transplantasi Organ menciptakan kebutuhan mendesak akan infrastruktur digital pendukung.'),
      BULLET('Penetrasi internet yang meningkat pesat di Indonesia (terutama di perkotaan) mendukung adopsi platform digital.'),
      BULLET('Potensi integrasi dengan Sistem Informasi Rumah Sakit (SIMRS) dan platform BPJS Kesehatan untuk memperluas jangkauan.'),
      BULLET('Kemungkinan perluasan ke registri organ lain (hati, jantung, kornea) menggunakan arsitektur yang sama.'),
      H3('5.3.4 Ancaman (Threats)'),
      BULLET('Resistensi adopsi dari tenaga kesehatan yang terbiasa dengan sistem manual atau sistem legacy.'),
      BULLET('Risiko keamanan siber yang meningkat seiring dengan semakin berharganya data kesehatan di pasar gelap.'),
      BULLET('Kompleksitas regulasi perlindungan data yang terus berkembang memerlukan adaptasi sistem yang berkelanjutan.'),
      BULLET('Tantangan kepercayaan masyarakat terhadap keamanan data medis yang disimpan di platform digital.'),

      H2('5.4 Pengembangan Masa Depan'),
      P('Platform kidneyhub.id dirancang dengan arsitektur yang memungkinkan pengembangan berkelanjutan menuju sistem yang lebih canggih. Beberapa arah pengembangan yang diidentifikasi antara lain:'),
      H3('5.4.1 Kecerdasan Buatan untuk Pencocokan Donor-Resipien'),
      P('Tahap pengembangan selanjutnya mencakup implementasi algoritma machine learning untuk mengoptimalkan proses pencocokan donor-resipien. Model prediktif dapat dilatih menggunakan data historis transplantasi untuk memprediksi kompatibilitas berdasarkan parameter HLA, usia, kondisi kesehatan donor dan resipien, serta faktor geografis. Pendekatan ini berpotensi secara signifikan meningkatkan angka keberhasilan transplantasi jangka panjang.'),
      H3('5.4.2 Integrasi HL7 FHIR'),
      P('Integrasi dengan standar HL7 FHIR akan memungkinkan pertukaran data seamless dengan sistem HIS berbasis FHIR yang diadopsi oleh rumah sakit-rumah sakit di Indonesia. Kementerian Kesehatan RI telah mewajibkan penggunaan FHIR dalam Rekam Medis Elektronik melalui PMK No. 24/2022, sehingga integrasi ini akan menjadi kebutuhan kritis untuk adopsi skala nasional.'),
      H3('5.4.3 Notifikasi Real-Time'),
      P('Implementasi Firebase Cloud Messaging (FCM) untuk notifikasi push akan memungkinkan pemberitahuan real-time kepada semua pemangku kepentingan saat terjadi perubahan status yang relevan, seperti hasil skrining yang tersedia, penugasan rumah sakit baru, atau hasil laboratorium yang siap.'),
      H3('5.4.4 Analitik dan Business Intelligence'),
      P('Pengembangan modul analitik terintegrasi akan memungkinkan administrator dan pembuat kebijakan untuk menganalisis tren data transplantasi secara real-time, mengidentifikasi bottleneck dalam alur proses, dan menghasilkan laporan untuk keperluan regulasi dan penelitian.'),
      H3('5.4.5 Perluasan ke Organ Lain'),
      P('Arsitektur modular platform memungkinkan perluasan yang relatif mudah untuk mencakup registri organ lain, seperti hati, jantung, paru-paru, dan kornea, sehingga kidneyhub.id dapat berkembang menjadi platform registri organ komprehensif Indonesia.'),

      PAGE_BREAK(),

      // ════════════════════════════════════════════════════════
      // BAB VI — PENUTUP
      // ════════════════════════════════════════════════════════
      H1('BAB VI'),
      H1('PENUTUP'),

      H2('6.1 Kesimpulan'),
      P('Penelitian ini telah berhasil merancang dan mengimplementasikan platform digital kidneyhub.id sebagai sistem registri donor ginjal nasional berbasis web untuk Indonesia. Hasil penelitian menunjukkan bahwa pendekatan teknologi modern berbasis Next.js, Firebase, dan Tailwind CSS mampu menghadirkan solusi yang komprehensif, skalabel, dan dapat dipercaya untuk mengatasi permasalahan fragmentasi data dan inefisiensi yang selama ini menghambat perkembangan program transplantasi ginjal nasional.'),
      P('Platform yang dikembangkan berhasil mengintegrasikan seluruh alur kerja kritis dalam ekosistem transplantasi ginjal: dari pendaftaran donor online dengan verifikasi email OTP, skrining multidisiplin oleh tiga dokter spesialis, hingga input dan manajemen rekam medis laboratorium yang komprehensif. Sistem RBAC yang diimplementasikan memastikan bahwa setiap pemangku kepentingan memiliki akses yang tepat sesuai dengan perannya, menjaga keamanan dan privasi data medis yang sensitif.'),
      P('Dari perspektif arsitektur, pemilihan Firebase sebagai Backend-as-a-Service terbukti tepat untuk konteks ini, menyediakan infrastruktur yang andal, skalabel, dan aman tanpa memerlukan manajemen server yang kompleks. Kemampuan real-time Firebase memungkinkan kolaborasi yang mulus antar pengguna dari berbagai institusi yang berbeda, yang merupakan kebutuhan mendasar dalam ekosistem transplantasi organ yang melibatkan banyak pemangku kepentingan.'),

      H2('6.2 Rekomendasi'),
      NUMBERED('Pengujian Klinis: Penelitian selanjutnya perlu melakukan uji kegunaan (usability testing) dengan melibatkan pengguna nyata dari kelima rumah sakit mitra untuk mengidentifikasi area perbaikan antarmuka dan alur kerja.'),
      NUMBERED('Integrasi Nasional: Diperlukan koordinasi dengan Kementerian Kesehatan RI untuk mengintegrasikan platform dengan infrastruktur data kesehatan nasional, termasuk SATU SEHAT.'),
      NUMBERED('Keamanan Lanjutan: Implementasi multi-factor authentication (MFA) dan penetration testing berkala direkomendasikan sebelum peluncuran skala penuh.'),
      NUMBERED('Standarisasi Data: Adopsi terminologi medis standar (SNOMED CT, LOINC) untuk kode diagnosis dan pemeriksaan laboratorium akan meningkatkan interoperabilitas dengan sistem lain.'),
      NUMBERED('Model Keberlanjutan: Perlu dikembangkan model keberlanjutan (sustainability model) yang mencakup pembiayaan operasional jangka panjang, yang dapat melibatkan dukungan pemerintah, rumah sakit mitra, atau model layanan berlangganan.'),

      SPACE(),
      DIVIDER(),

      // ── DAFTAR PUSTAKA ─────────────────────────────────────
      H1('DAFTAR PUSTAKA'),
      P('Bikbov, B., Purcell, C. A., Levey, A. S., Smith, M., Abdoli, A., Abebe, M., ... & Perico, N. (2020). Global, regional, and national burden of chronic kidney disease, 1990-2017: a systematic analysis for the Global Burden of Disease Study 2017. The Lancet, 395(10225), 709-733.', { indent: false }),
      SPACE(),
      P('Declaration of Istanbul Custodian Group. (2018). The Declaration of Istanbul on Organ Trafficking and Transplant Tourism. Transplantation, 102(9), 1434-1437.', { indent: false }),
      SPACE(),
      P('Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. MIS Quarterly, 28(1), 75-105.', { indent: false }),
      SPACE(),
      P('Indonesian Renal Registry (IRR). (2022). 15th Report of Indonesian Renal Registry. Perhimpunan Nefrologi Indonesia (PERNEFRI).', { indent: false }),
      SPACE(),
      P('Kementerian Kesehatan Republik Indonesia. (2021). Peraturan Pemerintah Republik Indonesia Nomor 53 Tahun 2021 tentang Transplantasi Organ dan Jaringan Tubuh. Sekretariat Negara RI.', { indent: false }),
      SPACE(),
      P('Kementerian Kesehatan Republik Indonesia. (2022). Peraturan Menteri Kesehatan Nomor 24 Tahun 2022 tentang Rekam Medis. Kemenkes RI.', { indent: false }),
      SPACE(),
      P('Port, F. K., Wolfe, R. A., Mauger, E. A., Berling, D. P., & Jiang, K. (2003). Comparison of survival probabilities for dialysis patients vs cadaveric renal transplant recipients. JAMA, 270(11), 1339-1343.', { indent: false }),
      SPACE(),
      P('Vercel Inc. (2023). Next.js Documentation. Next.js by Vercel — The React Framework. Diakses dari: https://nextjs.org/docs', { indent: false }),
      SPACE(),
      P('World Health Organization. (2010). WHO guiding principles on human cell, tissue and organ transplantation. Transplantation, 90(3), 229-233.', { indent: false }),
      SPACE(),
      P('Wolfe, R. A., Ashby, V. B., Milford, E. L., Ojo, A. O., Ettenger, R. E., Agodoa, L. Y., ... & Port, F. K. (1999). Comparison of mortality in all patients on dialysis, patients on dialysis awaiting transplantation, and recipients of a first cadaveric transplant. New England Journal of Medicine, 341(23), 1725-1730.', { indent: false }),

    ],
  }],
});

// ── Write file ────────────────────────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('proposal-kidneyhub.docx', buffer);
  console.log('Proposal berhasil dibuat: proposal-kidneyhub.docx');
});
