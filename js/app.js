// App shell: views, editor, library and print.
import { DIFFICULTY, MODES, BLOCK_KINDS, HEADING_SUGGESTIONS, ART_PRESETS, ICON_TOKENS, newMission, newBlock, newPart, normaliseMission, missionName, uid } from './data/schema.js?v=a4121861';
import { ITEMS } from './data/items.js?v=a4121861';
import { sampleMission } from './data/sample.js?v=a4121861';
import { renderFront, renderBack, drawIcon, ensureFonts, fitReport } from './render.js?v=a4121861';
import { fileToDataUrl } from './art.js?v=a4121861';
import { listMissions, getMission, saveMission, deleteMission, exportPayload, downloadJson, importJson, getSetting, setSetting, slug } from './store.js?v=a4121861';
import { renderSheet, buildSheetPdf } from './sheet.js?v=a4121861';
import { buildPdf, PAPERS, layoutFor } from './print.js?v=a4121861';

const VERSION = '1.0.0';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'value') e.value = v;
    else if (v === true) e.setAttribute(k, '');
    else e.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) e.append(kid.nodeType ? kid : document.createTextNode(kid));
  return e;
}

function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, ms);
}

const state = { missions: [], current: null, partIdx: 0, side: 'front', fit: [] };

// ---------- routing ----------

function route() {
  const [tab, id] = (location.hash.replace('#', '') || 'library').split('/');
  const views = ['library', 'edit', 'print', 'sheet', 'guide', 'about'];
  const view = views.includes(tab) ? tab : 'library';
  views.forEach(v => { $('#view-' + v).hidden = v !== view; });
  $$('.tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === view));
  if (view === 'library') renderLibrary();
  if (view === 'edit') openEditor(id);
  if (view === 'print') renderPrint();
  if (view === 'sheet') renderSheetView();
  window.scrollTo(0, 0);
}

// ---------- library ----------

async function refreshMissions() {
  state.missions = await listMissions();
  return state.missions;
}

async function renderLibrary() {
  const grid = $('#libraryGrid');
  const missions = await refreshMissions();
  grid.innerHTML = '';
  if (!missions.length) {
    grid.append(el('div', { class: 'empty' }, 'No missions yet. Start a new one or import a file.'));
    return;
  }
  for (const m of missions) {
    const cv = el('canvas', { width: 12, height: 7, title: 'Open in editor', onclick: () => { location.hash = '#edit/' + m.id; } });
    const diff = DIFFICULTY.find(d => d.value === m.difficulty);
    const tile = el('article', { class: 'tile' },
      cv,
      el('div', { class: 'tile-body' },
        el('h3', { text: m.title || 'Untitled mission' }),
        el('div', { class: 'muted small', text: [missionName(m), `${m.parts.length} parts`, diff && diff.label, m.author && `by ${m.author}`].filter(Boolean).join(' · ') })
      ),
      el('div', { class: 'tile-actions' },
        el('a', { class: 'btn mini primary', href: '#edit/' + m.id }, 'Edit'),
        el('button', { class: 'btn mini', type: 'button', onclick: () => duplicate(m) }, 'Duplicate'),
        el('button', { class: 'btn mini', type: 'button', onclick: () => downloadJson(exportPayload([m]), slug(m.title) + '.json') }, 'Export'),
        el('button', { class: 'btn mini danger', type: 'button', onclick: () => remove(m) }, 'Delete')
      )
    );
    grid.append(tile);
    renderBack(m, 0, { scale: 4, canvas: cv }).catch(() => {});
  }
}

async function duplicate(m) {
  const copy = normaliseMission(JSON.parse(JSON.stringify(m)));
  copy.id = uid('m');
  copy.title = (m.title || 'Mission') + ' (copy)';
  copy.created = new Date().toISOString();
  await saveMission(copy);
  toast('Duplicated.');
  renderLibrary();
}

async function remove(m) {
  if (!confirm(`Delete "${m.title}"? This cannot be undone unless you have a backup file.`)) return;
  await deleteMission(m.id);
  if (state.current && state.current.id === m.id) state.current = null;
  toast('Deleted.');
  renderLibrary();
}

// ---------- editor ----------

let saveTimer = null, previewTimer = null, fitTimer = null;

function scheduleSave() {
  $('#saveState').textContent = 'Saving';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try { await saveMission(state.current); $('#saveState').textContent = 'Saved'; }
    catch (e) { $('#saveState').textContent = 'Not saved'; toast('Could not save: ' + e.message, 5000); }
  }, 500);
}

function changed({ structure = false } = {}) {
  scheduleSave();
  $('#editorTitle').textContent = state.current.title || 'Mission';
  if (structure) renderParts();
  schedulePreview();
}

function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(renderPreview, 160);
  clearTimeout(fitTimer);
  fitTimer = setTimeout(updateFit, 700);
}

async function openEditor(id) {
  if (id && (!state.current || state.current.id !== id)) {
    state.current = await getMission(id);
    state.partIdx = 0;
  }
  if (!state.current) {
    const last = getSetting('lastMission', null);
    if (last) state.current = await getMission(last);
  }
  const m = state.current;
  $('#editorEmpty').hidden = !!m;
  $('#editor').hidden = !m;
  if (!m) return;
  setSetting('lastMission', m.id);
  if (location.hash !== '#edit/' + m.id) history.replaceState(null, '', '#edit/' + m.id);
  $('#editorTitle').textContent = m.title || 'Mission';
  $('#saveState').textContent = '';
  renderDetails();
  renderArtForm();
  renderParts();
  $('#notesField').value = m.notes || '';
  renderPreview();
  updateFit();
}

function field(label, input, cls) {
  return el('label', { class: 'field' + (cls ? ' ' + cls : '') }, el('span', { text: label }), input);
}

function bindText(input, obj, key, opts = {}) {
  input.value = obj[key] ?? '';
  input.addEventListener('input', () => { obj[key] = input.value; changed(opts); });
  return input;
}

function renderDetails() {
  const m = state.current;
  const f = $('#detailsForm');
  f.innerHTML = '';
  const diff = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Difficulty' },
    DIFFICULTY.map(d => el('button', {
      type: 'button', class: m.difficulty === d.value ? 'on' : '', title: d.label,
      onclick: e => { m.difficulty = d.value; $$('button', e.currentTarget.parentNode).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); changed(); }
    }, `${d.marks} ${d.label}`)));
  const mode = el('select', { onchange: e => { m.mode = e.target.value; changed(); } }, MODES.map(o => el('option', { value: o.value, selected: m.mode === o.value }, o.label)));
  const community = el('input', { type: 'checkbox', checked: !!m.community, onchange: e => { m.community = e.target.checked; changed(); } });
  f.append(
    field('Mission name', bindText(el('input', { type: 'text', placeholder: 'Search and rescue' }), m, 'title'), 'wide'),
    field('Label', bindText(el('input', { type: 'text', placeholder: 'Mission' }), m, 'label')),
    field('Number', bindText(el('input', { type: 'text', placeholder: '15, CM-3 or blank' }), m, 'number')),
    field('Author', bindText(el('input', { type: 'text', placeholder: 'Your name or handle' }), m, 'author')),
    field('Players', bindText(el('input', { type: 'text', placeholder: '1-6' }), m, 'players')),
    field('Playing time (minutes)', bindText(el('input', { type: 'text', placeholder: '90-180' }), m, 'playtime')),
    field('Game mode', mode),
    el('div', { class: 'field wide' }, el('span', { class: 'muted small', text: 'Difficulty' }), el('div', {}, diff)),
    field('Summary (printed as brief info on the back of part 1)', bindText(el('textarea', { rows: 2, placeholder: 'One or two sentences that tell players what the mission is about.' }), m, 'summary'), 'wide'),
    el('label', { class: 'check wide' }, community, 'Show "Community mission" under the title')
  );
}

function renderArtForm() {
  const m = state.current;
  const f = $('#artForm');
  f.innerHTML = '';
  const preset = el('select', { onchange: e => { m.art.preset = e.target.value; changed(); } },
    ART_PRESETS.map(p => el('option', { value: p.value, selected: m.art.preset === p.value }, p.label)));
  f.append(el('p', { class: 'muted small', text: 'Upload your own art, or use a drawn scene. The front art sits behind the text. The back shows the art in landscape. Use art you made or have permission to use.' }));
  f.append(field('Drawn scene (used when no picture is uploaded)', preset));
  for (const side of ['front', 'back']) {
    const posKey = side + 'Pos';
    const wrap = el('div', { class: 'panel' });
    const input = el('input', { type: 'file', accept: 'image/*', hidden: true, id: 'art-' + side });
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      try { m.art[side] = await fileToDataUrl(file); changed(); renderArtForm(); }
      catch (e) { toast(e.message); }
    });
    const slider = (label, key, min, max, step) => {
      const r = el('input', { type: 'range', min, max, step, value: m.art[posKey][key] });
      r.addEventListener('input', () => { m.art[posKey][key] = +r.value; changed(); });
      return field(label, r);
    };
    wrap.append(
      el('strong', { text: side === 'front' ? 'Front art (portrait)' : 'Back art (landscape)' }),
      m.art[side] ? el('img', { class: 'thumb', src: m.art[side], alt: side + ' art' }) : el('p', { class: 'muted small', text: side === 'back' && m.art.front ? 'Using the front art.' : side === 'front' && m.art.back ? 'Using the back art.' : 'Using the drawn scene.' }),
      el('div', { class: 'toolbar-actions' },
        el('label', { class: 'btn mini', for: 'art-' + side }, m.art[side] ? 'Replace picture' : 'Upload picture'),
        m.art[side] ? el('button', { class: 'btn mini danger', type: 'button', onclick: () => { m.art[side] = null; changed(); renderArtForm(); } }, 'Remove') : null,
        input
      ),
      el('div', { class: 'form-grid' },
        slider('Left to right', 'x', 0, 100, 1),
        slider('Top to bottom', 'y', 0, 100, 1),
        slider('Zoom', 'zoom', 1, 3, 0.05)
      )
    );
    f.append(wrap);
  }
}

function fitBadge(i) {
  const fit = state.fit[i];
  if (!fit) return el('span', { class: 'fit empty', text: '' });
  if (fit.empty) return el('span', { class: 'fit empty', text: 'empty' });
  if (fit.overflow) return el('span', { class: 'fit over', text: 'too long' });
  if (fit.scale < 0.985) return el('span', { class: 'fit shrunk', text: `fits at ${Math.round(fit.scale * 100)}%` });
  return el('span', { class: 'fit ok', text: 'fits' });
}

function selectPart(i) {
  state.partIdx = i;
  $$('.part').forEach((p, k) => p.classList.toggle('selected', k === i));
  renderPreviewSelect();
  renderPreview();
}

function insertAtCursor(ta, text) {
  const s = ta.selectionStart ?? ta.value.length, e = ta.selectionEnd ?? ta.value.length;
  ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
  ta.selectionStart = ta.selectionEnd = s + text.length;
  ta.dispatchEvent(new Event('input'));
  ta.focus();
}

function renderParts() {
  const m = state.current;
  const list = $('#partsList');
  list.innerHTML = '';
  if (state.partIdx >= m.parts.length) state.partIdx = m.parts.length - 1;
  m.parts.forEach((part, i) => {
    const move = (d) => { const j = i + d; if (j < 0 || j >= m.parts.length) return; [m.parts[i], m.parts[j]] = [m.parts[j], m.parts[i]]; state.partIdx = j; changed({ structure: true }); };
    const head = el('div', { class: 'part-head' },
      el('h3', { onclick: () => selectPart(i) }, `Part ${i + 1} of ${m.parts.length}`),
      el('span', { class: 'fit-slot' }, fitBadge(i)),
      el('button', { class: 'btn mini', type: 'button', title: 'Move up', 'aria-label': 'Move part up', disabled: i === 0, onclick: () => move(-1) }, '↑'),
      el('button', { class: 'btn mini', type: 'button', title: 'Move down', 'aria-label': 'Move part down', disabled: i === m.parts.length - 1, onclick: () => move(1) }, '↓'),
      el('button', { class: 'btn mini', type: 'button', onclick: () => { const c = JSON.parse(JSON.stringify(part)); c.id = uid('p'); c.blocks.forEach(b => { b.id = uid('b'); }); m.parts.splice(i + 1, 0, c); state.partIdx = i + 1; changed({ structure: true }); } }, 'Copy'),
      el('button', { class: 'btn mini danger', type: 'button', disabled: m.parts.length === 1, onclick: () => { if (!confirm(`Delete part ${i + 1}?`)) return; m.parts.splice(i, 1); changed({ structure: true }); } }, 'Delete')
    );
    const blocks = el('div', { class: 'blocks' });
    part.blocks.forEach((b, k) => blocks.append(blockEditor(part, b, k, i)));
    const kindSel = el('select', { 'aria-label': 'Block type to add' }, Object.entries(BLOCK_KINDS).map(([v, d]) => el('option', { value: v }, d.label)));
    blocks.append(el('div', { class: 'add-row' }, kindSel,
      el('button', { class: 'btn mini', type: 'button', onclick: () => { const kind = kindSel.value; part.blocks.push(newBlock(kind, kind === 'section' ? 'SETUP' : '')); changed({ structure: true }); } }, 'Add block')));
    const card = el('section', { class: 'part' + (i === state.partIdx ? ' selected' : ''), onfocusin: () => { if (state.partIdx !== i) selectPart(i); } }, head, blocks);
    list.append(card);
  });
  renderPreviewSelect();
}

function blockEditor(part, b, k, partIdx) {
  const m = state.current;
  const def = BLOCK_KINDS[b.kind] || BLOCK_KINDS.story;
  const wrap = el('div', { class: 'block' });
  wrap.style.setProperty('--kind', def.colour || (b.kind === 'section' ? '#8a3b1c' : '#bfb3a3'));
  const kind = el('select', { 'aria-label': 'Block type', onchange: e => { b.kind = e.target.value; if (b.kind === 'section' && !b.heading) b.heading = 'SETUP'; changed({ structure: true }); } },
    Object.entries(BLOCK_KINDS).map(([v, d]) => el('option', { value: v, selected: v === b.kind }, d.label)));
  const move = (d) => { const j = k + d; if (j < 0 || j >= part.blocks.length) return; [part.blocks[k], part.blocks[j]] = [part.blocks[j], part.blocks[k]]; changed({ structure: true }); };
  wrap.append(el('div', { class: 'block-head' }, kind,
    el('button', { class: 'btn mini', type: 'button', 'aria-label': 'Move block up', disabled: k === 0, onclick: () => move(-1) }, '↑'),
    el('button', { class: 'btn mini', type: 'button', 'aria-label': 'Move block down', disabled: k === part.blocks.length - 1, onclick: () => move(1) }, '↓'),
    el('button', { class: 'btn mini danger', type: 'button', 'aria-label': 'Delete block', onclick: () => { part.blocks.splice(k, 1); changed({ structure: true }); } }, '✕')));

  if (b.kind === 'image') {
    const id = 'img-' + b.id;
    const input = el('input', { type: 'file', accept: 'image/*', hidden: true, id });
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      try { b.image = await fileToDataUrl(file, 1400, 0.9); changed({ structure: true }); } catch (e) { toast(e.message); }
    });
    wrap.append(
      b.image ? el('img', { class: 'thumb', src: b.image, alt: 'Block picture' }) : el('p', { class: 'muted small', text: 'No picture yet. Diagrams with a white or clear background print best.' }),
      el('div', { class: 'toolbar-actions' }, el('label', { class: 'btn mini', for: id }, b.image ? 'Replace picture' : 'Upload picture'), input),
      field('Caption', bindText(el('input', { type: 'text', placeholder: 'Optional' }), b, 'caption'))
    );
    return wrap;
  }

  if (b.kind === 'section') {
    const listId = 'heads-' + b.id;
    const hi = bindText(el('input', { type: 'text', list: listId, placeholder: 'Heading', class: 'heading' }), b, 'heading');
    wrap.append(hi, el('datalist', { id: listId }, HEADING_SUGGESTIONS.map(h => el('option', { value: h }))));
  }
  const placeholder = {
    section: b.heading === 'SETUP' ? 'Form 2 stacks of map tiles...' : b.heading === 'SPECIAL RULES' ? 'Rules that only apply in this mission.' : 'Introduction to the mission.',
    story: 'What the characters find or see.',
    goal: 'What the group must achieve to win.',
    objectives: 'Do X, then read **{mission} - Part 2**.',
    bonus: 'An optional extra task and its reward.',
    success: 'Debriefing when the mission succeeds.',
    failure: 'Debriefing when the mission fails.'
  }[b.kind];
  const ta = bindText(el('textarea', { rows: 4, placeholder }), b, 'text');
  const iconSel = el('select', { class: 'mini', 'aria-label': 'Insert icon', onchange: e => { if (e.target.value) insertAtCursor(ta, `{${e.target.value}}`); e.target.value = ''; } },
    el('option', { value: '' }, 'Insert icon'), Object.entries(ICON_TOKENS).map(([v, d]) => el('option', { value: v }, d.label)));
  const cats = [...new Set(ITEMS.map(i => i.cat))];
  const itemSel = el('select', { class: 'mini', 'aria-label': 'Insert item name', onchange: e => { if (e.target.value) insertAtCursor(ta, `**${e.target.value}**`); e.target.value = ''; } },
    el('option', { value: '' }, 'Insert item'),
    cats.map(c => el('optgroup', { label: c }, ITEMS.filter(i => i.cat === c).map(i => el('option', { value: i.name }, i.name + (i.cp01 ? ' (CP01)' : ''))))));
  const nextPart = Math.min(m.parts.length, partIdx + 2);
  wrap.append(ta, el('div', { class: 'block-tools' },
    el('button', { class: 'btn mini', type: 'button', title: 'Bold the selected text', onclick: () => { const s = ta.selectionStart, e = ta.selectionEnd; const sel = ta.value.slice(s, e) || 'bold'; ta.setSelectionRange(s, e); insertAtCursor(ta, `**${sel}**`); } }, 'Bold'),
    el('button', { class: 'btn mini', type: 'button', onclick: () => insertAtCursor(ta, `Read **{mission} - Part ${nextPart}**.`) }, `Link to part ${nextPart}`),
    iconSel, itemSel));
  return wrap;
}

function renderPreviewSelect() {
  const m = state.current;
  const sel = $('#previewPart');
  sel.innerHTML = '';
  m.parts.forEach((p, i) => sel.append(el('option', { value: i, selected: i === state.partIdx }, `Part ${i + 1}`)));
}

let previewSeq = 0;
async function renderPreview() {
  const m = state.current;
  if (!m) return;
  const seq = ++previewSeq;
  const tmp = document.createElement('canvas');
  const opts = { scale: 9, rounded: true, markOverflow: true, canvas: tmp };
  const res = state.side === 'front' ? await renderFront(m, state.partIdx, opts) : await renderBack(m, state.partIdx, opts);
  if (seq !== previewSeq) return;
  const cv = $('#previewCanvas');
  cv.width = tmp.width; cv.height = tmp.height;
  cv.getContext('2d').drawImage(tmp, 0, 0);
  const note = $('#fitNote');
  if (state.side === 'front' && res.fit) {
    const f = res.fit;
    note.textContent = f.empty ? 'This part has no text yet.' : f.overflow ? 'Too long for one card. Split this part or trim the text.' : f.scale < 0.985 ? `Text shrunk to ${Math.round(f.scale * 100)}% to fit.` : 'Text fits.';
    note.style.color = f.overflow ? 'var(--danger)' : '';
  } else note.textContent = state.partIdx === 0 ? 'Part 1 back shows the brief info.' : '';
}

async function updateFit() {
  const m = state.current;
  if (!m) return;
  state.fit = await fitReport(m);
  $$('#partsList .part').forEach((p, i) => { const slot = $('.fit-slot', p); if (slot) { slot.innerHTML = ''; slot.append(fitBadge(i)); } });
}

function setupEditorChrome() {
  $$('#preview .seg button').forEach(b => b.addEventListener('click', () => {
    state.side = b.dataset.side;
    $$('#preview .seg button').forEach(x => x.classList.toggle('on', x === b));
    renderPreview();
  }));
  $('#previewPart').addEventListener('change', e => selectPart(+e.target.value));
  $('#previewOpen').addEventListener('click', () => { $('#preview').classList.add('open'); renderPreview(); });
  $('#previewClose').addEventListener('click', () => $('#preview').classList.remove('open'));
  $('#addPart').addEventListener('click', () => {
    const m = state.current;
    m.parts.push(newPart([newBlock('story'), newBlock('objectives')]));
    state.partIdx = m.parts.length - 1;
    changed({ structure: true });
  });
  $('#notesField').addEventListener('input', e => { state.current.notes = e.target.value; scheduleSave(); });
  $('#exportOne').addEventListener('click', () => downloadJson(exportPayload([state.current]), slug(state.current.title) + '.json'));
  $('#printOne').addEventListener('click', () => { setSetting('printSel', [state.current.id]); location.hash = '#print'; });
  $('#downloadPng').addEventListener('click', async () => {
    const m = state.current;
    const r = state.side === 'front' ? await renderFront(m, state.partIdx, { scale: 12 }) : await renderBack(m, state.partIdx, { scale: 12 });
    const a = el('a', { href: r.canvas.toDataURL('image/png'), download: `${slug(m.title)}-part-${state.partIdx + 1}-${state.side}.png` });
    document.body.append(a); a.click(); a.remove();
  });
}

// ---------- print ----------

function renderPrint() {
  const opts = getSetting('printOpts', { paper: 'letter', perPage: 6, backs: true, clockwise: true, marks: true });
  const box = $('#printOptions');
  box.innerHTML = '';
  const save = () => setSetting('printOpts', opts);
  const paper = el('select', { onchange: e => { opts.paper = e.target.value; save(); renderPrint(); } }, Object.entries(PAPERS).map(([k, p]) => el('option', { value: k, selected: opts.paper === k }, p.label)));
  const L6 = layoutFor(opts.paper, 6);
  const per = el('select', { onchange: e => { opts.perPage = +e.target.value; save(); } },
    L6.per === 6 ? el('option', { value: 6, selected: opts.perPage === 6 }, '6 cards per page (needs about 3 mm side margins)') : null,
    el('option', { value: 4, selected: opts.perPage !== 6 || L6.per !== 6 }, '4 cards per page (fits every printer)'));
  const chk = (label, key) => el('label', { class: 'check' }, el('input', { type: 'checkbox', checked: !!opts[key], onchange: e => { opts[key] = e.target.checked; save(); } }), label);
  const rot = el('select', { onchange: e => { opts.clockwise = e.target.value === 'cw'; save(); } },
    el('option', { value: 'cw', selected: opts.clockwise !== false }, 'Back art top edge on the right'),
    el('option', { value: 'ccw', selected: opts.clockwise === false }, 'Back art top edge on the left'));
  box.append(field('Paper', paper), field('Layout', per), chk('Card backs on the following page (duplex)', 'backs'), chk('Crop marks', 'marks'), field('Back orientation', rot, 'wide'));

  const list = $('#printList');
  list.innerHTML = '';
  const sel = new Set(getSetting('printSel', []));
  refreshMissions().then(missions => {
    if (!missions.length) { list.append(el('p', { class: 'muted', text: 'No missions saved yet.' })); return; }
    for (const m of missions) {
      list.append(el('label', { class: 'check' },
        el('input', { type: 'checkbox', value: m.id, checked: sel.has(m.id), onchange: () => setSetting('printSel', $$('#printList input:checked').map(i => i.value)) }),
        `${m.title} `, el('span', { class: 'muted small', text: `${missionName(m)}, ${m.parts.length} cards` })));
    }
  });
}

function setupPrint() {
  const setAll = on => { $$('#printList input').forEach(i => { i.checked = on; }); setSetting('printSel', $$('#printList input:checked').map(i => i.value)); };
  $('#printAll').addEventListener('click', () => setAll(true));
  $('#printNone').addEventListener('click', () => setAll(false));
  $('#makePdf').addEventListener('click', async () => {
    const ids = $$('#printList input:checked').map(i => i.value);
    if (!ids.length) { toast('Pick at least one mission.'); return; }
    if (!window.jspdf) { toast('The PDF library has not loaded yet. Try again in a moment.'); return; }
    const opts = getSetting('printOpts', { paper: 'letter', perPage: 6, backs: true, clockwise: true, marks: true });
    const missions = (await refreshMissions()).filter(m => ids.includes(m.id));
    const cards = [];
    missions.forEach(m => m.parts.forEach((p, i) => cards.push({ mission: m, part: i })));
    const total = cards.length * (opts.backs ? 2 : 1);
    const btn = $('#makePdf'), status = $('#printStatus');
    btn.disabled = true;
    try {
      const doc = await buildPdf(cards, Object.assign({}, opts, { onProgress: n => { status.textContent = `Drawing card ${n} of ${total}`; } }));
      const name = missions.length === 1 ? slug(missions[0].title) : 'uos-missions';
      doc.save(`${name}-cards.pdf`);
      status.textContent = `PDF ready: ${cards.length} cards. Print at 100% scale.`;
    } catch (e) {
      status.textContent = 'PDF failed: ' + e.message;
    } finally { btn.disabled = false; }
  });
}

// ---------- survivor log ----------

const SHEET_DEFAULTS = { lang: 'en', paper: 'letter', preset: 'dunes', inkSaver: false, marks: true, pages: 1 };
function sheetOpts() { return Object.assign({}, SHEET_DEFAULTS, getSetting('sheetOpts', {})); }

function renderSheetView() {
  const opts = sheetOpts();
  const box = $('#sheetOptions');
  box.innerHTML = '';
  const save = (redraw = true) => { setSetting('sheetOpts', opts); if (redraw) drawSheetPreview(); };
  const lang = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Language' },
    [['en', 'English'], ['de', 'Deutsch']].map(([v, l]) => el('button', { type: 'button', class: opts.lang === v ? 'on' : '',
      onclick: e => { opts.lang = v; $$('button', e.currentTarget.parentNode).forEach(b => b.classList.toggle('on', b === e.currentTarget)); save(); } }, l)));
  const paper = el('select', { onchange: e => { opts.paper = e.target.value; save(false); } }, Object.entries(PAPERS).map(([k, p]) => el('option', { value: k, selected: opts.paper === k }, p.label + ', landscape')));
  const preset = el('select', { onchange: e => { opts.preset = e.target.value; save(); } }, ART_PRESETS.map(p => el('option', { value: p.value, selected: opts.preset === p.value }, p.label)));
  const pages = el('input', { type: 'number', min: 1, max: 10, value: opts.pages, onchange: e => { opts.pages = Math.max(1, Math.min(10, +e.target.value || 1)); save(false); } });
  const chk = (label, key, redraw) => el('label', { class: 'check' }, el('input', { type: 'checkbox', checked: !!opts[key], onchange: e => { opts[key] = e.target.checked; save(redraw); } }), label);
  box.append(
    el('div', { class: 'field' }, el('span', { class: 'muted small', text: 'Language' }), el('div', {}, lang)),
    field('Paper', paper), field('Header scene', preset), field('Pages (4 cards each)', pages),
    chk('Ink saver (no header art)', 'inkSaver', true), chk('Cut marks', 'marks', false));
  drawSheetPreview();
}

async function drawSheetPreview() {
  const c = await renderSheet(Object.assign(sheetOpts(), { scale: 8, rounded: true }));
  const cv = $('#sheetCanvas');
  cv.width = c.width; cv.height = c.height;
  cv.getContext('2d').drawImage(c, 0, 0);
}

function setupSheet() {
  $('#sheetPdf').addEventListener('click', async () => {
    if (!window.jspdf) { toast('The PDF library has not loaded yet. Try again in a moment.'); return; }
    const o = sheetOpts();
    const doc = await buildSheetPdf(o);
    doc.save(`survivor-log-${o.lang}.pdf`);
    $('#sheetStatus').textContent = 'PDF ready. Print at 100% scale.';
  });
  $('#sheetPng').addEventListener('click', async () => {
    const o = sheetOpts();
    const c = await renderSheet(Object.assign(o, { scale: 12 }));
    const a = el('a', { href: c.toDataURL('image/png'), download: `survivor-log-${o.lang}.png` });
    document.body.append(a); a.click(); a.remove();
  });
}

// ---------- guide ----------

function renderIconTable() {
  const box = $('#iconTable');
  for (const [k, d] of Object.entries(ICON_TOKENS)) {
    const cv = el('canvas', { width: 44, height: 44 });
    const ctx = cv.getContext('2d');
    drawIcon(ctx, k, 4, 4, 36);
    box.append(el('div', {}, cv, el('span', {}, el('code', { text: `{${k}}` }), ' ', d.label)));
  }
}

// ---------- start ----------

async function start() {
  $('#versionLine').textContent = 'Version ' + VERSION;
  $('#themeToggle').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    if (dark) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
    setSetting('theme', dark ? 'dark' : 'light');
  });
  $('#newMission').addEventListener('click', async () => {
    const m = newMission();
    await saveMission(m);
    state.current = m; state.partIdx = 0;
    location.hash = '#edit/' + m.id;
  });
  $('#exportAll').addEventListener('click', async () => {
    const all = await refreshMissions();
    if (!all.length) { toast('Nothing to back up yet.'); return; }
    downloadJson(exportPayload(all), `uos-missions-backup-${new Date().toISOString().slice(0, 10)}.json`);
  });
  $('#importFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const got = await importJson(await file.text());
      toast(`Imported ${got.length} mission${got.length === 1 ? '' : 's'}.`);
      renderLibrary();
    } catch (err) { toast(err.message, 5000); }
    e.target.value = '';
  });
  setupEditorChrome();
  setupPrint();
  setupSheet();
  renderIconTable();
  await ensureFonts();
  if (!getSetting('seeded', false)) {
    const existing = await listMissions();
    if (!existing.length) await saveMission(sampleMission());
    setSetting('seeded', true);
  }
  window.addEventListener('hashchange', route);
  route();
}

start();
