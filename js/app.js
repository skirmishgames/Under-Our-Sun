// App shell: views, editor, library and print.
import { DIFFICULTY, MODES, BLOCK_KINDS, HEADING_SUGGESTIONS, ART_PRESETS, ICON_TOKENS, MISSION_TAGS, newMission, newBlock, newPart, normaliseMission, missionName, partLabel, partTotal, uid } from './data/schema.js?v=33dccb04';
import { PATTERNS } from './data/patterns.js?v=33dccb04';
import { ITEMS } from './data/items.js?v=33dccb04';
import { sampleMission } from './data/sample.js?v=33dccb04';
import { renderFront, renderBack, drawIcon, ensureFonts, fitReport } from './render.js?v=33dccb04';
import { fileToDataUrl } from './art.js?v=33dccb04';
import { listMissions, getMission, saveMission, deleteMission, exportPayload, downloadJson, importJson, getSetting, setSetting, slug } from './store.js?v=33dccb04';
import { DISPATCHES, DISPATCH_STATUS } from './data/dispatches.js?v=33dccb04';
import { OFFICIAL_MISSIONS, COMMUNITY_MISSIONS, MISSION_TYPES } from './data/missions-index.js?v=33dccb04';
import { rollSpark } from './data/design.js?v=33dccb04';
import { FAQ, FAQ_TOPICS, FAQ_SOURCES, FAQ_LINKS, CONTENTS_1E } from './data/faq.js?v=33dccb04';
import { renderSheet, buildSheetPdf, ROGUELIKE_TEXT } from './sheet.js?v=33dccb04';
import { buildPdf, PAPERS, layoutFor } from './print.js?v=33dccb04';

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
  // First visit opens on Design; later visits open on the mission library.
  const first = !getSetting('visited', false);
  if (!location.hash) { setSetting('visited', true); history.replaceState(null, '', first ? '#design' : '#library'); }
  const [tab, id] = (location.hash.replace('#', '') || 'library').split('/');
  // Old links: Dispatches is now Stories.
  if (tab === 'dispatches') { history.replaceState(null, '', '#stories' + (id ? '/' + id : '')); return route(); }
  // Old links to the Guide open the editor's Help panel.
  if (tab === 'guide') { history.replaceState(null, '', '#edit'); setTimeout(() => { const h = $('#helpPanel'); if (h) { h.open = true; h.scrollIntoView(); } }, 300); return route(); }
  const views = ['library', 'edit', 'print', 'sheet', 'index', 'stories', 'design', 'faq', 'about'];
  const view = views.includes(tab) ? tab : 'library';
  views.forEach(v => { $('#view-' + v).hidden = v !== view; });
  $$('.tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === (view === 'edit' ? 'library' : view)));
  if (view === 'library') renderLibrary();
  if (view === 'edit') openEditor(id);
  if (view === 'print') renderPrint();
  if (view === 'sheet') renderSheetView();
  if (view === 'faq') renderFaq(id);
  if (view === 'index') renderIndex();
  if (view === 'stories') renderDispatches(id);
  if (view === 'design' && !state.spark) showSpark();
  if (!(view === 'faq' && id)) window.scrollTo(0, 0);
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
        el('div', { class: 'muted small', text: [missionName(m), `${m.parts.length} parts`, ...(m.types || []).map(t => MISSION_TAGS[t]).filter(Boolean), diff && diff.label, m.author && `by ${m.author}`].filter(Boolean).join(' · ') })
      ),
      el('div', { class: 'tile-actions' },
        el('a', { class: 'btn mini primary', href: '#edit/' + m.id }, 'Edit'),
        el('button', { class: 'btn mini', type: 'button', onclick: () => { setSetting('printSel', [m.id]); location.hash = '#print'; } }, 'Print'),
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
  if (!m) { location.hash = '#library'; return; }
  setSetting('lastMission', m.id);
  if (location.hash !== '#edit/' + m.id) history.replaceState(null, '', '#edit/' + m.id);
  $('#editorTitle').textContent = m.title || 'Mission';
  $('#saveState').textContent = '';
  renderDetails();
  renderArtForm();
  renderParts();
  $('#notesField').value = m.notes || '';
  $('#notesPanel').open = !!m.notes;
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
    el('label', { class: 'check wide' }, community, 'Show "Community mission" under the title'),
    el('div', { class: 'field wide' }, el('span', { class: 'muted small', text: 'Mission type (for your library and sharing, not printed)' }),
      el('div', { class: 'chips' }, Object.entries(MISSION_TAGS).map(([k, label]) => el('button', { type: 'button', class: 'chip' + (m.types.includes(k) ? ' on' : ''), 'aria-pressed': String(m.types.includes(k)),
        onclick: e => { const on = !m.types.includes(k); m.types = on ? [...m.types, k] : m.types.filter(t => t !== k); e.currentTarget.classList.toggle('on', on); e.currentTarget.setAttribute('aria-pressed', String(on)); scheduleSave(); } }, label))))
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
      el('h3', { onclick: () => selectPart(i) }, `Part ${partLabel(m, i)} of ${partTotal(m)}`),
      el('input', { type: 'text', class: 'part-label', value: part.label || '', placeholder: 'Label', title: 'Optional label for branching parts, for example 6 A', 'aria-label': 'Part label',
        oninput: e => { part.label = e.target.value; scheduleSave(); schedulePreview(); renderPreviewSelect(); const h = e.target.parentNode.querySelector('h3'); if (h) h.textContent = `Part ${partLabel(m, i)} of ${partTotal(m)}`; } }),
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
    failure: 'Debriefing when the mission fails.',
    roguelike: 'The group receives 1 additional {star} and the **A.E.D.** item.',
    tip: 'Try to sleep during the day.'
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
    iconSel, itemSel, el('select', { class: 'mini', 'aria-label': 'Insert a pattern from the official missions', onchange: e => { const pt = PATTERNS[+e.target.value]; if (pt) insertAtCursor(ta, (ta.value && !ta.value.endsWith('\n') ? '\n' : '') + pt.text); e.target.value = ''; } },
      el('option', { value: '' }, 'Insert pattern'), PATTERNS.map((pt, k) => el('option', { value: k }, pt.label)))));
  return wrap;
}

function renderPreviewSelect() {
  const m = state.current;
  const sel = $('#previewPart');
  sel.innerHTML = '';
  m.parts.forEach((p, i) => sel.append(el('option', { value: i, selected: i === state.partIdx }, `Part ${partLabel(m, i)}`)));
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

function renderRoguelike(lang) {
  const T = ROGUELIKE_TEXT[lang] || ROGUELIKE_TEXT.en;
  const box = $('#roguelikeRules');
  box.innerHTML = '';
  const star = el('span', { class: 'star', 'aria-hidden': 'true', text: '★' });
  box.append(el('h2', { text: T.title }), el('p', { text: T.intro }), el('ul', {}, T.rules.map(r => el('li', { text: r }))),
    el('h3', { text: T.costsTitle }),
    el('table', { class: 'cheat' }, T.costs.map(([c, what]) => el('tr', {}, el('th', {}, c, ' ', star.cloneNode(true)), el('td', { text: what })))),
    el('p', { class: 'muted small' }, T.source + ' ', el('a', { href: 'https://tabletopper.games/downloads/', target: '_blank', rel: 'noopener', text: 'tabletopper games downloads page' }), '.'));
}

async function drawSheetPreview() {
  renderRoguelike(sheetOpts().lang);
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

// ---------- mission index ----------

const indexState = { src: '', diff: '', dur: '', type: '' };

const DURATIONS = [
  { value: 'short', label: 'Short (up to 90 min)', test: max => max <= 90 },
  { value: 'medium', label: 'Medium (up to 2.5 hours)', test: max => max > 90 && max <= 150 },
  { value: 'long', label: 'Long (over 2.5 hours)', test: max => max > 150 }
];

function maxTime(m) { const n = String(m.time || '').split('-').map(Number).filter(Boolean); return n.length ? Math.max(...n) : 0; }

// Source: 'official' = written by the designers; 'community' = community authors, printed (13, 14) or fan-made.
function isCommunity(m) { return !!m.community || !m.n; }

function indexMatch(m, st) {
  if (st.src === 'official' && isCommunity(m)) return false;
  if (st.src === 'community' && !isCommunity(m)) return false;
  if (st.diff && m.diff !== +st.diff) return false;
  if (st.dur) { const d = DURATIONS.find(x => x.value === st.dur); if (!d || !d.test(maxTime(m))) return false; }
  if (st.type === 'coop' && m.mode === 'comp') return false;
  if (st.type === 'comp' && m.mode !== 'comp') return false;
  if (st.type && st.type !== 'coop' && st.type !== 'comp' && !m.types.includes(st.type)) return false;
  return true;
}

function diffBadge(d) {
  const def = DIFFICULTY.find(x => x.value === d) || DIFFICULTY[1];
  const b = el('span', { class: 'dhex', title: def.label, text: def.marks });
  b.style.background = def.colour;
  return b;
}

function renderIndex() {
  const box = $('#indexFilters');
  box.innerHTML = '';
  // count for an option, given the other active filters
  const ALL = [...OFFICIAL_MISSIONS, ...COMMUNITY_MISSIONS];
  const count = (key, value) => ALL.filter(m => indexMatch(m, Object.assign({}, indexState, { [key]: value }))).length;
  const opt = (key, value, label) => el('option', { value, selected: indexState[key] === value }, `${label} (${count(key, value)})`);
  const select = (key, label, children) => el('label', { class: 'field' }, el('span', { text: label }),
    el('select', { onchange: e => { indexState[key] = e.target.value; renderIndex(); } }, children));
  const types = Object.entries(MISSION_TYPES).filter(([k]) => k !== 'competitive' && OFFICIAL_MISSIONS.some(m => m.types.includes(k)));
  box.append(
    select('src', 'Source', [opt('src', '', 'Any'), opt('src', 'official', 'Official (by the designers)'), opt('src', 'community', 'Community')]),
    select('diff', 'Difficulty', [opt('diff', '', 'Any'), ...DIFFICULTY.map(d => opt('diff', String(d.value), `${d.marks} ${d.label}`))]),
    select('dur', 'Playing time', [opt('dur', '', 'Any'), ...DURATIONS.map(d => opt('dur', d.value, d.label))]),
    select('type', 'Type', [opt('type', '', 'Any'),
      el('optgroup', { label: 'Play mode' }, opt('type', 'coop', 'Cooperative'), opt('type', 'comp', 'Competitive')),
      el('optgroup', { label: 'Mission type' }, types.map(([k, l]) => opt('type', k, l)))]));
  const active = indexState.src || indexState.diff || indexState.dur || indexState.type;
  if (active) box.append(el('button', { class: 'btn mini', type: 'button', onclick: () => { indexState.src = indexState.diff = indexState.dur = indexState.type = ''; renderIndex(); } }, 'Clear filters'));
  const list = $('#indexList');
  list.innerHTML = '';
  const shown = OFFICIAL_MISSIONS.filter(m => indexMatch(m, indexState));
  const fans = COMMUNITY_MISSIONS.filter(m => indexMatch(m, indexState));
  const total = shown.length + fans.length;
  $('#indexCount').textContent = active ? `${total} of ${ALL.length} missions` : `${ALL.length} missions`;
  $('#indexOfficialHead').hidden = !shown.length;
  $('#indexCommunityHead').hidden = !fans.length;
  if (!total) list.append(el('p', { class: 'empty', text: 'No mission matches these filters.' }));
  for (const m of shown) {
    const meta = [`${m.parts} part${m.parts === 1 ? '' : 's'}`, `${m.players} players`, m.time && `${m.time} min`, m.box === 'cp01' ? 'Content Pack 01' : 'Base game'].filter(Boolean).join(' · ');
    list.append(el('article', { class: 'mcard', id: 'mission-' + m.n },
      el('header', {}, diffBadge(m.diff), el('div', {}, el('div', { class: 'num', text: `Mission ${m.n} · ${(DIFFICULTY.find(d => d.value === m.diff) || {}).label || ''}` }), el('h3', { text: m.title }))),
      el('div', { class: 'meta', text: meta + (m.author ? ` · by ${m.author}` : '') }),
      el('div', { class: 'tags' }, m.mode === 'comp' ? el('span', { class: 'tag comp', text: 'Competitive' }) : el('span', { class: 'tag', text: 'Cooperative' }),
        m.types.filter(t => t !== 'competitive').map(t => el('span', { class: 'tag', text: MISSION_TYPES[t] })),
        m.community ? el('span', { class: 'tag box', text: 'Community mission' }) : null),
      el('p', { text: m.premise })));
  }
  const com = $('#indexCommunity');
  com.innerHTML = '';
  for (const m of fans) {
    const meta = [m.diffText && `Difficulty: ${m.diffText}`, m.players && `${m.players} players`, m.time && `${m.time} min`].filter(Boolean).join(' · ');
    com.append(el('article', { class: 'mcard' },
      el('header', {}, el('div', {}, el('div', { class: 'num', text: m.author ? `by ${m.author}` : 'Community' }), el('h3', { text: m.title }))),
      meta ? el('div', { class: 'meta', text: meta }) : null,
      el('div', { class: 'tags' }, m.types.map(t => el('span', { class: 'tag', text: MISSION_TYPES[t] }))),
      el('p', { text: m.premise })));
  }
}

// ---------- dispatches ----------

const dispatchState = { status: '' };
const dispatchCache = new Map();

async function loadDispatch(d) {
  if (!dispatchCache.has(d.id)) {
    dispatchCache.set(d.id, fetch(d.file).then(r => { if (!r.ok) throw new Error('Could not load ' + d.title); return r.json(); })
      .then(j => normaliseMission((j.missions || [j])[0])));
  }
  return dispatchCache.get(d.id);
}

function renderDispatches(openId) {
  const box = $('#dispatchFilters');
  box.innerHTML = '';
  const count = st => DISPATCHES.filter(d => !st || d.status === st).length;
  box.append(el('label', { class: 'field' }, el('span', { text: 'Status' }),
    el('select', { onchange: e => { dispatchState.status = e.target.value; renderDispatches(); } },
      el('option', { value: '', selected: !dispatchState.status }, `All (${count('')})`),
      Object.entries(DISPATCH_STATUS).map(([k, v]) => el('option', { value: k, selected: dispatchState.status === k }, `${v.label} (${count(k)})`)))));
  const list = $('#dispatchList');
  list.innerHTML = '';
  const shown = DISPATCHES.filter(d => !dispatchState.status || d.status === dispatchState.status);
  if (!shown.length) list.append(el('p', { class: 'empty', text: 'No stories with this status yet.' }));
  for (const d of shown) {
    const st = DISPATCH_STATUS[d.status];
    const front = el('canvas', { class: 'front', width: 7, height: 12, 'aria-label': 'Part 1 front' });
    const back = el('canvas', { class: 'back', width: 12, height: 7, 'aria-label': 'Part 1 back' });
    const allCards = el('div', { class: 'all-cards' });
    const spoil = el('details', { ontoggle: async e => {
      if (!e.target.open || allCards.childElementCount) return;
      const m = await loadDispatch(d);
      for (let i = 0; i < m.parts.length; i++) { const c = el('canvas', {}); allCards.append(c); renderFront(m, i, { scale: 4, rounded: true, canvas: c }); }
    } }, el('summary', { text: 'Read every card (spoilers)' }), allCards);
    const meta = [`${d.parts} parts`, `${d.players} players`, `${d.time} min`, d.needs, `version ${d.version}`].join(' · ');
    const card = el('article', { class: 'mcard dcard', id: 'dispatch-' + d.id },
      el('header', {}, diffBadge(d.diff), el('div', {},
        el('div', { class: 'num', text: `Story ${d.number} · ${(DIFFICULTY.find(x => x.value === d.diff) || {}).label || ''}` }), el('h3', { text: d.title }))),
      el('div', {}, el('span', { class: 'status status-' + d.status, title: st.note, text: st.label })),
      el('div', { class: 'meta', text: meta }),
      el('div', { class: 'tags' }, el('span', { class: 'tag', text: (MODES.find(x => x.value === d.mode) || MODES[0]).label }), d.types.map(t => el('span', { class: 'tag', text: MISSION_TYPES[t] }))),
      el('p', { text: d.premise }),
      el('div', { class: 'thumbs' }, front, back),
      d.status === 'untested' ? el('details', { class: 'focus' }, el('summary', {}, el('strong', { text: `What to test (${d.testNotes.length})` })),
        el('ol', {}, d.testNotes.map(t => el('li', { text: t })))) : null,
      d.changes && d.changes.length ? el('p', { class: 'muted small', text: 'Changes: ' + d.changes.join(' ') }) : null,
      el('div', { class: 'tile-actions', style: 'padding:0' },
        el('button', { class: 'btn mini primary', type: 'button', onclick: async e => {
          const btn = e.currentTarget; btn.disabled = true;
          try {
            if (!window.jspdf) throw new Error('The PDF library has not loaded yet.');
            const m = await loadDispatch(d);
            const opts = getSetting('printOpts', { paper: 'letter', perPage: 6, backs: true, clockwise: true, marks: true });
            const doc = await buildPdf(m.parts.map((p, i) => ({ mission: m, part: i })), opts);
            doc.save(`story-${d.number}-${slug(d.title)}-cards.pdf`);
          } catch (err) { toast(err.message, 5000); } finally { btn.disabled = false; }
        } }, 'Print cards'),
        el('button', { class: 'btn mini', type: 'button', onclick: async () => {
          const m = JSON.parse(JSON.stringify(await loadDispatch(d)));
          const got = await importJson(JSON.stringify(exportPayload([m])));
          toast(`"${got[0].title}" added to My missions.`);
        } }, 'Add to My missions'),
        el('a', { class: 'btn mini', href: `mailto:games@staroversky.com?subject=${encodeURIComponent(`Playtest: Story ${d.number} ${d.title} v${d.version}`)}&body=${encodeURIComponent(['Players:', 'Characters:', 'Game mode (co-op or semi-co-op):', 'Playing time:', 'Result (won or lost, and on which part):', '', ...(d.testNotes || []).map((t, k) => `${k + 1}. ${t}\nAnswer:\n`), 'Anything else:'].join('\n'))}` }, 'Send feedback'),
        el('a', { class: 'btn mini', href: '#stories/' + d.id, title: 'Link to this story' }, 'Link')),
      d.playtests.length ? el('p', { class: 'muted small', text: `Playtested ${d.playtests.length} time${d.playtests.length === 1 ? '' : 's'}.` }) : null,
      spoil);
    list.append(card);
    loadDispatch(d).then(m => { renderFront(m, 0, { scale: 4, rounded: true, canvas: front }); renderBack(m, 0, { scale: 4, rounded: true, canvas: back }); }).catch(err => toast(err.message));
  }
  if (openId) { const t = document.getElementById('dispatch-' + openId); if (t) t.scrollIntoView({ block: 'start' }); }
}

// ---------- design ----------

const SPARK_LABELS = { hook: 'Hook', goal: 'Goal', complication: 'Complication', twist: 'Twist', finale: 'Finale' };

function showSpark() {
  state.spark = rollSpark();
  const dl = $('#sparkOut');
  dl.innerHTML = '';
  for (const [k, label] of Object.entries(SPARK_LABELS)) dl.append(el('dt', { text: label }), el('dd', { text: state.spark[k] }));
}

function setupDesign() {
  $('#sparkRoll').addEventListener('click', showSpark);
  $('#sparkUse').addEventListener('click', async () => {
    const sp = state.spark || rollSpark();
    const m = newMission();
    m.title = 'Untitled mission';
    m.notes = 'Spark\n' + Object.entries(SPARK_LABELS).map(([k, l]) => `${l}: ${sp[k]}`).join('\n');
    await saveMission(m);
    state.current = m; state.partIdx = 0;
    location.hash = '#edit/' + m.id;
    toast('New mission started. The spark is in the author notes.');
  });
}

// ---------- faq ----------

const faqState = { topic: 'all', query: '' };

function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function faqHtml(text, query) {
  const inline = t => {
    let h = esc(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\{link:(\w+)\|([^}]+)\}/g, (m, k, label) => `<a href="${FAQ_LINKS[k] || '#'}" target="_blank" rel="noopener">${label}</a>`);
    if (query) {
      const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![^<]*>)', 'gi');
      h = h.replace(re, '<mark>$1</mark>');
    }
    return h;
  };
  const out = [];
  let list = null;
  for (const line of String(text).split('\n')) {
    if (/^- /.test(line)) { if (!list) { list = []; } list.push('<li>' + inline(line.slice(2)) + '</li>'); continue; }
    if (list) { out.push('<ul>' + list.join('') + '</ul>'); list = null; }
    if (line.trim()) out.push('<p>' + inline(line) + '</p>');
  }
  if (list) out.push('<ul>' + list.join('') + '</ul>');
  return out.join('');
}

function faqMatches(e, q) {
  if (!q) return true;
  return (e.q + ' ' + e.a).toLowerCase().includes(q.toLowerCase());
}

function renderFaq(openId) {
  $('#faqWikiLink').href = FAQ_LINKS.wiki;
  if (openId) { faqState.query = ''; faqState.topic = 'all'; $('#faqSearch').value = ''; }
  const q = faqState.query.trim();
  const visible = FAQ.filter(e => (faqState.topic === 'all' || e.topic === faqState.topic) && faqMatches(e, q));
  // topic chips with counts for the current search
  const chips = $('#faqTopics');
  chips.innerHTML = '';
  const count = t => FAQ.filter(e => (t === 'all' || e.topic === t) && faqMatches(e, q)).length;
  [{ id: 'all', label: 'All' }, ...FAQ_TOPICS].forEach(t => {
    const n = count(t.id);
    if (t.id !== 'all' && !n) return;
    chips.append(el('button', { type: 'button', class: 'chip' + (faqState.topic === t.id ? ' on' : ''), 'aria-pressed': String(faqState.topic === t.id),
      onclick: () => { faqState.topic = t.id; renderFaq(); } }, t.label, el('span', { class: 'n', text: String(n) })));
  });
  $('#faqCount').textContent = q ? `${visible.length} answer${visible.length === 1 ? '' : 's'} for "${q}"` : '';
  const list = $('#faqList');
  list.innerHTML = '';
  if (!visible.length) { list.append(el('p', { class: 'empty', text: 'Nothing found. Try another word, or check the rulebook.' })); }
  for (const t of FAQ_TOPICS) {
    const items = visible.filter(e => e.topic === t.id);
    if (!items.length) continue;
    const sec = el('section', { class: 'faq-topic' }, el('h2', { text: t.label }));
    for (const e of items) {
      const src = FAQ_SOURCES[e.src];
      const d = el('details', { class: 'qa', id: 'faq-' + e.id, open: !!q || openId === e.id },
        el('summary', {}, el('span', { class: 'q', text: e.q }), el('span', { class: 'src src-' + e.src, title: src.title, text: src.label })));
      const body = el('div', { class: 'body' });
      body.innerHTML = faqHtml(e.a, q);
      body.append(el('p', { class: 'muted small' }, el('a', { href: '#faq/' + e.id, text: 'Link to this answer' })));
      d.append(body);
      sec.append(d);
    }
    list.append(sec);
  }
  if (openId) { const target = document.getElementById('faq-' + openId); if (target) target.scrollIntoView({ block: 'start' }); }
}

function setupFaq() {
  const s = $('#faqSearch');
  let t = null;
  s.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { faqState.query = s.value; renderFaq(); }, 120); });
  const table = $('#faqContents');
  CONTENTS_1E.forEach(([k, v]) => table.append(el('tr', {}, el('th', { text: k }), el('td', { text: v }))));
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
  setupFaq();
  setupDesign();
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
