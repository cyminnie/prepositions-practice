#!/usr/bin/env node
// Worksheet PDF generator — outputs black & white printable worksheets + answer key.
// Usage: node worksheets/gen.js  -> writes pdfs/prepositions.pdf and pdfs/tenses.pdf
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ROOT = path.join(__dirname, '..');
const BUILD = path.join(__dirname, 'build');
const OUT = path.join(ROOT, 'pdfs');
fs.mkdirSync(BUILD, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

/* ============================ DATA ============================ */

const PREP = [
  { title: "Exercise 1", tag: "at / in / on", items: [
    "Come [in] and close the door [at] once.",
    "Hold [on] please and Mr Lee will be with you [in] a moment.",
    "The show ended [at] five minutes past one [in] the afternoon.",
    "I met him [in] the supermarket [on] several occasions.",
    "[In] those days, we lived [in] a very small hotel.",
    "[In] the end, [at] least twenty students agreed to help us.",
    "His office is located [in] a commercial building, [on] the top floor.",
    "Although he got up [at] half past seven, he got to school [on] time.",
    "Everyone [on] board the ship jumped for joy [at] the sight of land.",
    "We shall arrive [at] our destination [in] the New Territories soon.",
    "You must hand [in] your classwork [at] the end of the lesson.",
    "[On] answering the call, he left the house [in] a hurry.",
    "[On] the night of May 5, the travellers arrived [in] New York.",
    "We got [on] the bus [at] noon.",
    "He is not [in] [at] this moment; he is out [at] the moment.",
    "He looked [at] the woman [in] surprise.",
    "[On] average two thirds of the students failed [in] the examination.",
    "[In] my opinion, you are too fat. You need to go [on] a diet.",
    "It has been raining for several days [on] end. It is still raining [at] present.",
    "He put [on] his glasses [in] order to read the small prints [in] the newspaper."
  ]},
  { title: "Exercise 2", tag: "to / for / from", items: [
    "The prisoner was released [from] prison yesterday.",
    "[To] my surprise, no one failed in the short quiz.",
    "Manchester is [to] the north of London.",
    "Wine is made [from] grapes.",
    "He has been taken [to] hospital [for] treatment.",
    "He made a birthday card [for] his mother.",
    "I am now on the way [to] the airport.",
    "Are you willing to fight [for] your country?",
    "Do you know that steel is made [from] iron?",
    "The needle points [to] the north.",
    "He took some money [from] his wallet.",
    "I bought this old stamp [for] a mere ten dollars.",
    "Walk straight and turn [to] left when you reach the traffic lights.",
    "The poor boy has been separated [from] his mother [for] a few years.",
    "You may take this medicine [for] your headache.",
    "I would like to borrow a tool [from] you.",
    "He often changes [from] one job [to] another.",
    "He has been sick [for] over two weeks.",
    "We need to protect children [from] violence.",
    "He often laughs at his friends [for] fun."
  ]},
  { title: "Exercise 3", tag: "to / for / from / against", items: [
    "Move [to] the left and turn round.",
    "She bought many presents [for] the children.",
    "Don't lean [against] the wall; it is not safe.",
    "He has been absent [from] school [for] two weeks.",
    "The film was so touching that the audience was moved [to] tears.",
    "This youth centre provides many different facilities [for] its members.",
    "He is rowing a boat [against] the current.",
    "He tore the photograph [to] pieces.",
    "He is learning French [for] his work.",
    "[From] now on, you will be the owner of this house.",
    "He is a criminal and is acting [against] the law.",
    "We will go [to] Hawaii [for] pleasure.",
    "The vase fell [to] the ground and broke.",
    "What are you trying to hide [from] me?",
    "The tourists will stay at this hotel [for] two weeks.",
    "Mrs Wong sang her baby [to] sleep.",
    "The woods extend [to] the river bank.",
    "The young woman married the old man [against] her will.",
    "Her application is unsuccessful because her age is [against] her.",
    "That little boy mistook a strange woman [for] …"
  ]},
  { title: "Exercise 4", tag: "by / to / for / from", items: [
    "We must finish all our work [by] noon tomorrow.",
    "[From] what I know, we will have a new teacher next month.",
    "He gave me his old piano [for] nothing.",
    "We must object [to] this plan because it costs too much.",
    "[By] the time we reached home, the house had burnt [to] ashes.",
    "The old woman has to work [from] hand [to] mouth.",
    "The fireman got a medal [for] his bravery.",
    "All the windows were broken [to] pieces in the explosion.",
    "Jimmy often stays away [from] school because of illness.",
    "He had employed more than twenty workers [by] then.",
    "Close your eyes and count [to] ten.",
    "Things have gone [from] bad [to] worse.",
    "I will stand [by] you if you need me.",
    "The criminal was sent [to] prison [for] ten years.",
    "[To] whom does this bicycle belong?",
    "We shall complete our work [by] tomorrow.",
    "The dog is quite faithful [to] its master.",
    "Please don't translate this letter word [for] word.",
    "He is going [to] Shanghai [by] air tomorrow.",
    "I am far [from] agreeing with him."
  ]},
  { title: "Exercise 5", tag: "by / in / of / to", items: [
    "I think you must get rid [of] your bad habits.",
    "Air pollution has given rise [to] many cases of lung diseases.",
    "He realized that he needed to act more carefully [in] future.",
    "The police have decided to accuse him [of] robbery.",
    "This road leads [to] the new stadium.",
    "Eggs are sold [by] the dozen.",
    "We will spend part [of] our holiday [in] Canada.",
    "I wonder if you can give me the answer [to] this question.",
    "His health is improving day [by] day.",
    "He could not stop his car [in] time. It crashed into the back [of] a taxi.",
    "You need to reply [to] this letter as soon as possible.",
    "[Of] course I will help you if I can.",
    "Three [by] six equals eighteen.",
    "[In] regard [to] your criticism, I wish to express my views.",
    "Many people are not conscious [of] the dangers around them.",
    "These two digital cameras differ greatly [in] prices.",
    "Two teenagers robbed him [of] all his money this morning.",
    "Your jacket smells [of] cigarette smoke.",
    "He is not awake [to] his opportunities.",
    "The bullet missed the target [by] a few centimetres."
  ]}
];

const TENSES = [
  { title: "Exercise 1", kind: "fill",
    instr: "Complete the sentences with the correct form of the verbs in brackets.",
    items: [
      "I [haven't seen|not see] my cousin since we [finished|finish] primary school.",
      "While the chef [was cooking|cook], a customer [fainted|faint] suddenly.",
      "I'm sure it [will snow|snow] tonight.",
      "By the time the firemen [arrived|arrive], the fire [had already destroyed|already destroy] the whole building.",
      "Hurry up! The bus [is coming|come]. We [will be|be] late for school.",
      "She [promised|promise] to help me yesterday, but she [hasn't called|not call] me yet.",
      "The shop [opens|open] at ten, so we still have time.",
      "I [have been working|work] on this project for two weeks and I [haven't finished|not finish] it yet.",
      "When I [was|be] young, I usually [spent|spend] my holidays in the countryside.",
      "By the end of this year, my father [will have been working|work] at the bank for twenty years."
    ]},
  { title: "Exercise 2", kind: "fill",
    instr: "Complete the sentences with the correct form of the verbs in brackets.",
    items: [
      "Don't switch off the TV. I [am still watching|still watch] the news.",
      "She [has lost|lose] her keys, so she [cannot|cannot] get into her flat now.",
      "Last night, while we [were having|have] dinner, the lights [went|go] out.",
      "We [had been queuing|queue] for tickets for an hour before the counter [opened|open].",
      "The students [had already left|already leave] the hall when the headmaster [arrived|arrive].",
      "I [met|meet] John last week. He [had just returned|just return] from Australia.",
      "She [is taking|take] a rest now because she [has been feeling|feel] tired all day.",
      "Have you ever [visited|visit] the Space Museum?",
      "They [are building|build] a new library near our school; they [will have finished|finish] it by next year.",
      "This time next week, I [will be sunbathing|sunbathe] on a beach in Thailand."
    ]},
  { title: "Exercise 3", kind: "fill",
    instr: "Complete the sentences with the correct form of the verbs in brackets.",
    items: [
      "The phone [rang|ring] while he [was driving|drive], but he [didn't answer|not answer] it.",
      "By the time you [come|come] home, I [will have cooked|cook] dinner.",
      "I [have read|read] that novel twice already. It's brilliant.",
      "She [hasn't been|not be] to the cinema for ages because she [has been|be] too busy.",
      "When the alarm [rang|ring], everyone [ran|run] out of the building.",
      "He [has lived|live] in this flat since 2018.",
      "We [have been waiting|wait] for the doctor for two hours and we [are still waiting|still wait].",
      "I [had never seen|never see] such a beautiful sunset before I [visited|visit] the island.",
      "Don't worry about the tickets. I [will book|book] them online.",
      "She [was studying|study] in the library when I last [saw|see] her."
    ]},
  { title: "Exercise 4", kind: "rewrite",
    instr: "Complete the second sentence so that it means the same as the first.",
    items: [
      { orig: "I last saw my friend two years ago.", tgt: "I [haven't seen] my friend for two years." },
      { orig: "The film began before I arrived.", tgt: "When I arrived, the film [had already begun]." },
      { orig: "She started learning French five years ago.", tgt: "She [has been] learning French for five years." },
      { orig: "This is my first visit to Japan.", tgt: "I [have never been] to Japan before." },
      { orig: "He began reading at eight and is still reading at nine.", tgt: "At nine, he [has been reading] for an hour." },
      { orig: "The baby is still crying.", tgt: "The baby [has been] crying since noon." },
      { orig: "We have arranged to have a party next Friday.", tgt: "We [are having] a party next Friday." },
      { orig: "It's likely that the typhoon will come this weekend.", tgt: "The typhoon [will probably] come this weekend." }
    ]},
  { title: "Exercise 5", kind: "rewrite",
    instr: "Rewrite each sentence using the word in brackets. Do not change the meaning.",
    items: [
      { orig: "I was having dinner. The lights went out.", given: "while", tgt: "The lights went out [while] I [was having] dinner." },
      { orig: "She had never seen snow before she visited Japan.", given: "until", tgt: "She [had never seen] snow [until] she visited Japan." },
      { orig: "He finished speaking. Then he sat down.", given: "When", tgt: "When he [had spoken], he sat down." },
      { orig: "I have decided to join the school choir.", given: "going", tgt: "I [am going to] join the school choir." },
      { orig: "We will probably finish the project next week.", given: "by", tgt: "We [will have finished] the project by next week." },
      { orig: "Look at the dark clouds! It will rain soon.", given: "going", tgt: "Look at the dark clouds! It [is going to] rain soon." },
      { orig: "I started working here in 2020.", given: "since", tgt: "I [have worked] here [since] 2020." },
      { orig: "This is the first time I have tried scuba diving.", given: "never", tgt: "I [have never tried] scuba diving before." }
    ]},
  { title: "Exercise 6", kind: "mc",
    instr: "Choose the best answer for each question.",
    items: [
      { q: "I ______ my homework when you called me last night.", opts: ["do","was doing","have done","had done"], ans: 1 },
      { q: "By the time we reached the cinema, the film ______.", opts: ["started","has started","had started","was starting"], ans: 2 },
      { q: "She ______ in this company since 2019.", opts: ["works","worked","has worked","is working"], ans: 2 },
      { q: "Look! It ______. Take an umbrella.", opts: ["rains","is raining","has rained","rained"], ans: 1 },
      { q: "We ______ a party next Saturday. Would you like to come?", opts: ["have","had","are having","will having"], ans: 2 },
      { q: "I ______ three cups of coffee so far today.", opts: ["drink","drank","am drinking","have drunk"], ans: 3 },
      { q: "While Mum ______ in the kitchen, I ______ my room.", opts: ["cooked, cleaned","was cooking, cleaned","cooked, was cleaning","was cooking, was cleaning"], ans: 3 },
      { q: "The students ______ the hall before the headmaster arrived.", opts: ["left","have left","had left","were leaving"], ans: 2 },
      { q: "This time tomorrow, I ______ on a plane to London.", opts: ["sit","will sit","will be sitting","am sitting"], ans: 2 },
      { q: "He ______ his keys, so he can't open the door now.", opts: ["loses","lost","has lost","had lost"], ans: 2 },
      { q: "I'm sure our team ______ the match tomorrow.", opts: ["wins","will win","is winning","has won"], ans: 1 },
      { q: "She ______ the piano every day when she was young.", opts: ["plays","played","was playing","has played"], ans: 1 }
    ]},
  { title: "Exercise 7", kind: "mc",
    instr: "Choose the best answer for each question.",
    items: [
      { q: "How long ______ you ______ here?", opts: ["did, live","have, lived","do, live","are, living"], ans: 1 },
      { q: "The baby ______ all morning. He must be tired.", opts: ["cries","cried","has been crying","is crying"], ans: 2 },
      { q: "Don't disturb me. I ______ an important letter.", opts: ["write","wrote","am writing","have written"], ans: 2 },
      { q: "When I ______ young, I ______ to school by bus.", opts: ["was, went","am, go","was, was going","have been, went"], ans: 0 },
      { q: "She ______ a shower when the earthquake happened.", opts: ["takes","took","was taking","has taken"], ans: 2 },
      { q: "We ______ our new house by the end of this month.", opts: ["move into","will move into","will have moved into","are moving into"], ans: 2 },
      { q: "I ______ never ______ such a funny film before.", opts: ["have, seen","had, seen","did, see","was, seeing"], ans: 0 },
      { q: "The train ______ at 7:30 every morning.", opts: ["leave","leaves","is leaving","left"], ans: 1 },
      { q: "He ______ for ten years before he retired.", opts: ["taught","has taught","had taught","was teaching"], ans: 2 },
      { q: "______ you ______ the new library yet?", opts: ["Have, visited","Did, visit","Do, visit","Are, visiting"], ans: 0 },
      { q: "It ______. The ground is wet.", opts: ["rained","was raining","has rained","had rained"], ans: 2 },
      { q: "Look out! That car ______ hit you!", opts: ["will","is going to","is","was going to"], ans: 1 }
    ]},
  { title: "Exercise 8", kind: "passage",
    instr: "Complete the passage with the correct form of the verbs in brackets.",
    paras: [
      "When I [was|be] fourteen, my father [took|take] me on my first camping trip in Sai Kung. We [had been planning|plan] the trip for weeks, and I [had been looking forward|look forward] to it eagerly. On the day of departure, however, I [overslept|oversleep] because my alarm clock [had stopped|stop] working during the night. By the time we [left|leave] the house, the sky [had already turned|already turn] grey.",
      "“Don't worry,” my father [said|say]. “The weather [will improve|improve] later.” I [didn't believe|not believe] him, but I [decided|decide] to stay positive. While we [were driving|drive] along the winding country road, heavy rain suddenly [poured|pour] down. The visibility [became|become] so poor that my father [had|have] to pull over. We [sat|sit] in the car for nearly two hours, listening to the thunder. I [had never felt|never feel] so disappointed in my life.",
      "Eventually, the rain [eased|ease] and we [reached|reach] the campsite late in the evening, exhausted but relieved. Since that trip, I [have always packed|always pack] a spare alarm clock whenever I go camping."
    ]},
  { title: "Exercise 9", kind: "passage",
    instr: "Complete the passage with the correct form of the verbs in brackets.",
    paras: [
      "This summer, I [decided|decide] to look for a part-time job instead of staying at home. For years, I [had relied|rely] on my parents for pocket money, and I [wanted|want] to become more independent. After I [had sent|send] out more than ten applications, a small café finally [called|call] me for an interview.",
      "On the day of the interview, I [woke|wake] up extra early. I [had been practising|practise] answering common interview questions all week, so I [felt|feel] fairly confident. However, when I [arrived|arrive], the manager [had already interviewed|already interview] two other candidates. I [waited|wait] nervously outside for what felt like forever. Just as I [was wondering|wonder] whether I should give up, the door [opened|open] and the manager [called|call] my name.",
      "“Relax,” she [smiled|smile]. “We [have decided|decide] to hire you already. You [are|be] the most enthusiastic applicant we [have ever met|ever meet].”",
      "I could hardly believe it. I [have been working|work] at the café for a month now, and I [have been enjoying|enjoy] every moment. Next week, I [will use|use] my first salary to buy my mother a birthday present. I am sure she [will be|be] proud of me."
    ]},
  { title: "Exercise 10", kind: "passage",
    instr: "Complete the passage with the correct form of the verbs in brackets.",
    paras: [
      "Last Friday [was|be] the day of the inter-school basketball final. Our team [had been preparing|prepare] for this match for the whole year. We [trained|train] every evening, and our coach [never let|never let] us rest until we [had perfected|perfect] every move.",
      "In the first half, we [played|play] terribly. By half-time, the other team [had already scored|already score] twenty more points than us. While we [were sitting|sit] in the changing room, our captain [gave|give] an inspiring speech. “We [are not going to lose|not lose] this match,” he [shouted|shout]. “We [have come|come] this far, and we [will not throw|not throw] it away now.”",
      "The second half [was|be] completely different. We [played|play] with such energy that the crowd [cheered|cheer] wildly. With only ten seconds left, I [managed|manage] to score the winning basket. The moment I [did|do] that, the whole gymnasium [erupted|erupt]. I [had never felt|never feel] such joy before. Even now, I [still remember|still remember] every detail of that afternoon. It [remains|remain] one of the happiest moments of my life."
    ]}
];

/* ============================ HELPERS ============================ */
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function parseText(s) {
  const segs = [];
  const re = /\[([^\]|]+)(?:\|([^\]]*))?\]/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) segs.push({ t: s.slice(last, m.index) });
    segs.push({ blank: true, ans: m[1], base: m[2] || null });
    last = m.index + m[0].length;
  }
  if (last < s.length) segs.push({ t: s.slice(last) });
  return segs;
}

function blankHtml(w) { return '<span class="b" style="width:' + w + 'cm">&nbsp;</span>'; }

function renderSegs(segs, width, showBase) {
  let out = '';
  for (const s of segs) {
    if (s.t) { out += esc(s.t); }
    else {
      out += blankHtml(width);
      if (showBase && s.base) out += ' <span class="base">(' + esc(s.base) + ')</span>';
    }
  }
  return out;
}

function answersOf(segs) { return segs.filter(s => s.blank).map(s => s.ans); }

/* ============================ RENDER ============================ */
const CSS = `
@page { size: A4; margin: 1.5cm 1.8cm; }
* { box-sizing: border-box; }
body { font-family: Helvetica, Arial, "PingFang TC", "Hiragino Sans GB", sans-serif; font-size: 12pt; line-height: 1.55; color: #000; margin: 0; }
h1 { font-size: 16pt; margin: 0 0 3pt; }
.subtitle { font-size: 10.5pt; color: #222; margin: 0 0 10pt; }
.meta { font-size: 11pt; margin-bottom: 14pt; border-bottom: 1px solid #999; padding-bottom: 8pt; }
.meta span { margin-right: 26pt; }
.meta .ln { display:inline-block; width: 150pt; border-bottom: 1px solid #000; height: 11pt; vertical-align: bottom; }
.ex { margin: 0 0 16pt; }
.ex h2 { font-size: 12.5pt; margin: 0 0 3pt; page-break-after: avoid; }
.ex .instr { font-size: 10.5pt; font-style: italic; margin: 0 0 7pt; }
.ex .choice-note { font-size: 10.5pt; margin: 0 0 7pt; }
ol { margin: 0; padding-left: 22pt; }
ol > li { margin-bottom: 9pt; page-break-inside: avoid; }
.b { display:inline-block; border-bottom: 1px solid #000; height: 11pt; }
.base { white-space: nowrap; }
.pnum { font-size: 9pt; vertical-align: super; }
.passage p { margin: 0 0 8pt; line-height: 2.0; }
.passage p:last-child { margin-bottom: 0; }
.mc { margin-bottom: 9pt; page-break-inside: avoid; }
.mc .q { margin-bottom: 2pt; }
.mc .opt { padding-left: 16pt; }
.answerkey { page-break-before: always; }
.answerkey h2 { font-size: 14pt; margin: 0 0 8pt; }
.answerkey h3 { font-size: 12pt; margin: 10pt 0 4pt; page-break-after: avoid; }
.answerkey ol { list-style: none; padding-left: 0; }
.answerkey li { margin-bottom: 3pt; page-break-inside: avoid; }
`;

function buildPreposition() {
  let body = '';
  body += '<h1>Grammar Worksheet — Prepositions</h1>';
  body += '<div class="subtitle">at / in / on &nbsp;·&nbsp; to / for / from &nbsp;·&nbsp; against &nbsp;·&nbsp; by / of</div>';
  body += '<div class="meta"><span>Name: <span class="ln">&nbsp;</span></span><span>Class: <span class="ln">&nbsp;</span></span><span>Date: <span class="ln">&nbsp;</span></span></div>';

  let ans = '';
  ans += '<div class="answerkey"><h2>Answer Key — Prepositions</h2>';

  PREP.forEach((ex) => {
    body += '<div class="ex"><h2>' + ex.title + ' &nbsp;<span style="font-weight:normal;font-size:10.5pt">(' + ex.tag + ')</span></h2>';
    body += '<div class="instr">Fill in each blank with the correct preposition (' + ex.tag + ').</div>';
    body += '<ol>';
    const itemAns = [];
    ex.items.forEach((s, i) => {
      const segs = parseText(s);
      body += '<li>' + renderSegs(segs, 1.6, false) + '</li>';
      itemAns.push((i + 1) + '. ' + answersOf(segs).join(', '));
    });
    body += '</ol></div>';
    ans += '<h3>' + ex.title + '</h3><ol>';
    itemAns.forEach(a => { ans += '<li>' + esc(a) + '</li>'; });
    ans += '</ol>';
  });
  ans += '</div>';

  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>' + body + ans + '</body></html>';
}

function buildTenses() {
  let body = '';
  body += '<h1>Grammar Worksheet — Tenses (Mixed)</h1>';
  body += '<div class="subtitle">Present · Past · Future — fill in the blanks, sentence transformation, multiple choice &amp; cloze passages</div>';
  body += '<div class="meta"><span>Name: <span class="ln">&nbsp;</span></span><span>Class: <span class="ln">&nbsp;</span></span><span>Date: <span class="ln">&nbsp;</span></span></div>';

  let ans = '';
  ans += '<div class="answerkey"><h2>Answer Key — Tenses</h2>';

  TENSES.forEach((ex) => {
    body += '<div class="ex"><h2>' + ex.title + '</h2>';
    body += '<div class="instr">' + esc(ex.instr) + '</div>';

    const key = [];

    if (ex.kind === 'fill') {
      body += '<ol>';
      ex.items.forEach((s, i) => {
        const segs = parseText(s);
        body += '<li>' + renderSegs(segs, 3.2, true) + '</li>';
        key.push((i + 1) + '. ' + answersOf(segs).join(', '));
      });
      body += '</ol>';
    }
    else if (ex.kind === 'rewrite') {
      body += '<ol>';
      ex.items.forEach((it, i) => {
        const segs = parseText(it.tgt);
        body += '<li><span style="color:#000">' + esc(it.orig) + '</span>' +
                (it.given ? ' <b>(' + esc(it.given) + ')</b>' : '') +
                '<br>' + renderSegs(segs, 3.2, false) + '</li>';
        key.push((i + 1) + '. ' + answersOf(segs).join(', '));
      });
      body += '</ol>';
    }
    else if (ex.kind === 'mc') {
      const letters = ['A', 'B', 'C', 'D'];
      ex.items.forEach((it, i) => {
        body += '<div class="mc"><div class="q">' + (i + 1) + '. ' + esc(it.q) + '</div>';
        it.opts.forEach((o, j) => {
          body += '<div class="opt">' + letters[j] + '. ' + esc(o) + '</div>';
        });
        body += '</div>';
        key.push((i + 1) + '. ' + letters[it.ans] + (it.opts[it.ans] ? ' (' + it.opts[it.ans] + ')' : ''));
      });
    }
    else if (ex.kind === 'passage') {
      let n = 1;
      body += '<div class="passage">';
      ex.paras.forEach((p) => {
        const segs = parseText(p);
        let out = '<p>';
        for (const s of segs) {
          if (s.t) { out += esc(s.t); }
          else {
            out += '<span class="pnum">(' + n + ')</span> ' + blankHtml(2.6);
            if (s.base) out += ' <span class="base">(' + esc(s.base) + ')</span>';
            key.push(n + '. ' + s.ans);
            n++;
          }
        }
        out += '</p>';
        body += out;
      });
      body += '</div>';
    }

    ans += '<h3>' + ex.title + '</h3><ol>';
    key.forEach(a => { ans += '<li>' + esc(a) + '</li>'; });
    ans += '</ol>';
  });
  ans += '</div>';

  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>' + body + ans + '</body></html>';
}

/* ============================ GENERATE ============================ */
function toPdf(html, htmlPath, pdfPath) {
  fs.writeFileSync(htmlPath, html);
  const args = ['--headless', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=' + pdfPath, 'file://' + htmlPath];
  execFileSync(CHROME, args, { stdio: 'ignore' });
}

const prepHtmlPath = path.join(BUILD, 'prepositions.html');
const tenseHtmlPath = path.join(BUILD, 'tenses.html');
const prepPdf = path.join(OUT, 'prepositions.pdf');
const tensePdf = path.join(OUT, 'tenses.pdf');

toPdf(buildPreposition(), prepHtmlPath, prepPdf);
toPdf(buildTenses(), tenseHtmlPath, tensePdf);

console.log('Wrote', prepPdf);
console.log('Wrote', tensePdf);
