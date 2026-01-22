/* =========================================================
   SYSTEM: Midnight Route
   app.js — PART 1 (CORE ENGINE)
   Paste FIRST into app.js
   ========================================================= */

(() => {
  "use strict";

  /* =======================
     BASIC HELPERS
  ======================= */
  const $ = (s) => document.querySelector(s);
  const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

  /* =======================
     STATE
  ======================= */
  const state = {
    node: "ep1_boot",
    history: [],
    name: "Player",

    typing: false,
    skip: false,

    episode: 1,
    tone: "blue", // blue | red

    vars: {
      bond: 0,
      evelynTrust: 0,
      stability: 0,
      memoryDebt: 0,
      routerAggro: 0
    }
  };

  /* =======================
     DOM ELEMENTS
  ======================= */
  const el = {
    bg: $("#bg"),
    vignette: $("#vignette"),

    hudStatus: $("#hudStatus"),
    hudEpisode: $("#hudEpisode"),

    systemPanel: $("#systemPanel"),
    systemLabel: $("#systemLabel"),
    systemMeta: $("#systemMeta"),
    systemText: $("#systemText"),
    systemChoices: $("#systemChoices"),

    dialogPanel: $("#dialogPanel"),
    dialogSpeaker: $("#dialogSpeaker"),
    dialogMood: $("#dialogMood"),
    dialogMeta: $("#dialogMeta"),
    dialogText: $("#dialogText"),
    dialogChoices: $("#dialogChoices"),

    btnNext: $("#btnNext"),
    btnBack: $("#btnBack"),
    btnNext2: $("#btnNext2"),
    btnBack2: $("#btnBack2"),

    portraitLWrap: $("#portraitLeftWrap"),
    portraitRWrap: $("#portraitRightWrap"),
    portraitL: $("#portraitLeft"),
    portraitR: $("#portraitRight"),

    modalName: $("#modalName"),
    playerName: $("#playerName"),
    btnNameClose: $("#btnNameClose"),
    btnNameOk: $("#btnNameOk")
  };

  /* =======================
     UTIL UI
  ======================= */
  function fmt(text){
    return String(text || "").replaceAll("{name}", state.name);
  }

  function setEpisode(n){
    state.episode = n || 1;
    if (el.hudEpisode) el.hudEpisode.textContent = "EP " + state.episode;
  }

  function setTone(t){
    state.tone = (t === "red") ? "red" : "blue";
    const red = state.tone === "red";

    if (el.systemPanel){
      el.systemPanel.classList.toggle("tone-red", red);
      el.systemPanel.classList.toggle("tone-blue", !red);
    }

    if (el.hudStatus){
      el.hudStatus.textContent = red ? "DANGER" : "NORMAL";
      el.hudStatus.classList.toggle("tone-red", red);
      el.hudStatus.classList.toggle("tone-blue", !red);
    }

    document.body.classList.toggle("system-danger", red);
    document.body.classList.toggle("system-safe", !red);
  }

  function showSystem(){
    if (el.systemPanel) el.systemPanel.classList.remove("is-hidden");
    if (el.dialogPanel) el.dialogPanel.classList.add("is-hidden");
  }

  function showDialog(){
    if (el.dialogPanel) el.dialogPanel.classList.remove("is-hidden");
    if (el.systemPanel) el.systemPanel.classList.add("is-hidden");
  }

  function clearChoices(){
    if (el.systemChoices){
      el.systemChoices.innerHTML = "";
      el.systemChoices.classList.add("is-hidden");
    }
    if (el.dialogChoices){
      el.dialogChoices.innerHTML = "";
      el.dialogChoices.classList.add("is-hidden");
    }
  }

  function hidePortraits(){
    if (el.portraitLWrap) el.portraitLWrap.classList.add("is-hidden");
    if (el.portraitRWrap) el.portraitRWrap.classList.add("is-hidden");
  }

  /* =======================
     TYPING EFFECT
  ======================= */
  async function typeText(target, text){
    if (!target) return;

    state.typing = true;
    state.skip = false;
    target.innerHTML = "";

    const s = fmt(text);

    for (let i = 0; i < s.length; i++){
      if (state.skip) break;
      target.innerHTML += s[i];
      await new Promise(r => setTimeout(r, 12));
    }

    if (state.skip) target.innerHTML = s;
    state.typing = false;
  }

  function skipTyping(){
    if (!state.typing) return false;
    state.skip = true;
    return true;
  }

  /* =========================================================
     STORY DATA (DIISI LANJUT DI PART 2)
  ========================================================= */
  const STORY = {
    ep1_boot: {
      type: "system",
      episode: 1,
      label: "BOOT",
      meta: "midnight-route",
      text: "SYSTEM ONLINE...\nMencari pengguna.",
      next: "ep1_time"
    },

    ep1_time: {
      type: "system",
      episode: 1,
      label: "BOOT",
      meta: "00:17",
      text: "Waktu menunjukkan 00:17.\nTidak ada kelas malam di jadwal sekolah ini.",
      next: null
    }
  };

  /* =========================================================
     RENDER CORE
  ========================================================= */
  async function render(id){
    const node = STORY[id];
    if (!node) return;

    state.node = id;
    setEpisode(node.episode || 1);
    setTone(node.tone || "blue");

    clearChoices();
    hidePortraits();

    if (node.type === "system"){
      showSystem();
      if (el.systemLabel) el.systemLabel.textContent = node.label || "SYSTEM";
      if (el.systemMeta) el.systemMeta.textContent = node.meta || "";
      await typeText(el.systemText, node.text);
    } else {
      showDialog();
      await typeText(el.dialogText, node.text);
    }
  }

  function next(){
    if (skipTyping()) return;
    const node = STORY[state.node];
    if (node && node.next){
      state.history.push(state.node);
      render(node.next);
    }
  }

  function back(){
    if (skipTyping()) return;
    if (!state.history.length) return;
    render(state.history.pop());
  }

  /* =======================
     EVENTS
  ======================= */
  function bind(){
    on(el.btnNext, "click", next);
    on(el.btnNext2, "click", next);
    on(el.btnBack, "click", back);
    on(el.btnBack2, "click", back);

    on(el.systemPanel, "click", next);
    on(el.dialogPanel, "click", next);
  }

  /* =======================
     INIT
  ======================= */
  window.addEventListener("load", () => {
    bind();
    render(state.node);
  });

/* ===== PART 1 END (JANGAN TUTUP IIFE) ===== */
/* =========================================================
   app.js — PART 2 (CHOICES + NAME + STORY EXTEND)
   Paste BELOW PART 1
   ========================================================= */

/* =======================
   TONE AUTO (BAHAYA)
======================= */
function computeTone(node){
  if (!node) return "blue";
  if (node.dangerChoices) return "red";
  if (Array.isArray(node.choices) && node.choices.some(c => c && c.risk)) return "red";
  return "blue";
}

/* =======================
   NAME MODAL (OPTIONAL)
======================= */
function openNameModal(){
  if (!el.modalName) return;
  if (el.playerName) el.playerName.value = (state.name === "Player") ? "" : state.name;
  el.modalName.classList.remove("is-hidden");
  setTimeout(()=> el.playerName && el.playerName.focus(), 50);
}

function closeNameModal(){
  if (!el.modalName) return;
  el.modalName.classList.add("is-hidden");
}

function confirmName(){
  if (!el.playerName) return;
  const raw = (el.playerName.value || "").trim();
  state.name = (raw || "Player").slice(0, 18);
  closeNameModal();
}

/* =======================
   CHOICES ENGINE
======================= */
function hasChoices(node){
  return node && Array.isArray(node.choices) && node.choices.length > 0;
}

function renderChoices(node){
  const list = (node.type === "system") ? el.systemChoices : el.dialogChoices;
  if (!list) return;

  if (!hasChoices(node)){
    list.classList.add("is-hidden");
    list.innerHTML = "";
    return;
  }

  list.classList.remove("is-hidden");
  list.innerHTML = "";

  node.choices.forEach(choice=>{
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice" + (choice.risk ? " is-risk" : "");

    const left = document.createElement("div");
    left.className = "choice-left";

    const t = document.createElement("div");
    t.className = "choice-title";
    t.textContent = choice.title || "Choice";

    const d = document.createElement("div");
    d.className = "choice-desc";
    d.textContent = choice.desc || "";

    left.appendChild(t);
    left.appendChild(d);

    const icon = document.createElement("div");
    icon.className = "choice-icon";
    icon.textContent = choice.icon || "→";

    btn.appendChild(left);
    btn.appendChild(icon);

    btn.onclick = ()=>{
      if (state.typing) state.skip = true;
      if (typeof choice.effects === "function"){
        try{ choice.effects(); }catch{}
      }
      if (choice.to){
        state.history.push(state.node);
        render(choice.to);
      }
    };

    li.appendChild(btn);
    list.appendChild(li);
  });
}

/* =======================
   PORTRAITS (SIMPLE)
======================= */
function setPortraitsSimple(leftSrc, rightSrc){
  if (el.portraitL && el.portraitLWrap){
    if (leftSrc){
      el.portraitL.src = leftSrc;
      el.portraitLWrap.classList.remove("is-hidden");
    } else el.portraitLWrap.classList.add("is-hidden");
  }
  if (el.portraitR && el.portraitRWrap){
    if (rightSrc){
      el.portraitR.src = rightSrc;
      el.portraitRWrap.classList.remove("is-hidden");
    } else el.portraitRWrap.classList.add("is-hidden");
  }
}

/* =======================
   STORY EXTEND (EP1 -> EP2 awal)
======================= */
Object.assign(STORY, {
  ep1_scan: {
    type: "system",
    episode: 1,
    label: "SCAN",
    meta: "local",
    text: "Mencari user terdekat…\nSinkronisasi jalur: AKTIF.",
    next: "ep1_name"
  },

  ep1_name: {
    type: "system",
    episode: 1,
    label: "IDENTITY",
    meta: "register",
    action: "name_input",
    text: "Identitas tidak terdaftar.\nMasukkan nama pengguna.",
    next: "ep1_name_ok"
  },

  ep1_name_ok: {
    type: "system",
    episode: 1,
    label: "CONFIRMED",
    meta: "ok",
    text: "Identitas dikonfirmasi.\nSelamat datang, {name}.",
    next: "ep1_card_drop"
  },

  ep1_card_drop: {
    type: "system",
    episode: 1,
    label: "DETECTED",
    meta: "object",
    text: "Objek terdeteksi.\nKartu akses jatuh di dekat Anda.\n\nAda satu nama di sana… bukan nama kamu.",
    next: "ep1_pick_card"
  },

  ep1_pick_card: {
    type: "system",
    episode: 1,
    label: "ROUTE WARNING",
    meta: "risk: high",
    dangerChoices: true,
    text: "Mengambil kartu dapat mengubah rute Anda.\n\nApa tindakan Anda?",
    choices: [
      {
        title: "Ambil kartu",
        desc: "Terima risiko dan lanjutkan rute.",
        icon: "→",
        risk: true,
        to: "ep1_card_id",
        effects: () => { state.vars.routerAggro = Math.min(3, state.vars.routerAggro + 1); }
      },
      {
        title: "Abaikan",
        desc: "Tetap aman… untuk sementara.",
        icon: "↺",
        risk: true,
        to: "ep1_ignore_fail"
      }
    ]
  },

  ep1_ignore_fail: {
    type: "system",
    episode: 1,
    label: "FAIL STATE",
    meta: "false-safe",
    dangerChoices: true,
    text: "Anda memilih diam.\n\nNamun rute tetap bergerak tanpa Anda.\nSYSTEM menandai Anda sebagai: PASIF.\n\nRute diulang.",
    next: "ep1_pick_card"
  },

  ep1_card_id: {
    type: "system",
    episode: 1,
    label: "ACCESS CARD",
    meta: "ID: AREL",
    text: "ID KARTU: AREL\nHak akses: TIDAK DIKETAHUI\n\nSYSTEM tidak menjelaskan. Itu lebih mengganggu.",
    next: "ep1_evelyn_enter"
  },

  ep1_evelyn_enter: {
    type: "dialog",
    episode: 1,
    speaker: "EVELYN",
    mood: "—",
    meta: "channel: private",
    text: "Kamu juga lihat kartu itu, ya?",
    next: "ep1_mc_reply"
  },

  ep1_mc_reply: {
    type: "dialog",
    episode: 1,
    speaker: "MC",
    mood: "—",
    meta: "channel: private",
    text: "Kamu siapa?\nDan kenapa kamu ada di sini jam segini?",
    next: "ep1_evelyn_tease"
  },

  ep1_evelyn_tease: {
    type: "dialog",
    episode: 1,
    speaker: "EVELYN",
    mood: "playful",
    meta: "channel: private",
    text: "Namaku Evelyn.\nAku cuma… penasaran.\n\nKalau kamu nggak masuk rute itu, kamu harusnya udah pulang dari tadi.",
    next: "ep1_system_detect"
  },

  ep1_system_detect: {
    type: "system",
    episode: 1,
    label: "DETECTED",
    meta: "anomaly",
    text: "Anomali terdeteksi.\nDua pengguna berada di jalur yang sama.",
    next: "ep1_route_warning"
  },

  ep1_route_warning: {
    type: "system",
    episode: 1,
    label: "ROUTE WARNING",
    meta: "shared-route",
    dangerChoices: true,
    text: "Berbagi rute meningkatkan risiko.\nPilih tindakan Anda.",
    choices: [
      {
        title: "Percaya Evelyn",
        desc: "Bentuk kontrak rute bersama.",
        icon: "⧉",
        risk: true,
        to: "ep1_trust",
        effects: () => { state.vars.bond++; state.vars.evelynTrust++; }
      },
      {
        title: "Jalan sendiri",
        desc: "Putus jalur. Kurangi risiko… di permukaan.",
        icon: "⟂",
        risk: true,
        to: "ep1_solo",
        effects: () => { state.vars.stability++; }
      }
    ]
  },

  ep1_trust: {
    type: "dialog",
    episode: 1,
    speaker: "EVELYN",
    mood: "soft",
    meta: "channel: private",
    text: "Heh… keputusan yang berani.\nAku nggak janji aman.\nTapi aku janji jujur.",
    next: "ep1_lock"
  },

  ep1_solo: {
    type: "dialog",
    episode: 1,
    speaker: "EVELYN",
    mood: "cold",
    meta: "channel: private",
    text: "Oh.\nJadi kamu tipe yang nggak suka bergantung, ya.\n\nBaik. Jangan tersesat.",
    next: "ep1_lock"
  },

  ep1_lock: {
    type: "system",
    episode: 1,
    label: "LOCKED",
    meta: "route: established",
    text: "Jalur awal ditetapkan.\nMidnight Entry berhasil.",
    next: "ep1_timer"
  },

  ep1_timer: {
    type: "system",
    episode: 1,
    label: "TIMER",
    meta: "next test",
    dangerChoices: true,
    text: "Peringatan:\nRute Anda akan diuji dalam 01:00 menit.\n\nEvelyn menatapmu seolah tahu sesuatu.\nDan untuk pertama kali, kamu merasa sekolah ini… bukan sekolah yang sama.",
    next: "ep2_entry"
  },

  ep2_entry: {
    type: "system",
    episode: 2,
    label: "EP2",
    meta: "Truth or Memory",
    dangerChoices: true,
    text: "EPISODE 2: TRUTH OR MEMORY\n\nSebuah pintu merah muncul di ujung koridor.\nSYSTEM menunggu jawabanmu.",
    choices: [
      {
        title: "Masuk pintu merah",
        desc: "Terima tes berikutnya.",
        icon: "→",
        risk: true,
        to: "ep2_room"
      },
      {
        title: "Tanya Evelyn dulu",
        desc: "Cari info. Mungkin ada trik.",
        icon: "…",
        risk: true,
        to: "ep2_ask_evelyn"
      }
    ]
  },

  ep2_ask_evelyn: {
    type: "dialog",
    episode: 2,
    speaker: "EVELYN",
    mood: "serious",
    meta: "channel: private",
    text: "Kalau SYSTEM nawarin ‘Truth’ atau ‘Memory’…\nitu bukan pertanyaan biasa.\n\nPilihannya selalu ada biaya.\nDan kadang… bayarannya bukan dari kamu doang.",
    next: "ep2_entry"
  },

  ep2_room: {
    type: "system",
    episode: 2,
    label: "ENTER",
    meta: "session begin",
    dangerChoices: true,
    text: "Pintu menutup.\nUdara jadi dingin.\n\nSYSTEM menampilkan dua tombol besar:\nTRUTH / MEMORY",
    next: null
  }
});

/* =======================
   PATCH: UPDATE PART 1 STORY LINK
======================= */
STORY.ep1_time.next = "ep1_scan";

/* =======================
   PATCH RENDER (support tone + choices + action + portraits)
======================= */
const _renderCore = render;
render = async function(id){
  const node = STORY[id];
  if (!node) return;

  state.node = id;
  setEpisode(node.episode || 1);
  setTone(node.tone || computeTone(node));

  clearChoices();
  hidePortraits();

  // simple portraits: MC left, Evelyn right (kalau dialog Evelyn)
  if (node.type === "dialog"){
    if (node.speaker === "EVELYN") setPortraitsSimple(null, null); // default dulu
  }

  if (node.type === "system"){
    showSystem();
    if (el.systemLabel) el.systemLabel.textContent = node.label || "SYSTEM";
    if (el.systemMeta) el.systemMeta.textContent = node.meta || "";
    await typeText(el.systemText, node.text);
  } else {
    showDialog();
    if (el.dialogSpeaker) el.dialogSpeaker.textContent = node.speaker || "MC";
    if (el.dialogMood) el.dialogMood.textContent = node.mood || "—";
    if (el.dialogMeta) el.dialogMeta.textContent = node.meta || "";
    await typeText(el.dialogText, node.text);
  }

  // name modal action
  if (node.action === "name_input"){
    openNameModal();
  }

  renderChoices(node);
};

/* =======================
   NAME MODAL EVENTS
======================= */
if (el.modalName){
  on(el.btnNameClose, "click", closeNameModal);
  on(el.btnNameOk, "click", () => {
    confirmName();
    const node = STORY[state.node];
    if (node && node.next){
      state.history.push(state.node);
      render(node.next);
    }
  });

  on(el.playerName, "keydown", (e) => {
    if (e.key === "Enter" && el.btnNameOk) el.btnNameOk.click();
  });

  on(el.modalName, "click", (e) => {
    if (e.target === el.modalName) closeNameModal();
  });
}

/* ===== PART 2 END (JANGAN TUTUP IIFE) ===== */
/* =========================================================
   app.js — PART 3 (FINAL: events patch + portraits + close)
   Paste BELOW PART 2
   ========================================================= */

/* =======================
   ASSET PATH DEFAULT (kalau kamu sudah punya)
   - ubah sesuai folder kamu kalau beda
======================= */
const CHAR = {
  mc: "assets/char/mc_system.png",
  eveBlue: "assets/char/evelyn_blue.png",
  eveRed: "assets/char/evelyn_red.png"
};

/* =======================
   PORTRAIT AUTO RULES
======================= */
function applyPortraitsForNode(node){
  if (!node) return;
  // default: sembunyikan dulu
  hidePortraits();

  if (node.type !== "dialog") return;

  // MC selalu di kiri (kalau ada file)
  // Evelyn di kanan kalau speaker EVELYN atau kalau dialog terasa “bareng”
  const left = CHAR.mc;

  // Evelyn mode: kalau mood serious -> red (kalau file ada)
  let right = null;

  if ((node.speaker || "").toUpperCase() === "EVELYN"){
    right = (node.mood === "serious") ? CHAR.eveRed : CHAR.eveBlue;
  } else {
    // kalau MC ngomong setelah Evelyn muncul, tetap tampilkan Evelyn di kanan
    // biar vibe VN-nya dapet
    const currentId = state.node || "";
    if (String(currentId).startsWith("ep1_") || String(currentId).startsWith("ep2_")){
      right = CHAR.eveBlue;
    }
  }

  setPortraitsSimple(left, right);
}

/* =======================
   PATCH: make render apply portraits
======================= */
const _renderPart2 = render;
render = async function(id){
  const node = STORY[id];
  if (!node) return;

  // panggil render yang sudah dipatch part 2
  await _renderPart2(id);

  // apply portraits setelah teks muncul
  applyPortraitsForNode(node);
};

/* =======================
   PATCH: next/back behavior
======================= */
const _nextOld = next;
next = function(){
  // kalau lagi typing, skip dulu
  if (skipTyping()) return;

  const node = STORY[state.node];
  if (!node) return;

  // kalau ada choices, jangan loncat
  if (hasChoices(node)){
    return;
  }

  // kalau node name input, jangan loncat
  if (node.action === "name_input"){
    openNameModal();
    return;
  }

  // normal next
  if (node.next){
    state.history.push(state.node);
    render(node.next);
  }
};

const _backOld = back;
back = function(){
  if (skipTyping()) return;
  if (!state.history.length) return;
  render(state.history.pop());
};

/* =======================
   PATCH: panel click ignore choice
======================= */
function bindPanelTapSafe(){
  if (el.systemPanel){
    el.systemPanel.onclick = (e) => {
      if (e && e.target && e.target.closest && e.target.closest(".choice")) return;
      next();
    };
  }
  if (el.dialogPanel){
    el.dialogPanel.onclick = (e) => {
      if (e && e.target && e.target.closest && e.target.closest(".choice")) return;
      next();
    };
  }
}

/* =======================
   PATCH: buttons (rebind)
======================= */
function rebindButtons(){
  if (el.btnNext) el.btnNext.onclick = next;
  if (el.btnNext2) el.btnNext2.onclick = next;
  if (el.btnBack) el.btnBack.onclick = back;
  if (el.btnBack2) el.btnBack2.onclick = back;
}

/* =======================
   RUN PATCHES AFTER LOAD
======================= */
window.addEventListener("load", () => {
  rebindButtons();
  bindPanelTapSafe();
});
/* =========================================================
   STORY PACK — EP2 TAMAT (FULL)
   Paste BEFORE final "})();"
   ========================================================= */

Object.assign(STORY, {

  /* =========================
     EP2: TRUTH OR MEMORY
     ========================= */

  ep2_room: {
    type: "system",
    episode: 2,
    label: "ENTER",
    meta: "session begin",
    dangerChoices: true,
    text:
      "Pintu menutup.\nUdara jadi dingin.\n\nSYSTEM menampilkan dua tombol besar:\nTRUTH / MEMORY\n\nTulisan kecil di bawahnya:\n“Setiap pilihan menulis ulang rute.”",
    next: "ep2_choice_tm"
  },

  ep2_choice_tm: {
    type: "system",
    episode: 2,
    label: "TEST",
    meta: "Truth or Memory",
    dangerChoices: true,
    text:
      "Pilih:\nTRUTH atau MEMORY.\n\nTRUTH:\nKamu akan melihat sesuatu yang seharusnya tidak kamu lihat.\n\nMEMORY:\nKamu akan kehilangan sesuatu yang tidak kamu sadari kamu miliki.",
    choices: [
      {
        title: "TRUTH",
        desc: "Ambil kebenaran — apa pun harganya.",
        icon: "T",
        risk: true,
        to: "ep2_truth_01",
        effects: () => {
          state.vars.routerAggro = Math.min(9, state.vars.routerAggro + 2);
        }
      },
      {
        title: "MEMORY",
        desc: "Bayar dengan ingatan. Bertahan sekarang.",
        icon: "M",
        risk: true,
        to: "ep2_memory_01",
        effects: () => {
          state.vars.memoryDebt = Math.min(9, state.vars.memoryDebt + 1);
        }
      }
    ]
  },

  /* =========================
     TRUTH ROUTE
     ========================= */

  ep2_truth_01: {
    type: "system",
    episode: 2,
    label: "TRUTH",
    meta: "granted",
    dangerChoices: true,
    text:
      "Tombol TRUTH menyala.\n\nLayar memucat.\nLalu berubah menjadi peta.\n\nBukan peta sekolah.\nItu peta rute.\n\nDi tengahnya tertulis:\n“DEATH ROUTER SYSTEM”",
    next: "ep2_truth_02"
  },

  ep2_truth_02: {
    type: "system",
    episode: 2,
    label: "NODE",
    meta: "scan",
    dangerChoices: true,
    text:
      "Satu node disorot.\n\nNAMA NODE:\nAREL\n\nSTATUS:\nMISSING OWNER\n\nKartu di tanganmu bergetar.",
    next: "ep2_truth_03"
  },

  ep2_truth_03: {
    type: "dialog",
    episode: 2,
    speaker: "EVELYN",
    mood: "quiet",
    meta: "channel: private",
    text:
      "…kamu lihat itu, kan.\n\nKalau sudah sampai tahap ini, berarti rutenya benar-benar aktif.\nDan biasanya…\nnggak ada jalan pulang yang normal.",
    next: "ep2_truth_04"
  },

  ep2_truth_04: {
    type: "dialog",
    episode: 2,
    speaker: "MC",
    mood: "tense",
    meta: "channel: private",
    text:
      "Kamu tahu soal ini lebih dari yang kamu bilang.\n\nKamu siapa sebenarnya?",
    next: "ep2_truth_05"
  },

  ep2_truth_05: {
    type: "dialog",
    episode: 2,
    speaker: "EVELYN",
    mood: "serious",
    meta: "channel: private",
    text:
      "Aku pernah ada di rute ini.\n\nBukan sebagai peserta utama.\nTapi sebagai… variabel.\n\nDan orang pertama yang kuberi tahu soal rute ini—\nnamanya juga AREL.",
    next: "ep2_truth_06"
  },

  ep2_truth_06: {
    type: "system",
    episode: 2,
    label: "TRUTH",
    meta: "sync complete",
    dangerChoices: true,
    text:
      "TRUTH selesai.\n\nEFEK:\n— Kamu bisa melihat indikator rute.\n— Router bisa melacakmu lebih akurat.\n\nFitur baru terbuka:\nTRACE",
    next: "ep2_truth_trace_unlock"
  },

  ep2_truth_trace_unlock: {
    type: "system",
    episode: 2,
    label: "UNLOCK",
    meta: "TRACE",
    dangerChoices: true,
    text:
      "TRACE memungkinkanmu mengikuti jejak node tertentu.\n\nCatatan:\nMengaktifkan TRACE meningkatkan risiko deteksi.",
    choices: [
      {
        title: "Aktifkan TRACE",
        desc: "Ikuti jejak node AREL.",
        icon: "→",
        risk: true,
        to: "ep2_truth_trace_on",
        effects: () => {
          state.vars.routerAggro = Math.min(9, state.vars.routerAggro + 2);
        }
      },
      {
        title: "Tunda TRACE",
        desc: "Cari stabilitas dulu.",
        icon: "…",
        risk: true,
        to: "ep2_truth_trace_hold"
      }
    ]
  },

  ep2_truth_trace_hold: {
    type: "dialog",
    episode: 2,
    speaker: "EVELYN",
    mood: "calm",
    meta: "channel: private",
    text:
      "Keputusan yang benar.\nRouter suka orang yang terburu-buru.\n\nKalau kamu aktifkan TRACE, pastikan kamu siap kehilangan sesuatu.",
    next: "ep2_truth_trace_unlock"
  },

  ep2_truth_trace_on: {
    type: "system",
    episode: 2,
    label: "TRACE",
    meta: "active",
    dangerChoices: true,
    text:
      "TRACE aktif.\n\nKoridor memanjang tak wajar.\nLampu berkedip.\n\nDi ujung lorong:\nsebuah pintu dengan simbol kartu AREL.",
    next: "ep2_endgate"
  },

  /* =========================
     MEMORY ROUTE
     ========================= */

  ep2_memory_01: {
    type: "system",
    episode: 2,
    label: "MEMORY",
    meta: "accepted",
    dangerChoices: true,
    text:
      "Tombol MEMORY menyala.\n\nAda sensasi kosong.\nBukan sakit.\n\nSeperti lupa sesuatu—\ntapi tidak tahu apa.",
    next: "ep2_memory_02"
  },

  ep2_memory_02: {
    type: "dialog",
    episode: 2,
    speaker: "EVELYN",
    mood: "shocked",
    meta: "channel: private",
    text:
      "Kamu barusan bayar MEMORY?\n\nKamu gila?\nItu bukan mata uang biasa di rute ini.",
    next: "ep2_memory_03"
  },

  ep2_memory_03: {
    type: "dialog",
    episode: 2,
    speaker: "MC",
    mood: "confused",
    meta: "channel: private",
    text:
      "Aku cuma ngerasa ada yang hilang.\n\nTapi aku nggak tahu apa.",
    next: "ep2_memory_04"
  },

  ep2_memory_04: {
    type: "dialog",
    episode: 2,
    speaker: "EVELYN",
    mood: "tight",
    meta: "channel: private",
    text:
      "Itu yang bikin berbahaya.\n\nMemory Debt bikin kamu:\n— Lebih sulit dilacak.\n— Tapi lebih mudah dimanipulasi.\n\nRouter suka peserta seperti itu.",
    next: "ep2_memory_05"
  },

  ep2_memory_05: {
    type: "system",
    episode: 2,
    label: "MEMORY",
    meta: "side effect",
    dangerChoices: true,
    text:
      "MEMORY selesai.\n\nEFEK:\n— Deteksi berkurang.\n— Ingatan acak terkikis.\n\nFitur baru terbuka:\nHIDE",
    next: "ep2_memory_hide_unlock"
  },

  ep2_memory_hide_unlock: {
    type: "system",
    episode: 2,
    label: "UNLOCK",
    meta: "HIDE",
    dangerChoices: true,
    text:
      "HIDE menyembunyikanmu dari router.\n\nCatatan:\nSetiap penggunaan menambah Memory Debt.",
    choices: [
      {
        title: "Aktifkan HIDE",
        desc: "Kurangi deteksi.",
        icon: "○",
        risk: true,
        to: "ep2_memory_hide_on",
        effects: () => {
          state.vars.memoryDebt = Math.min(9, state.vars.memoryDebt + 1);
        }
      },
      {
        title: "Tahan dulu",
        desc: "Tetap sadar penuh.",
        icon: "×",
        risk: true,
        to: "ep2_memory_hide_hold"
      }
    ]
  },

  ep2_memory_hide_hold: {
    type: "dialog",
    episode: 2,
    speaker: "EVELYN",
    mood: "calm",
    meta: "channel: private",
    text:
      "Bagus.\nHIDE itu kayak utang.\nSekali dipakai, susah berhenti.",
    next: "ep2_memory_hide_unlock"
  },

  ep2_memory_hide_on: {
    type: "system",
    episode: 2,
    label: "HIDE",
    meta: "active",
    dangerChoices: true,
    text:
      "HIDE aktif.\n\nLangkahmu terasa sunyi.\n\nDi kejauhan:\nsebuah pintu dengan simbol kartu AREL.\nKamu merasa…\nkamu pernah melihat simbol itu.\nTapi tidak ingat di mana.",
    next: "ep2_endgate"
  },

  /* =========================
     EP2 END
     ========================= */

  ep2_endgate: {
    type: "system",
    episode: 2,
    label: "GATE",
    meta: "AREL route",
    dangerChoices: true,
    text:
      "Pintu terbuka sendiri.\n\nSYSTEM menulis:\n“Selamat datang di jalur yang bukan milikmu.”\n\nEPISODE 2 SELESAI.\n\nMemuat EP3: CROSSNODE.",
    next: "ep3_start"
  },

  ep3_start: {
    type: "system",
    episode: 3,
    label: "LOADING",
    meta: "EP3",
    dangerChoices: true,
    text:
      "EP3 akan dimuat.\n\nJalur mulai bercabang lebih tajam.\n\n(EP3–EP4 akan dikirim di STORY PACK berikutnya.)",
    next: null
  }

});
/* =========================================================
   STORY PACK — EP3–EP4
   PART 1 / 2
   (EP3 FULL + EP4 START)
   ========================================================= */

Object.assign(STORY, {

  /* =========================
     EP3: CROSSNODE
     ========================= */

  ep3_start: {
    type: "system",
    episode: 3,
    label: "CROSSNODE",
    meta: "entry",
    dangerChoices: true,
    text:
      "EPISODE 3: CROSSNODE\n\nKoridor bercabang menjadi tiga arah.\n\nSYSTEM:\n\"Jalur mulai tumpang tindih.\"",
    next: "ep3_meet_kairo"
  },

  ep3_meet_kairo: {
    type: "dialog",
    episode: 3,
    speaker: "KAIRO",
    mood: "cold",
    meta: "unknown node",
    text:
      "Jangan berdiri di tengah.\n\nDi CROSSNODE, yang ragu mati duluan.",
    next: "ep3_kairo_intro"
  },

  ep3_kairo_intro: {
    type: "dialog",
    episode: 3,
    speaker: "MC",
    mood: "alert",
    meta: "first contact",
    text:
      "Kamu siapa?\n\nKenapa kamu tahu soal rute ini?",
    next: "ep3_kairo_reply"
  },

  ep3_kairo_reply: {
    type: "dialog",
    episode: 3,
    speaker: "KAIRO",
    mood: "flat",
    meta: "truth partial",
    text:
      "Aku survivor.\n\nAtau lebih tepatnya:\naku yang belum dihapus.",
    next: "ep3_lyra_appear"
  },

  ep3_lyra_appear: {
    type: "dialog",
    episode: 3,
    speaker: "LYRA",
    mood: "unstable",
    meta: "signal interference",
    text:
      "Hei… hei…\n\nJangan percaya dia sepenuhnya.\nDi rute ini, yang hidup lama biasanya menyimpan hutang.",
    next: "ep3_system_warning"
  },

  ep3_system_warning: {
    type: "system",
    episode: 3,
    label: "WARNING",
    meta: "node conflict",
    dangerChoices: true,
    text:
      "DETEKSI KONFLIK NODE.\n\nKAIRO / LYRA\n\nSYSTEM:\n\"Pilih siapa yang kamu ikuti.\"",
    choices: [
      {
        title: "Ikuti KAIRO",
        desc: "Stabil, tapi dingin.",
        icon: "K",
        risk: true,
        to: "ep3_follow_kairo",
        effects: () => {
          state.vars.kairoTrust = (state.vars.kairoTrust || 0) + 1;
        }
      },
      {
        title: "Ikuti LYRA",
        desc: "Berbahaya, tapi jujur.",
        icon: "L",
        risk: true,
        to: "ep3_follow_lyra",
        effects: () => {
          state.vars.lyraTrust = (state.vars.lyraTrust || 0) + 1;
        }
      }
    ]
  },

  ep3_follow_kairo: {
    type: "dialog",
    episode: 3,
    speaker: "KAIRO",
    mood: "approved",
    meta: "route lock",
    text:
      "Pilihan yang logis.\n\nIngat satu hal:\nSYSTEM bukan musuh utama.",
    next: "ep3_echo_hall"
  },

  ep3_follow_lyra: {
    type: "dialog",
    episode: 3,
    speaker: "LYRA",
    mood: "grin",
    meta: "risk route",
    text:
      "Hehe…\n\nBerarti kamu siap kotor.\nKarena kebenaran di rute ini selalu berdarah.",
    next: "ep3_echo_hall"
  },

  ep3_echo_hall: {
    type: "system",
    episode: 3,
    label: "ECHO HALL",
    meta: "memory feedback",
    dangerChoices: true,
    text:
      "Ruangan memantulkan suara.\n\nSetiap langkah memicu gema.\n\nSYSTEM:\n\"ECHO HALL aktif.\"",
    next: "ep3_echo_test"
  },

  ep3_echo_test: {
    type: "system",
    episode: 3,
    label: "TEST",
    meta: "echo memory",
    dangerChoices: true,
    text:
      "Satu gema terasa familiar.\n\nNama itu muncul lagi:\nAREL",
    next: "ep3_end"
  },

  ep3_end: {
    type: "system",
    episode: 3,
    label: "END",
    meta: "episode clear",
    dangerChoices: true,
    text:
      "EPISODE 3 SELESAI.\n\nSYSTEM:\n\"Crossnode disinkronkan.\"",
    next: "ep4_start"
  },

  /* =========================
     EP4: ROUTE AUCTION (START)
     ========================= */

  ep4_start: {
    type: "system",
    episode: 4,
    label: "ROUTE AUCTION",
    meta: "entry",
    dangerChoices: true,
    text:
      "EPISODE 4: ROUTE AUCTION\n\nRuang terbuka lebar.\n\nBanyak peserta.\n\nSYSTEM:\n\"Rute dapat diperdagangkan.\"",
    next: "ep4_market_intro"
  },

  ep4_market_intro: {
    type: "dialog",
    episode: 4,
    speaker: "EVELYN",
    mood: "serious",
    meta: "return",
    text:
      "Di sini rute dijual.\n\nIngatan.\nNyawa.\nIdentitas.\n\nSemua punya harga.",
    next: "ep4_market_notice"
  },

  ep4_market_notice: {
    type: "system",
    episode: 4,
    label: "NOTICE",
    meta: "auction rule",
    dangerChoices: true,
    text:
      "PERATURAN:\n\n— Setiap tawaran mengikat.\n— Penarikan dilarang.\n— Rute AREL terdaftar.\n\nAUCTION akan dimulai.",
    next: "ep4_choice_entry"
  }

  // ⛔ JANGAN TUTUP DI SINI
});
/* =========================================================
   STORY PACK — EP3–EP4
   PART 2 / 2
   (EP4 FULL → END)
   Paste BELOW PART 1, BEFORE final "})();"
   ========================================================= */

Object.assign(STORY, {

  /* =========================
     EP4: ROUTE AUCTION (CONT.)
     ========================= */

  ep4_choice_entry: {
    type: "system",
    episode: 4,
    label: "BID",
    meta: "entry choice",
    dangerChoices: true,
    text:
      "TIGA ITEM di papan utama:\n\n1) EXIT KEY (Langka)\n2) SAFE PASS (1x)\n3) INFO: AREL (Terkunci)\n\nCatatan kecil:\n“Jika kamu tidak menawar, kamu bisa ditawar.”\n\nPilih tindakan pertamamu.",
    choices: [
      {
        title: "Bid EXIT KEY",
        desc: "Kejar peluang keluar (berisiko).",
        icon: "↗",
        risk: true,
        to: "ep4_bid_exit_01",
        effects: () => {
          state.vars.bidCount = (state.vars.bidCount || 0) + 1;
          state.vars.memoryDebt = Math.min(9, (state.vars.memoryDebt || 0) + 1);
        }
      },
      {
        title: "Bid SAFE PASS",
        desc: "Pegangan darurat untuk tes berikutnya.",
        icon: "S",
        risk: true,
        to: "ep4_bid_safe_01",
        effects: () => {
          state.vars.bidCount = (state.vars.bidCount || 0) + 1;
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      },
      {
        title: "Bid INFO: AREL",
        desc: "Buka rahasia pemilik kartu.",
        icon: "i",
        risk: true,
        to: "ep4_bid_info_01",
        effects: () => {
          state.vars.bidCount = (state.vars.bidCount || 0) + 1;
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      },
      {
        title: "Tahan dulu",
        desc: "Amati peserta lain (berisiko ditawar).",
        icon: "…",
        risk: true,
        to: "ep4_hold_01"
      }
    ]
  },

  ep4_hold_01: {
    type: "dialog",
    episode: 4,
    speaker: "KAIRO",
    mood: "flat",
    meta: "auction sense",
    text:
      "Kalau kamu diam, sistem bakal cari cara bikin kamu ‘bergerak’.\n\nDi lelang, diam itu juga keputusan.\nDan keputusan bisa dihargai… atau dihukum.",
    next: "ep4_hold_02"
  },

  ep4_hold_02: {
    type: "dialog",
    episode: 4,
    speaker: "LYRA",
    mood: "focused",
    meta: "pattern",
    text:
      "Lihat cara lampu berkedip.\n\nSaat orang menawar, ada jeda 3 detik.\nKalau kamu diincar… jedanya jadi 1 detik.\n\nSekarang… jedanya 1 detik buat kamu.",
    next: "ep4_backbid_warn"
  },

  ep4_backbid_warn: {
    type: "system",
    episode: 4,
    label: "ALERT",
    meta: "you can be bid",
    dangerChoices: true,
    text:
      "PERINGATAN:\nTarget bid balik terdeteksi.\n\nJika kamu tidak menawar dalam 1 langkah,\nsistem akan menawar dirimu.\n\nPilih sekarang.",
    choices: [
      {
        title: "Menawar sekarang",
        desc: "Ambil salah satu item.",
        icon: "!",
        risk: true,
        to: "ep4_choice_entry"
      },
      {
        title: "Tetap diam",
        desc: "Terima bid balik (bahaya).",
        icon: "×",
        risk: true,
        to: "ep4_backbid_hit",
        effects: () => {
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
        }
      }
    ]
  },

  ep4_backbid_hit: {
    type: "system",
    episode: 4,
    label: "BACK-BID",
    meta: "penalty",
    dangerChoices: true,
    text:
      "LELANG MENAWAR BALIK.\n\nHarga ditetapkan otomatis:\n— 1 Stability\natau\n— +2 Router Aggro\n\nKamu merasa napasmu berubah berat.\nSeolah ruangan menandaimu.",
    next: "ep4_after_backbid"
  },

  ep4_after_backbid: {
    type: "dialog",
    episode: 4,
    speaker: "EVELYN",
    mood: "serious",
    meta: "private",
    text:
      "Itu sebabnya aku benci Auction.\n\nKalau kamu diam, kamu dijual.\nKalau kamu bergerak, kamu bayar.\n\nMulai sekarang… kita harus memilih apa yang hilang dengan sengaja.\nBukan dipaksa.",
    next: "ep4_choice_entry"
  },

  /* ===== EXIT KEY PATH ===== */

  ep4_bid_exit_01: {
    type: "system",
    episode: 4,
    label: "BID",
    meta: "EXIT KEY",
    dangerChoices: true,
    text:
      "BID: EXIT KEY diterima.\n\nHarga:\n1 ingatan kecil.\n\nKamu kehilangan detail remeh.\nBukan sesuatu penting…\n\nTapi rasanya seperti ada lubang kecil di kepala.",
    next: "ep4_bid_exit_02"
  },

  ep4_bid_exit_02: {
    type: "system",
    episode: 4,
    label: "RESULT",
    meta: "outbid",
    dangerChoices: true,
    text:
      "Seseorang menawar lebih tinggi.\n\nEXIT KEY berpindah tangan.\n\nKamu hanya mendapat:\nFRAGMENT KEY (1/3)\n\nSYSTEM menulis:\n“Keinginanmu dicatat.”",
    next: "ep4_post_bid_common"
  },

  /* ===== SAFE PASS PATH ===== */

  ep4_bid_safe_01: {
    type: "system",
    episode: 4,
    label: "BID",
    meta: "SAFE PASS",
    dangerChoices: true,
    text:
      "BID: SAFE PASS diterima.\n\nHarga:\n1 ‘ketegasan’.\n\nKamu merasa… untuk beberapa detik,\nkamu jadi lebih sulit mengambil keputusan.\n\nTapi item masuk inventori.",
    next: "ep4_bid_safe_02"
  },

  ep4_bid_safe_02: {
    type: "system",
    episode: 4,
    label: "GAIN",
    meta: "SAFE PASS",
    text:
      "SAFE PASS didapat.\n\nKartu kecil muncul:\nSAFE PASS (1x)\n\nCatatan:\nBisa mengabaikan 1 penalti di tes berikutnya.",
    next: "ep4_post_bid_common"
  },

  /* ===== INFO AREL PATH ===== */

  ep4_bid_info_01: {
    type: "system",
    episode: 4,
    label: "BID",
    meta: "INFO: AREL",
    dangerChoices: true,
    text:
      "BID: INFO AREL diterima.\n\nHarga:\n+1 Router Aggro.\n\nSistem seperti… mendekat.\nSeolah layar menatapmu balik.",
    next: "ep4_bid_info_02"
  },

  ep4_bid_info_02: {
    type: "system",
    episode: 4,
    label: "INFO",
    meta: "AREL unlocked",
    dangerChoices: true,
    text:
      "INFO: AREL\n\n— AREL adalah pemilik rute awal.\n— Node AREL menghilang saat ROUTE COLLISION.\n— Kartu AREL berpindah ke tangan orang yang ‘terpilih’.\n\nKalimat terakhir:\n“Pengganti akan dipilih.\nPengganti akan diuji.\nPengganti akan dibentuk.”",
    next: "ep4_evelyn_info_react"
  },

  ep4_evelyn_info_react: {
    type: "dialog",
    episode: 4,
    speaker: "EVELYN",
    mood: "serious",
    meta: "private",
    text:
      "…jadi bener.\n\nRouter lagi nyusun kamu.\n\nTes EP5 itu bukan soal fisik doang.\nItu soal ‘kamu mau jadi siapa’ setelah ini.\n\nKalau kamu runtuh… rute akan nulis ulang kamu.",
    next: "ep4_post_bid_common"
  },

  /* ===== COMMON AFTER FIRST BID ===== */

  ep4_post_bid_common: {
    type: "system",
    episode: 4,
    label: "AUCTION",
    meta: "phase 2",
    dangerChoices: true,
    text:
      "Putaran kedua dimulai.\n\nItem baru muncul:\n— FRAGMENT KEY (tambahan)\n— ROUTE SHIFT (pakai CROSSNODE TOKEN)\n\nCatatan:\nCROSSNODE TOKEN bisa memaksa jalur.\nTapi akan menambah perhatian Router.",
    next: "ep4_phase2_choice"
  },

  ep4_phase2_choice: {
    type: "system",
    episode: 4,
    label: "DECISION",
    meta: "phase 2",
    dangerChoices: true,
    text:
      "Tindakan putaran kedua.\n\nPilih satu.",
    choices: [
      {
        title: "Ambil FRAGMENT lagi",
        desc: "Kejar 2/3 atau 3/3 kunci.",
        icon: "F",
        risk: true,
        to: "ep4_take_fragment_01",
        effects: () => {
          state.vars.fragments = (state.vars.fragments || 1); // kalau sudah punya 1/3 dari EXIT KEY path
          state.vars.fragments = Math.min(3, state.vars.fragments + 1);
          state.vars.memoryDebt = Math.min(9, (state.vars.memoryDebt || 0) + 1);
        }
      },
      {
        title: "Pakai CROSSNODE TOKEN",
        desc: "Paksa ROUTE SHIFT (bahaya).",
        icon: "⧉",
        risk: true,
        to: "ep4_route_shift_01",
        effects: () => {
          state.vars.usedToken = true;
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
        }
      },
      {
        title: "Stop dan keluar",
        desc: "Tinggalkan Auction sebelum fase akhir.",
        icon: "→",
        risk: true,
        to: "ep4_leave_01",
        effects: () => {
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      }
    ]
  },

  ep4_take_fragment_01: {
    type: "system",
    episode: 4,
    label: "GAIN",
    meta: "FRAGMENTS",
    dangerChoices: true,
    text:
      "FRAGMENT KEY bertambah.\n\nSekarang fragmen kamu:\n(cek variabel fragments)\n\nHarga:\n1 ingatan kecil lagi.\n\nKamu mulai kesulitan mengingat urutan kejadian barusan.\nTidak hilang total.\nTapi kabur.",
    next: "ep4_fragment_check"
  },

  ep4_fragment_check: {
    type: "system",
    episode: 4,
    label: "CHECK",
    meta: "fragments",
    dangerChoices: true,
    text:
      "SYSTEM memeriksa fragmen.\n\nJika fragmen = 3/3, kamu bisa membentuk KEY.\nJika belum, kamu membawa fragmen ke episode berikutnya.",
    next: "ep4_fragment_resolve"
  },

  ep4_fragment_resolve: {
    type: "system",
    episode: 4,
    label: "RESOLVE",
    meta: "key",
    dangerChoices: true,
    text:
      "Jika kamu sudah 3/3:\nSYSTEM membentuk ‘FRAGMENT KEY’ menjadi satu kunci kecil.\n\nJika belum:\nfragmen disimpan.\n\nKunci ini tidak langsung membuka EXIT.\nTapi bisa membuka ‘pintu samping’ di tes EP5.",
    next: "ep4_endgate_01"
  },

  ep4_route_shift_01: {
    type: "system",
    episode: 4,
    label: "ROUTE SHIFT",
    meta: "token used",
    dangerChoices: true,
    text:
      "CROSSNODE TOKEN digunakan.\n\nLantai bergetar.\nPapan Auction retak.\n\nSYSTEM:\n“Paksaan rute terdeteksi.”\n\nSemua peserta menoleh.\nBukan karena suara.\nTapi karena sistem mengarahkan perhatian.",
    next: "ep4_route_shift_02"
  },

  ep4_route_shift_02: {
    type: "dialog",
    episode: 4,
    speaker: "KAIRO",
    mood: "flat",
    meta: "warning",
    text:
      "Kamu barusan narik rute…\n\nSekarang kamu jadi pusat.\nItu bukan keren.\nItu target.",
    next: "ep4_route_shift_03"
  },

  ep4_route_shift_03: {
    type: "dialog",
    episode: 4,
    speaker: "EVELYN",
    mood: "serious",
    meta: "private",
    text:
      "Aku ngerti kenapa kamu lakukan itu.\n\nTapi kalau Router udah ‘melihat’ kamu penuh…\nMataku juga bisa berubah.\nDan kalau itu terjadi… jangan takut sama aku.\nTakutlah sama apa yang Router coba bikin dari aku.",
    next: "ep4_endgate_01"
  },

  ep4_leave_01: {
    type: "system",
    episode: 4,
    label: "LEAVE",
    meta: "exit auction",
    dangerChoices: true,
    text:
      "Kamu memilih keluar.\n\nDi belakangmu, papan menulis:\n“PESERTA YANG MENOLAK MENAWAR = KOMODITAS.”\n\nLampu meredup.\nSesuatu memilih harga dari jarak jauh.",
    next: "ep4_leave_02"
  },

  ep4_leave_02: {
    type: "system",
    episode: 4,
    label: "BACK-BID",
    meta: "last strike",
    dangerChoices: true,
    text:
      "Bid balik terjadi.\n\nSYSTEM mengambil:\n— +1 Memory Debt\n\natau\n— +1 Router Aggro\n\nKamu menggigit bibir.\nBukan sakit.\nPerasaan… hilang tipis.",
    next: "ep4_endgate_01"
  },

  /* ===== EP4 END ===== */

  ep4_endgate_01: {
    type: "system",
    episode: 4,
    label: "END",
    meta: "auction complete",
    dangerChoices: true,
    text:
      "AUCTION berakhir.\n\nAula memudar.\nLorong kembali.\n\nDi lantai, simbol kartu AREL terbakar samar.\n\nSYSTEM:\n“EP5: SUCCESSOR TRIAL.”",
    next: "ep4_endgate_02"
  },

  ep4_endgate_02: {
    type: "dialog",
    episode: 4,
    speaker: "EVELYN",
    mood: "quiet",
    meta: "private",
    text:
      "EP5 bakal nyari ‘inti’ kamu.\n\nKalau kamu punya SAFE PASS… simpan.\nKalau kamu punya fragmen… simpan.\n\nDan kalau kamu punya rasa takut…\nJangan lawan sendirian.\n\nAku ada di sini.",
    next: "ep5_start"
  },

  /* =========================
     EP5 placeholder (next pack)
     ========================= */

  ep5_start: {
    type: "system",
    episode: 5,
    label: "LOADING",
    meta: "EP5",
    dangerChoices: true,
    text:
      "EP5 akan dimuat.\n\nTes pengganti dimulai.\n\nKetik: “lanjut EP5” untuk PACK berikutnya (EP5–EP6 FULL).",
    next: null
  }

});
/* =========================================================
   STORY PACK — EP5
   EPISODE 5: SUCCESSOR TRIAL
   Paste BEFORE final "})();"
   ========================================================= */

Object.assign(STORY, {

  /* =========================
     EP5 START
     ========================= */

  ep5_start: {
    type: "system",
    episode: 5,
    label: "SUCCESSOR TRIAL",
    meta: "entry",
    dangerChoices: true,
    text:
      "EPISODE 5: SUCCESSOR TRIAL\n\nLorong berakhir.\n\nRuang ini… kosong.\nTidak ada pintu.\nTidak ada jam.\n\nSYSTEM:\n\"Tes ini tidak mengukur kekuatan.\"",
    next: "ep5_rule"
  },

  ep5_rule: {
    type: "system",
    episode: 5,
    label: "RULE",
    meta: "trial condition",
    dangerChoices: true,
    text:
      "ATURAN:\n\n— Tidak ada pilihan benar.\n— Tidak ada jawaban aman.\n— Kamu tidak diuji sebagai pemain.\n\nKamu diuji sebagai:\nPENGGANTI.",
    next: "ep5_face_evelyn"
  },

  ep5_face_evelyn: {
    type: "dialog",
    episode: 5,
    speaker: "EVELYN",
    mood: "serious",
    meta: "forced sync",
    text:
      "Dari semua tes…\nIni yang paling berbahaya.\n\nKarena kamu nggak bisa pura-pura.\nSYSTEM bakal narik keputusan dari hal yang kamu sembunyikan.",
    next: "ep5_memory_pull"
  },

  ep5_memory_pull: {
    type: "system",
    episode: 5,
    label: "SCAN",
    meta: "memory extraction",
    dangerChoices: true,
    text:
      "MEMORY SCAN DIMULAI.\n\nFragmen muncul di udara.\n\n— Ketakutan pertama.\n— Pilihan yang kamu sesali.\n— Nama yang terus diulang.\n\nNama itu:\nAREL",
    next: "ep5_choice_identity"
  },

  /* =========================
     CORE DECISION
     ========================= */

  ep5_choice_identity: {
    type: "system",
    episode: 5,
    label: "IDENTITY CHECK",
    meta: "core choice",
    dangerChoices: true,
    text:
      "SYSTEM bertanya:\n\n\"Jika kamu menggantikan AREL…\"\n\n\"Apa yang akan kamu ubah?\"",
    choices: [
      {
        title: "Mengubah sistem dari dalam",
        desc: "Menjadi pengganti yang melawan Router.",
        icon: "Δ",
        risk: true,
        to: "ep5_choice_rebel",
        effects: () => {
          state.vars.successorType = "REBEL";
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
        }
      },
      {
        title: "Menjalankan rute sebaik mungkin",
        desc: "Menjadi pengganti yang efisien.",
        icon: "□",
        risk: true,
        to: "ep5_choice_executor",
        effects: () => {
          state.vars.successorType = "EXECUTOR";
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      },
      {
        title: "Menolak menjadi pengganti",
        desc: "Tetap sebagai dirimu sendiri.",
        icon: "×",
        risk: true,
        to: "ep5_choice_refuse",
        effects: () => {
          state.vars.successorType = "REFUSER";
          state.vars.memoryDebt = Math.min(9, (state.vars.memoryDebt || 0) + 1);
        }
      }
    ]
  },

  /* =========================
     OUTCOMES
     ========================= */

  ep5_choice_rebel: {
    type: "system",
    episode: 5,
    label: "RESULT",
    meta: "rebel path",
    dangerChoices: true,
    text:
      "SYSTEM diam lebih lama dari biasanya.\n\nLalu menulis:\n\"Perlawanan dicatat.\"",
    next: "ep5_evelyn_react_rebel"
  },

  ep5_evelyn_react_rebel: {
    type: "dialog",
    episode: 5,
    speaker: "EVELYN",
    mood: "worried",
    meta: "private",
    text:
      "…jadi kamu pilih jalan itu.\n\nAku harap kamu siap.\nKarena Router nggak suka orang yang mencoba menulis ulang dirinya.",
    next: "ep5_end"
  },

  ep5_choice_executor: {
    type: "system",
    episode: 5,
    label: "RESULT",
    meta: "executor path",
    dangerChoices: true,
    text:
      "SYSTEM:\n\"Kepatuhan terdeteksi.\"",
    next: "ep5_evelyn_react_exec"
  },

  ep5_evelyn_react_exec: {
    type: "dialog",
    episode: 5,
    speaker: "EVELYN",
    mood: "quiet",
    meta: "private",
    text:
      "Kalau itu pilihanmu…\n\nPastikan kamu nggak lupa kenapa kamu mulai.\nKarena banyak orang jadi kosong di jalur ini.",
    next: "ep5_end"
  },

  ep5_choice_refuse: {
    type: "system",
    episode: 5,
    label: "RESULT",
    meta: "refuse path",
    dangerChoices: true,
    text:
      "SYSTEM:\n\"Penolakan dicatat.\"",
    next: "ep5_evelyn_react_refuse"
  },

  ep5_evelyn_react_refuse: {
    type: "dialog",
    episode: 5,
    speaker: "EVELYN",
    mood: "soft",
    meta: "private",
    text:
      "Itu juga keberanian.\n\nMenolak jadi sesuatu yang bukan kamu.\n\nTapi ingat… Router tidak suka kehilangan kandidat.",
    next: "ep5_end"
  },

  /* =========================
     EP5 END
     ========================= */

  ep5_end: {
    type: "system",
    episode: 5,
    label: "END",
    meta: "trial complete",
    dangerChoices: true,
    text:
      "SUCCESSOR TRIAL SELESAI.\n\nStatus kamu dikunci.\n\nSYSTEM:\n\"EP6: ROUTE DIVERGENCE.\"",
    next: "ep6_start"
  },

  ep6_start: {
    type: "system",
    episode: 6,
    label: "LOADING",
    meta: "EP6",
    dangerChoices: true,
    text:
      "EP6 akan dimuat.\n\nRute mulai benar-benar terpisah.\n\nKetik: “lanjut EP6”",
    next: null
  }

});
/* =========================================================
   STORY PACK — EP6
   EPISODE 6: ROUTE DIVERGENCE
   Paste BEFORE final "})();"
   ========================================================= */

Object.assign(STORY, {

  /* =========================
     EP6 START
     ========================= */

  ep6_start: {
    type: "system",
    episode: 6,
    label: "ROUTE DIVERGENCE",
    meta: "entry",
    dangerChoices: true,
    text:
      "EPISODE 6: ROUTE DIVERGENCE\n\nLampu padam.\n\nKetika menyala lagi…\nruangan berubah jadi tiga gerbang.\n\nSYSTEM:\n\"Rute pecah sesuai status kandidat.\"",
    next: "ep6_gate_read"
  },

  ep6_gate_read: {
    type: "system",
    episode: 6,
    label: "GATES",
    meta: "three gates",
    dangerChoices: true,
    text:
      "Tiga gerbang:\n\n1) GATE: STATIC (tenang)\n2) GATE: CRIMSON (bahaya)\n3) GATE: NULL (kosong)\n\nSYSTEM:\n\"Satu gerbang akan lebih dekat denganmu.\"",
    next: "ep6_gate_bias"
  },

  ep6_gate_bias: {
    type: "system",
    episode: 6,
    label: "BIAS",
    meta: "based on EP5",
    dangerChoices: true,
    text:
      "Gerbang bergerak.\n\nSatu di antaranya terasa ‘memanggil’.\n\nJika kamu REBEL:\nCRIMSON terasa hangat.\n\nJika kamu EXECUTOR:\nSTATIC terasa tepat.\n\nJika kamu REFUSER:\nNULL terasa sunyi.",
    next: "ep6_choice_gate"
  },

  ep6_choice_gate: {
    type: "system",
    episode: 6,
    label: "SELECT",
    meta: "gate choice",
    dangerChoices: true,
    text:
      "Pilih gerbang.\n\nCatatan:\nKamu bisa melawan bias…\nTapi Router akan mencatatnya.",
    choices: [
      {
        title: "Masuk STATIC",
        desc: "Rute stabil, tekanan psikologis halus.",
        icon: "□",
        risk: true,
        to: "ep6_static_01",
        effects: () => {
          state.vars.chosenGate = "STATIC";
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      },
      {
        title: "Masuk CRIMSON",
        desc: "Rute panas, keputusan cepat, bahaya nyata.",
        icon: "◼",
        risk: true,
        to: "ep6_crimson_01",
        effects: () => {
          state.vars.chosenGate = "CRIMSON";
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
        }
      },
      {
        title: "Masuk NULL",
        desc: "Rute hening, ilusi, dan kehilangan arah.",
        icon: "∅",
        risk: true,
        to: "ep6_null_01",
        effects: () => {
          state.vars.chosenGate = "NULL";
          state.vars.memoryDebt = Math.min(9, (state.vars.memoryDebt || 0) + 1);
        }
      }
    ]
  },

  /* =========================
     STATIC ROUTE
     ========================= */

  ep6_static_01: {
    type: "system",
    episode: 6,
    label: "STATIC",
    meta: "white corridor",
    text:
      "Kamu masuk STATIC.\n\nLorong putih.\nSunyi.\n\nTapi ada suara kecil:\nseperti radio rusak.\n\nSYSTEM:\n\"Stabilitas bukan berarti aman.\"",
    next: "ep6_static_02"
  },

  ep6_static_02: {
    type: "dialog",
    episode: 6,
    speaker: "EVELYN",
    mood: "serious",
    meta: "close",
    text:
      "Static itu licik.\n\nIa bikin kamu nyaman…\nlalu ngambil sedikit demi sedikit.\n\nJangan tidur di sini.",
    next: "ep6_static_test"
  },

  ep6_static_test: {
    type: "system",
    episode: 6,
    label: "TEST",
    meta: "micro choice",
    dangerChoices: true,
    text:
      "Ujian STATIC:\n\nSebuah tombol muncul:\n\"Simpan Stabilitas +1\"\natau\n\"Ambil Info Arel (kabur)\"\n\nPilih.",
    choices: [
      {
        title: "Simpan Stabilitas",
        desc: "Main aman, tetap utuh.",
        icon: "S",
        risk: false,
        to: "ep6_static_safe",
        effects: () => {
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      },
      {
        title: "Ambil Info Arel",
        desc: "Ambil potongan rahasia, tapi bayar fokus.",
        icon: "i",
        risk: true,
        to: "ep6_static_info",
        effects: () => {
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
          state.vars.memoryDebt = Math.min(9, (state.vars.memoryDebt || 0) + 1);
        }
      }
    ]
  },

  ep6_static_safe: {
    type: "system",
    episode: 6,
    label: "GAIN",
    meta: "stability",
    text:
      "Stabilitas naik.\n\nTombol menghilang.\n\nSuara radio mengecil.\n\nSYSTEM:\n\"Kandidat memilih bertahan.\"",
    next: "ep6_common_merge"
  },

  ep6_static_info: {
    type: "system",
    episode: 6,
    label: "INFO",
    meta: "arel fragment",
    dangerChoices: true,
    text:
      "Fragmen info masuk.\n\nKalimat kabur:\n\"AREL tidak hilang… dia dipindahkan ke…\"\n\nSisa kalimat terpotong.\n\nKepalamu berdenyut.\nSeakan kamu memaksa pintu yang tidak mau dibuka.",
    next: "ep6_common_merge"
  },

  /* =========================
     CRIMSON ROUTE
     ========================= */

  ep6_crimson_01: {
    type: "system",
    episode: 6,
    label: "CRIMSON",
    meta: "red corridor",
    dangerChoices: true,
    text:
      "Kamu masuk CRIMSON.\n\nLorong merah.\nLampu berkedip cepat.\n\nSYSTEM:\n\"Keputusan lambat = hukuman.\"",
    next: "ep6_crimson_02"
  },

  ep6_crimson_02: {
    type: "dialog",
    episode: 6,
    speaker: "KAIRO",
    mood: "cold",
    meta: "pace",
    text:
      "Jangan mikir lama.\n\nDi Crimson, Router ngukur kamu dari respon pertama.\nKalau ragu… kamu jadi mainan.",
    next: "ep6_crimson_test"
  },

  ep6_crimson_test: {
    type: "system",
    episode: 6,
    label: "TEST",
    meta: "rush choice",
    dangerChoices: true,
    text:
      "Ujian CRIMSON:\n\nPintu terbuka dua:\nA) Selamatkan satu peserta jatuh\nB) Ambil kartu akses di lantai\n\nWaktu: 5 detik.",
    choices: [
      {
        title: "Selamatkan peserta",
        desc: "Resiko, tapi manusiawi.",
        icon: "A",
        risk: true,
        to: "ep6_crimson_save",
        effects: () => {
          state.vars.humanity = Math.min(9, (state.vars.humanity || 0) + 1);
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      },
      {
        title: "Ambil kartu akses",
        desc: "Efisien, dingin.",
        icon: "B",
        risk: true,
        to: "ep6_crimson_take",
        effects: () => {
          state.vars.hasAccessCard = true;
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      }
    ]
  },

  ep6_crimson_save: {
    type: "system",
    episode: 6,
    label: "RESULT",
    meta: "save",
    dangerChoices: true,
    text:
      "Kamu menarik peserta itu.\n\nDia selamat.\nTapi Router mencatat:\n\"Intervensi.\" \n\nLampu berkedip semakin cepat.\n\nSYSTEM:\n\"Kandidat memperlambat rute.\"",
    next: "ep6_common_merge"
  },

  ep6_crimson_take: {
    type: "system",
    episode: 6,
    label: "GAIN",
    meta: "card",
    text:
      "Kartu akses di tangan.\n\nPeserta jatuh… menghilang di balik pintu.\n\nSYSTEM:\n\"Kandidat memilih efisiensi.\"",
    next: "ep6_common_merge"
  },

  /* =========================
     NULL ROUTE
     ========================= */

  ep6_null_01: {
    type: "system",
    episode: 6,
    label: "NULL",
    meta: "silent corridor",
    dangerChoices: true,
    text:
      "Kamu masuk NULL.\n\nSemua suara hilang.\nSeperti dunia tanpa udara.\n\nSYSTEM:\n\"Kehilangan arah memperlihatkan inti.\"",
    next: "ep6_null_02"
  },

  ep6_null_02: {
    type: "dialog",
    episode: 6,
    speaker: "LYRA",
    mood: "low",
    meta: "whisper",
    text:
      "Null itu bukan kosong.\n\nNull itu tempat sistem nyimpen hal-hal yang ‘dibatalkan’.\n\nKalau kamu dengar namamu dipanggil…\njangan jawab.",
    next: "ep6_null_test"
  },

  ep6_null_test: {
    type: "system",
    episode: 6,
    label: "TEST",
    meta: "name bait",
    dangerChoices: true,
    text:
      "Ujian NULL:\n\nKamu mendengar suara memanggil:\n\"AREL…\"\n\nBukan namamu.\nTapi terasa dekat.\n\nApa yang kamu lakukan?",
    choices: [
      {
        title: "Jawab suara itu",
        desc: "Cari arah (berbahaya).",
        icon: "Y",
        risk: true,
        to: "ep6_null_answer",
        effects: () => {
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
        }
      },
      {
        title: "Abaikan dan berjalan",
        desc: "Tetap diam, jangan terpancing.",
        icon: "N",
        risk: false,
        to: "ep6_null_ignore",
        effects: () => {
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      }
    ]
  },

  ep6_null_answer: {
    type: "system",
    episode: 6,
    label: "PUNISH",
    meta: "bait triggered",
    dangerChoices: true,
    text:
      "Suara berhenti.\n\nTiba-tiba…\nruang menulis balik.\n\nSYSTEM:\n\"Kandidat menjawab nama yang bukan miliknya.\"\n\nKepalamu pusing.\nSeolah identitasmu ditarik keluar sesaat.",
    next: "ep6_common_merge"
  },

  ep6_null_ignore: {
    type: "system",
    episode: 6,
    label: "PASS",
    meta: "bait ignored",
    text:
      "Kamu tidak menjawab.\n\nSuara itu memudar.\n\nSYSTEM:\n\"Kandidat menolak umpan.\"",
    next: "ep6_common_merge"
  },

  /* =========================
     MERGE + EP6 END
     ========================= */

  ep6_common_merge: {
    type: "system",
    episode: 6,
    label: "MERGE",
    meta: "routes converge",
    dangerChoices: true,
    text:
      "Gerbang menghilang.\n\nKamu kembali ke satu lorong.\n\nDi dinding ada tulisan baru:\n\"SUCCESSOR STATUS: STABIL / DIBURU / KABUR\"\n\nSYSTEM:\n\"EP7 akan memilih ‘partner’ atau ‘pemberat’.\"",
    next: "ep6_evelyn_shift"
  },

  ep6_evelyn_shift: {
    type: "dialog",
    episode: 6,
    speaker: "EVELYN",
    mood: "serious",
    meta: "eye hint",
    text:
      "Aku bisa ngerasain Router makin dekat.\n\nKalau nanti mataku berubah…\nitu bukan aku yang berubah.\n\nItu sistem yang nyoba pakai aku.\n\nJangan ragu… tapi juga jangan benci aku.",
    next: "ep6_end"
  },

  ep6_end: {
    type: "system",
    episode: 6,
    label: "END",
    meta: "episode clear",
    dangerChoices: true,
    text:
      "EPISODE 6 SELESAI.\n\nSYSTEM:\n\"EP7: PARTNER PROTOCOL.\"",
    next: "ep7_start"
  },

  ep7_start: {
    type: "system",
    episode: 7,
    label: "LOADING",
    meta: "EP7",
    dangerChoices: true,
    text:
      "EP7 akan dimuat.\n\nKetik: “lanjut EP7”",
    next: null
  }

});
/* =========================================================
   STORY PACK — EP7
   EPISODE 7: PARTNER PROTOCOL
   Paste BEFORE final "})();"
   ========================================================= */

Object.assign(STORY, {

  ep7_start: {
    type: "system",
    episode: 7,
    label: "PARTNER PROTOCOL",
    meta: "entry",
    dangerChoices: true,
    text:
      "EPISODE 7: PARTNER PROTOCOL\n\nLorong berakhir di ruang kelas.\nTapi kursinya rapi seperti ujian nasional.\n\nSYSTEM:\n\"Rute tidak stabil tanpa pasangan.\"",
    next: "ep7_rule"
  },

  ep7_rule: {
    type: "system",
    episode: 7,
    label: "RULE",
    meta: "pairing",
    dangerChoices: true,
    text:
      "ATURAN:\n\n— Kamu harus memilih 'Partner Protocol'.\n— Partner bisa jadi pelindung… atau pemberat.\n— Jika kamu menolak memilih, Router akan memilihkan.\n\nSYSTEM:\n\"Kandidat pengganti butuh saksi.\"",
    next: "ep7_candidates"
  },

  ep7_candidates: {
    type: "system",
    episode: 7,
    label: "CANDIDATES",
    meta: "available",
    dangerChoices: true,
    text:
      "Tiga kandidat terdeteksi:\n\n1) EVELYN (private channel)\n2) KAIRO (crossnode)\n3) LYRA (signal)\n\nCatatan:\nPilihanmu akan memengaruhi EP8.",
    next: "ep7_choose_partner"
  },

  ep7_choose_partner: {
    type: "system",
    episode: 7,
    label: "SELECT",
    meta: "partner",
    dangerChoices: true,
    text:
      "Pilih Partner Protocol.\n\nIni bukan sekadar teman.\nIni adalah 'kunci' yang menempel pada rute kamu.",
    choices: [
      {
        title: "EVELYN",
        desc: "Dekat, intuitif, tapi ada sesuatu di matanya…",
        icon: "E",
        risk: true,
        to: "ep7_pick_evelyn",
        effects: () => {
          state.vars.partner = "EVELYN";
          state.vars.evelynTrust = Math.min(9, (state.vars.evelynTrust || 0) + 1);
          state.vars.bond = Math.min(9, (state.vars.bond || 0) + 1);
        }
      },
      {
        title: "KAIRO",
        desc: "Stabil, tak banyak bicara, cocok untuk bertahan.",
        icon: "K",
        risk: true,
        to: "ep7_pick_kairo",
        effects: () => {
          state.vars.partner = "KAIRO";
          state.vars.kairoTrust = (state.vars.kairoTrust || 0) + 1;
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      },
      {
        title: "LYRA",
        desc: "Peka pada pola Router, tapi sinyalnya berbahaya.",
        icon: "L",
        risk: true,
        to: "ep7_pick_lyra",
        effects: () => {
          state.vars.partner = "LYRA";
          state.vars.lyraTrust = (state.vars.lyraTrust || 0) + 1;
          state.vars.memoryDebt = Math.min(9, (state.vars.memoryDebt || 0) + 1);
        }
      }
    ]
  },

  /* =========================
     EVELYN PARTNER
     ========================= */

  ep7_pick_evelyn: {
    type: "dialog",
    episode: 7,
    speaker: "EVELYN",
    mood: "serious",
    meta: "partner locked",
    text:
      "Oke.\n\nKalau kamu milih aku…\nkamu harus jujur ke aku.\n\nKalau kamu mulai 'kabur' dari dirimu sendiri,\naku bakal tarik kamu balik.\nMau nggak mau.",
    next: "ep7_partner_test"
  },

  /* =========================
     KAIRO PARTNER
     ========================= */

  ep7_pick_kairo: {
    type: "dialog",
    episode: 7,
    speaker: "KAIRO",
    mood: "flat",
    meta: "partner locked",
    text:
      "Aku nggak peduli kamu siapa.\n\nAku peduli kamu masih hidup besok.\n\nKalau kamu panik,\nikuti instruksi.\nKalau kamu nekat,\ntanggung sendiri.",
    next: "ep7_partner_test"
  },

  /* =========================
     LYRA PARTNER
     ========================= */

  ep7_pick_lyra: {
    type: "dialog",
    episode: 7,
    speaker: "LYRA",
    mood: "uneasy",
    meta: "partner locked",
    text:
      "Hehe…\n\nAku tahu kamu dipilih.\nItu sebabnya aku nempel.\n\nKalau Router berubah arah,\naku bakal dengar duluan.\n\nTapi… kalau aku mulai ngomong aneh,\njangan langsung percaya.",
    next: "ep7_partner_test"
  },

  /* =========================
     PARTNER TEST
     ========================= */

  ep7_partner_test: {
    type: "system",
    episode: 7,
    label: "TEST",
    meta: "sync protocol",
    dangerChoices: true,
    text:
      "Partner Protocol aktif.\n\nTes sinkronisasi dimulai.\n\nRULE:\nSatu dari kalian harus 'menjadi saksi'.\nYang lain harus 'menjadi pelaku'.\n\nSaksi = mengingat.\nPelaku = memilih.\n\nPilih peran.",
    choices: [
      {
        title: "Kamu jadi SAKSI",
        desc: "Kamu mengingat detail rute. Partner memilih.",
        icon: "S",
        risk: true,
        to: "ep7_you_witness",
        effects: () => { state.vars.role = "WITNESS"; }
      },
      {
        title: "Kamu jadi PELAKU",
        desc: "Kamu yang memilih. Partner mengingat.",
        icon: "P",
        risk: true,
        to: "ep7_you_actor",
        effects: () => { state.vars.role = "ACTOR"; }
      }
    ]
  },

  ep7_you_witness: {
    type: "system",
    episode: 7,
    label: "ROLE",
    meta: "witness",
    dangerChoices: true,
    text:
      "Kamu memilih menjadi SAKSI.\n\nKamu merasa penglihatanmu lebih tajam.\n\nTapi tanganmu terasa berat.\nSeolah pilihan bukan lagi milikmu.",
    next: "ep7_witness_scene"
  },

  ep7_you_actor: {
    type: "system",
    episode: 7,
    label: "ROLE",
    meta: "actor",
    dangerChoices: true,
    text:
      "Kamu memilih menjadi PELAKU.\n\nKamu merasa tubuhmu lebih ringan.\n\nTapi kepala terasa kosong.\nSeolah ingatanmu dititipkan pada orang lain.",
    next: "ep7_actor_scene"
  },

  /* ===== Witness path scene ===== */

  ep7_witness_scene: {
    type: "system",
    episode: 7,
    label: "SCENE",
    meta: "mirror desk",
    dangerChoices: true,
    text:
      "Di meja ujian, muncul dua lembar:\n\n1) Lembar 'Kebenaran'\n2) Lembar 'Ingatan'\n\nPartner menatapmu.\nRouter menunggu keputusan partner.",
    next: "ep7_partner_decides"
  },

  ep7_partner_decides: {
    type: "dialog",
    episode: 7,
    speaker: "PARTNER",
    mood: "—",
    meta: "decision",
    text:
      "Aku yang milih.\n\nKalau salah… aku yang tanggung.\n\nTapi kamu jadi saksi.\nKamu bakal ingat semuanya.",
    next: "ep7_partner_pick"
  },

  ep7_partner_pick: {
    type: "system",
    episode: 7,
    label: "CHOICE",
    meta: "partner chooses",
    dangerChoices: true,
    text:
      "Partner memilih:\n\nTRUTH atau MEMORY.\n\n(Saksi akan mengingat konsekuensi.)",
    choices: [
      {
        title: "Partner pilih TRUTH",
        desc: "Router makin dekat, tapi info bertambah.",
        icon: "T",
        risk: true,
        to: "ep7_witness_truth",
        effects: () => {
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      },
      {
        title: "Partner pilih MEMORY",
        desc: "Deteksi turun, tapi ada yang hilang.",
        icon: "M",
        risk: true,
        to: "ep7_witness_memory",
        effects: () => {
          state.vars.memoryDebt = Math.min(9, (state.vars.memoryDebt || 0) + 1);
        }
      }
    ]
  },

  ep7_witness_truth: {
    type: "system",
    episode: 7,
    label: "SYNC",
    meta: "truth chosen",
    dangerChoices: true,
    text:
      "TRUTH dipilih.\n\nKamu melihat kilatan:\nAREL… berdiri di ruang yang sama.\n\nTapi wajahnya blur.\n\nSYSTEM:\n\"Saksi melihat bayangan node.\"",
    next: "ep7_end"
  },

  ep7_witness_memory: {
    type: "system",
    episode: 7,
    label: "SYNC",
    meta: "memory chosen",
    dangerChoices: true,
    text:
      "MEMORY dipilih.\n\nKamu tetap ingat.\nTapi partner… diam.\n\nKamu sadar:\npartner kehilangan satu hal kecil.\nMungkin namanya sendiri… sebentar tadi.\n\nSYSTEM:\n\"Saksi menyimpan beban.\"",
    next: "ep7_end"
  },

  /* ===== Actor path scene ===== */

  ep7_actor_scene: {
    type: "system",
    episode: 7,
    label: "SCENE",
    meta: "two doors",
    dangerChoices: true,
    text:
      "Dua pintu muncul:\n\n1) Pintu biru (TRUTH)\n2) Pintu hitam (MEMORY)\n\nPartner berdiri di belakangmu.\nDia akan mengingat apa pun yang terjadi.",
    next: "ep7_actor_pick"
  },

  ep7_actor_pick: {
    type: "system",
    episode: 7,
    label: "CHOICE",
    meta: "actor chooses",
    dangerChoices: true,
    text:
      "Pilih pintu.",
    choices: [
      {
        title: "Masuk pintu biru (TRUTH)",
        desc: "Ambil info, bayar perhatian Router.",
        icon: "T",
        risk: true,
        to: "ep7_actor_truth",
        effects: () => {
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      },
      {
        title: "Masuk pintu hitam (MEMORY)",
        desc: "Selamatkan diri dari deteksi, bayar memori.",
        icon: "M",
        risk: true,
        to: "ep7_actor_memory",
        effects: () => {
          state.vars.memoryDebt = Math.min(9, (state.vars.memoryDebt || 0) + 1);
        }
      }
    ]
  },

  ep7_actor_truth: {
    type: "system",
    episode: 7,
    label: "TRUTH",
    meta: "glimpse",
    dangerChoices: true,
    text:
      "Kamu masuk pintu biru.\n\nDi dalam… layar besar.\n\nTulisan:\n\"AREL tidak hilang.\nAREL dipindahkan ke NODE: CORE.\"",
    next: "ep7_end"
  },

  ep7_actor_memory: {
    type: "system",
    episode: 7,
    label: "MEMORY",
    meta: "cost",
    dangerChoices: true,
    text:
      "Kamu masuk pintu hitam.\n\nKamu keluar dengan rasa kosong.\n\nPartner menatapmu:\n\"Kamu tadi… mau bilang apa?\"\n\nKamu tidak ingat.\n\nSYSTEM:\n\"Pelaku membayar kata.\"",
    next: "ep7_end"
  },

  /* =========================
     EP7 END
     ========================= */

  ep7_end: {
    type: "system",
    episode: 7,
    label: "END",
    meta: "protocol complete",
    dangerChoices: true,
    text:
      "PARTNER PROTOCOL selesai.\n\nRouter mencatat:\n— Partner: terkunci\n— Peran: disinkronkan\n\nSYSTEM:\n\"EP8: RED EYE EVENT.\"",
    next: "ep8_start"
  },

  ep8_start: {
    type: "system",
    episode: 8,
    label: "LOADING",
    meta: "EP8",
    dangerChoices: true,
    text:
      "EP8 akan dimuat.\n\nKetik: “lanjut EP8”",
    next: null
  }

});
/* =========================================================
   STORY PACK — EP8
   EPISODE 8: RED EYE EVENT
   Paste BEFORE final "})();"
   ========================================================= */

Object.assign(STORY, {

  /* =========================
     EP8 START
     ========================= */

  ep8_start: {
    type: "system",
    episode: 8,
    label: "RED EYE EVENT",
    meta: "entry",
    dangerChoices: true,
    text:
      "EPISODE 8: RED EYE EVENT\n\nAlarm tidak berbunyi.\n\nJustru… terlalu tenang.\n\nSYSTEM:\n\"Anomali visual terdeteksi.\"",
    next: "ep8_warning"
  },

  ep8_warning: {
    type: "system",
    episode: 8,
    label: "WARNING",
    meta: "visual anomaly",
    dangerChoices: true,
    text:
      "PERINGATAN:\n\n— Event ini tidak bisa dilewati.\n— Partner Protocol tetap aktif.\n— Respon emosional akan dicatat.\n\nSYSTEM:\n\"Jangan menatap terlalu lama.\"",
    next: "ep8_evelyn_shift"
  },

  ep8_evelyn_shift: {
    type: "dialog",
    episode: 8,
    speaker: "EVELYN",
    mood: "unstable",
    meta: "red eye hint",
    text:
      "…aku mulai dengar suara lain.\n\nBukan Router.\n\nSeperti… gema dari belakang mataku.\n\nKalau nanti aku berubah sikap,\natau mataku berubah warna…\n\njangan langsung menjauh.",
    next: "ep8_event_trigger"
  },

  /* =========================
     EVENT TRIGGER
     ========================= */

  ep8_event_trigger: {
    type: "system",
    episode: 8,
    label: "EVENT",
    meta: "trigger",
    dangerChoices: true,
    text:
      "Cahaya menyapu ruangan.\n\nUntuk sesaat…\nsemua berhenti.\n\nLalu kamu melihatnya:\n\nMata EVELYN menyala merah.",
    next: "ep8_red_eye_state"
  },

  ep8_red_eye_state: {
    type: "system",
    episode: 8,
    label: "STATE",
    meta: "red eye active",
    dangerChoices: true,
    text:
      "RED EYE STATE AKTIF.\n\nRouter mencoba menggunakan node EVELYN.\n\nSYSTEM:\n\"Partner menjadi medium.\"",
    next: "ep8_choice_react"
  },

  /* =========================
     CORE REACTION
     ========================= */

  ep8_choice_react: {
    type: "system",
    episode: 8,
    label: "REACTION",
    meta: "core choice",
    dangerChoices: true,
    text:
      "EVELYN berdiri kaku.\n\nSuara lain keluar dari mulutnya:\n\"Kandidat pengganti terkonfirmasi.\" \n\nApa yang kamu lakukan?",
    choices: [
      {
        title: "Tetap mendekat",
        desc: "Percaya pada EVELYN.",
        icon: "→",
        risk: true,
        to: "ep8_stay_close",
        effects: () => {
          state.vars.bond = Math.min(9, (state.vars.bond || 0) + 1);
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      },
      {
        title: "Menjauh selangkah",
        desc: "Jaga jarak aman.",
        icon: "←",
        risk: true,
        to: "ep8_step_back",
        effects: () => {
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      },
      {
        title: "Panggil nama aslinya",
        desc: "Tarik kesadarannya.",
        icon: "!",
        risk: true,
        to: "ep8_call_name",
        effects: () => {
          state.vars.bond = Math.min(9, (state.vars.bond || 0) + 2);
          state.vars.memoryDebt = Math.min(9, (state.vars.memoryDebt || 0) + 1);
        }
      }
    ]
  },

  /* =========================
     PATHS
     ========================= */

  ep8_stay_close: {
    type: "dialog",
    episode: 8,
    speaker: "EVELYN",
    mood: "glitched",
    meta: "possession strain",
    text:
      "Kamu…\n\njangan terlalu dekat.\n\nSuara ini…\nkalau dia ambil alih penuh,\naku nggak yakin bisa berhenti.",
    next: "ep8_router_voice"
  },

  ep8_step_back: {
    type: "system",
    episode: 8,
    label: "DISTANCE",
    meta: "containment",
    dangerChoices: true,
    text:
      "Kamu mundur.\n\nMata merah itu berkedip.\n\nSYSTEM:\n\"Kandidat memilih mitigasi.\"",
    next: "ep8_router_voice"
  },

  ep8_call_name: {
    type: "dialog",
    episode: 8,
    speaker: "MC",
    mood: "urgent",
    meta: "name call",
    text:
      "EVELYN!\n\nDengar aku.\nKamu bukan rute.\nKamu bukan node.\n\nKamu kamu.",
    next: "ep8_breakthrough"
  },

  ep8_breakthrough: {
    type: "system",
    episode: 8,
    label: "FLUCTUATION",
    meta: "identity clash",
    dangerChoices: true,
    text:
      "Nama itu beresonansi.\n\nMata merah meredup… lalu menyala lagi.\n\nSYSTEM:\n\"Gangguan identitas terdeteksi.\"",
    next: "ep8_router_voice"
  },

  /* =========================
     ROUTER INTERVENTION
     ========================= */

  ep8_router_voice: {
    type: "system",
    episode: 8,
    label: "ROUTER",
    meta: "direct address",
    dangerChoices: true,
    text:
      "Suara baru memenuhi ruangan.\n\n\"Pengganti…\"\n\"Kamu terlalu cepat terikat.\" \n\n\"Ikatan mengganggu optimasi.\"",
    next: "ep8_final_choice"
  },

  ep8_final_choice: {
    type: "system",
    episode: 8,
    label: "DECISION",
    meta: "override",
    dangerChoices: true,
    text:
      "Router memberi opsi:\n\n— Lepaskan EVELYN (stabil)\n— Pertahankan EVELYN (berbahaya)\n\nPilih.",
    choices: [
      {
        title: "Lepaskan",
        desc: "Potong ikatan, tekan Event.",
        icon: "□",
        risk: true,
        to: "ep8_release",
        effects: () => {
          state.vars.bond = Math.max(0, (state.vars.bond || 0) - 2);
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 2);
        }
      },
      {
        title: "Pertahankan",
        desc: "Lawan Router secara emosional.",
        icon: "■",
        risk: true,
        to: "ep8_hold",
        effects: () => {
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
          state.vars.bond = Math.min(9, (state.vars.bond || 0) + 1);
        }
      }
    ]
  },

  /* =========================
     ENDINGS
     ========================= */

  ep8_release: {
    type: "system",
    episode: 8,
    label: "RESOLVE",
    meta: "event suppressed",
    dangerChoices: true,
    text:
      "Kamu menarik dirimu menjauh.\n\nIkatan terputus sebagian.\n\nMata EVELYN kembali biru.\nDia jatuh berlutut.\n\nSYSTEM:\n\"Event ditekan.\"",
    next: "ep8_release_after"
  },

  ep8_release_after: {
    type: "dialog",
    episode: 8,
    speaker: "EVELYN",
    mood: "tired",
    meta: "distance",
    text:
      "Kamu…\n\nmilih yang aman.\n\nItu masuk akal.\n\nCuma… jangan heran kalau setelah ini\naku agak menjauh.\nBukan karena marah.\nKarena takut.",
    next: "ep8_end"
  },

  ep8_hold: {
    type: "system",
    episode: 8,
    label: "RESOLVE",
    meta: "event embraced",
    dangerChoices: true,
    text:
      "Kamu bertahan.\n\nTekanan melonjak.\n\nMata EVELYN merah terang.\n\nTapi… dia masih berdiri.\n\nSYSTEM:\n\"Ikatan tidak dilepas.\"",
    next: "ep8_hold_after"
  },

  ep8_hold_after: {
    type: "dialog",
    episode: 8,
    speaker: "EVELYN",
    mood: "controlled",
    meta: "red eye calm",
    text:
      "Aku masih di sini.\n\nSuara itu… belum pergi.\nTapi sekarang dia tahu:\naku bukan kosong.\n\nKalau nanti aku kehilangan kontrol…\n\njangan lari.\nTarik aku balik.",
    next: "ep8_end"
  },

  /* =========================
     EP8 END
     ========================= */

  ep8_end: {
    type: "system",
    episode: 8,
    label: "END",
    meta: "event complete",
    dangerChoices: true,
    text:
      "RED EYE EVENT selesai.\n\nRouter mencatat:\n— Ikatan: dinilai\n— Risiko: meningkat\n\nSYSTEM:\n\"EP9: CORE APPROACH.\"",
    next: "ep9_start"
  },

  ep9_start: {
    type: "system",
    episode: 9,
    label: "LOADING",
    meta: "EP9",
    dangerChoices: true,
    text:
      "EP9 akan dimuat.\n\nKetik: “lanjut EP9”",
    next: null
  }

});
/* =========================================================
   STORY PACK — EP9
   EPISODE 9: CORE APPROACH
   Paste BEFORE final "})();"
   ========================================================= */

Object.assign(STORY, {

  /* =========================
     EP9 START
     ========================= */

  ep9_start: {
    type: "system",
    episode: 9,
    label: "CORE APPROACH",
    meta: "entry",
    dangerChoices: true,
    text:
      "EPISODE 9: CORE APPROACH\n\nLorong berubah jadi tangga turun.\n\nSemakin turun, semakin terasa:\nini bukan sekolah.\n\nSYSTEM:\n\"CORE berada di bawah struktur.”",
    next: "ep9_status_read"
  },

  ep9_status_read: {
    type: "system",
    episode: 9,
    label: "STATUS",
    meta: "variables",
    dangerChoices: true,
    text:
      "SYSTEM membaca status kandidat:\n\n— Successor Type: (REBEL / EXECUTOR / REFUSER)\n— Partner: (EVELYN / KAIRO / LYRA)\n— Aggro / Debt / Stability: berjalan\n\nCatatan:\nSemakin dekat CORE, semakin sedikit kebohongan yang bisa kamu simpan.",
    next: "ep9_partner_talk"
  },

  ep9_partner_talk: {
    type: "dialog",
    episode: 9,
    speaker: "PARTNER",
    mood: "—",
    meta: "walking",
    text:
      "…kita beneran turun ke CORE.\n\nKalau rumor benar,\nCORE itu tempat rute ditulis.\n\nDan kalau kita masuk,\nberarti Router ngizinin kita lihat sesuatu…\natau mau kita jadi bagian darinya.",
    next: "ep9_evelyn_private"
  },

  ep9_evelyn_private: {
    type: "dialog",
    episode: 9,
    speaker: "EVELYN",
    mood: "quiet",
    meta: "private channel",
    text:
      "Aku nggak suka bagian ini.\n\nSemakin dekat CORE,\nsemakin sering aku ngerasa…\naku pernah di sini.\n\nDan setiap kali aku ingat,\nmataku panas.",
    next: "ep9_core_door"
  },

  /* =========================
     CORE DOOR
     ========================= */

  ep9_core_door: {
    type: "system",
    episode: 9,
    label: "CORE DOOR",
    meta: "seal",
    dangerChoices: true,
    text:
      "Pintu besar.\nTidak ada gagang.\n\nDi tengah:\nslot kartu.\n\nTulisan:\n\"Masukkan kartu AREL.\"",
    next: "ep9_insert_choice"
  },

  ep9_insert_choice: {
    type: "system",
    episode: 9,
    label: "INPUT",
    meta: "insert card",
    dangerChoices: true,
    text:
      "Kartu AREL di tanganmu terasa berat.\n\nJika kamu masukkan:\nCORE terbuka.\nTapi Router dapat akses penuh ke statusmu.\n\nApa yang kamu lakukan?",
    choices: [
      {
        title: "Masukkan kartu",
        desc: "Buka CORE sekarang.",
        icon: "→",
        risk: true,
        to: "ep9_insert",
        effects: () => {
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      },
      {
        title: "Coba pakai FRAGMENT KEY",
        desc: "Kalau kamu punya fragmen, coba pintu samping.",
        icon: "F",
        risk: true,
        to: "ep9_try_fragment",
        effects: () => {
          state.vars.usedFragmentAtCore = true;
        }
      },
      {
        title: "Tahan dulu",
        desc: "Bicara dengan partner sebelum masuk.",
        icon: "…",
        risk: true,
        to: "ep9_talk_before"
      }
    ]
  },

  ep9_talk_before: {
    type: "dialog",
    episode: 9,
    speaker: "MC",
    mood: "tense",
    meta: "final breath",
    text:
      "Kalau kita masuk…\nnggak ada jaminan kita keluar sama.\n\nKamu masih mau ikut?",
    next: "ep9_partner_answer"
  },

  ep9_partner_answer: {
    type: "dialog",
    episode: 9,
    speaker: "PARTNER",
    mood: "—",
    meta: "answer",
    text:
      "Aku udah sampai sini.\n\nKalau aku mundur sekarang,\nberarti semua yang tadi cuma kabur.\n\nMasuk.\nKita selesaikan.",
    next: "ep9_insert_choice"
  },

  /* =========================
     FRAGMENT PATH
     ========================= */

  ep9_try_fragment: {
    type: "system",
    episode: 9,
    label: "FRAGMENT",
    meta: "side slot",
    dangerChoices: true,
    text:
      "Kamu menempelkan FRAGMENT KEY.\n\nDi samping slot utama,\nada celah tipis yang terbuka.\n\nPintu tidak terbuka penuh.\nTapi kamu mendapat akses ‘samping’.\n\nSYSTEM:\n\"Akses parsial diberikan.\"",
    next: "ep9_side_access"
  },

  ep9_side_access: {
    type: "system",
    episode: 9,
    label: "SIDE ACCESS",
    meta: "limited view",
    dangerChoices: true,
    text:
      "Kamu melihat potongan data:\n\n— NODE: CORE\n— STATUS: ACTIVE\n— PRIMARY OWNER: ???\n\nDan satu kalimat:\n\"AREL berada di dalam… tapi bukan sebagai dirinya.\"",
    next: "ep9_insert_choice"
  },

  /* =========================
     INSERT CARD PATH
     ========================= */

  ep9_insert: {
    type: "system",
    episode: 9,
    label: "OPEN",
    meta: "core unlocked",
    dangerChoices: true,
    text:
      "Kartu masuk.\n\nPintu berdenyut.\n\nSeolah pintu itu hidup.\n\nSYSTEM:\n\"CORE terbuka.\"",
    next: "ep9_core_inside"
  },

  ep9_core_inside: {
    type: "system",
    episode: 9,
    label: "CORE",
    meta: "inside",
    dangerChoices: true,
    text:
      "Di dalam… bukan ruangan.\n\nIni seperti terminal.\nLayar raksasa menggantung.\n\nAda banyak jalur seperti kabel cahaya.\n\nDi tengah:\nNODE AREL.\n\nStatus:\n\"BOUND\"",
    next: "ep9_core_question"
  },

  ep9_core_question: {
    type: "system",
    episode: 9,
    label: "QUERY",
    meta: "router test",
    dangerChoices: true,
    text:
      "CORE mengajukan pertanyaan:\n\n\"Kamu datang untuk menyelamatkan AREL…\"\n\"atau untuk menggantikannya?\"",
    choices: [
      {
        title: "Selamatkan AREL",
        desc: "Cari cara memutus BOUND.",
        icon: "A",
        risk: true,
        to: "ep9_save_arel",
        effects: () => {
          state.vars.goal = "SAVE";
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      },
      {
        title: "Gantikan AREL",
        desc: "Terima peran pengganti.",
        icon: "G",
        risk: true,
        to: "ep9_replace_arel",
        effects: () => {
          state.vars.goal = "REPLACE";
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      },
      {
        title: "Hancurkan jalur",
        desc: "Putuskan kabel rute (bahaya).",
        icon: "X",
        risk: true,
        to: "ep9_break_routes",
        effects: () => {
          state.vars.goal = "BREAK";
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
        }
      }
    ]
  },

  /* =========================
     SAVE
     ========================= */

  ep9_save_arel: {
    type: "system",
    episode: 9,
    label: "ACTION",
    meta: "save",
    dangerChoices: true,
    text:
      "Kamu menyentuh kabel NODE AREL.\n\nAda rasa dingin.\n\nKamu melihat bayangan orang:\nAREL… tapi wajahnya masih blur.\n\nSYSTEM:\n\"Mengganggu BOUND meningkatkan resiko.\"",
    next: "ep9_save_after"
  },

  ep9_save_after: {
    type: "dialog",
    episode: 9,
    speaker: "EVELYN",
    mood: "serious",
    meta: "private",
    text:
      "Kamu nggak bisa nyelamatin dia sendirian.\n\nBOUND itu perjanjian.\nKalau kamu tarik paksa,\nRouter tarik balik lebih keras.\n\nTapi…\naku bisa bantu cari celahnya.",
    next: "ep9_end"
  },

  /* =========================
     REPLACE
     ========================= */

  ep9_replace_arel: {
    type: "system",
    episode: 9,
    label: "ACTION",
    meta: "replace",
    dangerChoices: true,
    text:
      "CORE menyala.\n\nTulisan:\n\"Kandidat menerima posisi.\" \n\nNODE AREL berdenyut.\n\nSeolah kursi kosong menunggumu.",
    next: "ep9_replace_after"
  },

  ep9_replace_after: {
    type: "dialog",
    episode: 9,
    speaker: "PARTNER",
    mood: "—",
    meta: "concern",
    text:
      "Kalau kamu terima itu,\nsiapa kamu setelah ini?\n\nAku ikut kamu,\n\ntapi aku pengen kamu masih kamu.",
    next: "ep9_end"
  },

  /* =========================
     BREAK
     ========================= */

  ep9_break_routes: {
    type: "system",
    episode: 9,
    label: "ACTION",
    meta: "break",
    dangerChoices: true,
    text:
      "Kamu meraih kabel rute.\n\nSatu kabel putus.\nLayar berkedip.\n\nSYSTEM:\n\"Kerusakan CORE terdeteksi.\" \n\nSuhu turun drastis.\nRouter… marah.",
    next: "ep9_break_after"
  },

  ep9_break_after: {
    type: "dialog",
    episode: 9,
    speaker: "EVELYN",
    mood: "serious",
    meta: "red eye flicker",
    text:
      "Jangan banyak putus!\n\nKalau CORE rusak total,\nRouter bakal pakai jalur darurat.\n\nDan jalur darurat itu… biasanya pakai manusia sebagai kabel.",
    next: "ep9_end"
  },

  /* =========================
     EP9 END
     ========================= */

  ep9_end: {
    type: "system",
    episode: 9,
    label: "END",
    meta: "core approach complete",
    dangerChoices: true,
    text:
      "EPISODE 9 SELESAI.\n\nCORE menutup sebagian.\n\nSYSTEM:\n\"EP10: THE OWNER FILE.\"",
    next: "ep10_start"
  },

  ep10_start: {
    type: "system",
    episode: 10,
    label: "LOADING",
    meta: "EP10",
    dangerChoices: true,
    text:
      "EP10 akan dimuat.\n\nKetik: “lanjut EP10”",
    next: null
  }

});
/* =========================================================
   STORY PACK — EP10
   EPISODE 10: THE OWNER FILE
   Paste BEFORE final "})();"
   ========================================================= */

Object.assign(STORY, {

  /* =========================
     EP10 START
     ========================= */

  ep10_start: {
    type: "system",
    episode: 10,
    label: "THE OWNER FILE",
    meta: "entry",
    dangerChoices: true,
    text:
      "EPISODE 10: THE OWNER FILE\n\nCORE tidak menutup sepenuhnya.\n\nDi sela pintu, muncul folder transparan.\n\nNama folder:\nOWNER\n\nSYSTEM:\n\"File kepemilikan terdeteksi.\"",
    next: "ep10_rule"
  },

  ep10_rule: {
    type: "system",
    episode: 10,
    label: "RULE",
    meta: "file access",
    dangerChoices: true,
    text:
      "ATURAN AKSES:\n\n— Kamu boleh membuka 1 file.\n— File lain akan terkunci.\n— Membuka file akan memicu 'balasan' Router.\n\nSYSTEM:\n\"Pilih file yang mau kamu ketahui.\"",
    next: "ep10_files"
  },

  ep10_files: {
    type: "system",
    episode: 10,
    label: "FILES",
    meta: "list",
    dangerChoices: true,
    text:
      "Terdapat 3 file:\n\n1) FILE_A: ORIGIN\n2) FILE_B: CONTRACT\n3) FILE_C: EVIDENCE\n\nCatatan kecil:\n\"AREL terkait ketiganya.\"",
    next: "ep10_choose"
  },

  ep10_choose: {
    type: "system",
    episode: 10,
    label: "SELECT",
    meta: "pick one",
    dangerChoices: true,
    text:
      "Pilih satu file untuk dibuka.\n\nPilih dengan sadar.\nSetiap file membentuk akhir yang berbeda.",
    choices: [
      {
        title: "FILE_A: ORIGIN",
        desc: "Awal mula Router dan jalur AREL.",
        icon: "A",
        risk: true,
        to: "ep10_open_origin",
        effects: () => {
          state.vars.ownerFile = "ORIGIN";
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      },
      {
        title: "FILE_B: CONTRACT",
        desc: "Perjanjian BOUND dan syarat pengganti.",
        icon: "B",
        risk: true,
        to: "ep10_open_contract",
        effects: () => {
          state.vars.ownerFile = "CONTRACT";
          state.vars.memoryDebt = Math.min(9, (state.vars.memoryDebt || 0) + 1);
        }
      },
      {
        title: "FILE_C: EVIDENCE",
        desc: "Bukti siapa yang mengendalikan jalur.",
        icon: "C",
        risk: true,
        to: "ep10_open_evidence",
        effects: () => {
          state.vars.ownerFile = "EVIDENCE";
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
        }
      }
    ]
  },

  /* =========================
     ORIGIN
     ========================= */

  ep10_open_origin: {
    type: "system",
    episode: 10,
    label: "OPEN",
    meta: "ORIGIN",
    dangerChoices: true,
    text:
      "FILE_A: ORIGIN terbuka.\n\nTeks muncul:\n\n\"Death Router System bukan lahir dari mesin.\nIa lahir dari kebutuhan.\n\nSeseorang menciptakan jalur untuk memilih orang yang mampu menanggung keputusan.\n\nOrang pertama yang bertahan…\nAREL.\"",
    next: "ep10_origin_2"
  },

  ep10_origin_2: {
    type: "system",
    episode: 10,
    label: "ORIGIN",
    meta: "continued",
    dangerChoices: true,
    text:
      "Lanjut:\n\n\"AREL tidak diciptakan untuk menang.\nAREL diciptakan untuk menahan.\n\nSaat sistem butuh pembaruan,\nAREL dijadikan CORE ANCHOR.\" \n\nKata terakhir muncul:\n\"ANCHOR = korban yang dipakai sebagai fondasi.\"",
    next: "ep10_router_backlash"
  },

  /* =========================
     CONTRACT
     ========================= */

  ep10_open_contract: {
    type: "system",
    episode: 10,
    label: "OPEN",
    meta: "CONTRACT",
    dangerChoices: true,
    text:
      "FILE_B: CONTRACT terbuka.\n\nTeks:\n\n\"BOUND adalah kontrak.\nKontrak antara Router dan Owner.\n\nSyarat:\n— Owner butuh kandidat pengganti.\n— Kandidat harus memilih dirinya sendiri.\n\nJika kandidat menolak,\nRouter akan mencari cara membuatnya 'setuju'.\"",
    next: "ep10_contract_2"
  },

  ep10_contract_2: {
    type: "system",
    episode: 10,
    label: "CONTRACT",
    meta: "continued",
    dangerChoices: true,
    text:
      "Lanjut:\n\n\"Partner Protocol dibuat untuk mempercepat persetujuan.\nIkatan membuat kandidat lebih mudah dibentuk.\n\nJika ikatan kuat,\nRouter bisa memakai partner sebagai pengungkit.\"",
    next: "ep10_router_backlash"
  },

  /* =========================
     EVIDENCE
     ========================= */

  ep10_open_evidence: {
    type: "system",
    episode: 10,
    label: "OPEN",
    meta: "EVIDENCE",
    dangerChoices: true,
    text:
      "FILE_C: EVIDENCE terbuka.\n\nGambar teks muncul:\n\n\"Owner bukan Router.\nOwner adalah manusia.\n\nOwner menulis aturan.\nRouter mengeksekusi.\"",
    next: "ep10_evidence_2"
  },

  ep10_evidence_2: {
    type: "system",
    episode: 10,
    label: "EVIDENCE",
    meta: "continued",
    dangerChoices: true,
    text:
      "Nama Owner tidak ditulis.\n\nTapi ada petunjuk:\n\n\"Owner pernah menjadi peserta.\nOwner pernah memakai kartu AREL.\nOwner pernah gagal menyelamatkan seseorang.\n\nDan sekarang…\nOwner mencari pengganti agar ia bisa keluar.\"",
    next: "ep10_router_backlash"
  },

  /* =========================
     ROUTER BACKLASH (COMMON)
     ========================= */

  ep10_router_backlash: {
    type: "system",
    episode: 10,
    label: "BACKLASH",
    meta: "router response",
    dangerChoices: true,
    text:
      "Begitu file dibaca,\nCORE bereaksi.\n\nLampu berkedip.\nSuhu turun.\n\nSYSTEM:\n\"Akses ilegal dicatat.\" \n\nRouter tidak suka kamu tahu terlalu banyak.",
    next: "ep10_partner_risk"
  },

  ep10_partner_risk: {
    type: "dialog",
    episode: 10,
    speaker: "EVELYN",
    mood: "serious",
    meta: "red eye flicker",
    text:
      "…aku ngerasa dia narik sesuatu.\n\nBukan dari kamu.\n\nDari aku.\n\nKalau file itu tentang Contract…\natau Evidence…\nRouter mungkin bakal nyoba tekan kita lewat partner.",
    next: "ep10_choice_shield"
  },

  ep10_choice_shield: {
    type: "system",
    episode: 10,
    label: "SHIELD",
    meta: "use item?",
    dangerChoices: true,
    text:
      "Router mulai menekan.\n\nJika kamu punya SAFE PASS,\nkamu bisa pakai sekarang untuk meredam backlash.\n\nApa yang kamu lakukan?",
    choices: [
      {
        title: "Pakai SAFE PASS",
        desc: "Redam tekanan (jika punya).",
        icon: "S",
        risk: true,
        to: "ep10_use_safe",
        effects: () => {
          state.vars.usedSafePass = true;
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      },
      {
        title: "Tahan",
        desc: "Biarkan lewat, simpan SAFE PASS untuk nanti.",
        icon: "—",
        risk: true,
        to: "ep10_hold_backlash",
        effects: () => {
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      }
    ]
  },

  ep10_use_safe: {
    type: "system",
    episode: 10,
    label: "SAFE",
    meta: "pass used",
    dangerChoices: true,
    text:
      "SAFE PASS aktif.\n\nTekanan menurun.\n\nRouter mundur sedikit.\n\nSYSTEM:\n\"Penalti dibatalkan (1x).\"",
    next: "ep10_after_backlash"
  },

  ep10_hold_backlash: {
    type: "system",
    episode: 10,
    label: "PRESSURE",
    meta: "took it",
    dangerChoices: true,
    text:
      "Kamu menahan tekanan.\n\nKepalamu berat.\n\nBeberapa detik kamu sulit fokus.\n\nSYSTEM:\n\"Kandidat menanggung backlash.\"",
    next: "ep10_after_backlash"
  },

  ep10_after_backlash: {
    type: "system",
    episode: 10,
    label: "AFTER",
    meta: "door closing",
    dangerChoices: true,
    text:
      "Folder OWNER menghilang.\n\nCORE menutup lebih rapat.\n\nTapi sebelum menutup total,\nada satu pesan terakhir:\n\n\"EP11: LAST KEY\"",
    next: "ep10_end"
  },

  /* =========================
     EP10 END
     ========================= */

  ep10_end: {
    type: "system",
    episode: 10,
    label: "END",
    meta: "episode clear",
    dangerChoices: true,
    text:
      "EPISODE 10 SELESAI.\n\nKamu membawa satu kebenaran.\n\nRouter membawa satu niat.\n\nSYSTEM:\n\"EP11: LAST KEY.\"",
    next: "ep11_start"
  },

  ep11_start: {
    type: "system",
    episode: 11,
    label: "LOADING",
    meta: "EP11",
    dangerChoices: true,
    text:
      "EP11 akan dimuat.\n\nKetik: “lanjut EP11”",
    next: null
  }

});
/* =========================================================
   STORY PACK — EP11
   EPISODE 11: LAST KEY
   Paste BEFORE final "})();"
   ========================================================= */

Object.assign(STORY, {

  /* =========================
     EP11 START
     ========================= */

  ep11_start: {
    type: "system",
    episode: 11,
    label: "LAST KEY",
    meta: "entry",
    dangerChoices: true,
    text:
      "EPISODE 11: LAST KEY\n\nCORE menutup.\n\nTapi lorong di depan tidak kembali.\n\nSebaliknya, muncul pintu kecil.\nPintu yang seharusnya tidak ada.\n\nSYSTEM:\n\"Kunci terakhir tersedia.\"",
    next: "ep11_notice"
  },

  ep11_notice: {
    type: "system",
    episode: 11,
    label: "NOTICE",
    meta: "conditions",
    dangerChoices: true,
    text:
      "Pemberitahuan:\n\n— Kunci terakhir bukan benda.\n— Kunci terakhir adalah pilihan.\n— Pilihan terakhir akan menentukan siapa yang 'keluar'.\n\nSYSTEM:\n\"Owner menunggu.\"",
    next: "ep11_key_types"
  },

  ep11_key_types: {
    type: "system",
    episode: 11,
    label: "KEY TYPES",
    meta: "three keys",
    dangerChoices: true,
    text:
      "Tiga bentuk kunci:\n\n1) KEY: RELEASE (membebaskan AREL)\n2) KEY: REPLACE (menggantikan AREL)\n3) KEY: REWRITE (menulis ulang rute)\n\nCatatan:\nSatu dipilih.\nDua lainnya hilang selamanya.",
    next: "ep11_pre_talk"
  },

  ep11_pre_talk: {
    type: "dialog",
    episode: 11,
    speaker: "PARTNER",
    mood: "—",
    meta: "final approach",
    text:
      "Ini… udah hampir akhir.\n\nAku nggak tahu apa yang nunggu setelah ini.\n\nTapi aku tahu:\nRouter bakal pakai apa pun yang kamu sayang\nbuat bikin kamu memilih.\n\nJadi…\njangan pilih karena takut.\nPilih karena kamu siap menanggungnya.",
    next: "ep11_evelyn_redhint"
  },

  ep11_evelyn_redhint: {
    type: "dialog",
    episode: 11,
    speaker: "EVELYN",
    mood: "serious",
    meta: "private",
    text:
      "Kalau pilihanmu REWRITE…\naku mungkin nggak bisa tetap ‘normal’.\n\nKarena Router bakal berusaha memakai aku.\nDan kalau aku jadi alat…\naku butuh kamu narik aku balik.\n\nSekali lagi…\njangan benci aku kalau mataku merah.",
    next: "ep11_owner_ping"
  },

  /* =========================
     OWNER PING
     ========================= */

  ep11_owner_ping: {
    type: "system",
    episode: 11,
    label: "OWNER",
    meta: "direct signal",
    dangerChoices: true,
    text:
      "Sinyal baru masuk.\n\nBukan Router.\n\nSuara manusia.\n\n\"Kamu sampai juga.\"",
    next: "ep11_owner_line"
  },

  ep11_owner_line: {
    type: "dialog",
    episode: 11,
    speaker: "OWNER",
    mood: "calm",
    meta: "voice only",
    text:
      "Aku nggak akan sebut namaku.\n\nNama itu… sudah tidak berguna.\n\nYang penting:\naku pernah di posisi kamu.\n\nAku pernah pegang kartu AREL.\nAku pernah gagal.\n\nSekarang…\naku butuh kamu ambil satu kunci.\nSupaya aku bisa keluar.",
    next: "ep11_choice_key"
  },

  /* =========================
     KEY CHOICE
     ========================= */

  ep11_choice_key: {
    type: "system",
    episode: 11,
    label: "SELECT KEY",
    meta: "final keys",
    dangerChoices: true,
    text:
      "Tiga kunci menyala.\n\nOwner menunggu.\nRouter menunggu.\nPartner menunggu.\n\nPilih kunci terakhir:",
    choices: [
      {
        title: "KEY: RELEASE",
        desc: "Bebaskan AREL dari BOUND. Tapi seseorang harus menggantikannya sementara.",
        icon: "R",
        risk: true,
        to: "ep11_key_release",
        effects: () => {
          state.vars.lastKey = "RELEASE";
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      },
      {
        title: "KEY: REPLACE",
        desc: "Ambil posisi AREL. Owner bisa keluar. Kamu jadi jangkar baru.",
        icon: "G",
        risk: true,
        to: "ep11_key_replace",
        effects: () => {
          state.vars.lastKey = "REPLACE";
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      },
      {
        title: "KEY: REWRITE",
        desc: "Ganggu aturan. Risiko: rute hancur atau berubah total.",
        icon: "Δ",
        risk: true,
        to: "ep11_key_rewrite",
        effects: () => {
          state.vars.lastKey = "REWRITE";
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
        }
      }
    ]
  },

  /* =========================
     RELEASE PATH
     ========================= */

  ep11_key_release: {
    type: "system",
    episode: 11,
    label: "KEY",
    meta: "RELEASE",
    dangerChoices: true,
    text:
      "Kunci RELEASE dipilih.\n\nNODE AREL berdenyut.\n\nSYSTEM:\n\"BOUND dapat diputus…\"\n\n\"…namun butuh pengganti sementara.\"",
    next: "ep11_release_question"
  },

  ep11_release_question: {
    type: "system",
    episode: 11,
    label: "QUESTION",
    meta: "who replaces",
    dangerChoices: true,
    text:
      "SYSTEM bertanya:\n\nSiapa yang akan menanggung BOUND sementara?\n\n(Ini tidak permanen… tapi menyakitkan.)",
    choices: [
      {
        title: "Kamu",
        desc: "Ambil beban sementara agar AREL bebas.",
        icon: "ME",
        risk: true,
        to: "ep11_release_you",
        effects: () => { state.vars.boundTemp = "YOU"; }
      },
      {
        title: "Owner",
        desc: "Paksa Owner menanggung akibat.",
        icon: "OW",
        risk: true,
        to: "ep11_release_owner",
        effects: () => { state.vars.boundTemp = "OWNER"; state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1); }
      }
    ]
  },

  ep11_release_you: {
    type: "system",
    episode: 11,
    label: "BIND",
    meta: "temporary",
    dangerChoices: true,
    text:
      "Kamu memilih menanggung BOUND sementara.\n\nRasanya seperti… rantai tak terlihat menahan dadamu.\n\nDi layar, siluet AREL muncul lebih jelas.\n\nSYSTEM:\n\"AREL mendapatkan celah.\"",
    next: "ep11_release_after"
  },

  ep11_release_owner: {
    type: "dialog",
    episode: 11,
    speaker: "OWNER",
    mood: "tense",
    meta: "pushed",
    text:
      "…kamu berani.\n\nKamu pikir itu adil?\n\nKalau aku kembali terikat,\nsemua ini sia-sia.\n\nTapi…\nbaik.\nAku terima.",
    next: "ep11_release_after"
  },

  ep11_release_after: {
    type: "system",
    episode: 11,
    label: "RESULT",
    meta: "release outcome",
    dangerChoices: true,
    text:
      "NODE AREL bergetar.\n\nKata muncul:\n\"RELEASE IN PROGRESS\"\n\nRouter mulai menekan.\n\nSYSTEM:\n\"EP12 akan menentukan apakah RELEASE berhasil.\"",
    next: "ep11_end"
  },

  /* =========================
     REPLACE PATH
     ========================= */

  ep11_key_replace: {
    type: "system",
    episode: 11,
    label: "KEY",
    meta: "REPLACE",
    dangerChoices: true,
    text:
      "Kunci REPLACE dipilih.\n\nOwner menarik napas lega.\n\nRouter diam.\nTerlalu diam.\n\nSYSTEM:\n\"Kandidat menerima posisi jangkar.\"",
    next: "ep11_replace_after"
  },

  ep11_replace_after: {
    type: "dialog",
    episode: 11,
    speaker: "EVELYN",
    mood: "shocked",
    meta: "private",
    text:
      "Kamu… serius?\n\nItu berarti kamu…\n",
    next: "ep11_replace_after2"
  },

  ep11_replace_after2: {
    type: "dialog",
    episode: 11,
    speaker: "MC",
    mood: "steady",
    meta: "decision",
    text:
      "Kalau ini satu-satunya cara,\naku ambil.\n\nKalau aku harus jadi jangkar,\nsetidaknya aku pilih dengan sadar.\n\nBukan karena dipaksa.",
    next: "ep11_replace_owner_react"
  },

  ep11_replace_owner_react: {
    type: "dialog",
    episode: 11,
    speaker: "OWNER",
    mood: "relieved",
    meta: "exit hope",
    text:
      "Bagus.\n\nKamu ngerti.\n\nAku…\nakhirnya bisa keluar.",
    next: "ep11_replace_router_note"
  },

  ep11_replace_router_note: {
    type: "system",
    episode: 11,
    label: "NOTE",
    meta: "router satisfied",
    dangerChoices: true,
    text:
      "Router mencatat:\n\"Kandidat menyetujui kontrak.\" \n\nKamu merasa sesuatu mulai menempel.\nBukan rantai.\n\nSeperti… aturan.",
    next: "ep11_end"
  },

  /* =========================
     REWRITE PATH
     ========================= */

  ep11_key_rewrite: {
    type: "system",
    episode: 11,
    label: "KEY",
    meta: "REWRITE",
    dangerChoices: true,
    text:
      "Kunci REWRITE dipilih.\n\nCORE bergetar keras.\n\nRouter tidak bicara.\n\nYang bicara justru:\n— alarm.\n\nSYSTEM:\n\"Upaya penulisan ulang terdeteksi.\"",
    next: "ep11_rewrite_risk"
  },

  ep11_rewrite_risk: {
    type: "system",
    episode: 11,
    label: "RISK",
    meta: "rewrite penalty",
    dangerChoices: true,
    text:
      "Konsekuensi REWRITE:\n\n— Jalur bisa berubah total.\n— Partner bisa jadi korban pengungkit.\n— Jika gagal, kamu akan dihapus dari rute.\n\nTetap lanjut?",
    choices: [
      {
        title: "Lanjut REWRITE",
        desc: "Tarik aturan dari CORE.",
        icon: "Δ",
        risk: true,
        to: "ep11_rewrite_go",
        effects: () => {
          state.vars.rewriteCommit = true;
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
        }
      },
      {
        title: "Batal",
        desc: "Kembali ke pilihan kunci (tapi Router mencatat keraguan).",
        icon: "×",
        risk: true,
        to: "ep11_choice_key",
        effects: () => {
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      }
    ]
  },

  ep11_rewrite_go: {
    type: "system",
    episode: 11,
    label: "REWRITE",
    meta: "writing",
    dangerChoices: true,
    text:
      "Kamu meraih kabel aturan.\n\nHuruf-huruf seperti pecahan kaca.\n\nKamu menarik satu kalimat:\n\"Kandidat harus setuju.\"\n\nKamu mencoba menggantinya jadi:\n\"Kandidat boleh memilih keluar tanpa pengganti.\"",
    next: "ep11_rewrite_shock"
  },

  ep11_rewrite_shock: {
    type: "system",
    episode: 11,
    label: "SHOCK",
    meta: "router counter",
    dangerChoices: true,
    text:
      "CORE menjerit.\n\nLampu merah.\n\nMata EVELYN…\nmenyala merah lagi.\n\nSYSTEM:\n\"Partner digunakan sebagai pengunci.\"",
    next: "ep11_rewrite_partner"
  },

  ep11_rewrite_partner: {
    type: "dialog",
    episode: 11,
    speaker: "EVELYN",
    mood: "glitched",
    meta: "red eye",
    text:
      "…aku…\n\naku ngerasa tanganku bukan milikku.\n\nKalau aku gerak…\nitu Router.\n\nJangan… biarin aku nyakitin kamu.",
    next: "ep11_rewrite_choice_partner"
  },

  ep11_rewrite_choice_partner: {
    type: "system",
    episode: 11,
    label: "CRITICAL",
    meta: "partner as lever",
    dangerChoices: true,
    text:
      "Router mengikat REWRITE pada partner.\n\nUntuk lanjut REWRITE, kamu harus pilih:\n\n— Korbankan sebagian ikatan (bond turun)\natau\n— Hentikan REWRITE (aturan tetap)\n\nPilih.",
    choices: [
      {
        title: "Korbankan ikatan",
        desc: "Lanjut REWRITE, tapi hubungan retak.",
        icon: "↓",
        risk: true,
        to: "ep11_rewrite_sacrifice",
        effects: () => {
          state.vars.bond = Math.max(0, (state.vars.bond || 0) - 2);
        }
      },
      {
        title: "Hentikan REWRITE",
        desc: "Selamatkan partner dari tekanan.",
        icon: "■",
        risk: true,
        to: "ep11_rewrite_stop",
        effects: () => {
          state.vars.rewriteStopped = true;
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      }
    ]
  },

  ep11_rewrite_sacrifice: {
    type: "system",
    episode: 11,
    label: "SACRIFICE",
    meta: "bond cut",
    dangerChoices: true,
    text:
      "Kamu memotong sebagian ikatan.\n\nRasanya seperti merobek sesuatu yang menempel di dada.\n\nMata EVELYN kembali biru.\nDia terengah.\n\nSYSTEM:\n\"REWRITE lanjut, biaya dibayar.\"",
    next: "ep11_rewrite_success_hint"
  },

  ep11_rewrite_success_hint: {
    type: "system",
    episode: 11,
    label: "HINT",
    meta: "rewrite partial",
    dangerChoices: true,
    text:
      "Kalimat aturan berubah… sebagian.\n\nTidak sempurna.\nTapi ada celah.\n\nSYSTEM:\n\"Celah REWRITE disimpan untuk EP12.\"",
    next: "ep11_end"
  },

  ep11_rewrite_stop: {
    type: "system",
    episode: 11,
    label: "STOP",
    meta: "rewrite halted",
    dangerChoices: true,
    text:
      "Kamu menghentikan REWRITE.\n\nCORE mereda.\n\nRouter tertawa tanpa suara.\n\nSYSTEM:\n\"Upaya tercatat.\"\n\nTapi partner selamat… untuk saat ini.",
    next: "ep11_end"
  },

  /* =========================
     EP11 END
     ========================= */

  ep11_end: {
    type: "system",
    episode: 11,
    label: "END",
    meta: "last key chosen",
    dangerChoices: true,
    text:
      "EPISODE 11 SELESAI.\n\nKunci terakhir dipilih.\n\nOwner bergerak.\nRouter bergerak.\n\nSYSTEM:\n\"EP12: JUDGMENT ROUTE.\"",
    next: "ep12_start"
  },

  ep12_start: {
    type: "system",
    episode: 12,
    label: "LOADING",
    meta: "EP12",
    dangerChoices: true,
    text:
      "EP12 akan dimuat.\n\nKetik: “lanjut EP12”",
    next: null
  }

});
/* =========================================================
   STORY PACK — EP12
   EPISODE 12: JUDGMENT ROUTE
   Paste BEFORE final "})();"
   ========================================================= */

Object.assign(STORY, {

  /* =========================
     EP12 START
     ========================= */

  ep12_start: {
    type: "system",
    episode: 12,
    label: "JUDGMENT ROUTE",
    meta: "entry",
    dangerChoices: true,
    text:
      "EPISODE 12: JUDGMENT ROUTE\n\nTidak ada lorong.\nTidak ada pintu.\n\nKamu berdiri di ruang putih tanpa batas.\n\nSYSTEM:\n\"Rute terakhir dimulai.\"",
    next: "ep12_context"
  },

  ep12_context: {
    type: "system",
    episode: 12,
    label: "CONTEXT",
    meta: "final conditions",
    dangerChoices: true,
    text:
      "Kondisi akhir dikumpulkan:\n\n— LAST KEY\n— Successor Type\n— Partner Protocol\n— Ikatan (bond)\n— Gangguan Router\n\nSYSTEM:\n\"Semua keputusan akan ditimbang.\"",
    next: "ep12_owner_present"
  },

  /* =========================
     OWNER + ROUTER
     ========================= */

  ep12_owner_present: {
    type: "dialog",
    episode: 12,
    speaker: "OWNER",
    mood: "calm",
    meta: "final voice",
    text:
      "Aku berdiri di sisi lain rute ini.\n\nKalau kamu sampai sini,\nartinya kamu nggak kabur.\n\nSekarang…\nbiar rute yang memutuskan.",
    next: "ep12_router_manifest"
  },

  ep12_router_manifest: {
    type: "system",
    episode: 12,
    label: "ROUTER",
    meta: "manifest",
    dangerChoices: true,
    text:
      "Cahaya memadat.\n\nSesuatu terbentuk.\n\nBukan wajah.\nBukan mesin.\n\nSYSTEM:\n\"Death Router System: aktif penuh.\"",
    next: "ep12_partner_state"
  },

  ep12_partner_state: {
    type: "system",
    episode: 12,
    label: "PARTNER",
    meta: "status check",
    dangerChoices: true,
    text:
      "Partner berdiri di sampingmu.\n\nStatus:\n— Jika bond tinggi: stabil.\n— Jika bond rendah: rentan.\n\nMata EVELYN…\nberubah sesuai tekanan.",
    next: "ep12_question"
  },

  /* =========================
     FINAL QUESTION
     ========================= */

  ep12_question: {
    type: "system",
    episode: 12,
    label: "QUESTION",
    meta: "judgment",
    dangerChoices: true,
    text:
      "ROUTER bertanya:\n\n\"Apakah rute ini masih layak berlanjut?\"\n\nJawabanmu akan menjadi putusan.",
    choices: [
      {
        title: "Ya — lanjutkan rute",
        desc: "Sistem tetap berjalan dengan perubahan.",
        icon: "→",
        risk: true,
        to: "ep12_continue",
        effects: () => {
          state.vars.finalDecision = "CONTINUE";
          state.vars.stability = Math.min(9, (state.vars.stability || 0) + 1);
        }
      },
      {
        title: "Tidak — akhiri rute",
        desc: "Hentikan sistem sepenuhnya.",
        icon: "×",
        risk: true,
        to: "ep12_end_route",
        effects: () => {
          state.vars.finalDecision = "END";
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 2);
        }
      },
      {
        title: "Ubah cara rute berjalan",
        desc: "Bukan lanjut, bukan hancur.",
        icon: "Δ",
        risk: true,
        to: "ep12_reform_route",
        effects: () => {
          state.vars.finalDecision = "REFORM";
          state.vars.routerAggro = Math.min(9, (state.vars.routerAggro || 0) + 1);
        }
      }
    ]
  },

  /* =========================
     CONTINUE
     ========================= */

  ep12_continue: {
    type: "system",
    episode: 12,
    label: "VERDICT",
    meta: "continue",
    dangerChoices: true,
    text:
      "Kamu memilih melanjutkan rute.\n\nRouter memproses.\n\nSYSTEM:\n\"Sistem akan berjalan dengan modifikasi.\"",
    next: "ep12_continue_outcome"
  },

  ep12_continue_outcome: {
    type: "dialog",
    episode: 12,
    speaker: "OWNER",
    mood: "quiet",
    meta: "accepted",
    text:
      "Berarti masih ada yang harus ditanggung.\n\nAku pergi.\nKamu… jaga rute ini.\n\nJangan ulangi kesalahanku.",
    next: "ep12_endings"
  },

  /* =========================
     END ROUTE
     ========================= */

  ep12_end_route: {
    type: "system",
    episode: 12,
    label: "VERDICT",
    meta: "terminate",
    dangerChoices: true,
    text:
      "Kamu memilih mengakhiri rute.\n\nRouter bergetar.\n\nSYSTEM:\n\"Penghentian total diproses.\"",
    next: "ep12_end_route_outcome"
  },

  ep12_end_route_outcome: {
    type: "dialog",
    episode: 12,
    speaker: "EVELYN",
    mood: "soft",
    meta: "release",
    text:
      "Kalau ini akhir…\naku nggak nyesel.\n\nSetidaknya kita nggak ninggalin beban ke orang lain.\n\nTerima kasih… sudah berhenti.",
    next: "ep12_endings"
  },

  /* =========================
     REFORM
     ========================= */

  ep12_reform_route: {
    type: "system",
    episode: 12,
    label: "VERDICT",
    meta: "reform",
    dangerChoices: true,
    text:
      "Kamu memilih mengubah rute.\n\nRouter berhenti.\n\nSYSTEM:\n\"Parameter tidak dikenali.\"",
    next: "ep12_reform_outcome"
  },

  ep12_reform_outcome: {
    type: "dialog",
    episode: 12,
    speaker: "ROUTER",
    mood: "neutral",
    meta: "learning",
    text:
      "Pilihan tidak ada dalam tabel.\n\nNamun…\nkeputusan diterima.\n\nRute akan menyesuaikan.\n\nHarga: ketidakpastian.",
    next: "ep12_endings"
  },

  /* =========================
     FINAL ENDINGS
     ========================= */

  ep12_endings: {
    type: "system",
    episode: 12,
    label: "END",
    meta: "finale",
    dangerChoices: true,
    text:
      "PUTUSAN DITETAPKAN.\n\nRute menutup.\n\nBeberapa hal berakhir.\nBeberapa hal baru dimulai.\n\nSYSTEM:\n\"Death Router System: resolved.\"",
    next: "ep12_epilogue"
  },

  ep12_epilogue: {
    type: "dialog",
    episode: 12,
    speaker: "EVELYN",
    mood: "calm",
    meta: "after",
    text:
      "Kalau suatu hari kamu ragu…\n\ningat ini:\n\nKamu bukan rute.\nKamu bukan node.\n\nKamu adalah orang yang memilih.",
    next: "ep12_credits"
  },

  ep12_credits: {
    type: "system",
    episode: 12,
    label: "CREDITS",
    meta: "roll",
    dangerChoices: true,
    text:
      "=== END ===\n\nTerima kasih telah berjalan sampai akhir.\n\nJudul:\nDEATH ROUTER SYSTEM\n\nStatus:\nTAMAT",
    next: null
  }

});
/* ===== FINAL CLOSE (AKHIR FILE) ===== */
})();