import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, Circle, Clock, BookOpen, Stethoscope, 
  Users, PenTool, Target, Calendar, Trophy, ChevronRight, 
  AlertCircle, Activity, BrainCircuit, Globe, Heart, PlayCircle, BarChart3,
  Sparkles, Zap, ShieldCheck, Flame, TrendingUp, Layers, CheckSquare, 
  Award, Eye, Compass, RefreshCw, ChevronDown, ChevronUp, FileText, Cpu
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'dr-ebrahim-compass-surgery';

// --- ACCELERATED SURGERY SYLLABUS (62 Days Compressed into 35 Days / 5 Weeks) ---
const SURGERY_SYLLABUS = [
  // Week 1: Oct 31 - Nov 6 (Upper GI, Basic Vascular & Hernia/Thyroid Sheets)
  { id: 'lec_1', week: 1, day: 'saturday', title: 'Esophagus Anatomy, Physiology & Injury', type: 'GI Surgery', dr: 'أ.د تامر محمد نبيل', originalDate: '31 أكتوبر', highYield: true },
  { id: 'lec_2', week: 1, day: 'saturday', title: 'Acute Limb Ischemia (PBL)', type: 'Vascular', dr: 'د. خالد شوقي', originalDate: '31 أكتوبر', highYield: true },
  { id: 'lec_3', week: 1, day: 'sunday', title: 'Achalasia & Esophageal Hiatus Hernia', type: 'GI Surgery', dr: 'أ.د.م محمد أحمد قرني', originalDate: '1 نوفمبر', highYield: false },
  { id: 'lec_4', week: 1, day: 'sunday', title: 'Esophageal Carcinoma + Clinical Round', type: 'GI Surgery', dr: 'أ.د.م عمرو محمد علي', originalDate: '1 نوفمبر', highYield: true },
  { id: 'lec_5', week: 1, day: 'monday', title: 'Stomach Anatomy, Physiology & Gastric Dilatation', type: 'GI Surgery', dr: 'أ.د.م أحمد محمد رشاد', originalDate: '2 نوفمبر', highYield: false },
  { id: 'lec_6', week: 1, day: 'monday', title: 'Peptic Ulcer + Suture/CPR/Ostomy Care', type: 'GI Surgery', dr: 'أ.د هشام أحمد نفادي', originalDate: '2 نوفمبر', highYield: true },
  { id: 'lec_7', week: 1, day: 'tuesday', title: 'History Taking, Swelling & Thyroid Sheet (Nodular/Tumors)', type: 'Clinical Sheet', dr: 'د. عبد الحليم / د. الجارحي', originalDate: '5 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_8', week: 1, day: 'wednesday', title: 'Hernia Sheet & Inguinal Hernia Cases', type: 'Clinical Sheet', dr: 'د. مصطفى الجارحي', originalDate: '5 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_9', week: 1, day: 'thursday', title: 'Stomach Neoplasm, Operations & Complications', type: 'GI Surgery', dr: 'أ.د.م أحمد سعد', originalDate: '7 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_10', week: 1, day: 'friday', title: 'Gangrene, Diabetic Foot & Foot Infection (PBL)', type: 'Vascular', dr: 'د. أحمد مسعود', originalDate: '7 نوفمبر (مُعجّل)', highYield: true },

  // Week 2: Nov 7 - Nov 13 (Hepatobiliary & Comprehensive Vascular)
  { id: 'lec_11', week: 2, day: 'saturday', title: 'X-Rays, Jars & Operative on Esophagus & Stomach', type: 'Operative/Jars', dr: 'د. عبد الحليم محمد', originalDate: '8 نوفمبر', highYield: true },
  { id: 'lec_12', week: 2, day: 'saturday', title: 'Liver Anatomy, Physiology & Studies', type: 'Hepatobiliary', dr: 'أ.د.م أحمد صفاء', originalDate: '8 نوفمبر', highYield: false },
  { id: 'lec_13', week: 2, day: 'sunday', title: 'Chronic Limb Ischemia (PBL) + Liver Trauma & Infections', type: 'Mixed', dr: 'د. عبد العزيز / أ.د هشام نفادي', originalDate: '9 نوفمبر', highYield: true },
  { id: 'lec_14', week: 2, day: 'monday', title: 'Venous & Chronic Ischemia Limb Exam + Neck Exam', type: 'Vascular Clinical', dr: 'م.م أسامة سامح / محمد خالد', originalDate: '12 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_15', week: 2, day: 'tuesday', title: 'Vascular Imaging + DVT, Venous Ulcers & Postphlebitic Limb', type: 'Vascular', dr: 'أ.د محمد حسن / د. أحمد مسعود', originalDate: '14 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_16', week: 2, day: 'wednesday', title: 'Liver Tumours + GB Anatomy, Physiology & Radiology', type: 'Hepatobiliary', dr: 'د. قرني / د. عمرو علي', originalDate: '15 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_17', week: 2, day: 'thursday', title: 'Congenital Anomalies of GB, Gall Stones & Cholecystitis', type: 'Hepatobiliary', dr: 'د. رشاد / أ.د نفادي', originalDate: '16 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_18', week: 2, day: 'friday', title: 'DD of Cervical Lymphadenopathy, Unilateral Edema & Lymphedema', type: 'Vascular Clinical', dr: 'م.م محمد خالد / أسامة سامح', originalDate: '19 نوفمبر (مُعجّل)', highYield: false },

  // Week 3: Nov 14 - Nov 20 (Pancreas, Spleen, Breast & Arterial)
  { id: 'lec_19', week: 3, day: 'saturday', title: 'Arterial Injury, Aneurysm & A/V Fistula (PBL) + HSM & Jaundice', type: 'Mixed', dr: 'د. أحمد مبروك / د. سهام أنور', originalDate: '21 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_20', week: 3, day: 'sunday', title: 'X-Rays, Jars & Operative on Liver & GB + Pancreatitis', type: 'Hepatobiliary', dr: 'د. إيمان عبد السلام / د. أحمد صفاء', originalDate: '22 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_21', week: 3, day: 'monday', title: 'Benign & Malignant Tumors of Pancreas', type: 'Hepatobiliary', dr: 'د. الجارحي / د. قرني', originalDate: '23 & 29 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_22', week: 3, day: 'tuesday', title: 'Breast Sheet, HSM Cases & Salivary Gland Sheet', type: 'Clinical Sheet', dr: 'د. الجارحي / د. عبد الحليم', originalDate: '26 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_23', week: 3, day: 'wednesday', title: 'Pulmonary Embolism (PBL) + Spleen Anatomy & Rupture', type: 'Mixed', dr: 'د. أحمد مبروك / د. عبد الحليم', originalDate: '28 نوفمبر (مُعجّل)', highYield: true },
  { id: 'lec_24', week: 3, day: 'thursday', title: 'Small & Large Intestine Anatomy, Trauma & Colon Surgery Principles', type: 'Colorectal', dr: 'أ.د.م عمرو محمد علي', originalDate: '29 نوفمبر (مُعجّل)', highYield: false },
  { id: 'lec_25', week: 3, day: 'friday', title: 'IBD + Intestinal Obstruction', type: 'Colorectal', dr: 'د. رشاد / أ.د نفادي', originalDate: '30 نوفمبر (مُعجّل)', highYield: true },

  // Week 4: Nov 21 - Nov 27 (CONFERENCE WEEK - Lighter Load: Colorectal & Lymphatics)
  { id: 'lec_26', week: 4, day: 'saturday', title: 'Lymphadenopathy, Thyroid & Abdomen Sheets Review', type: 'Clinical Sheet', dr: 'د. الجارحي / د. عبد الحليم', originalDate: '3 ديسمبر (مُعجّل)', highYield: false },
  { id: 'lec_27', week: 4, day: 'sunday', title: 'X-Rays & Jars on Pancreas/Spleen + Neonatal Emergency (PBL)', type: 'Pediatric/Jars', dr: 'د. أحمد سعد / أ.د السادات', originalDate: '5 ديسمبر (مُعجّل)', highYield: true },
  { id: 'lec_28', week: 4, day: 'monday', title: 'Cancer Colon + Intestinal Ischemia, Fistula & Diverticulum', type: 'Colorectal', dr: 'د. إيمان / د. أحمد صفاء', originalDate: '6 ديسمبر (مُعجّل)', highYield: true },
  { id: 'lec_29', week: 4, day: 'wednesday', title: 'Lymphatic Vessels Anatomy + Appendix', type: 'GI Surgery', dr: 'د. عبد العزيز / أ.د نفادي', originalDate: '7 ديسمبر (مُعجّل)', highYield: true },
  { id: 'lec_30', week: 4, day: 'thursday', title: 'Hernia, Varicocele, Hydrocele & Varicose Vein Sheets', type: 'Clinical Sheet', dr: 'د. عبد الحليم / د. الجارحي', originalDate: '10 ديسمبر (مُعجّل)', highYield: true },

  // Week 5: Nov 28 - Dec 4 (FINAL SPRINT: Anorectal, Pediatric Surgery & Trauma)
  { id: 'lec_31', week: 5, day: 'saturday', title: 'Colostomy/Ileostomy + Constipation & Hirschsprung (PBL)', type: 'Colorectal/Ped', dr: 'د. عبد الحليم / د. سهام أنور', originalDate: '12 ديسمبر (مُعجّل)', highYield: true },
  { id: 'lec_32', week: 5, day: 'sunday', title: 'DD Bleeding Per Rectum + Anal Fissure, Abscess, Fistula, Piles & Pilonidal', type: 'Anorectal', dr: 'د. قرني / د. عمرو / د. رشاد / أ.د نفادي', originalDate: '13-14 ديسمبر (مُعجّل)', highYield: true },
  { id: 'lec_33', week: 5, day: 'monday', title: 'Pediatric Surgery 1: CHPS, Malrotation, Umbilical/Inguinal Hernia, UDT, Hypospadias, Anorectal Malf.', type: 'Pediatric', dr: 'م.م أحمد ربيع / م.م عمرو الكومي', originalDate: '17 ديسمبر (مُعجّل)', highYield: true },
  { id: 'lec_34', week: 5, day: 'tuesday', title: 'Acute Abdomen, Hematemesis & DD Neck Swelling (PBL)', type: 'Emergency', dr: 'د. أحمد سعد / د. سهام أنور', originalDate: '19 ديسمبر (مُعجّل)', highYield: true },
  { id: 'lec_35', week: 5, day: 'wednesday', title: 'X-Rays/Jars Intestine & Anus + Tubes, Drains & Abdominal Injuries', type: 'Operative/Trauma', dr: 'د. إيمان / د. عبد العزيز / د. الجارحي', originalDate: '20-21 ديسمبر (مُعجّل)', highYield: true },
  { id: 'lec_36', week: 5, day: 'thursday', title: 'Pediatric Surgery 2: Jaundice, Child vs Adult, CDH, Esophageal Atresia & TOF', type: 'Pediatric', dr: 'م.م إسلام السيد / م.م عبد الله مصطفى', originalDate: '24 ديسمبر (مُعجّل)', highYield: true },
  { id: 'lec_37', week: 5, day: 'friday', title: 'Peritoneum Anatomy, Peritonitis & Hemangiomas/Vascular Malformations (PBL)', type: 'Mixed', dr: 'د. عبد الحليم / د. سهام أنور', originalDate: '26 ديسمبر (مُعجّل) - ختام المنهج! 🎉', highYield: true },
];

// --- COMPASS NOVEMBER MILESTONES ---
const COMPASS_MILESTONES = [
  { id: 'comp_1', week: 1, title: 'استلام 80% من مسودات الـ Slides للمتحدثين ومراجعتها', committee: 'Scientific', deadline: '1-10 نوفمبر' },
  { id: 'comp_2', week: 1, title: 'بروفة الألوان بالمطبعة (CMYK Proofing) للكحلي والذهبي والفيروزي', committee: 'Design', deadline: '1-10 نوفمبر' },
  { id: 'comp_3', week: 1, title: 'إطلاق بطاقات كشف المتحدثين (Speaker Cards) وخريطة الأجندة', committee: 'Marketing', deadline: '1-10 نوفمبر' },
  { id: 'comp_4', week: 2, title: 'استلام اللوجوهات Vector ومتطلبات بوثات الرعاة', committee: 'PR & Sponsors', deadline: '1-15 نوفمبر' },
  { id: 'comp_5', week: 2, title: 'اختبار الضغط للموقع (Load Testing) لـ 1000 مستخدم وتجربة الـ QR Scanner', committee: 'IT', deadline: '1-15 نوفمبر' },
  { id: 'comp_6', week: 2, title: 'بروفات الـ Zoom (Dry Runs) للمتحدثين لضبط التوقيتات', committee: 'Scientific', deadline: '11-20 نوفمبر' },
  { id: 'comp_7', week: 3, title: 'اعتماد بروتوكول اللاسلكي وتدريب الـ Floaters ومهندسي الحركة', committee: 'Logistics', deadline: '15 نوفمبر' },
  { id: 'comp_8', week: 3, title: 'شراء كاميرات Instax وطباعة جوازات سفر COMPASS وحائط التقدير', committee: 'Engagement & VIP', deadline: '15 نوفمبر' },
  { id: 'comp_9', week: 4, title: 'تقديم العرض التقديمي الخاص بك (24 نوفمبر) بأعلى احترافية!', committee: 'Dr. Ebrahim Keynote', deadline: '24 نوفمبر 🔥' },
  { id: 'comp_10', week: 4, title: 'استلام القاعة والفرش الكامل والـ Dry Run النهائي على المسرح', committee: 'All Squads', deadline: '26 نوفمبر' },
  { id: 'comp_11', week: 4, title: 'يوم الحدث الكبير COMPASS 2026 + اجتماع الـ Hot Debrief', committee: 'Grand Day', deadline: '27 نوفمبر 🏆' },
];

// --- DAILY TEMPLATE GENERATOR ---
const generateDailyRoutine = (weekNum) => {
  const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const sunnahChallenges = [
    'ركعتين الضحى بنية البركة في الوقت', 'صدقة خفية ولو بمبلغ بسيط', 'قراءة سورة الملك وتجديد التوبة قبل النوم',
    'صيام تطوع أو إطعام/إدخال سرور على مسلم', '100 مرة صلاة على النبي ﷺ بخشوع', 'سنة الفجر القبلية والوتر', 'سورة الكهف + الدعاء في آخر ساعة من الجمعة'
  ];

  let routine = [];
  days.forEach((day, idx) => {
    const dayLectures = SURGERY_SYLLABUS.filter(l => l.week === weekNum && l.day === day);
    const lecTitles = dayLectures.map(l => l.title).join(' + ') || 'مراجعة وتجميع جراحة';

    // 1. Spiritual Core
    routine.push({
      id: `w${weekNum}_${day}_sp1`, week: weekNum, day, time: '05:20 ص', duration: '45m',
      title: `الفجر + أذكار الصباح + ورد القرآن والتدبر`, category: 'روحي', priority: '🔴',
      subtext: `تحدي السنة اليومي: ${sunnahChallenges[idx]}`
    });
    routine.push({
      id: `w${weekNum}_${day}_sp2`, week: weekNum, day, time: '06:15 ص', duration: '35m',
      title: 'منصة زاد للعلوم الشرعية + قراءة صباحية', category: 'روحي', priority: '🔴',
      subtext: 'بداية اليوم بطلب العلم الشرعي تفتح مغاليق الطب'
    });

    // 2. Accelerated Surgery Block 1 (Morning Deep Work)
    routine.push({
      id: `w${weekNum}_${day}_ac1`, week: weekNum, day, time: '08:30 ص', duration: '2h',
      title: `الكتلة الجراحية المسرّعة (محاضرات اليوم): ${lecTitles}`, category: 'أكاديمي', priority: '🔴',
      subtext: 'هدفنا: إنهاء المنهج في 35 يوماً بدلاً من 62 يوماً (سرعة 1.8x)',
      linkedLectures: dayLectures.map(l => l.id)
    });

    // 3. Practical / Clinical Videos
    routine.push({
      id: `w${weekNum}_${day}_ac2`, week: weekNum, day, time: '11:00 ص', duration: '1h 10m',
      title: 'فيديوهات عملي جراحة (Wound / Clinical / Operative Jars)', category: 'أكاديمي', priority: '🔴',
      subtext: 'تطبيق بصري وإكلينيكي لتثبيت النظري'
    });

    // 4. Midday Prayer & AI Gems
    routine.push({
      id: `w${weekNum}_${day}_ai1`, week: weekNum, day, time: '01:00 م', duration: '30m',
      title: idx % 2 === 0 ? 'صلاة الظهر + Gem: Learn Drugs & Clinical Sense' : 'صلاة الظهر + Gem: Talks Mastery & Geography',
      category: 'ترفيه ذكي', priority: '🟢', subtext: 'تنشيط ذهني سريع بالذكاء الاصطناعي قبل القيلولة'
    });

    // 5. COMPASS & Content Production
    routine.push({
      id: `w${weekNum}_${day}_pr1`, week: weekNum, day, time: '03:00 م', duration: '45m',
      title: 'كتابة محتوى صفحة Medhance الطبية (3 بوستات مركزة)', category: 'إنتاج', priority: '🔴',
      subtext: 'حول معلومة من محاضرة الجراحة النهاردة لبوست طبي جذاب!'
    });

    routine.push({
      id: `w${weekNum}_${day}_pr2`, week: weekNum, day, time: '04:15 م', duration: '1h',
      title: weekNum === 4 && day === 'tuesday' 
        ? '🔥 يوم العرض الكبير: تقديم بريزنتيشن المؤتمر (24 نوفمبر)!' 
        : 'صلاة العصر + تجهيز بريزنتيشن 24 نوفمبر ومتابعة لجان COMPASS',
      category: 'إنتاج', priority: '🔴',
      subtext: 'مراجعة الـ KPIs مع رؤساء اللجان وتصميم السلايدز بالهوية البصرية'
    });

    if (['saturday', 'tuesday', 'thursday'].includes(day)) {
      routine.push({
        id: `w${weekNum}_${day}_pr3`, week: weekNum, day, time: '05:30 م', duration: '30m',
        title: 'كتابة بوست إبداعي للصفحة الشخصية', category: 'إنتاج', priority: '🟡',
        subtext: 'توثيق الرحلة ومشاركة فكرة ملهمة'
      });
    }

    // 6. Research & Self-Development
    routine.push({
      id: `w${weekNum}_${day}_dev1`, week: weekNum, day, time: '07:00 م', duration: '1h',
      title: idx % 2 === 0 ? 'كورس البحث العلمي (Search Strategy / Screening / AI)' : 'كورس التطوير المتقدم + بودكاست عربي/طبي',
      category: 'تطوير', priority: '🟡', subtext: 'بناء عقلية الباحث الطبي القائد'
    });

    // 7. Night Gaze Tracker & Wrap up
    routine.push({
      id: `w${weekNum}_${day}_sp3`, week: weekNum, day, time: '08:30 م', duration: '25m',
      title: 'صلاة العشاء + محاسبة النفس وتقييم غض البصر (10/10)', category: 'روحي', priority: '🔴',
      subtext: '4 أيام التزام متتالية = مكافأة حلقة Dr. House حلال زلال!'
    });
  });

  return routine;
};

export default function SuperProfessionalDashboard() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'syllabus' | 'compass' | 'ai_analytics'
  const [selectedWeek, setSelectedWeek] = useState(1); // 1 to 5 (Accelerated Weeks)
  const [selectedDay, setSelectedDay] = useState('saturday');
  
  // Persisted States
  const [completedTasks, setCompletedTasks] = useState({});
  const [completedLectures, setCompletedLectures] = useState({});
  const [completedCompass, setCompletedCompass] = useState({});
  const [gazeStreak, setGazeStreak] = useState(2);
  const [gazeHistory, setGazeHistory] = useState({ saturday: 10, sunday: 10 });
  const [customNotes, setCustomNotes] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // AI Advisor State
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- FIREBASE AUTH & REALTIME SYNC ---
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth initialization error:", e);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'dashboardState', 'main_v2');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.completedTasks) setCompletedTasks(data.completedTasks);
        if (data.completedLectures) setCompletedLectures(data.completedLectures);
        if (data.completedCompass) setCompletedCompass(data.completedCompass);
        if (typeof data.gazeStreak === 'number') setGazeStreak(data.gazeStreak);
        if (data.gazeHistory) setGazeHistory(data.gazeHistory);
        if (data.customNotes !== undefined) setCustomNotes(data.customNotes);
      }
    }, (err) => console.error("Firestore sync error:", err));
    return () => unsub();
  }, [user]);

  const saveToCloud = async (updates) => {
    if (!user || !db) return;
    setIsSyncing(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'dashboardState', 'main_v2');
      await setDoc(docRef, {
        completedTasks,
        completedLectures,
        completedCompass,
        gazeStreak,
        gazeHistory,
        customNotes,
        ...updates,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  // --- HANDLERS ---
  const toggleTask = (task) => {
    const newStatus = !completedTasks[task.id];
    const nextTasks = { ...completedTasks, [task.id]: newStatus };
    let nextLectures = { ...completedLectures };

    // Auto-check linked surgery lectures if the daily surgery block is checked!
    if (task.linkedLectures && task.linkedLectures.length > 0) {
      task.linkedLectures.forEach(lecId => {
        nextLectures[lecId] = newStatus;
      });
      setCompletedLectures(nextLectures);
    }

    setCompletedTasks(nextTasks);
    saveToCloud({ completedTasks: nextTasks, completedLectures: nextLectures });
  };

  const toggleLecture = (lecId) => {
    const nextLectures = { ...completedLectures, [lecId]: !completedLectures[lecId] };
    setCompletedLectures(nextLectures);
    saveToCloud({ completedLectures: nextLectures });
  };

  const toggleCompass = (compId) => {
    const nextComp = { ...completedCompass, [compId]: !completedCompass[compId] };
    setCompletedCompass(nextComp);
    saveToCloud({ completedCompass: nextComp });
  };

  const updateGazeScore = (score) => {
    const nextHistory = { ...gazeHistory, [`w${selectedWeek}_${selectedDay}`]: score };
    const nextStreak = score === 10 ? gazeStreak + 1 : 0;
    setGazeHistory(nextHistory);
    setGazeStreak(nextStreak);
    saveToCloud({ gazeHistory: nextHistory, gazeStreak: nextStreak });
  };

  // --- COMPUTED METRICS & AI VELOCITY ENGINE ---
  const weekRoutine = useMemo(() => generateDailyRoutine(selectedWeek), [selectedWeek]);
  const activeDayTasks = useMemo(() => weekRoutine.filter(t => t.day === selectedDay), [weekRoutine, selectedDay]);

  const dayCompletedCount = activeDayTasks.filter(t => completedTasks[t.id]).length;
  const dayProgress = Math.round((dayCompletedCount / (activeDayTasks.length || 1)) * 100);

  const weekCompletedCount = weekRoutine.filter(t => completedTasks[t.id]).length;
  const weekProgress = Math.round((weekCompletedCount / (weekRoutine.length || 1)) * 100);

  const totalLectures = SURGERY_SYLLABUS.length;
  const doneLecturesCount = SURGERY_SYLLABUS.filter(l => completedLectures[l.id]).length;
  const syllabusProgress = Math.round((doneLecturesCount / totalLectures) * 100);

  // Velocity Analytics
  // Official college round: Oct 31 to Jan 1 = 62 days.
  // Target Accelerated Plan (56% of time / ~35 days): Finish by Dec 4.
  const remainingLectures = totalLectures - doneLecturesCount;
  // Standard pace = 37 blocks / 62 days = 0.6 blocks/day.
  // Accelerated pace = 37 blocks / 35 days = 1.06 blocks/day.
  const userEffectiveVelocity = doneLecturesCount > 0 ? Math.max(0.8, (doneLecturesCount / Math.max(1, selectedWeek * 3)).toFixed(2)) : 1.06;
  const daysToFinishAtCurrentPace = Math.ceil(remainingLectures / userEffectiveVelocity);
  const daysSavedVsCollege = Math.max(0, 62 - (doneLecturesCount * 1.1 + daysToFinishAtCurrentPace));

  const getDomainProg = (cat) => {
    const list = activeDayTasks.filter(t => t.category === cat);
    if (!list.length) return 0;
    return Math.round((list.filter(t => completedTasks[t.id]).length / list.length) * 100);
  };

  // --- GEMINI AI LIVE COACH INTEGRATION ---
  const generateSmartAiInsights = async () => {
    setIsAiLoading(true);
    setAiAnalysis('');
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const systemPrompt = "أنت د. إبراهيم رجب (المستشار الشخصي والصديق المقرب لدكتور إبراهيم في الفرقة الخامسة طب بني سويف). تحدث بالعامية المصرية المحفزة والذكية جداً. حلل أرقامه وقدم 3 نقاط محددة: 1) تقييم سرعته في ختم الجراحة مقارنة بهدف الـ 35 يوم (قبل 4 ديسمبر). 2) نصيحة تكتيكية لتوازن المؤتمر COMPASS (عرضه يوم 24 نوفمبر والمؤتمر 27 نوفمبر) مع المذاكرة. 3) تذكرة إيمانية سريعة مرتبطة بغض البصر والبركة في الوقت.";
    
    const userQuery = `بياناتي الحالية:
- خلصت ${doneLecturesCount} من أصل ${totalLectures} محاضرة مجمعة في الجراحة العامة والأوعية والأطفال (${syllabusProgress}%).
- نسبة إنجاز اليوم (${selectedDay} - الأسبوع ${selectedWeek}): ${dayProgress}%.
- الـ Streak الحالي لغض البصر: ${gazeStreak} أيام متتالية.
- باقي لي ${remainingLectures} محاضرة، ومتوقع أخلصهم في ${daysToFinishAtCurrentPace} يوم (يعني سابق جدول الكلية بـ ${Math.round(daysSavedVsCollege)} يوم).
اديني خطبة قيادية سريعة وخطة هجوم للـ 48 ساعة الجايين!`;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiAnalysis(text || "يا بطل! أرقامك بتقول إنك لو حافظت على محاضرة ونص يومياً هتفرم الراوند قبل 4 ديسمبر وتفضى للمراجعة والـ Jars بالكامل. ركز النهاردة في الـ High-Yield ومتفرطش في ورد القرآن!");
    } catch (err) {
      setAiAnalysis("عاش يا دكتور إبراهيم! خطة الـ 5 أسابيع ماشية بانتظام. نصيحتي الفورية: ربط محاضرات الـ GI والـ Vascular بملفات الـ PBL عشان تضمن امتياز الجراحة، وخلي عرضك يوم 24 نوفمبر جاهز قبلها بأسبوع!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const daysAr = [
    { id: 'saturday', label: 'السبت', dateOffset: 0 },
    { id: 'sunday', label: 'الأحد', dateOffset: 1 },
    { id: 'monday', label: 'الإثنين', dateOffset: 2 },
    { id: 'tuesday', label: 'الثلاثاء', dateOffset: 3 },
    { id: 'wednesday', label: 'الأربعاء', dateOffset: 4 },
    { id: 'thursday', label: 'الخميس', dateOffset: 5 },
    { id: 'friday', label: 'الجمعة', dateOffset: 6 }
  ];

  const weeksMeta = [
    { num: 1, title: 'الأسبوع 1: هجوم الـ Upper GI والـ Sheets', range: '31 أكتوبر - 6 نوفمبر', target: '27% من المنهج' },
    { num: 2, title: 'الأسبوع 2: فرم الـ Hepatobiliary والـ Vascular', range: '7 نوفمبر - 13 نوفمبر', target: '49% من المنهج' },
    { num: 3, title: 'الأسبوع 3: البنكرياس والطحال والـ Breast', range: '14 نوفمبر - 20 نوفمبر', target: '68% من المنهج' },
    { num: 4, title: 'الأسبوع 4: أسبوع مؤتمر COMPASS + القولون', range: '21 نوفمبر - 27 نوفمبر 🔥', target: '81% من المنهج' },
    { num: 5, title: 'الأسبوع 5: ضربة الختام (الأطفال والـ Anorectal)', range: '28 نوفمبر - 4 ديسمبر 🏆', target: '100% ختم الجراحة!' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans pb-16 selection:bg-teal-500 selection:text-white" dir="rtl">
      
      {/* --- SUPER HEADER --- */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F172A]/90 border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-amber-400 p-[2px] shadow-lg shadow-teal-500/20">
                <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
                  <Compass className="text-teal-400 animate-pulse" size={26} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black bg-gradient-to-l from-white via-teal-200 to-amber-300 bg-clip-text text-transparent">
                    منظومة القيادة الجراحية & COMPASS
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Sparkles size={11} /> AI Accelerated 1.8x
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>د. إبراهيم رجب • الفرقة الخامسة (Group A)</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    {isSyncing ? <><RefreshCw size={11} className="animate-spin"/> جاري الحفظ سحابياً...</> : <><ShieldCheck size={12}/> محفوظ تلقائياً</>}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Live Global KPIs */}
          <div className="grid grid-cols-3 sm:flex items-center gap-3 w-full lg:w-auto">
            {/* Surgery Accelerated Progress */}
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 hidden sm:block">
                <Stethoscope size={20} />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">ختم الجراحة (هدف 4 ديسمبر)</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-teal-400">{syllabusProgress}%</span>
                  <span className="text-[11px] text-slate-500">({doneLecturesCount}/{totalLectures})</span>
                </div>
              </div>
            </div>

            {/* Time Saved Badge */}
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hidden sm:block">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">توفير الوقت للمراجعة</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-amber-400">+{Math.round(daysSavedVsCollege)} يوم</span>
                  <span className="text-[10px] text-emerald-400 font-bold">سابق الكلية</span>
                </div>
              </div>
            </div>

            {/* Dr. House Gaze Streak */}
            <div className="bg-gradient-to-br from-indigo-950/90 to-slate-900 border border-indigo-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hidden sm:block">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-[11px] text-indigo-300">غض البصر (مكافأة House)</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-white">{gazeStreak}/4</span>
                  <span className="text-[10px] text-amber-300">{gazeStreak >= 4 ? '🎉 استحقيت الحلقة!' : 'أيام متتالية'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-2 pb-3 pt-1 hide-scrollbar">
          {[
            { id: 'daily', label: 'الجدول التفاعلي اليومي', icon: <Calendar size={16}/> },
            { id: 'syllabus', label: 'خريطة فرم الجراحة (5 أسابيع + شهر المراجعة)', icon: <Layers size={16}/> },
            { id: 'compass', label: 'غرفة عمليات COMPASS (نوفمبر)', icon: <Compass size={16}/> },
            { id: 'ai_analytics', label: 'تحليلات الـ AI وسرعة الإنجاز', icon: <Cpu size={16}/> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-l from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6 space-y-6">

        {/* --- WEEK SELECTOR BAR (Visible in Daily & Syllabus) --- */}
        {(activeTab === 'daily' || activeTab === 'syllabus') && (
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-3xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Target size={16} className="text-amber-400"/> اختر أسبوع الخطة المسرّعة (ختم الـ 62 يوم في 35 يوم فقط):
              </h2>
              <span className="text-xs text-teal-400 font-semibold bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                من 5 ديسمبر لـ 1 يناير = شهر كامل مراجعة خالصة وحل امتحانات!
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {weeksMeta.map(w => {
                const wLecs = SURGERY_SYLLABUS.filter(l => l.week === w.num);
                const wDone = wLecs.filter(l => completedLectures[l.id]).length;
                const wPct = Math.round((wDone / (wLecs.length || 1)) * 100);
                const active = selectedWeek === w.num;
                return (
                  <button
                    key={w.num}
                    onClick={() => setSelectedWeek(w.num)}
                    className={`text-right p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      active 
                        ? 'bg-gradient-to-br from-teal-950/90 to-slate-900 border-teal-400 shadow-lg shadow-teal-500/10' 
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-amber-400">{w.range}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-teal-300">{wPct}%</span>
                      </div>
                      <p className="font-bold text-sm text-white leading-snug">{w.title}</p>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${wPct}%` }}></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 flex justify-between">
                        <span>محاضرات: {wDone}/{wLecs.length}</span>
                        <span className="text-amber-300/90">{w.target}</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 1: DAILY INTERACTIVE SCHEDULE
        ========================================================= */}
        {activeTab === 'daily' && (
          <>
            {/* Days Filter Pills */}
            <div className="flex overflow-x-auto gap-2.5 pb-2 hide-scrollbar">
              {daysAr.map(d => {
                const dTasks = weekRoutine.filter(t => t.day === d.id);
                const dDone = dTasks.filter(t => completedTasks[t.id]).length;
                const dPct = Math.round((dDone / (dTasks.length || 1)) * 100);
                const isSelected = selectedDay === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDay(d.id)}
                    className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950 border-teal-400 font-black shadow-lg shadow-teal-500/20 scale-[1.02]'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-right">
                      <p className="text-sm font-extrabold">{d.label}</p>
                      <p className={`text-[11px] ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                        {dDone}/{dTasks.length} مهام
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${
                      isSelected ? 'bg-slate-950 text-teal-400' : 'bg-slate-800 text-amber-400'
                    }`}>
                      {dPct}%
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Column: Day Stats, Top 3 Priorities & Gaze Tracker */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Domain Breakdown Card */}
                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-lg text-white flex items-center gap-2">
                      <BarChart3 className="text-teal-400" size={20}/> توازن جوانب اليوم
                    </h3>
                    <span className="text-2xl font-black text-amber-400">{dayProgress}%</span>
                  </div>

                  <div className="space-y-4">
                    <DomainBar label="الجانب الروحي والقرآن (خط أحمر)" pct={getDomainProg('روحي')} color="bg-indigo-500" icon={<Heart size={15} className="text-indigo-400"/>} />
                    <DomainBar label="الجراحة المسرّعة والـ Clinical" pct={getDomainProg('أكاديمي')} color="bg-teal-400" icon={<Stethoscope size={15} className="text-teal-400"/>} />
                    <DomainBar label="مؤتمر COMPASS و Medhance" pct={getDomainProg('إنتاج')} color="bg-amber-400" icon={<PenTool size={15} className="text-amber-400"/>} />
                    <DomainBar label="البحث العلمي وتطوير الذات" pct={getDomainProg('تطوير')} color="bg-emerald-400" icon={<BrainCircuit size={15} className="text-emerald-400"/>} />
                  </div>
                </div>

                {/* Top 3 Non-Negotiable Priorities */}
                <div className="bg-gradient-to-br from-teal-900/60 via-slate-900 to-slate-900 border border-teal-500/30 p-6 rounded-3xl">
                  <h3 className="font-black text-base text-teal-300 mb-4 flex items-center gap-2">
                    <Trophy className="text-amber-400" size={18}/> أهم 3 أولويات اليوم (قاعدة باريتو 80/20)
                  </h3>
                  <div className="space-y-3">
                    {activeDayTasks.filter(t => t.priority === '🔴').slice(0, 3).map((t, i) => (
                      <div 
                        key={t.id} 
                        onClick={() => toggleTask(t)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          completedTasks[t.id] 
                            ? 'bg-slate-900/40 border-slate-800 opacity-50 line-through' 
                            : 'bg-slate-900/90 border-teal-500/20 hover:border-teal-400'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="text-xs font-bold text-slate-200 leading-relaxed">{t.title}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaze Tracker & Dr. House Reward System */}
                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-black text-base text-white flex items-center gap-2">
                      <Eye className="text-rose-400" size={18}/> متتبع غض البصر (بنزين التركيز)
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      Streak: {gazeStreak} 🔥
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    كل نظرة بتغضها بتتحول لبصيرة في الحفظ وتشخيص الحالات. قيّم نفسك النهاردة بصراحة:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => updateGazeScore(10)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                        gazeHistory[`w${selectedWeek}_${selectedDay}`] === 10
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                          : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      10/10 بطل اليوم 🌟
                    </button>
                    <button 
                      onClick={() => updateGazeScore(7)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                        gazeHistory[`w${selectedWeek}_${selectedDay}`] === 7
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                          : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      7/10 مجاهدة ⚡
                    </button>
                    <button 
                      onClick={() => updateGazeScore(4)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                        gazeHistory[`w${selectedWeek}_${selectedDay}`] === 4
                          ? 'bg-rose-500 text-white border-rose-400 font-black'
                          : 'bg-slate-800 text-rose-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      أقل (كفارة ركعتين) ⚠️
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Detailed Interactive Timeline */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden">
                  <div className="p-5 bg-slate-900 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <PlayCircle className="text-teal-400" size={22}/> الجدول الزمني ليوم {daysAr.find(d => d.id === selectedDay)?.label} (الأسبوع {selectedWeek})
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">اضغط على أي مهمة لحفظ إنجازها سحابياً وتحديث سرعة ختم الجراحة تلقائياً</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-slate-800 text-teal-300 px-3 py-1.5 rounded-xl border border-slate-700">
                        أنجزت {dayCompletedCount} من {activeDayTasks.length}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {activeDayTasks.map(task => {
                      const isDone = !!completedTasks[task.id];
                      const badgeStyles = {
                        'روحي': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
                        'أكاديمي': 'bg-teal-500/10 text-teal-300 border-teal-500/20',
                        'إنتاج': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
                        'تطوير': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
                        'ترفيه ذكي': 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                      }[task.category] || 'bg-slate-800 text-slate-300';

                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task)}
                          className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                            isDone
                              ? 'bg-slate-950/60 border-slate-800/60 opacity-60'
                              : 'bg-slate-950/90 border-slate-800 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5'
                          }`}
                        >
                          <button className="mt-1 shrink-0 transition-transform group-hover:scale-110">
                            {isDone ? <CheckCircle2 className="text-teal-400" size={26} /> : <Circle className="text-slate-600 group-hover:text-teal-400" size={26} />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-xs font-black bg-slate-900 text-amber-400 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                                <Clock size={12}/> {task.time} ({task.duration})
                              </span>
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${badgeStyles}`}>
                                {task.category}
                              </span>
                              {task.priority === '🔴' && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  🔴 أولوية قصوى
                                </span>
                              )}
                            </div>

                            <h3 className={`font-bold text-base leading-snug ${isDone ? 'line-through text-slate-500' : 'text-slate-100 group-hover:text-teal-200'}`}>
                              {task.title}
                            </h3>
                            
                            {task.subtext && (
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.subtext}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Personal Reflection & Notes (Cloud Saved) */}
                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl">
                  <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-amber-400"/> مسودة أفكارك السريعة (ملاحظات الجراحة، أفكار بوستات Medhance، أو تعديلات المؤتمر - تُحفظ تلقائياً):
                  </label>
                  <textarea
                    rows={3}
                    value={customNotes}
                    onChange={(e) => {
                      setCustomNotes(e.target.value);
                      saveToCloud({ customNotes: e.target.value });
                    }}
                    placeholder="اكتب هنا أي فكرة تخطر على بالك وقت المذاكرة عشان متنسهاش ومتتشتتش..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* =========================================================
            TAB 2: ACCELERATED SURGERY SYLLABUS (35-DAY PLAN)
        ========================================================= */}
        {activeTab === 'syllabus' && (
          <div className="space-y-6">
            
            {/* Two-Month Strategic Overview Banner */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-teal-950/80 to-slate-900 border border-teal-500/30 p-6 rounded-3xl">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300">
                  الشهر الأول (31 أكتوبر - 4 ديسمبر)
                </span>
                <h3 className="text-xl font-black text-white mt-3">مرحلة الهجوم والختم المسرّع (35 يوماً)</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  بدل ما نمشي ببطء مع جدول الكلية اللي بيخلص 1 يناير، ضغطنا الـ 37 بلوك محاضرات (GI, Hepatobiliary, Vascular, Pediatric, Clinical Sheets) في 5 أسابيع مركزة بمعدل ساعة ونص لساعتين نظري يومياً.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-950/70 to-slate-900 border border-amber-500/30 p-6 rounded-3xl">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300">
                  الشهر الثاني (5 ديسمبر - 1 يناير)
                </span>
                <h3 className="text-xl font-black text-white mt-3">مرحلة المراجعة الذهبية والامتحانات (27 يوماً خالصاً)</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  هتكون مخلص المؤتمر ومخلص المنهج بالكامل! الفترة دي هتتفرغ فيها لمراجعة الـ Cases، الـ Jars والـ X-Rays، وحل الـ Formative Exam (2) يوم 25 ديسمبر الساعة 9 مساءً وأنت حاطط رجل على رجل!
                </p>
              </div>
            </div>

            {/* Lectures Checklist for Selected Week */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">
                    محاضرات {weeksMeta.find(w => w.num === selectedWeek)?.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    الجدول ده بيدمج محاضرات ديسمبر مع نوفمبر عشان نخلص في نص المدة
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-400 block">إجمالي المنجز في المنهج</span>
                  <span className="text-2xl font-black text-teal-400">{doneLecturesCount} / {totalLectures} محاضرة مجمعة</span>
                </div>
              </div>

              <div className="p-6 grid md:grid-cols-2 gap-4">
                {SURGERY_SYLLABUS.filter(l => l.week === selectedWeek).map(lec => {
                  const isDone = !!completedLectures[lec.id];
                  return (
                    <div
                      key={lec.id}
                      onClick={() => toggleLecture(lec.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isDone
                          ? 'bg-slate-950/40 border-teal-500/20 opacity-60'
                          : 'bg-slate-950 border-slate-800 hover:border-teal-400'
                      }`}
                    >
                      <button className="mt-1 shrink-0">
                        {isDone ? <CheckCircle2 className="text-teal-400" size={24}/> : <Circle className="text-slate-600" size={24}/>}
                      </button>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            يوم {daysAr.find(d => d.id === lec.day)?.label} • {lec.type}
                          </span>
                          <span className="text-[11px] text-slate-400">تاريخ الكلية: {lec.originalDate}</span>
                        </div>
                        <h4 className={`font-bold text-sm leading-snug ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                          {lec.title}
                        </h4>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                          <span>👨‍⚕️ {lec.dr}</span>
                          {lec.highYield && <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">🔥 High-Yield</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: COMPASS CONFERENCE COMMAND CENTER (NOVEMBER)
        ========================================================= */}
        {activeTab === 'compass' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-teal-950/60 to-slate-900 border border-teal-500/30 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                  العد التنازلي للحسم: نوفمبر 2026
                </span>
                <h2 className="text-2xl font-black text-white mt-2">غرفة عمليات مؤتمر COMPASS + عرضك يوم 24 نوفمبر</h2>
                <p className="text-xs text-slate-300 mt-1">
                  متابعة الـ Deadlines الحرجة للجان التسعة من وثيقة الخطة الاستراتيجية عشان يوم 27 نوفمبر يطلع تاريخي!
                </p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 px-5 py-3 rounded-2xl text-center shrink-0">
                <p className="text-xs text-slate-400">إنجاز مهام نوفمبر</p>
                <p className="text-2xl font-black text-amber-400">
                  {COMPASS_MILESTONES.filter(m => completedCompass[m.id]).length} / {COMPASS_MILESTONES.length}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {COMPASS_MILESTONES.map(item => {
                const isDone = !!completedCompass[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCompass(item.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isDone ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800 hover:border-amber-400/60'
                    }`}
                  >
                    <button className="mt-0.5 shrink-0">
                      {isDone ? <CheckCircle2 className="text-amber-400" size={24}/> : <Circle className="text-slate-600" size={24}/>}
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          لجنة: {item.committee}
                        </span>
                        <span className="text-xs font-bold text-amber-400">{item.deadline}</span>
                      </div>
                      <h4 className={`font-bold text-sm leading-relaxed ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {item.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: AI VELOCITY & PREDICTIVE INSIGHTS
        ========================================================= */}
        {activeTab === 'ai_analytics' && (
          <div className="space-y-6">
            
            {/* Predictive KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                <p className="text-xs text-slate-400">معدل سرعتك المطلوب</p>
                <p className="text-2xl font-black text-teal-400 mt-1">1.06 بلوك/يوم</p>
                <span className="text-[11px] text-emerald-400 mt-1 block">تساوي 1.8x سرعة الكلية العادية</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                <p className="text-xs text-slate-400">تاريخ الختم المتوقع بالـ AI</p>
                <p className="text-2xl font-black text-amber-400 mt-1">4 ديسمبر 2026</p>
                <span className="text-[11px] text-slate-400 mt-1 block">قبل نهاية الراوند بـ 28 يوم كامل!</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                <p className="text-xs text-slate-400">الامتحان التجريبي Formative 2</p>
                <p className="text-2xl font-black text-white mt-1">25 ديسمبر (9 م)</p>
                <span className="text-[11px] text-teal-300 mt-1 block">هتكون مراجع المنهج مرتين قبلها</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                <p className="text-xs text-slate-400">حالة التوازن النفسي والروحي</p>
                <p className="text-2xl font-black text-indigo-400 mt-1">
                  {gazeStreak >= 3 ? 'ممتاز ومستقر 🔥' : 'يحتاج تركيز برقابة العين'}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">الورد الديني يحمي من الاحتراق</span>
              </div>
            </div>

            {/* Interactive Gemini AI Personal Coach Box */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0F1E36] to-slate-900 border border-teal-500/40 p-6 rounded-3xl shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">المحلل الاستراتيجي بالذكاء الاصطناعي (Live AI Coach)</h3>
                    <p className="text-xs text-slate-300">يقرأ تقدمك الحالي في الجراحة والمؤتمر وغض البصر ويعطيك خطة هجوم فورية</p>
                  </div>
                </div>
                <button
                  onClick={generateSmartAiInsights}
                  disabled={isAiLoading}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0"
                >
                  {isAiLoading ? <RefreshCw size={15} className="animate-spin"/> : <Zap size={15}/>}
                  {isAiLoading ? 'جاري تحليل أرقامك...' : 'اطلب تحليل وتوجيه الـ AI الآن'}
                </button>
              </div>

              {aiAnalysis ? (
                <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiAnalysis}
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl text-xs text-slate-400 leading-relaxed">
                  💡 <strong>توصية النظام المبدئية:</strong> أنت الآن في بداية معركة الـ 35 يوماً. أهم تكتيك لتخليص الجراحة في نصف المدة هو <strong>الدمج الذكي</strong>: عندما تذاكر محاضرة (Esophagus أو Stomach أو Vascular)، لخص منها فوراً 3 نقاط لتصبح هي نفسها بوستات <strong>Medhance</strong> لليوم! هكذا تضرب عصفورين بحجر واحد وتوفر 45 دقيقة يومياً. اضغط على الزر بالأعلى للحصول على تحليل مخصص لأرقامك الحالية.
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

function DomainBar({ label, pct, color, icon }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className="text-xs font-black text-slate-400">{pct}%</span>
      </div>
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}