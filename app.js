/* =========================
   SYSTEM: Midnight Route (Anime VN Edition)
   - Branching story + autosave
   - Background images per scene
   - Character portraits (left/right)
   - BGM/SFX
   - Screen FX (flash red, shake)
========================= */

const STORAGE_KEY = "midnight_route_save_v2";

const $ = (id) => document.getElementById(id);

const ui = {
  badge: $("badge"),
  sceneTitle: $("sceneTitle"),
  speaker: $("speaker"),
  text: $("text"),
  choices: $("choices"),
  btnNext: $("btnNext"),
  btnBack: $("btnBack"),
  btnReset: $("btnReset"),
  btnToggleSfx: $("btnToggleSfx"),
  btnToggleBgm: $("btnToggleBgm"),
  saveStatus: $("saveStatus"),
  progress: $("progress"),
  bg: $("bg"),

  // VN layers
  bgImage: $("bgImage"),
  leftPortrait: $("leftPortrait"),
  rightPortrait: $("rightPortrait"),
  stage: $("stage"),

  // audio
  sfxClick: $("sfxClick"),
  sfxAlert: $("sfxAlert"),
  sfxWhoosh: $("sfxWhoosh"),
  bgm: $("bgm"),
};

let state = {
  nodeId: "start",
  lineIndex: 0,
  history: [],
  sfx: true,
  bgm: true,
  typed: false,
};

/* ---------- UI helpers ---------- */
function setBadgeMood(mood) {
  const b = ui.badge;
  b.style.borderColor =
    mood === "red" ? "rgba(255,92,122,.45)" :
    mood === "purple" ? "rgba(176,124,255,.45)" :
    "rgba(77,163,255,.45)";

  b.style.background =
    mood === "red" ? "rgba(255,92,122,.10)" :
    mood === "purple" ? "rgba(176,124,255,.12)" :
    "rgba(77,163,255,.12)";
}

function setNameMood(mood) {
  ui.speaker.style.color =
    mood === "red" ? "var(--red)" :
    mood === "purple" ? "var(--purple)" :
    "var(--blue)";
}

function setBgPreset(preset) {
  if (preset === "red") {
    ui.bg.style.background =
      "radial-gradient(900px 500px at 70% 20%, rgba(255,92,122,.35), transparent 55%)," +
      "radial-gradient(800px 450px at 25% 70%, rgba(176,124,255,.18), transparent 55%)," +
      "linear-gradient(180deg, rgba(7,10,18,.25), rgba(7,10,18,.88))";
  } else if (preset === "purple") {
    ui.bg.style.background =
      "radial-gradient(900px 500px at 70% 20%, rgba(176,124,255,.42), transparent 55%)," +
      "radial-gradient(800px 450px at 25% 70%, rgba(77,163,255,.18), transparent 55%)," +
      "linear-gradient(180deg, rgba(7,10,18,.25), rgba(7,10,18,.88))";
  } else {
    ui.bg.style.background =
      "radial-gradient(900px 500px at 70% 20%, rgba(77,163,255,.35), transparent 55%)," +
      "radial-gradient(800px 450px at 25% 70%, rgba(176,124,255,.18), transparent 55%)," +
      "linear-gradient(180deg, rgba(7,10,18,.25), rgba(7,10,18,.88))";
  }
}

/* ---------- VN helpers ---------- */
function playSfx(audioEl) {
  if (!state.sfx || !audioEl) return;
  try {
    audioEl.currentTime = 0;
    audioEl.play();
  } catch {}
}

function playClick() {
  playSfx(ui.sfxClick);
}

function setBackgroundImage(path) {
  if (!ui.bgImage) return;
  if (!path) {
    ui.bgImage.style.backgroundImage = "";
    ui.bgImage.style.opacity = "0";
    return;
  }
  ui.bgImage.style.backgroundImage = `url("${path}")`;
  ui.bgImage.style.opacity = ".62";
}

function setPortraits({ left = null, right = null, focus = "left" } = {}) {
  if (!ui.leftPortrait || !ui.rightPortrait) return;

  const L = ui.leftPortrait;
  const R = ui.rightPortrait;

  if (left) {
    L.src = left;
    L.classList.add("show");
  } else {
    L.classList.remove("show", "dim");
    L.removeAttribute("src");
  }

  if (right) {
    R.src = right;
    R.classList.add("show");
  } else {
    R.classList.remove("show", "dim");
    R.removeAttribute("src");
  }

  L.classList.remove("dim");
  R.classList.remove("dim");

  if (left && right) {
    if (focus === "left") R.classList.add("dim");
    if (focus === "right") L.classList.add("dim");
  }
}

function screenShake() {
  if (!ui.stage) return;
  ui.stage.classList.add("shake");
  setTimeout(() => ui.stage.classList.remove("shake"), 450);
}

function flashRed(ms = 170) {
  if (!ui.stage) return;
  ui.stage.classList.add("flash-red");
  setTimeout(() => ui.stage.classList.remove("flash-red"), ms);
}

function setBgm(src) {
  if (!ui.bgm) return;
  if (!src) {
    try { ui.bgm.pause(); } catch {}
    return;
  }

  const current = ui.bgm.getAttribute("data-src");
  if (current === src) return;

  ui.bgm.setAttribute("data-src", src);
  ui.bgm.src = src;

  if (state.bgm) {
    ui.bgm.volume = 0.65;
    ui.bgm.play().catch(() => {});
  }
}

/* ---------- Typewriter ---------- */
let typingTimer = null;

function typeText(fullText) {
  clearInterval(typingTimer);
  ui.text.textContent = "";
  state.typed = false;

  let i = 0;
  const speed = 14;

  typingTimer = setInterval(() => {
    ui.text.textContent += fullText[i] || "";
    i++;
    if (i >= fullText.length) {
      clearInterval(typingTimer);
      state.typed = true;
    }
  }, speed);
}
/* =========================
   STORY DATA
   - Death Router System
   - Evelyn: penasaran, nakal, tapi tajam
========================= */

const story = {
  start: {
    title: "Boot Sequence",
    badge: "SYSTEM",
    bgPreset: "blue",
    bgImage: "assets/bg/school_hall.jpg",
    bgm: "assets/bgm/midnight_loop.mp3",
    portraits: { left: "assets/char/mc_shadow.png", right: null, focus: "left" },
    lines: [
      { who: "SYSTEM", mood: "blue", text: "Koneksi stabil. Sensor aktif." },
      { who: "SYSTEM", mood: "blue", text: "Nama pengguna: [UNREGISTERED]." },
      { who: "SYSTEM", mood: "purple", text: "Death Router System terdeteksi. Rute akan dipilih otomatis berdasarkan keputusanmu." },
      { who: "SYSTEM", mood: "blue", text: "Kamu berdiri di lorong sekolah kosong. Lampu berkedip, seperti opening anime horror—tapi… terlalu sunyi." },
      { who: "SYSTEM", mood: "blue", text: "Di lantai, ada kartu akses bertuliskan: 'AREL'." }
    ],
    choices: [
      { text: "Ambil kartu akses", to: "take_card" },
      { text: "Abaikan dan jalan ke kelas", to: "enter_class" }
    ]
  },

  take_card: {
    title: "Access Granted",
    badge: "SYSTEM",
    bgPreset: "purple",
    bgImage: "assets/bg/school_hall.jpg",
    portraits: { left: "assets/char/mc_shadow.png", right: null, focus: "left" },
    lines: [
      { who: "KAMU", mood: "blue", text: "Aku ambil kartu itu. Dingin banget." },
      { who: "SYSTEM", mood: "purple", text: "ID terdeteksi: AREL." },
      { who: "SYSTEM", mood: "purple", text: "Modul terbuka: 'INSIGHT' — membaca pola bahaya (10 detik)." },
      { who: "SYSTEM", mood: "blue", text: "Suara langkah muncul dari belakangmu… pelan, tapi makin dekat." }
    ],
    choices: [
      { text: "Aktifkan INSIGHT", to: "insight" },
      { text: "Lari masuk ke kelas", to: "enter_class" }
    ]
  },

  insight: {
    title: "INSIGHT (10s)",
    badge: "WARNING",
    bgPreset: "red",
    bgImage: "assets/bg/corridor_red.jpg",
    bgm: "assets/bgm/tension_loop.mp3",
    portraits: { left: "assets/char/mc_shadow.png", right: null, focus: "left" },
    fx: ["flashRed", "shake", "alert"],
    lines: [
      { who: "SYSTEM", mood: "red", text: "INSIGHT: AKTIF (10…9…8…)" },
      { who: "SYSTEM", mood: "red", text: "Bahaya utama: 'Penjaga Lorong' — menyerang dari sisi kiri." },
      { who: "SYSTEM", mood: "red", text: "Jalur aman: masuk kelas + kunci dari dalam." },
      { who: "SYSTEM", mood: "blue", text: "Kamu melihat bayangan tinggi di kiri. Ini… bukan manusia." }
    ],
    choices: [
      { text: "Masuk kelas dan kunci", to: "lock_in" },
      { text: "Hadapi bayangan (nekat)", to: "bad_end_1" }
    ]
  },

  lock_in: {
    title: "Safe… for Now",
    badge: "SYSTEM",
    bgPreset: "purple",
    bgImage: "assets/bg/classroom_night.jpg",
    portraits: { left: "assets/char/mc_shadow.png", right: null, focus: "left" },
    lines: [
      { who: "SYSTEM", mood: "purple", text: "Pintu terkunci." },
      { who: "SYSTEM", mood: "blue", text: "Suara dari luar berhenti. Sunyi—terlalu sunyi." },
      { who: "SYSTEM", mood: "purple", text: "Selamat. Kamu lolos gerbang pertama." },
      { who: "SYSTEM", mood: "blue", text: "Tapi ini bukan mimpi. Ini rute. Dan rute… bisa berubah." }
    ],
    choices: [
      { text: "Lanjut (masuk kelas)", to: "enter_class" }
    ]
  },

  enter_class: {
    title: "Classroom",
    badge: "SYSTEM",
    bgPreset: "blue",
    bgImage: "assets/bg/classroom_night.jpg",
    bgm: "assets/bgm/midnight_loop.mp3",
    portraits: { left: null, right: "assets/char/evelyn_neutral.png", focus: "right" },
    lines: [
      { who: "SYSTEM", mood: "blue", text: "Di papan tulis: 'Pilih satu — diam atau percaya'." },
      { who: "SYSTEM", mood: "blue", text: "Di pojok kelas, cewek rambut hitam panjang duduk santai. Matanya tajam, tapi senyumnya… nakal." },
      { who: "???", mood: "purple", text: "Kamu telat. Harusnya Death Router udah nge-lock kamu di lorong." },
      { who: "???", mood: "purple", text: "Tapi kamu malah masuk sini. Keren." }
    ],
    choices: [
      { text: "Tanya: 'Kamu siapa?'", to: "meet_evelyn" },
      { text: "Diam. Amati dulu", to: "observe" }
    ]
  },

  observe: {
    title: "Cold Read",
    badge: "SYSTEM",
    bgPreset: "blue",
    bgImage: "assets/bg/classroom_night.jpg",
    portraits: { left: null, right: "assets/char/evelyn_neutral.png", focus: "right" },
    lines: [
      { who: "SYSTEM", mood: "blue", text: "Kamu memilih diam. Mata kamu ngambil detail kecil." },
      { who: "SYSTEM", mood: "blue", text: "Kuku jarinya ada noda tinta—dia tipe yang suka nulis, bukan cuma ngomong." },
      { who: "???", mood: "purple", text: "Hei… kamu pendiam ya? Lucu." },
      { who: "???", mood: "purple", text: "Kalau kamu terus diam, sistem bakal nganggep kamu 'pasif'… dan itu biasanya… mati." }
    ],
    choices: [
      { text: "Oke… ngomong", to: "meet_evelyn" },
      { text: "Tetap diam (keras kepala)", to: "bad_end_2" }
    ]
  },

  meet_evelyn: {
    title: "Evelyn",
    badge: "SYSTEM",
    bgPreset: "purple",
    bgImage: "assets/bg/classroom_night.jpg",
    portraits: { left: null, right: "assets/char/evelyn_serious.png", focus: "right" },
    lines: [
      { who: "KAMU", mood: "blue", text: "Kamu siapa?" },
      { who: "EVELYN", mood: "purple", text: "Evelyn. Aku di sini duluan." },
      { who: "EVELYN", mood: "purple", text: "Dan kamu… kayaknya pemain yang salah nyasar ke rute berbahaya." },
      { who: "EVELYN", mood: "purple", text: "Tenang. Aku penasaran sama kamu. Jadi… aku belum mau kamu mati dulu." }
    ],
    choices: [
      { text: "Percaya Evelyn (Trust Route)", to: "trust" },
      { text: "Nggak percaya. Aku jalan sendiri (Solo Route)", to: "solo" }
    ]
  },

  trust: {
    title: "Trust Route",
    badge: "SYSTEM",
    bgPreset: "purple",
    bgImage: "assets/bg/school_hall.jpg",
    portraits: { left: "assets/char/mc_shadow.png", right: "assets/char/evelyn_neutral.png", focus: "right" },
    lines: [
      { who: "EVELYN", mood: "purple", text: "Bagus. Kita bikin rute ini kacauin balik." },
      { who: "EVELYN", mood: "purple", text: "Tapi aturan pertama: jangan percaya suara yang bilang 'pilih pintu ini'." },
      { who: "SYSTEM", mood: "red", text: "Peringatan: Death Router mendeteksi kolaborasi. Rute akan dinaikkan tingkat kesulitannya." },
      { who: "EVELYN", mood: "purple", text: "Heh. Sistemnya cemburu." }
    ],
    choices: [
      { text: "Lanjut Episode 2", to: "ep2_gate" }
    ]
  },

  solo: {
    title: "Solo Route",
    badge: "SYSTEM",
    bgPreset: "blue",
    bgImage: "assets/bg/school_hall.jpg",
    portraits: { left: "assets/char/mc_shadow.png", right: "assets/char/evelyn_serious.png", focus: "left" },
    lines: [
      { who: "EVELYN", mood: "purple", text: "Yaudah. Tapi jangan nyesel." },
      { who: "SYSTEM", mood: "blue", text: "Kamu keluar kelas. Lorong jadi lebih panjang dari sebelumnya." },
      { who: "SYSTEM", mood: "red", text: "Peringatan: Solo Route punya tingkat kematian lebih tinggi." }
    ],
    choices: [
      { text: "Lanjut Episode 2", to: "ep2_gate" }
    ]
  },

  ep2_gate: {
    title: "Episode 2 — Router Split",
    badge: "SYSTEM",
    bgPreset: "red",
    bgImage: "assets/bg/corridor_red.jpg",
    bgm: "assets/bgm/tension_loop.mp3",
    portraits: { left: "assets/char/mc_shadow.png", right: "assets/char/evelyn_neutral.png", focus: "right" },
    fx: ["flashRed", "alert"],
    lines: [
      { who: "SYSTEM", mood: "red", text: "ROUTER SPLIT: Dua pintu muncul." },
      { who: "SYSTEM", mood: "red", text: "Pintu A: 'MEMORY TAX' — bayar ingatan paling berharga." },
      { who: "SYSTEM", mood: "red", text: "Pintu B: 'TRUTH DARE' — jawab jujur, atau sistem yang jawab." },
      { who: "EVELYN", mood: "purple", text: "Aku suka yang bahaya. Tapi aku juga suka hidup." },
      { who: "EVELYN", mood: "purple", text: "Kamu pilih yang mana?" }
    ],
    choices: [
      { text: "Pintu A — MEMORY TAX", to: "memory_tax" },
      { text: "Pintu B — TRUTH DARE", to: "truth_dare" }
    ]
  },

  memory_tax: {
    title: "MEMORY TAX",
    badge: "WARNING",
    bgPreset: "purple",
    bgImage: "assets/bg/classroom_night.jpg",
    portraits: { left: "assets/char/mc_shadow.png", right: "assets/char/evelyn_serious.png", focus: "left" },
    lines: [
      { who: "SYSTEM", mood: "purple", text: "Pajak ingatan dimulai." },
      { who: "SYSTEM", mood: "purple", text: "Pilih: ingatan paling kamu lindungi — atau sistem akan mengambil acak." },
      { who: "EVELYN", mood: "purple", text: "Kalau salah pilih… kamu bisa lupa siapa kamu." }
    ],
    choices: [
      { text: "Serahkan ingatan 'nama seseorang'", to: "tbc" },
      { text: "Tolak dan biarkan sistem pilih acak", to: "bad_end_3" }
    ]
  },

  truth_dare: {
    title: "TRUTH DARE",
    badge: "SYSTEM",
    bgPreset: "blue",
    bgImage: "assets/bg/school_hall.jpg",
    portraits: { left: "assets/char/mc_shadow.png", right: "assets/char/evelyn_neutral.png", focus: "right" },
    lines: [
      { who: "SYSTEM", mood: "blue", text: "Pertanyaan: 'Apa yang paling kamu takutkan… kalau harus bergantung pada orang lain?'" },
      { who: "EVELYN", mood: "purple", text: "Wah. Ini kayak nembak karakter kamu banget." },
      { who: "EVELYN", mood: "purple", text: "Jawab jujur. Aku pengin lihat reaksimu." }
    ],
    choices: [
      { text: "Jawab jujur", to: "tbc" },
      { text: "Boong", to: "bad_end_4" }
    ]
  },

  bad_end_1: {
    title: "Bad End",
    badge: "WARNING",
    bgPreset: "red",
    bgImage: "assets/bg/corridor_red.jpg",
    bgm: "assets/bgm/tension_loop.mp3",
    portraits: { left: "assets/char/mc_shadow.png", right: null, focus: "left" },
    fx: ["flashRed", "shake", "alert"],
    lines: [
      { who: "SYSTEM", mood: "red", text: "Kamu menghadapi bayangan." },
      { who: "SYSTEM", mood: "red", text: "Salah keputusan. Layar jadi gelap." },
      { who: "SYSTEM", mood: "red", text: "BAD END #1 — 'Bravery Without Plan'." }
    ],
    choices: [
      { text: "Coba lagi dari awal", to: "start", resetHistory: true }
    ]
  },

  bad_end_2: {
    title: "Bad End",
    badge: "WARNING",
    bgPreset: "red",
    bgImage: "assets/bg/classroom_night.jpg",
    portraits: { left: null, right: "assets/char/evelyn_serious.png", focus: "right" },
    fx: ["flashRed", "alert"],
    lines: [
      { who: "SYSTEM", mood: "red", text: "Kamu tetap diam." },
      { who: "SYSTEM", mood: "red", text: "Label: PASSIVE." },
      { who: "SYSTEM", mood: "red", text: "BAD END #2 — 'Silence Kills'." }
    ],
    choices: [
      { text: "Coba lagi (masuk kelas)", to: "enter_class", resetHistory: true }
    ]
  },

  bad_end_3: {
    title: "Bad End",
    badge: "WARNING",
    bgPreset: "red",
    bgImage: "assets/bg/classroom_night.jpg",
    fx: ["flashRed", "shake", "alert"],
    lines: [
      { who: "SYSTEM", mood: "red", text: "Sistem mengambil ingatan acak." },
      { who: "SYSTEM", mood: "red", text: "Kamu lupa… alasan kamu bertahan." },
      { who: "SYSTEM", mood: "red", text: "BAD END #3 — 'Hollow Survivor'." }
    ],
    choices: [
      { text: "Coba lagi (Router Split)", to: "ep2_gate", resetHistory: true }
    ]
  },

  bad_end_4: {
    title: "Bad End",
    badge: "WARNING",
    bgPreset: "red",
    bgImage: "assets/bg/school_hall.jpg",
    fx: ["flashRed", "alert"],
    lines: [
      { who: "SYSTEM", mood: "red", text: "Deteksi: kebohongan." },
      { who: "SYSTEM", mood: "red", text: "Death Router membenci data palsu." },
      { who: "SYSTEM", mood: "red", text: "BAD END #4 — 'False Input'." }
    ],
    choices: [
      { text: "Coba lagi (Truth Dare)", to: "truth_dare", resetHistory: true }
    ]
  },

  tbc: {
    title: "To Be Continued",
    badge: "SYSTEM",
    bgPreset: "purple",
    bgImage: "assets/bg/school_hall.jpg",
    portraits: { left: "assets/char/mc_shadow.png", right: "assets/char/evelyn_neutral.png", focus: "right" },
    lines: [
      { who: "SYSTEM", mood: "purple", text: "Episode berikutnya belum ditulis." },
      { who: "EVELYN", mood: "purple", text: "Kamu mau lanjut bikin Episode 3? Aku punya ide nakal." }
    ],
    choices: [
      { text: "Balik ke awal", to: "start", resetHistory: true }
    ]
  },
};
/* =========================
   SAVE / LOAD + PROGRESS + RENDER
========================= */

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
  if (ui.saveStatus) ui.saveStatus.textContent = "Saved";
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.nodeId) {
      state = { ...state, ...parsed };
      return true;
    }
  } catch {}
  return false;
}

function currentNode() {
  return story[state.nodeId];
}

function setProgress() {
  const visited = new Set(state.history.map((h) => h.nodeId));
  visited.add(state.nodeId);
  const total = Object.keys(story).length;
  const pct = Math.min(99, Math.round((visited.size / total) * 100));
  if (ui.progress) ui.progress.textContent = `${pct}%`;
}

function applyNodeConfig(node) {
  setBgPreset(node.bgPreset || "blue");
  setBackgroundImage(node.bgImage || null);
  setPortraits(node.portraits || {});
  if (node.bgm) setBgm(node.bgm);

  if (node.fx && state.lineIndex === 0) {
    node.fx.forEach((f) => {
      if (f === "shake") screenShake();
      if (f === "flashRed") flashRed(170);
      if (f === "alert") playSfx(ui.sfxAlert);
    });
  }
}

function render() {
  const node = currentNode();
  if (!node) return;

  if (ui.sceneTitle) ui.sceneTitle.textContent = node.title || state.nodeId;
  if (ui.badge) ui.badge.textContent = node.badge || "SYSTEM";

  applyNodeConfig(node);

  ui.btnBack.disabled = state.history.length === 0;
  ui.btnNext.style.display = "inline-block";
  ui.choices.innerHTML = "";

  const line = (node.lines && node.lines[state.lineIndex]) || null;

  if (line) {
    const mood = line.mood || "blue";
    setBadgeMood(mood);
    setNameMood(mood);

    ui.speaker.textContent = line.who || "SYSTEM";
    typeText(line.text || "");

    ui.btnNext.onclick = () => {
      playClick();

      // tap to skip typewriter
      if (!state.typed) {
        clearInterval(typingTimer);
        ui.text.textContent = line.text || "";
        state.typed = true;
        return;
      }
      goNextLineOrChoices();
    };
  } else {
    goToChoices();
  }

  setProgress();
  save();
}

function goNextLineOrChoices() {
  const node = currentNode();
  const nextIndex = state.lineIndex + 1;

  if (node.lines && nextIndex < node.lines.length) {
    state.lineIndex = nextIndex;
    render();
  } else {
    goToChoices();
  }
}

function goToChoices() {
  const node = currentNode();
  ui.btnNext.style.display = "none";

  ui.choices.innerHTML = "";
  const choices = node.choices || [];

  choices.forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.textContent = c.text;

    btn.onclick = () => {
      playClick();
      // whoosh for VN feel
      playSfx(ui.sfxWhoosh);

      if (c.resetHistory) state.history = [];
      goToNode(c.to, false);
    };

    ui.choices.appendChild(btn);
  });

  if (choices.length === 0) {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.textContent = "Kembali ke awal";
    btn.onclick = () => goToNode("start", true);
    ui.choices.appendChild(btn);
  }

  save();
}
/* =========================
   NAVIGATION + EVENTS + INIT
========================= */

function goToNode(nodeId, resetHistory = false) {
  const prev = { nodeId: state.nodeId, lineIndex: state.lineIndex };
  if (!resetHistory) state.history.push(prev);

  state.nodeId = nodeId;
  state.lineIndex = 0;
  render();
}

function goBack() {
  const last = state.history.pop();
  if (!last) return;
  state.nodeId = last.nodeId;
  state.lineIndex = last.lineIndex;
  render();
}

function resetAll() {
  const keepSfx = state.sfx;
  const keepBgm = state.bgm;
  state = {
    nodeId: "start",
    lineIndex: 0,
    history: [],
    sfx: keepSfx,
    bgm: keepBgm,
    typed: false,
  };

  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  render();
}

/* ---------- Events ---------- */
ui.btnBack.addEventListener("click", () => {
  playClick();
  playSfx(ui.sfxWhoosh);
  goBack();
});

ui.btnReset.addEventListener("click", () => {
  playClick();
  resetAll();
});

ui.btnToggleSfx.addEventListener("click", () => {
  state.sfx = !state.sfx;
  ui.btnToggleSfx.textContent = `SFX: ${state.sfx ? "ON" : "OFF"}`;
  save();
});

if (ui.btnToggleBgm) {
  ui.btnToggleBgm.addEventListener("click", () => {
    state.bgm = !state.bgm;
    ui.btnToggleBgm.textContent = `BGM: ${state.bgm ? "ON" : "OFF"}`;

    if (state.bgm) ui.bgm.play().catch(() => {});
    else ui.bgm.pause();

    save();
  });
}

/* Autoplay fix: start BGM after first user gesture */
document.addEventListener("click", () => {
  if (state.bgm && ui.bgm && ui.bgm.paused) ui.bgm.play().catch(() => {});
}, { once: true });

(function init() {
  const loaded = load();

  ui.btnToggleSfx.textContent = `SFX: ${state.sfx ? "ON" : "OFF"}`;
  if (ui.btnToggleBgm) ui.btnToggleBgm.textContent = `BGM: ${state.bgm ? "ON" : "OFF"}`;

  if (!loaded) state.nodeId = "start";
  render();
})();