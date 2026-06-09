require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Trainer = require('../models/Trainer');
const Job = require('../models/Job');
const Application = require('../models/Application');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_db');
  console.log('MongoDB Connected for seeding...');
};

const seed = async () => {
  await connectDB();
  
  await Promise.all([
    User.deleteMany({}), Student.deleteMany({}),
    Company.deleteMany({}), Trainer.deleteMany({}),
    Job.deleteMany({}), Application.deleteMany({})
  ]);
  console.log('Cleared existing data...');
  
  // ── Admin ──
  const adminUser = await User.create({
    email: 'admin.placetrack@gmail.com',
    password: 'Admin@1234',
    role: 'admin',
    isApproved: true
  });
  console.log('Admin created: admin.placetrack@gmail.com / Admin@1234');
  
  // ── Trainer ──
  const trainerUser = await User.create({
    email: 'rajesh.kumar.trainer@gmail.com',
    password: 'Trainer@1234',
    role: 'trainer',
    isApproved: true
  });
  const trainer = await Trainer.create({
    user: trainerUser._id,
    firstName: 'Rajesh',
    lastName: 'Kumar',
    phone: '9876543210',
    specialization: ['Full Stack Development', 'Data Structures', 'Interview Preparation'],
    designation: 'Senior Trainer',
    bio: 'Experienced software trainer with 8 years of industry experience.',
    experience: 8
  });
  console.log('Trainer created: rajesh.kumar.trainer@gmail.com / Trainer@1234');
  
  // ── Companies ──
  const companyData = [
    { name: 'TechCorp Solutions', sector: 'IT', hr: 'Priya Sharma', email: 'hr.techcorp.solutions@gmail.com' },
    { name: 'InnovateSoft Pvt Ltd', sector: 'IT', hr: 'Rahul Verma', email: 'hr.innovatesoft@gmail.com' },
    { name: 'DataDriven Analytics', sector: 'IT', hr: 'Ananya Singh', email: 'hr.datadriven.analytics@gmail.com' }
  ];
  
  const companies = [];
  for (const cd of companyData) {
    const cu = await User.create({ email: cd.email, password: 'Company@1234', role: 'company', isApproved: true });
    const c = await Company.create({
      user: cu._id, companyName: cd.name, sector: cd.sector,
      hrName: cd.hr, hrEmail: cd.email, isVerified: true,
      verifiedBy: adminUser._id, verifiedAt: new Date(),
      website: `https://www.${cd.name.toLowerCase().replace(/\s+/g, '')}.com`,
      headquarters: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      description: `${cd.name} is a leading technology company focused on innovative solutions.`
    });
    companies.push(c);
  }
  console.log('Companies created with Gmail addresses');
  
  // ── Students ──
  const studentData = [
    { first: 'Amit',   last: 'Kumar',   branch: 'CSE',  cgpa: 8.5, skills: ['JavaScript','React','Node.js','MongoDB'] },
    { first: 'Priya',  last: 'Sharma',  branch: 'IT',   cgpa: 7.8, skills: ['Python','Django','PostgreSQL','Docker'] },
    { first: 'Rohit',  last: 'Singh',   branch: 'CSE',  cgpa: 9.1, skills: ['Java','Spring Boot','MySQL','REST APIs'] },
    { first: 'Sneha',  last: 'Patel',   branch: 'AIDS', cgpa: 8.2, skills: ['Python','Machine Learning','TensorFlow','SQL'] },
    { first: 'Vikas',  last: 'Gupta',   branch: 'AIML', cgpa: 7.5, skills: ['React','TypeScript','GraphQL','AWS'] },
    { first: 'Ananya', last: 'Verma',   branch: 'IT',   cgpa: 8.9, skills: ['C++','DSA','Competitive Programming','Java'] },
    { first: 'Raj',    last: 'Joshi',   branch: 'CSE',  cgpa: 7.2, skills: ['HTML','CSS','JavaScript','Bootstrap'] },
    { first: 'Pooja',  last: 'Mehta',   branch: 'ECE',  cgpa: 6.8, skills: ['Embedded C','Arduino','IoT','Python'] },
    { first: 'Karan',  last: 'Rao',     branch: 'AIDS', cgpa: 8.6, skills: ['Data Analysis','Pandas','NumPy','Power BI'] },
    { first: 'Deepa',  last: 'Nair',    branch: 'CSE',  cgpa: 7.9, skills: ['Angular','Java','Spring','Hibernate'] }
  ];

  const students = [];
  for (let i = 0; i < studentData.length; i++) {
    const sd = studentData[i];
    const email = `${sd.first.toLowerCase()}.${sd.last.toLowerCase()}${i + 1}@gmail.com`;
    const su = await User.create({ email, password: 'Student@1234', role: 'student', isApproved: true });
    const s = await Student.create({
      user: su._id,
      firstName: sd.first,
      lastName: sd.last,
      phone: `98765432${String(10 + i).padStart(2,'0')}`,
      branch: sd.branch,
      cgpa: sd.cgpa,
      rollNumber: `${sd.branch}2024${String(i + 1).padStart(3,'0')}`,
      seatNumber: `S${String(i + 1).padStart(4,'0')}`,
      backlogs: i === 7 ? 1 : 0,
      graduationYear: 2025,
      college: 'MIT College of Engineering, Pune',
      skills: sd.skills,
      readinessScore: 50 + Math.floor(Math.random() * 45),
      // Assign trainer to ALL students
      assignedTrainer: trainer._id,
      projects: [{
        title: `${sd.skills[0]} Web Application`,
        description: `A full-stack web application built using ${sd.skills.slice(0,2).join(' and ')}.`,
        techStack: sd.skills.slice(0, 2),
        link: 'https://github.com/example/project'
      }]
    });
    students.push(s);
    console.log(`  Student ${i+1}: ${email} / Student@1234`);
  }
  
  // ── Assign ALL students to trainer ──
  await Trainer.findByIdAndUpdate(trainer._id, {
    assignedStudents: students.map(s => s._id)
  });
  console.log(`Trainer assigned ${students.length} students`);

  // ── Company users ref ──
  const companyUser1 = await User.findOne({ email: 'hr.techcorp.solutions@gmail.com' });

  // ── Jobs ──
  const jobsPayload = [
    {
      title: 'Full Stack Developer',
      company: companies[0],
      description: 'We are hiring Full Stack Developers with strong skills in React, Node.js and MongoDB. You will work on scalable web applications for enterprise clients.',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      eligibility: { minCGPA: 7.0, maxBacklogs: 0, allowedBranches: ['CSE', 'IT', 'AIDS', 'AIML'] },
      package: { min: 600000, max: 1000000 },
      openings: 5
    },
    {
      title: 'Python Backend Developer',
      company: companies[1],
      description: 'Join our backend team as a Python Developer. You will build REST APIs using Django and manage PostgreSQL databases.',
      requiredSkills: ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
      eligibility: { minCGPA: 6.5, maxBacklogs: 1, allowedBranches: ['ALL'] },
      package: { min: 500000, max: 800000 },
      openings: 3
    },
    {
      title: 'Data Analyst',
      company: companies[2],
      description: 'Looking for analytical minds to join our data team. You will build dashboards, analyze datasets and produce business insights.',
      requiredSkills: ['Python', 'SQL', 'Power BI', 'Pandas'],
      eligibility: { minCGPA: 7.5, maxBacklogs: 0, allowedBranches: ['ALL'] },
      package: { min: 700000, max: 1200000 },
      openings: 2
    }
  ];

  const jobObjs = [];
  for (const jd of jobsPayload) {
    const j = await Job.create({
      title: jd.title,
      company: jd.company._id,
      postedBy: companyUser1._id,
      description: jd.description,
      requiredSkills: jd.requiredSkills,
      eligibility: jd.eligibility,
      package: jd.package,
      openings: jd.openings,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      isApproved: true,
      approvedBy: adminUser._id,
      selectionProcess: ['Online Test', 'Technical Interview', 'HR Interview'],
      jobType: 'full_time',
      workMode: 'hybrid',
      location: 'Bangalore, Karnataka'
    });
    jobObjs.push(j);
  }
  console.log('3 approved active jobs created');
  
  // ── Applications ──
  const appPairs = [
    { student: students[0], job: jobObjs[0], status: 'shortlisted' },
    { student: students[1], job: jobObjs[1], status: 'applied' },
    { student: students[2], job: jobObjs[0], status: 'interview_scheduled',
      interviewSchedule: { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), time: '10:00 AM', mode: 'online', meetLink: 'https://meet.google.com/abc-defg-hij' }
    },
    { student: students[3], job: jobObjs[2], status: 'selected',
      offerDetails: { package: 900000, joiningDate: new Date('2025-07-01') }
    },
    { student: students[4], job: jobObjs[1], status: 'under_review' }
  ];

  for (const ap of appPairs) {
    await Application.create({
      student: ap.student._id,
      job: ap.job._id,
      company: ap.job.company,
      status: ap.status,
      resumeUrl: '/uploads/resumes/sample.pdf',
      statusHistory: [
        { status: 'applied', note: 'Application submitted' },
        ...(ap.status !== 'applied' ? [{ status: ap.status, note: `Status updated to ${ap.status}` }] : [])
      ],
      ...(ap.interviewSchedule ? { interviewSchedule: ap.interviewSchedule } : {}),
      ...(ap.offerDetails ? { offerDetails: ap.offerDetails } : {})
    });
  }

  // Update placement status for placed/shortlisted students
  await Student.findByIdAndUpdate(students[3]._id, {
    placementStatus: 'placed', placedCompany: companies[2]._id, packageOffered: 900000
  });
  await Student.findByIdAndUpdate(students[0]._id, { placementStatus: 'shortlisted' });
  await Student.findByIdAndUpdate(students[2]._id, { placementStatus: 'shortlisted' });

  console.log('\n✅ Seed completed successfully!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('DEMO CREDENTIALS (share only with admins):');
  console.log('Admin:   admin.placetrack@gmail.com          / Admin@1234');
  console.log('Trainer: rajesh.kumar.trainer@gmail.com      / Trainer@1234');
  console.log('Company: hr.techcorp.solutions@gmail.com     / Company@1234');
  console.log('Student: amit.kumar1@gmail.com               / Student@1234');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Trainer has ALL 10 students assigned automatically.');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
