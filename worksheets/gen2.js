#!/usr/bin/env node
// Generates vocabulary.pdf, listening.pdf, plan.pdf (black & white printable).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ROOT = path.join(__dirname, '..');
const BUILD = path.join(__dirname, 'build');
const OUT = path.join(ROOT, 'pdfs');
fs.mkdirSync(BUILD, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

function loadArr(file, name) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(new RegExp('var ' + name + ' = (\\[[\\s\\S]*?\\]);'));
  return eval('(' + m[1] + ')');
}
const VOCAB = loadArr(path.join(ROOT, 'vocab-data.js'), 'VOCAB');
const LISTENING = loadArr(path.join(ROOT, 'listening-data.js'), 'LISTENING');

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

const CSS = `
@page { size: A4; margin: 1.4cm 1.6cm; }
* { box-sizing: border-box; }
body { font-family: Helvetica, Arial, "PingFang TC", "Hiragino Sans GB", sans-serif; font-size: 11pt; line-height: 1.45; color: #000; margin: 0; }
h1 { font-size: 15pt; margin: 0 0 3pt; }
.sub { font-size: 10pt; color: #222; margin: 0 0 10pt; }
.ex { margin-bottom: 12pt; }
.ex h2 { font-size: 11.5pt; margin: 8pt 0 2pt; page-break-after: avoid; }
.w { margin: 0 0 2pt; page-break-inside: avoid; }
.w .en { font-weight: 600; }
.w .pos { color: #333; font-size: 9.5pt; }
.w .ex { color: #333; }
.qz .w { margin-bottom: 9pt; page-break-inside: avoid; }
.bl { display: inline-block; border-bottom: 1px solid #000; height: 10pt; }
table { border-collapse: collapse; width: 100%; font-size: 10pt; }
th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: top; }
th { background: #eee; }
.mc { margin-bottom: 6pt; page-break-inside: avoid; }
.opt { padding-left: 16pt; }
.note { font-size: 10pt; }
.answerkey { page-break-before: always; }
.answerkey h2 { font-size: 13pt; }
.answerkey h3 { font-size: 11pt; margin: 8pt 0 3pt; page-break-after: avoid; }
`;

function toPdf(html, name) {
  const hp = path.join(BUILD, name + '.html');
  const pp = path.join(OUT, name + '.pdf');
  fs.writeFileSync(hp, html);
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=' + pp, 'file://' + hp], { stdio: 'ignore' });
  return pp;
}

/* ---------- vocabulary.pdf ---------- */
function buildVocab() {
  let list = '<h1>詞彙表 Vocabulary List</h1><div class="sub">高頻核心 300 字 ＋ 考試指令詞 ＋ 8 大主題。每天 10 字：聽 → 看 → 跟讀 → 默寫。</div>';
  let quiz = '<div class="answerkey"><h2>默寫練習（Write the English word）</h2><div class="sub">看着中文寫出英文單字。</div>';
  VOCAB.forEach((set, si) => {
    list += '<div class="ex"><h2>' + esc(set.title) + '</h2>';
    quiz += '<div class="ex qz"><h2>' + esc(set.title) + '</h2>';
    set.words.forEach((w, wi) => {
      const p = w.split('|');
      const [en, zh, pos, ex, exc] = p;
      list += '<div class="w"><span class="en">' + esc(en) + '</span> <span class="pos">' + esc(pos) + '</span> ' + esc(zh) + ' &nbsp;—&nbsp; <span class="ex">' + esc(ex) + '　' + esc(exc) + '</span></div>';
      quiz += '<div class="w">' + (wi + 1) + '. ' + esc(zh) + ' <span class="bl" style="width:3.2cm">&nbsp;</span></div>';
    });
    list += '</div>';
    quiz += '</div>';
  });
  quiz += '</div>';
  return '<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>' + list + quiz + '</body></html>';
}

/* ---------- listening.pdf ---------- */
function parseCloze(s) {
  const segs = [];
  const re = /\[([^\]|]+)(?:\|([^\]]*))?(?:\|[^\]]*)?\]/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) segs.push({ t: s.slice(last, m.index) });
    segs.push({ blank: true, ans: m[1] });
    last = m.index + m[0].length;
  }
  if (last < s.length) segs.push({ t: s.slice(last) });
  return segs;
}

function buildListening() {
  const letters = ['A', 'B', 'C', 'D'];
  let body = '<h1>聆聽練習 Listening Practice</h1>';
  body += '<div class="sub">真人錄音（ELLLO A1）。先開音檔（網址見每單元），聽完作答。</div>';
  let ans = '<div class="answerkey"><h2>答案 Answer Key</h2>';

  LISTENING.forEach((u, ui) => {
    body += '<div class="ex"><h2>' + esc(u.title) + ' <span style="font-weight:normal;font-size:9.5pt">（' + esc(u.topic) + '）</span></h2>';
    body += '<div class="note">▶ 音檔：' + esc(u.audio) + '<br>（原文稿可在 ELLLO 頁面查看：' + esc(u.page) + '）</div>';

    // prediction
    body += '<div class="mc"><b>① 聽前預測</b><br>' + esc(u.predict.q) + '</div>';
    u.predict.opts.forEach((o, j) => { body += '<div class="opt">' + letters[j] + '. ' + esc(o) + '</div>'; });

    // keywords
    body += '<div style="margin-top:6pt"><b>② 關鍵字抓取</b></div>';
    u.keywords.forEach((k, ki) => { body += '<div class="w">' + (ki + 1) + '. ' + esc(k.q) + ' <span class="bl" style="width:3cm">&nbsp;</span></div>'; });

    // cloze
    body += '<div style="margin-top:6pt"><b>③ 聽寫填空</b></div><div class="w">';
    const segs = parseCloze(u.cloze);
    let clozeAns = [];
    segs.forEach(s => {
      if (s.t) body += esc(s.t);
      else { body += ' <span class="bl" style="width:2.4cm">&nbsp;</span> '; clozeAns.push(s.ans); }
    });
    body += '</div></div>';

    // answer key
    ans += '<h3>' + (ui + 1) + '. ' + esc(u.title) + '</h3><div>';
    ans += '預測：' + letters[u.predict.ans] + '（' + esc(u.predict.opts[u.predict.ans]) + '）<br>';
    ans += '關鍵字：' + u.keywords.map(k => esc(k.ans.join(' / '))).join('；') + '<br>';
    ans += '聽寫：' + clozeAns.map(a => esc(a)).join('、');
    ans += '</div>';
  });
  ans += '</div>';

  return '<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>' + body + ans + '</body></html>';
}

/* ---------- plan.pdf ---------- */
function buildPlan() {
  let rows = '';
  for (let d = 1; d <= 30; d++) {
    const vset = VOCAB[d - 1];
    const lunit = LISTENING[(d - 1) % LISTENING.length];
    rows += '<tr><td>' + d + '</td><td>' + esc(vset ? vset.title : '') + '</td><td>' + esc(lunit.title) + '</td></tr>';
  }
  return '<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>' +
    '<h1>30 日自學計劃</h1>' +
    '<div class="sub">每天 15 分鐘：① 學 10 個詞彙（聽 🔊 → 看中文 → 跟讀 → 默寫測驗）② 聽 1 段聆聽（先預測 → 聽 → 關鍵字 → 聽寫）。做完在下方打勾。</div>' +
    '<table><tr><th style="width:34pt">日 Day</th><th>詞彙（組）</th><th>聆聽（單元）</th></tr>' + rows + '</table>' +
    '<div class="sub" style="margin-top:10pt">完成 30 日後：複習「考試指令詞」與 8 大主題詞彙，並把 12 個聆聽單元重聽一遍（關閉字幕）。</div>' +
    '</body></html>';
}

console.log('Wrote', toPdf(buildVocab(), 'vocabulary'));
console.log('Wrote', toPdf(buildListening(), 'listening'));
console.log('Wrote', toPdf(buildPlan(), 'plan'));
