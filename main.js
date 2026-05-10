/* ════════════════════════════════════════════
   Ahmed Medhat Website — main.js
   ════════════════════════════════════════════ */

const WHATSAPP_NUMBER = '201118541290';
const ADMIN_PASSWORD  = 'Ahmed medhat 2002';

/* ─────────────────────────────────────────────
   JSONBIN DATABASE
───────────────────────────────────────────── */
const BIN_ID     = '6a00fac4c0954111d8047dc8';
const MASTER_KEY = '$2a$10$kvYlQK4FlV.tu6Mn6AdKeeQvAOC1FFBa5aK..1ubHEB.mKifiWqvC';
const BIN_URL    = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const DEFAULT_VIDEOS = [
  { id:1, title:'الجبر - حل المعادلات',  subtitle:'أول ثانوي',  duration:'45:20', level:'easy', type:'youtube',  ytId:'dQw4w9WgXcQ', thumb:'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
  { id:2, title:'الهندسة التحليمية',      subtitle:'تاني ثانوي', duration:'52:10', level:'mid',  type:'youtube',  ytId:'dQw4w9WgXcQ', thumb:'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
  { id:3, title:'التفاضل والتكامل',       subtitle:'تالت ثانوي', duration:'61:00', level:'hard', type:'youtube',  ytId:'dQw4w9WgXcQ', thumb:'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
  { id:4, title:'المصفوفات والمحددات',    subtitle:'تاني ثانوي', duration:'38:45', level:'mid',  type:'youtube',  ytId:'dQw4w9WgXcQ', thumb:'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
  { id:5, title:'الإحصاء والاحتمالات',   subtitle:'أول ثانوي',  duration:'44:30', level:'easy', type:'youtube',  ytId:'dQw4w9WgXcQ', thumb:'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
  { id:6, title:'المثلثات والدوال',       subtitle:'تالت ثانوي', duration:'55:15', level:'hard', type:'youtube',  ytId:'dQw4w9WgXcQ', thumb:'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
];

let videos = [...DEFAULT_VIDEOS];

/* ── Load videos from JSONBin ── */
async function loadVideos() {
  try {
    const res = await fetch(BIN_URL + '/latest', {
      headers: { 'X-Master-Key': MASTER_KEY }
    });
    const data = await res.json();
    const saved = data.record?.videos;
    if (saved && saved.length > 0) {
      videos = saved;
    } else {
      videos = [...DEFAULT_VIDEOS];
      await saveVideos(); // initialize bin with defaults
    }
  } catch(e) {
    console.warn('Load failed, using defaults', e);
    videos = [...DEFAULT_VIDEOS];
  }
  renderVideos();
  renderAdminVideos();
}

/* ── Save videos to JSONBin ── */
async function saveVideos() {
  try {
    const toSave = videos.map(v => ({...v, src: null}));
    await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY
      },
      body: JSON.stringify({ videos: toSave })
    });
  } catch(e) { console.warn('Save failed', e); }
}

let currentFilter = 'all';
const levelMap    = { easy:['level-easy','سهل'], mid:['level-mid','متوسط'], hard:['level-hard','صعب'] };
const gradeFilter = { grade1:'أول ثانوي', grade2:'تاني ثانوي', grade3:'تالت ثانوي' };

/* ─────────────────────────────────────────────
   VIDEOS — RENDER
───────────────────────────────────────────── */
function filterVideos(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderVideos();
}

function renderVideos() {
  let filtered = [...videos];
  if      (currentFilter === 'youtube')      filtered = videos.filter(v => v.type === 'youtube');
  else if (currentFilter === 'uploaded')      filtered = videos.filter(v => v.type === 'uploaded');
  else if (gradeFilter[currentFilter])        filtered = videos.filter(v => v.subtitle === gradeFilter[currentFilter]);
  const grid = document.getElementById('videosGrid');
  if (!grid) return;
  grid.innerHTML = filtered.length ? filtered.map(videoCard).join('') : '<p style="text-align:center;color:var(--text-muted);padding:3rem">لا توجد فيديوهات في هذا القسم</p>';
}

function videoCard(v) {
  const [lvlClass, lvlText] = levelMap[v.level] || ['level-easy',''];
  const thumb = v.thumb ? `<img src="${v.thumb}" alt="${v.title}">` : `<div style="font-size:3rem">&#127916;</div>`;
  return `<div class="video-card" id="vcard-${v.id}">
    <div onclick="openVideo(${v.id})" style="cursor:pointer">
      <div class="video-thumb">${thumb}
        <div class="play-overlay"><div class="play-btn">&#9654;</div></div>
        <div class="video-duration">${v.duration}</div>
        <div class="video-level ${lvlClass}">${lvlText}</div>
      </div>
    </div>
    <div class="video-info">
      <h3 onclick="openVideo(${v.id})" style="cursor:pointer">${v.title}</h3>
      <div class="video-meta">
        <span>&#128218; ${v.subtitle}</span>
        <span>${v.type === 'youtube' ? '&#9654; يوتيوب' : '&#128193; مرفوع'}</span>
      </div>
    </div>
  </div>`;
}

/* ─────────────────────────────────────────────
   VIDEOS — DELETE
───────────────────────────────────────────── */
function deleteVideo(id, e) {
  if (e) e.stopPropagation();
  if (!confirm('مؤكد تحذف الفيديو ده؟')) return;
  const i = videos.findIndex(v => v.id === id);
  if (i !== -1) videos.splice(i, 1);
  saveVideos();
  const card = document.getElementById('vcard-' + id);
  if (card) { card.style.transition='all 0.3s'; card.style.opacity='0'; card.style.transform='scale(0.85)'; setTimeout(renderVideos,300); }
  renderAdminVideos();
  showToast('تم حذف الفيديو ✓');
}

/* ─────────────────────────────────────────────
   VIDEOS — MODAL
───────────────────────────────────────────── */
function openVideo(id) {
  const v = videos.find(x => x.id === id);
  if (!v) return;
  document.getElementById('modalTitle').textContent = v.title;
  if (v.type === 'youtube' && v.ytId) {
    document.getElementById('modalBody').innerHTML = `<iframe class="modal-video" src="https://www.youtube.com/embed/${v.ytId}?autoplay=1" allow="autoplay" allowfullscreen></iframe>`;
  } else if (v.src) {
    document.getElementById('modalBody').innerHTML = `<video class="modal-video" src="${v.src}" controls autoplay style="border-radius:12px"></video>`;
  } else {
    document.getElementById('modalBody').innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-muted)">الفيديو غير متاح حالياً</div>`;
  }
  document.getElementById('modal').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal') || e.currentTarget.tagName === 'BUTTON') {
    document.getElementById('modal').classList.remove('open');
    document.getElementById('modalBody').innerHTML = '';
  }
}

/* ─────────────────────────────────────────────
   VIDEOS — UPLOAD (Public)
───────────────────────────────────────────── */
function handleUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const newV = buildUploadedVideo(file);
  videos.unshift(newV);
  saveVideos();
  renderVideos(); renderAdminVideos();
  showToast('تم رفع الفيديو ✓');
}

function addYouTube() {
  const url = prompt('الصق رابط اليوتيوب:');
  if (!url) return;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  if (!match) { showToast('رابط غير صحيح'); return; }
  const ytId  = match[1];
  const title = prompt('عنوان الفيديو:') || 'فيديو جديد';
  videos.unshift({ id:Date.now(), title, subtitle:'يوتيوب', duration:'--:--', level:'easy', type:'youtube', ytId, thumb:`https://img.youtube.com/vi/${ytId}/hqdefault.jpg` });
  saveVideos();
  renderVideos(); renderAdminVideos();
  showToast('تم إضافة الفيديو ✓');
}

function buildUploadedVideo(file) {
  return { id:Date.now(), title:file.name.replace(/\.[^.]+$/,''), subtitle:'عام', duration:'--:--', level:'easy', type:'uploaded', thumb:'', ytId:null, src:URL.createObjectURL(file) };
}

/* ─────────────────────────────────────────────
   LIVE
───────────────────────────────────────────── */
let liveLink = 'https://meet.google.com';

function joinLive() {
  const name = document.getElementById('studentName').value.trim();
  if (!name) { showToast('من فضلك اكتب اسمك أولاً'); return; }
  showToast(`مرحباً ${name}! جارٍ الانضمام... 🎥`);
  setTimeout(() => window.open(liveLink, '_blank'), 1500);
}

/* ─────────────────────────────────────────────
   CONTACT FORM → WHATSAPP
───────────────────────────────────────────── */
function sendToWhatsApp(e) {
  e.preventDefault();
  const name  = document.getElementById('cf-name').value.trim();
  const phone = document.getElementById('cf-phone').value.trim();
  const grade = document.getElementById('cf-grade').value;
  const msg   = document.getElementById('cf-msg').value.trim();

  const text = [
    '📩 رسالة جديدة من الموقع',
    '━━━━━━━━━━━━━━',
    `👤 الاسم: ${name}`,
    `📱 الموبايل: ${phone}`,
    `📚 الصف: ${grade}`,
    msg ? `💬 الرسالة: ${msg}` : '',
    '━━━━━━━━━━━━━━',
  ].filter(Boolean).join('\n');

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  e.target.reset();
  showToast('جارٍ فتح الواتساب... 📱');
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ═══════════════════════════════════════════════
   ADMIN PANEL
═══════════════════════════════════════════════ */

/* ── Login ── */
function openAdminLogin() {
  document.getElementById('adminPass').value = '';
  document.getElementById('adminError').style.display = 'none';
  document.getElementById('adminLoginModal').classList.add('open');
  setTimeout(() => document.getElementById('adminPass').focus(), 200);
}

function closeAdminLogin(e) {
  if (!e || e.target === document.getElementById('adminLoginModal') || e.currentTarget.tagName === 'BUTTON')
    document.getElementById('adminLoginModal').classList.remove('open');
}

function checkAdmin() {
  if (document.getElementById('adminPass').value === ADMIN_PASSWORD) {
    document.getElementById('adminLoginModal').classList.remove('open');
    openAdmin();
  } else {
    document.getElementById('adminError').style.display = 'block';
    document.getElementById('adminPass').value = '';
    document.getElementById('adminPass').focus();
  }
}

/* ── Panel ── */
function openAdmin() {
  document.getElementById('adminPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderAdminVideos();
}

function closeAdmin() {
  document.getElementById('adminPanel').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Tabs ── */
function switchTab(name, btn) {
  document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).style.display = 'block';
  btn.classList.add('active');
}

/* ── Videos Tab ── */
function renderAdminVideos() {
  const el = document.getElementById('adminVideosList');
  if (!el) return;
  el.innerHTML = videos.length ? videos.map(v => `
    <div class="admin-video-row" id="avrow-${v.id}">
      <div class="admin-video-thumb">${v.thumb ? `<img src="${v.thumb}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">` : '&#127916;'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px">${v.title}</div>
        <div style="color:var(--text-muted);font-size:0.8rem">${v.subtitle} · ${v.type === 'youtube' ? 'يوتيوب' : 'مرفوع'} · ${v.duration}</div>
      </div>
      <div style="display:flex;gap:0.5rem;flex-shrink:0">
        <button class="admin-action-btn edit"   onclick="editVideo(${v.id})">&#9999; تعديل</button>
        <button class="admin-action-btn delete" onclick="deleteVideo(${v.id})">&#128465; حذف</button>
      </div>
    </div>`).join('')
    : '<p style="color:var(--text-muted);text-align:center;padding:2rem">لا توجد فيديوهات بعد</p>';
}

function editVideo(id) {
  const v = videos.find(x => x.id === id);
  if (!v) return;
  const t = prompt('عنوان الفيديو:', v.title);    if (t === null) return;
  const s = prompt('الصف:', v.subtitle);            if (s === null) return;
  const l = prompt('المستوى (easy/mid/hard):', v.level); if (l === null) return;
  v.title    = t.trim() || v.title;
  v.subtitle = s.trim() || v.subtitle;
  v.level    = ['easy','mid','hard'].includes(l) ? l : v.level;
  saveVideos();
  renderVideos(); renderAdminVideos();
  showToast('تم تعديل الفيديو ✓');
}

function adminAddYouTube() {
  const url = prompt('الصق رابط اليوتيوب:');
  if (!url) return;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  if (!match) { showToast('رابط غير صحيح'); return; }
  const ytId     = match[1];
  const title    = prompt('عنوان الفيديو:')    || 'فيديو جديد';
  const subtitle = prompt('الصف:')             || 'عام';
  const level    = prompt('المستوى (easy/mid/hard):') || 'easy';
  videos.unshift({ id:Date.now(), title, subtitle, duration:'--:--', level:['easy','mid','hard'].includes(level)?level:'easy', type:'youtube', ytId, thumb:`https://img.youtube.com/vi/${ytId}/hqdefault.jpg` });
  saveVideos();
  renderVideos(); renderAdminVideos();
  showToast('تم إضافة الفيديو ✓');
}

function adminUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const newV     = buildUploadedVideo(file);
  newV.title     = prompt('عنوان الفيديو:', newV.title)           || newV.title;
  newV.subtitle  = prompt('الصف:', 'أول ثانوي')                   || 'عام';
  newV.level     = prompt('المستوى (easy/mid/hard):', 'easy')      || 'easy';
  if (!['easy','mid','hard'].includes(newV.level)) newV.level = 'easy';
  videos.unshift(newV);
  saveVideos();
  renderVideos(); renderAdminVideos();
  showToast('تم رفع الفيديو ✓');
}

/* ── Pricing Tab ── */
function savePricing() {
  const p1 = document.getElementById('price1').value;
  const p2 = document.getElementById('price2').value;
  const p3 = document.getElementById('price3').value;
  const cards = document.querySelectorAll('.price-card');
  const nonFeatured = [...cards].filter(c => !c.classList.contains('featured'));
  if (nonFeatured[0]) nonFeatured[0].querySelector('.price-amount').innerHTML = `${p1} <span>ج.م</span>`;
  const featured = document.querySelector('.price-card.featured');
  if (featured) featured.querySelector('.price-amount').innerHTML = `${p2} <span>ج.م/شهر</span>`;
  if (nonFeatured[1]) nonFeatured[1].querySelector('.price-amount').innerHTML = `${p3} <span>ج.م/ترم</span>`;
  // WhatsApp links
  const links = document.querySelectorAll('.whatsapp-btn');
  if (links[0]) links[0].href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً أستاذ أحمد، أريد حجز باقة المحاضرة الواحدة (' + p1 + ' ج.م)')}`;
  if (links[1]) links[1].href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً أستاذ أحمد، أريد الاشتراك في الباقة الشهرية (' + p2 + ' ج.م/شهر)')}`;
  if (links[2]) links[2].href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً أستاذ أحمد، أريد حجز باقة الترم كامل (' + p3 + ' ج.م)')}`;
  showToast('تم حفظ الأسعار ✓');
}

/* ── Schedule Tab ── */
function saveSchedule() {
  const sCards = document.querySelectorAll('.schedule-card');
  [1,2,3].forEach((n, i) => {
    const card = sCards[i]; if (!card) return;
    card.querySelector('.day').textContent  = document.getElementById('day'+n).value;
    card.querySelector('.time').textContent = document.getElementById('time'+n).value;
    card.querySelector('h4').textContent    = document.getElementById('title'+n).value;
    card.querySelector('p').textContent     = document.getElementById('sub'+n).value;
    const status = document.getElementById('status'+n).value;
    const tag = card.querySelector('.live-tag');
    if (status === 'live') {
      tag.textContent = 'مباشر الآن';
      tag.style.cssText = 'background:rgba(46,204,113,0.15);border-color:rgba(46,204,113,0.4);color:#2ECC71;margin-right:auto;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;border:1px solid';
    } else {
      tag.textContent = 'قريباً';
      tag.style.cssText = '';
    }
  });
  const ml = document.getElementById('meetLink').value;
  if (ml) liveLink = ml;
  showToast('تم حفظ الجدول ✓');
}

/* ── Info Tab ── */
function saveInfo() {
  const name = document.getElementById('infoName').value;
  const role = document.getElementById('infoRole').value;
  const wa   = document.getElementById('infoWA').value;
  const fb   = document.getElementById('infoFB').value;
  const yt   = document.getElementById('infoYT').value;
  const e1 = document.getElementById('card-name');   if (e1) e1.textContent = name;
  const e2 = document.getElementById('card-role');   if (e2) e2.textContent = role;
  const e3 = document.getElementById('hero-subtitle');if (e3) e3.textContent = role;
  document.querySelector('.nav-logo').textContent = 'أ. ' + name.split(' ').slice(0,2).join(' ');
  // Stats
  const sn = [...document.querySelectorAll('.stat-num')];
  if (sn[0]) sn[0].textContent = document.getElementById('statStudents').value;
  if (sn[1]) sn[1].textContent = document.getElementById('statVideos').value;
  if (sn[2]) sn[2].textContent = document.getElementById('statRating').value;
  // Links
  document.querySelectorAll('a[href*="wa.me"]').forEach(l => { l.href = `https://wa.me/${wa}`; });
  const fbL = document.querySelector('a[href*="facebook"]'); if (fbL) fbL.href = fb;
  const ytL = document.querySelector('.contact-link[href*="youtube"]'); if (ytL) ytL.href = yt;
  showToast('تم حفظ المعلومات ✓');
}

/* ═══════════════════════════════════════════════
   LANGUAGE TOGGLE
═══════════════════════════════════════════════ */
let isAr = true;
const translations = {
  'hero-badge-text':['متاح للحجز الآن','Available for Booking'],
  'hero-name':['أحمد مدحت<br><span>محمد</span>','Ahmed Medhat<br><span>Mohamed</span>'],
  'hero-subtitle':['مدرس رياضيات لغات تجريبي · مهندس مدني','Experimental Math Teacher · Civil Engineer'],
  'stat1':['طالب','Students'],'stat2':['فيديو','Videos'],'stat3':['تقييم','Rating'],
  'hero-btn1':['🎥 ابدأ التعلم','🎥 Start Learning'],'hero-btn2':['تواصل معنا','Contact Us'],
  'card-name':['أحمد مدحت محمد','Ahmed Medhat Mohamed'],
  'card-role':['مدرس رياضيات · مهندس مدني','Math Teacher · Civil Engineer'],
  'tag1':['رياضيات لغات','Languages Math'],'tag2':['هندسة مدنية','Civil Engineering'],
  'tag3':['تجريبي','Experimental'],'tag4':['بكالوريوس','BSc'],
  'live-label':['البث المباشر','Live Sessions'],'live-title':['احضر المحاضرة Live','Attend Live Lectures'],
  'live-h2':['انضم للمحاضرة الآن','Join the Lecture Now'],
  'live-desc':['سجّل اسمك وانضم فوراً للبث المباشر','Register your name and join instantly'],
  'join-btn':['انضم الآن 🔴','Join Now 🔴'],
  'sched1-title':['رياضيات الصف الأول الثانوي','First Secondary Math'],
  'sched2-title':['رياضيات الثانوي العام','Secondary General Math'],
  'sched3-title':['رياضيات هندسية متقدمة','Advanced Engineering Math'],
  'videos-label':['المكتبة التعليمية','Video Library'],'videos-title':['الفيديوهات التعليمية','Educational Videos'],
  'f-all':['الكل','All'],'f-yt':['YouTube','YouTube'],'f-up':['مرفوع مباشر','Uploaded'],
  'f-g1':['أول ثانوي','1st Sec'],'f-g2':['تاني ثانوي','2nd Sec'],'f-g3':['تالت ثانوي','3rd Sec'],
  'upload-text':['ارفع فيديو جديد أو أضف رابط YouTube','Upload a new video or add a YouTube link'],
  'add-yt-btn':['+ رابط YouTube','+ YouTube Link'],'upload-btn':['+ رفع فيديو','+ Upload Video'],
  'about-h2':['من أنا؟ <span>أحمد مدحت</span>','About <span>Ahmed Medhat</span>'],
  'about-p1':['مدرس رياضيات لغات تجريبي مع خبرة واسعة في تبسيط المفاهيم الصعبة.','Experimental math teacher with extensive experience simplifying complex concepts.'],
  'about-p2':['بالإضافة لذلك، أنا مهندس مدني مما يجعل شرحي مرتبطاً بالتطبيق العملي.','Additionally, as a civil engineer, my explanations are linked to real-world applications.'],
  'sk1':['رياضيات ثانوي','Secondary Math'],'sk2':['هندسة تحليلية','Analytical Geometry'],
  'sk3':['التفاضل والتكامل','Calculus'],'sk4':['ميكانيكا هندسية','Engineering Mechanics'],
  'cert1-h':['بكالوريوس هندسة مدنية','BSc Civil Engineering'],'cert1-p':['مهندس مرخص','Licensed Engineer'],
  'cert2-h':['مدرس رياضيات لغات','Languages Math Teacher'],'cert2-p':['تجريبي معتمد','Certified Experimental'],
  'cert3-h':['+500 طالب ناجح','+500 Successful Students'],'cert3-p':['نتائج ممتازة','Excellent Results'],
  'cert4-h':['تقييم 5 نجوم','5-Star Rating'],'cert4-p':['من آراء الطلاب','From Student Reviews'],
  'pricing-label':['الأسعار','Pricing'],'pricing-title':['اختر باقتك','Choose Your Plan'],
  'feat-badge':['الأكثر طلباً ⭐','Most Popular ⭐'],
  'p1-name':['باقة المحاضرة الواحدة','Single Lecture'],'p1-cur':['ج.م','EGP'],
  'p2-name':['الباقة الشهرية','Monthly Plan'],'p2-cur':['ج.م/شهر','EGP/mo'],
  'p3-name':['باقة الترم كامل','Full Term Plan'],'p3-cur':['ج.م/ترم','EGP/term'],
  'pf1-1':['محاضرة لايف','Live Lecture'],'pf1-2':['تسجيل المحاضرة','Recording'],'pf1-3':['مذكرة PDF','PDF Notes'],
  'pf2-1':['8 محاضرات لايف','8 Live Lectures'],'pf2-2':['كل التسجيلات','All Recordings'],
  'pf2-3':['مذكرات ومراجعات','Notes & Reviews'],'pf2-4':['تواصل مباشر','Direct Contact'],'pf2-5':['واجبات وتصحيح','HW & Correction'],
  'pf3-1':['كل المحاضرات','All Lectures'],'pf3-2':['تسجيل كامل','Full Recording'],
  'pf3-3':['مراجعات نهائية','Final Reviews'],'pf3-4':['دعم مستمر','Continuous Support'],'pf3-5':['اختبارات تجريبية','Mock Exams'],
  'p1-btn':['احجز الآن','Book Now'],'p2-btn':['ابدأ الآن','Start Now'],'p3-btn':['احجز الآن','Book Now'],
  'contact-label':['التواصل','Contact'],'contact-title':['تواصل معنا','Get in Touch'],
  'contact-h2':['نحن هنا لمساعدتك',"We're Here to Help"],
  'contact-desc':['لأي استفسار — تواصل معنا فوراً','For any inquiries — contact us immediately'],
  'cl1':['واتساب','WhatsApp'],'cl2':['فيسبوك','Facebook'],'cl3':['يوتيوب','YouTube'],
  'fl-name':['الاسم','Name'],'fl-phone':['رقم الموبايل','Phone Number'],
  'fl-grade':['الصف الدراسي','Grade'],'fl-msg':['رسالتك','Your Message'],
  'g-opt0':['اختر الصف...','Select grade...'],'g-opt1':['أول ثانوي','1st Secondary'],
  'g-opt2':['ثاني ثانوي','2nd Secondary'],'g-opt3':['ثالث ثانوي','3rd Secondary'],
  'submit-btn':['إرسال الرسالة 📨','Send Message 📨'],
  'nav-live':['البث المباشر','Live'],'nav-videos':['الفيديوهات','Videos'],
  'nav-about':['عني','About'],'nav-pricing':['الأسعار','Pricing'],'nav-contact':['التواصل','Contact'],
  'footer-text':['© 2025 <span>أحمد مدحت محمد</span> · جميع الحقوق محفوظة','© 2025 <span>Ahmed Medhat Mohamed</span> · All Rights Reserved'],
};

function toggleLang() {
  isAr = !isAr;
  document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
  document.documentElement.lang = isAr ? 'ar'  : 'en';
  document.querySelector('.lang-btn').textContent = isAr ? 'EN' : 'عربي';
  document.querySelector('.nav-logo').textContent = isAr ? 'أ. أحمد مدحت' : 'A. Ahmed Medhat';
  const idx = isAr ? 0 : 1;
  Object.entries(translations).forEach(([id, vals]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = vals[idx];
  });
  const sn = document.getElementById('studentName');
  if (sn) sn.placeholder = isAr ? 'اسمك الكريم...' : 'Your name...';
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  // Show loading indicator
  const grid = document.getElementById('videosGrid');
  if (grid) grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:3rem">⏳ جارٍ تحميل الفيديوهات...</p>';
  loadVideos();
});

/* ─── SECRET ADMIN SHORTCUT: Ctrl + Shift + A ─── */
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    openAdminLogin();
  }
});

/* ─── SECRET ADMIN: LOGO TRIPLE CLICK ─── */
let logoClicks = 0, logoTimer;
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    logo.addEventListener('click', () => {
      logoClicks++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoClicks = 0; }, 800);
      if (logoClicks >= 3) { logoClicks = 0; openAdminLogin(); }
    });
  }
});
