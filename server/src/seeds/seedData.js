const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const { isInMemory, getMemoryStore } = require('../config/db');
const { chunkDocumentPages } = require('../pipeline/chunker');
const { embedBatch } = require('../pipeline/embedder');
const { insertChunkVector, deleteVectorsByDocId } = require('../services/vectorDbService');

const SAMPLE_DOCUMENTS = [
  {
    title: 'Admissions & Enrollment Handbook 2025-2026',
    fileName: 'Admissions_Guide_2025.txt',
    category: 'Admissions',
    department: 'Admissions Office',
    content: `# APEX UNIVERSITY OF TECHNOLOGY & SCIENCE
## OFFICIAL ADMISSIONS & ENROLLMENT HANDBOOK 2025-2026

### 1. General Eligibility Criteria
All prospective undergraduate candidates must have completed their higher secondary education (10+2 / Grade 12) with a minimum aggregate of 70% in Mathematics, Physics, and Chemistry (or Computer Science). Postgraduate candidates must possess a relevant Bachelor of Engineering / Technology degree with a minimum CGPA of 6.75 or 65% marks from an accredited university.

### 2. Application Process and Deadlines
- Phase 1 Application Opens: January 15, 2025
- Phase 1 Application Deadline: April 30, 2025
- Apex Engineering Entrance Exam (AEEE): May 18-20, 2025
- Seat Allocation & First Merit List: June 5, 2025
- Orientation and Document Verification: August 1, 2025
- Regular Classes Commence: August 10, 2025

The non-refundable application processing fee is $75 (or ₹1,500 for domestic applicants) payable through the official online portal.

### 3. Required Verification Documents
Candidates reporting for physical verification must present original copies of:
1. Grade 10 & Grade 12 Marksheets and Passing Certificates
2. Transfer Certificate (TC) and Migration Certificate
3. National Identity Card / Passport / Aadhar Card
4. Valid Category / Reserved Quota Certificate (if applicable)
5. Medical Fitness Certificate from a certified medical practitioner
6. Six passport-sized color photographs against a white background

### 4. Lateral Entry Admissions
Diploma holders in Engineering branches with at least 65% aggregate are eligible for direct admission to the 2nd Year (3rd Semester) under the Lateral Entry Scheme. The entrance exam for lateral candidates takes place on June 15, 2025.`
  },
  {
    title: 'Fee Structure and Scholarship Regulations 2025',
    fileName: 'Fee_Structure_and_Scholarships_2025.txt',
    category: 'Fees',
    department: 'Finance & Accounts',
    content: `# APEX UNIVERSITY OF TECHNOLOGY
## OFFICIAL TUITION FEES, LEVIES AND SCHOLARSHIPS (ACADEMIC YEAR 2025-2026)

### 1. Undergraduate Tuition Fee Structure
- Computer Science & AI: $4,200 per semester (₹1,40,000)
- Electronics & Communication: $3,800 per semester (₹1,25,000)
- Mechanical & Civil Engineering: $3,500 per semester (₹1,15,000)
- Biotechnology & Data Science: $3,900 per semester (₹1,30,000)

Additional Annual Charges:
- Library & Digital Resources Access: $250 / year
- Laboratory & Cloud Computing Consumables: $400 / year
- Student Welfare & Sports Activity Fund: $150 / year
- Refundable Security Deposit: $500 (one-time on admission)

### 2. Fee Payment Schedules & Late Penalties
Semester fees must be cleared within 14 calendar days of semester commencement.
- Fall Semester Deadline: August 25, 2025
- Spring Semester Deadline: January 20, 2026
Late payments incur a penalty of $15 per day up to 10 days, after which registration may be suspended.

### 3. Institutional Scholarships
1. **Presidential Merit Scholarship**: 50% tuition waiver for students maintaining a CGPA of 9.2 or higher.
2. **Dean's Honor Scholarship**: 25% tuition waiver for students ranking in the top 5% of their class.
3. **Sports Excellence Award**: 100% hostel and 40% tuition fee waiver for national/state level athletes.
4. **Need-Based Financial Assistance**: Up to 60% fee subsidy for students with annual household income under $8,000 / ₹4,00,000.`
  },
  {
    title: 'Hostel Code of Conduct and Mess Timings Handbook',
    fileName: 'Hostel_Rules_and_Mess_Timings.txt',
    category: 'Hostel',
    department: 'Student Affairs & Housing',
    content: `# RESIDENTIAL SERVICES & HOSTEL REGULATIONS 2025

### 1. Accommodation Options and Fees
- Single AC Room: $2,200 per semester (including utilities)
- Double Sharing AC Room: $1,800 per semester
- Triple Sharing Non-AC Room: $1,200 per semester
All options include 24/7 high-speed Wi-Fi, laundry facilities (up to 40 loads per semester), and biometric access security.

### 2. Curfew and Biometric Entry Timings
All resident students must return to the hostel premises by 10:00 PM on weekdays and 10:30 PM on weekends. Night-out permissions must be applied through the student ERP at least 24 hours in advance with verified parent/guardian consent.

### 3. Central Dining Hall (Mess) Timings
- Breakfast: 07:30 AM to 09:00 AM (Weekdays) | 08:00 AM to 09:30 AM (Weekends)
- Lunch: 12:30 PM to 02:00 PM
- Evening Snacks & Tea: 05:00 PM to 06:15 PM
- Dinner: 07:30 PM to 09:30 PM

Dietary menus rotate weekly and cater to vegetarian, non-vegetarian, and vegan preferences with strict hygiene audits conducted bi-weekly.

### 4. General Residence Rules
- Possession of prohibited substances or alcoholic beverages results in immediate expulsion.
- Electric heating appliances (heaters, induction stoves) are strictly prohibited in dorm rooms.
- Quiet hours are observed from 11:00 PM to 06:00 AM daily.`
  },
  {
    title: 'Academic Regulations, Grading System and Examination Manual',
    fileName: 'Exam_Regulations_and_Grading_Policy.txt',
    category: 'Exams',
    department: 'Office of the Controller of Examinations',
    content: `# ACADEMIC & EXAMINATION GUIDELINES

### 1. Mandatory Attendance Policy
Students must maintain a minimum attendance of 75% in each registered course to be eligible for the End-Semester Examination. Students with attendance between 65% and 74% due to verified medical emergencies may be permitted upon recommendation of the Dean of Academic Affairs with appropriate medical certificates.

### 2. Evaluation Schema & Grade Points
Total marks per course are distributed across Continuous Internal Assessment (50%) and End-Semester Examination (50%):
- Mid-Term Examination: 25%
- Quizzes, Assignments, and Mini-Projects: 20%
- Class Participation & Attendance: 5%
- End-Semester Written / Lab Exam: 50%

10-Point Grading Scale:
- Grade O (Outstanding): 90-100% -> Grade Point 10.0
- Grade A+ (Excellent): 80-89% -> Grade Point 9.0
- Grade A (Very Good): 70-79% -> Grade Point 8.0
- Grade B+ (Good): 60-69% -> Grade Point 7.0
- Grade B (Above Average): 50-59% -> Grade Point 6.0
- Grade C (Average): 45-49% -> Grade Point 5.0
- Grade P (Pass): 40-44% -> Grade Point 4.0
- Grade F (Fail): Below 40% -> Grade Point 0.0

### 3. Re-Evaluation and Supplementary Examinations
Students dissatisfied with their grades may apply for answer-sheet photocopy and re-evaluation within 14 calendar days of result publication by paying a fee of $20 / ₹500 per subject. Supplementary exams are held during the winter break for students with arrear subjects.`
  },
  {
    title: 'Campus Placements and Career Development Report 2025',
    fileName: 'Placement_Brochure_2025.txt',
    category: 'Placements',
    department: 'Career Development Centre (CDC)',
    content: `# APEX CAREER DEVELOPMENT & PLACEMENTS OVERVIEW 2025

### 1. Placement Statistics Highlights
- Total Companies Visited: 185+
- Total Job Offers Extended: 940+
- Placement Conversion Rate: 96.8%
- Highest International Package: $145,000 / annum (Google Cloud, Zurich)
- Highest Domestic Package: ₹52.0 LPA (Atlassian)
- Average Campus Package: ₹18.5 LPA ($92,000 / annum for global postings)
- Median Package: ₹14.2 LPA

### 2. Prominent Recruiting Partners
Technology & AI: Microsoft, Google, Amazon, NVIDIA, Oracle, Adobe, Cisco, Qualcomm.
Consulting & Finance: Goldman Sachs, Morgan Stanley, McKinsey, Deloitte, Boston Consulting Group.
Core Engineering: Bosch, Texas Instruments, Larsen & Toubro, Tata Motors, Siemens.

### 3. Internship Policy
All 3rd-year undergraduate students are required to undertake a mandatory 8-to-12 week summer internship at an approved industrial organization or research laboratory. The CDC provides pre-placement training including mock technical interviews, resume building, and competitive programming bootcamps.`
  }
];

const seedDatabase = async () => {
  console.log('[Seeder] Starting knowledge base and user account initialization...');

  // 1. Seed Users (Admin & Student)
  const salt = await bcrypt.genSalt(12);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const studentPasswordHash = await bcrypt.hash('Student@123', salt);

  let adminUserId;
  let studentUserId;

  if (isInMemory()) {
    const memoryStore = getMemoryStore();
    
    // Clear old sample seeds
    memoryStore.users.clear();
    memoryStore.documents.clear();
    memoryStore.chunks.clear();
    deleteVectorsByDocId('all');

    adminUserId = 'user_admin_001';
    studentUserId = 'user_student_001';

    memoryStore.users.set(adminUserId, {
      _id: adminUserId,
      id: adminUserId,
      name: 'Dr. Sarah Mitchell (Administrator)',
      email: 'admin@college.edu',
      password: adminPasswordHash,
      role: 'admin',
      department: 'Admissions & Academic Affairs',
      createdAt: new Date(),
    });

    memoryStore.users.set(studentUserId, {
      _id: studentUserId,
      id: studentUserId,
      name: 'Alex Vance (Student)',
      email: 'student@college.edu',
      password: studentPasswordHash,
      role: 'student',
      department: 'Computer Science',
      createdAt: new Date(),
    });
  } else {
    await User.deleteMany({ email: { $in: ['admin@college.edu', 'student@college.edu'] } });

    const adminUser = await User.create({
      name: 'Dr. Sarah Mitchell (Administrator)',
      email: 'admin@college.edu',
      password: 'Admin@123',
      role: 'admin',
      department: 'Admissions & Academic Affairs',
    });
    adminUserId = adminUser._id;

    const studentUser = await User.create({
      name: 'Alex Vance (Student)',
      email: 'student@college.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science',
    });
    studentUserId = studentUser._id;
  }

  // 2. Seed Official Documents & Chunks
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  let totalSeededChunks = 0;

  for (const docData of SAMPLE_DOCUMENTS) {
    const filePath = path.join(uploadsDir, docData.fileName);
    fs.writeFileSync(filePath, docData.content, 'utf8');

    let docId = uuidv4();
    const syntheticPages = docData.content.split('###').map((sec, idx) => ({
      pageNumber: idx + 1,
      text: (idx > 0 ? '###' : '') + sec.trim(),
    })).filter(p => p.text.length > 0);

    const chunks = chunkDocumentPages(syntheticPages, {
      docId,
      fileName: docData.fileName,
      category: docData.category,
      department: docData.department,
    });

    const chunkTexts = chunks.map(c => c.content);
    const embeddings = await embedBatch(chunkTexts);

    if (isInMemory()) {
      const memoryStore = getMemoryStore();
      const docObj = {
        _id: docId,
        id: docId,
        title: docData.title,
        fileName: docData.fileName,
        fileUrl: `/uploads/${docData.fileName}`,
        filePath,
        fileType: 'txt',
        category: docData.category,
        department: docData.department,
        uploadedBy: adminUserId,
        chunkCount: chunks.length,
        version: 1,
        status: 'indexed',
        ocrApplied: false,
        fileSize: docData.content.length,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.documents.set(docId, docObj);

      for (let i = 0; i < chunks.length; i++) {
        const chunkId = uuidv4();
        const chunkObj = {
          _id: chunkId,
          id: chunkId,
          docId,
          content: chunks[i].content,
          pageNumber: chunks[i].pageNumber,
          chunkIndex: chunks[i].chunkIndex,
          vectorId: chunkId,
          embedding: embeddings[i],
          metadata: chunks[i].metadata,
        };
        memoryStore.chunks.set(chunkId, chunkObj);
        await insertChunkVector(chunkId, docId, chunkObj.content, chunkObj.pageNumber, chunkObj.embedding, chunkObj.metadata);
      }
    } else {
      await Document.deleteMany({ fileName: docData.fileName });

      const createdDoc = await Document.create({
        title: docData.title,
        fileName: docData.fileName,
        fileUrl: `/uploads/${docData.fileName}`,
        fileType: 'txt',
        category: docData.category,
        department: docData.department,
        uploadedBy: adminUserId,
        chunkCount: chunks.length,
        status: 'indexed',
        fileSize: docData.content.length,
      });
      docId = createdDoc._id.toString();

      await DocumentChunk.deleteMany({ docId: createdDoc._id });
      const chunkDocs = chunks.map((c, i) => ({
        docId: createdDoc._id,
        content: c.content,
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        vectorId: `${createdDoc._id}_${c.chunkIndex}`,
        embedding: embeddings[i],
        metadata: c.metadata,
      }));

      const savedChunks = await DocumentChunk.insertMany(chunkDocs);
      for (const saved of savedChunks) {
        await insertChunkVector(
          saved._id.toString(),
          docId,
          saved.content,
          saved.pageNumber,
          saved.embedding,
          saved.metadata
        );
      }
    }

    totalSeededChunks += chunks.length;
  }

  console.log(`[Seeder] Seed complete: ${SAMPLE_DOCUMENTS.length} official documents & ${totalSeededChunks} chunks indexed into Vector Store.`);
  return {
    documentsSeeded: SAMPLE_DOCUMENTS.length,
    chunksIndexed: totalSeededChunks,
    credentials: [
      { role: 'Admin', email: 'admin@college.edu', password: 'Admin@123' },
      { role: 'Student', email: 'student@college.edu', password: 'Student@123' },
    ],
  };
};

// Execute if run directly via npm run seed
if (require.main === module) {
  const { connectDB } = require('../config/db');
  connectDB().then(() => seedDatabase()).then(() => {
    console.log('[Seeder] Standalone seed run completed.');
    process.exit(0);
  }).catch((err) => {
    console.error('[Seeder] Error seeding standalone:', err);
    process.exit(1);
  });
}

module.exports = {
  seedDatabase,
  SAMPLE_DOCUMENTS,
};
