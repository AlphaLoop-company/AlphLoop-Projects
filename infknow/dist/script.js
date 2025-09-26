/* InfKnow - main script
   - LocalStorage 기반 노트 CRUD
   - Markdown 실시간 프리뷰 (marked)
   - [[link]] 파싱 -> 그래프 생성 (d3)
   - 그래프 줌(마우스 휠 및 슬라이더), 드래그 가능
*/

(() => {
  // DOM 요소들
  const localKey = 'infknow_notes_v1';
  const notesListEl = document.getElementById('notesList');
  const notesCountEl = document.getElementById('notesCount');
  const newNoteBtn = document.getElementById('newNoteBtn');
  const saveBtn = document.getElementById('saveBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const mdEditor = document.getElementById('mdEditor');
  const previewEl = document.getElementById('preview');
  const titleInput = document.getElementById('noteTitle');
  const searchInput = document.getElementById('searchInput');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const fileInput = document.getElementById('fileInput');

  // Graph controls
  const graphContainer = document.getElementById('graphContainer');
  const zoomSlider = document.getElementById('zoomSlider');
  const zoomValLabel = document.getElementById('zoomVal');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const resetZoomBtn = document.getElementById('resetZoom');

  // state
  let notes = []; // {id, title, content, createdAt, updatedAt}
  let currentId = null;

  // ------ storage ------
  function loadNotesFromStorage(){
    try{
      const raw = localStorage.getItem(localKey);
      notes = raw ? JSON.parse(raw) : [];
    }catch(e){
      console.error('localStorage read error', e);
      notes = [];
    }
    if(!notes || !Array.isArray(notes)) notes = [];
  }

  function saveNotesToStorage(){
    localStorage.setItem(localKey, JSON.stringify(notes));
  }

  // init sample if empty
  function ensureSampleNotes(){
    if(notes.length === 0){
      const now = Date.now();
      notes.push({id: 'Welcome', title: 'Welcome', content: '# Welcome to InfKnow\n\nThis is a sample note. Try linking: [[GettingStarted]]', createdAt: now, updatedAt: now});
      notes.push({id: 'GettingStarted', title: 'GettingStarted', content: '# Getting Started\n\nCreate new notes, link them with [[NoteName]].', createdAt: now, updatedAt: now});
      saveNotesToStorage();
    }
  }

  // ------ rendering notes list ------
  function renderNotesList(filterText = ''){
    notesListEl.innerHTML = '';
    const q = (filterText || '').trim().toLowerCase();

    // sort by updatedAt desc
    const sorted = [...notes].sort((a,b)=>b.updatedAt - a.updatedAt);

    const filtered = sorted.filter(n=>{
      if(!q) return true;
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || (n.tags && n.tags.join(' ').toLowerCase().includes(q));
    });

    filtered.forEach(n=>{
      const div = document.createElement('div');
      div.className = 'note-item';
      div.title = n.title;
      div.innerHTML = `
        <div class="note-title">${escapeHtml(n.title)}</div>
        <div class="note-meta">${timeAgo(n.updatedAt)}</div>
      `;
      div.addEventListener('click', ()=> loadNoteIntoEditor(n.id));
      notesListEl.appendChild(div);
    });

    notesCountEl.textContent = filtered.length;
  }

  // ------ helper ------
  function uidFromTitle(title){
    return title.trim().replace(/\s+/g,'_').replace(/[^\w\-]/g,'') || `note_${Date.now()}`;
  }
  function now(){ return Date.now(); }

  function timeAgo(ts){
    if(!ts) return '';
    const s = Math.floor((Date.now()-ts)/1000);
    if(s < 60) return `${s}s`;
    const m = Math.floor(s/60);
    if(m < 60) return `${m}m`;
    const h = Math.floor(m/60);
    if(h < 24) return `${h}h`;
    const d = Math.floor(h/24);
    return `${d}d`;
  }

  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  // ------ CRUD ------
  function createNewNote(){
    const id = `Note_${Date.now()}`;
    const title = `New Note`;
    const createdAt = now();
    const note = {id, title, content: `# ${title}\n\n`, createdAt, updatedAt: createdAt};
    notes.push(note);
    saveNotesToStorage();
    renderNotesList(searchInput.value);
    loadNoteIntoEditor(id);
  }

  function loadNoteIntoEditor(id){
    const note = notes.find(n=>n.id===id);
    if(!note) return;
    currentId = id;
    titleInput.value = note.title;
    mdEditor.value = note.content;
    renderPreview(note.content);
    highlightSelectedInList(id);
  }

  function saveCurrentNote(){
    if(!currentId) return;
    const note = notes.find(n=>n.id===currentId);
    if(!note) return;
    note.title = (titleInput.value || '').trim() || note.title;
    note.content = mdEditor.value;
    note.updatedAt = now();
    // id consistency: keep id as uidFromTitle(title) only if user wants; for now keep id stable
    saveNotesToStorage();
    renderNotesList(searchInput.value);
    updateGraph();
  }

  function deleteCurrentNote(){
    if(!currentId) return;
    const confirmed = confirm('이 노트를 삭제하시겠습니까? 복구 불가합니다.');
    if(!confirmed) return;
    notes = notes.filter(n=>n.id !== currentId);
    saveNotesToStorage();
    currentId = null;
    mdEditor.value = '';
    titleInput.value = '';
    renderPreview('');
    renderNotesList(searchInput.value);
    updateGraph();
  }

  // ------ preview & link parsing ------
  function renderPreview(md){
    if(window.marked){
      previewEl.innerHTML = marked.parse(md || '');
    }else{
      previewEl.textContent = md || '';
    }
  }

  function parseLinksFromContent(content){
    const regex = /\[\[([^\]]+)\]\]/g;
    const out = [];
    let m;
    while((m = regex.exec(content)) !== null){
      out.push(m[1].trim());
    }
    return out;
  }

  // ------ graph (d3) ------
  let svg, g, simulation, zoomBehavior;
  let currentZoom = 1;

  function ensureSvg(){
    // clear
    graphContainer.innerHTML = '';
    const w = graphContainer.clientWidth;
    const h = graphContainer.clientHeight;

    svg = d3.select(graphContainer).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${w} ${h}`)
      .style('cursor', 'grab');

    zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        currentZoom = event.transform.k;
        g.attr('transform', event.transform);
        zoomSlider.value = currentZoom.toFixed(2);
        zoomValLabel.textContent = `${Math.round(currentZoom*100)}%`;
      });

    svg.call(zoomBehavior).on('dblclick.zoom', null);
    g = svg.append('g');
    simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d=>d.id).distance(120).strength(1))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(w/2, h/2))
      .alphaTarget(0.1);
  }

  function buildGraphData(){
    // nodes: all notes + missing placeholders
    const nodesMap = new Map();
    notes.forEach((n, idx) => {
      nodesMap.set(n.id, { id: n.id, title: n.title || n.id, group: determineGroup(n), present: true });
    });

    // collect links by parsing content
    const links = [];
    notes.forEach(n=>{
      const targets = parseLinksFromContent(n.content);
      targets.forEach(t=>{
        const tid = uidFromTitle(t);
        // find existing note by id or by title match, otherwise create missing placeholder
        let targetNode = [...nodesMap.values()].find(x => x.title === t || x.id === t || x.id === tid);
        if(!targetNode){
          // create placeholder
          const placeholderId = tid;
          targetNode = { id: placeholderId, title: t, group: 'Missing', present: false };
          nodesMap.set(placeholderId, targetNode);
        }
        links.push({ source: n.id, target: targetNode.id });
      });
    });

    return { nodes: Array.from(nodesMap.values()), links };
  }

  function determineGroup(note){
    // Grouping heuristic:
    // - If title contains "Inf" => Inf
    // - If title contains "Know" => Know
    // - Else alternate green/blue based on creation time (even/odd)
    const t = (note.title || '').toLowerCase();
    if(t.includes('inf')) return 'Inf';
    if(t.includes('know')) return 'Know';
    return (note.createdAt % 2 === 0) ? 'Inf' : 'Know';
  }

  function updateGraph(){
    if(!svg) ensureSvg();

    const {nodes, links} = buildGraphData();

    // clear previous
    g.selectAll('*').remove();

    // add links
    const link = g.selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#9aa4ad')
      .attr('stroke-width', 1.6)
      .attr('stroke-opacity', 0.9);

    // add nodes
    const node = g.selectAll('g.node')
      .data(nodes, d=>d.id)
      .enter().append('g')
      .attr('class','node')
      .call(d3.drag()
        .on('start', (event, d) => {
          if(!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event,d) => {
          d.fx = event.x; d.fy = event.y;
        })
        .on('end', (event,d) => {
          if(!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    node.append('circle')
      .attr('r', 14)
      .attr('fill', d => d.group==='Inf' ? '#4CAF50' : (d.group==='Know' ? '#64B5F6' : 'transparent'))
      .attr('stroke', d => d.present ? 'rgba(0,0,0,0.06)' : '#cbd5e1')
      .attr('stroke-width', d => d.present ? 0.5 : 2)
      .attr('stroke-dasharray', d => d.present ? '0' : '4,3')
      .on('dblclick', (e, d) => {
        // if placeholder, create new note
        if(!d.present){
          // create note with this title
          const newId = uidFromTitle(d.title);
          const newNote = { id: newId, title: d.title, content: `# ${d.title}\n\n`, createdAt: now(), updatedAt: now() };
          notes.push(newNote);
          saveNotesToStorage();
          renderNotesList(searchInput.value);
          updateGraph();
          loadNoteIntoEditor(newId);
        } else {
          loadNoteIntoEditor(d.id);
        }
      });

    node.append('text')
      .text(d => (d.title.length > 18 ? d.title.slice(0,16)+'…' : d.title))
      .attr('x', 18)
      .attr('y', 5)
      .style('font-size', '12px')
      .style('pointer-events','none');

    // restart simulation
    simulation.nodes(nodes);
    simulation.force('link').links(links);
    simulation.alpha(0.8).restart();

    simulation.on('tick', ()=>{
      link.attr('x1', d=>limit(d.source.x, graphContainer.clientWidth))
          .attr('y1', d=>limit(d.source.y, graphContainer.clientHeight))
          .attr('x2', d=>limit(d.target.x, graphContainer.clientWidth))
          .attr('y2', d=>limit(d.target.y, graphContainer.clientHeight));

      node.attr('transform', d => `translate(${limit(d.x, graphContainer.clientWidth)},${limit(d.y, graphContainer.clientHeight)})`);
    });

    // helper limit to keep inside bounds
    function limit(val, max){ if(val == null || isNaN(val)) return max/2; const pad = 20; return Math.max(pad, Math.min(max - pad, val)); }
  }

  // ------ UI wiring ------
  newNoteBtn.addEventListener('click', ()=> { createNewNote(); });
  saveBtn.addEventListener('click', ()=> { saveCurrentNote(); alert('Saved.'); });
  deleteBtn.addEventListener('click', ()=> { deleteCurrentNote(); });

  mdEditor.addEventListener('input', (e)=>{
    const md = mdEditor.value;
    renderPreview(md);
    // live update title (first line) preview but not commit
    const first = (md.split('\n')[0] || '').replace(/^#+\s*/, '').trim();
    if(!titleInput.value) titleInput.value = first;
    // update graph links dynamically without saving after a small throttle
    throttle(updateGraph, 250)();
  });

  titleInput.addEventListener('input', throttle(()=> {
    if(currentId){
      const note = notes.find(n=>n.id===currentId);
      if(note){
        // do not rename ID; update title for display
        note.title = titleInput.value;
        note.updatedAt = now();
        saveNotesToStorage();
        renderNotesList(searchInput.value);
        updateGraph();
      }
    }
  }, 350));

  searchInput.addEventListener('input', throttle(()=> renderNotesList(searchInput.value), 200));

  // export/import
  exportBtn.addEventListener('click', ()=>{
    const data = { exportedAt: now(), notes };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'infknow_export.json'; document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
  });

  importBtn.addEventListener('click', ()=> fileInput.click());
  fileInput.addEventListener('change', (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = (ev)=>{
      try{
        const incoming = JSON.parse(ev.target.result);
        if(incoming && Array.isArray(incoming.notes)){
          // merge by id (overwrite existing ids)
          const map = new Map(notes.map(n=>[n.id,n]));
          incoming.notes.forEach(n=> map.set(n.id,n));
          notes = Array.from(map.values());
          saveNotesToStorage();
          renderNotesList();
          updateGraph();
          alert('Import 완료');
        } else alert('잘못된 포맷입니다.');
      }catch(err){ alert('Import 실패: ' + err.message); }
    };
    r.readAsText(f);
  });

  // zoom controls wiring
  zoomSlider.addEventListener('input', (e)=>{
    const k = +e.target.value;
    if(svg && zoomBehavior){
      svg.transition().duration(150).call(zoomBehavior.scaleTo, k);
    }
    zoomValLabel.textContent = `${Math.round(k*100)}%`;
  });
  zoomInBtn.addEventListener('click', ()=>{
    const v = Math.min(3, +zoomSlider.value * 1.2);
    zoomSlider.value = v.toFixed(2);
    zoomSlider.dispatchEvent(new Event('input'));
  });
  zoomOutBtn.addEventListener('click', ()=>{
    const v = Math.max(0.5, +zoomSlider.value * 0.8);
    zoomSlider.value = v.toFixed(2);
    zoomSlider.dispatchEvent(new Event('input'));
  });
  resetZoomBtn.addEventListener('click', ()=>{
    zoomSlider.value = 1;
    zoomSlider.dispatchEvent(new Event('input'));
    // also center
    if(svg && zoomBehavior){
      svg.transition().duration(300).call(zoomBehavior.transform, d3.zoomIdentity.translate(0,0).scale(1));
    }
  });

  // click node highlight
  function highlightSelectedInList(id){
    // simple: scroll into view for chosen list item
    const items = [...notesListEl.querySelectorAll('.note-item')];
    const idx = notes.findIndex(n=>n.id===id);
    if(idx >= 0 && items[idx]) items[idx].scrollIntoView({block:'nearest',behavior:'smooth'});
  }

  // ------ util: throttle ------
  function throttle(fn, wait=200){
    let t = null;
    return (...args)=>{
      if(t) return;
      t = setTimeout(()=>{ t=null; fn.apply(this,args); }, wait);
    };
  }

  // ------ window resize handling ------
  window.addEventListener('resize', throttle(()=> {
    if(svg){
      const w = graphContainer.clientWidth;
      const h = graphContainer.clientHeight;
      svg.attr('viewBox', `0 0 ${w} ${h}`);
      simulation.force('center', d3.forceCenter(w/2, h/2));
      simulation.alpha(0.3).restart();
    }
  }, 250));

  // ------ boot ------
  loadNotesFromStorage();
  ensureSampleNotes();
  renderNotesList();
  ensureSvg();
  updateGraph();

  // load first note by default
  if(notes.length > 0){
    loadNoteIntoEditor(notes[0].id);
  }

  // expose for debug (optional)
  window.InfKnow = {
    notes, loadNotesFromStorage, saveNotesToStorage, updateGraph
  };

})();