/* ============================================================
   app.js — Semantic Layer Explorer
   Tab boards · node selection · right detail panel · SVG edges
   ============================================================ */
(function () {
  "use strict";
  const D = window.DATA;
  const AGENT = window.AGENT;
  const BOUNDARY = window.BOUNDARY;
  const SRC = {}; D.sources.forEach(s => SRC[s.id] = s);
  const INFO = {}; D.info.forEach(i => INFO[i.id] = i);
  const COLORVAR = { db: "--c-db", code: "--c-code", bi: "--c-bi", catalog: "--c-catalog" };
  const cvar = id => `var(${COLORVAR[id]})`;

  const state = { board: "sources", sel: { type: null, id: null }, dataDrill: false, modeFilter: null };

  /* nav — agent.js builders call back into here to mutate state + re-render */
  const nav = {
    select(type, id) { state.sel = { type, id }; render(); },
    drillData(colId) { state.dataDrill = true; state.sel = colId ? { type: "col", id: colId } : { type: null, id: null }; render(); },
    backCards() { state.dataDrill = false; state.sel = { type: null, id: null }; render(); },
    setMode(m) { state.modeFilter = m; render(); },
  };
  let pendingDrawIn = false;   // true only when ENTERING a board (tab switch) — drives edge draw-in, not selections
  let drawSeq = 0;             // per-layout stagger counter
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const mapEl = document.getElementById("map");
  const panelEl = document.getElementById("panel");

  const h = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  /* Draw one edge in: stroke-wipe for solid lines, fade for dashed. No-op unless a board was just entered. */
  function animateDrawIn(p, isDashed) {
    if (!pendingDrawIn || prefersReduced) return;
    const delay = Math.min(drawSeq++, 9) * 0.045;
    if (isDashed) {
      p.style.opacity = "0";
      p.getBoundingClientRect();
      p.style.transition = `opacity 0.45s ease ${delay + 0.1}s`;
      p.style.opacity = p.classList.contains("dim") ? "0.28" : "1";
    } else {
      let len = 0; try { len = p.getTotalLength(); } catch (e) { return; }
      if (!len) return;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      p.getBoundingClientRect();
      p.style.transition = `stroke-dashoffset 0.6s cubic-bezier(0.65,0,0.35,1) ${delay}s`;
      p.style.strokeDashoffset = "0";
    }
  }

  /* -------------------- TABS -------------------- */
  document.querySelectorAll(".tab").forEach(t => {
    t.addEventListener("click", () => {
      state.board = t.dataset.board;
      state.sel = { type: null, id: null };
      state.dataDrill = false;
      state.modeFilter = null;
      pendingDrawIn = true;
      syncTabs();
      render();
    });
  });
  document.getElementById("aboutBtn").addEventListener("click", () => {
    state.board = "sources"; state.sel = { type: null, id: null }; state.dataDrill = false;
    pendingDrawIn = true;
    syncTabs(); render();
  });
  function syncTabs() {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.board === state.board));
  }

  /* -------------------- RENDER -------------------- */
  function render() {
    pendingDrawIn = true;   // animate edge draw-in on every board render (tab switch AND node selection)
    mapEl.innerHTML = "";
    if (state.board === "catalog") renderCatalogBoard();
    else if (state.board === "sources") renderSourcesBoard();
    else if (state.board === "info") renderInfoBoard();
    else if (state.board === "boundary") renderBoundaryBoard();
    else if (state.board === "dashboard") renderDashboardBoard();
    else if (state.board === "console") renderConsoleBoard();
    renderPanel();
    relayout();
    pendingDrawIn = false;
  }
  function relayout() {
    const canvas = mapEl.querySelector(".map-canvas");
    if (!canvas) return;
    const svg = canvas.querySelector("svg.edges");
    if (!svg) return;
    drawSeq = 0;
    if (state.board === "catalog") layoutCatalogEdges(canvas, svg, {});
    else if (state.board === "info") layoutInfoEdges(canvas, svg);
  }

  function mapShell(title, hint) {
    const inner = h("div", "map-inner");
    const head = h("div", "map-head");
    head.appendChild(h("h2", null, title));
    head.appendChild(h("div", "hint", hint));
    inner.appendChild(head);
    const canvas = h("div", "map-canvas");
    inner.appendChild(canvas);
    mapEl.appendChild(inner);
    return canvas;
  }

  /* ===== BOARD: SOURCES ===== */
  function renderSourcesBoard() {
    const canvas = mapShell("시그널 소스", "컬럼 의미의 단서가 어디에, 어떤 형태로 존재하는가");
    const tiers = h("div", "tiers");
    D.tiers.forEach(tier => {
      const srcs = D.sources.filter(s => s.tier === tier.id);
      const accent = srcs.length ? cvar(srcs[0].id) : "var(--rule)";
      const row = h("div", "tier-row");
      row.style.setProperty("--tier-accent", tier.id === "raw" ? "var(--c-db)" : accent);
      const label = h("div", "tier-label", `
        <div class="tl-name">${tier.name}</div>
        <div class="tl-note">${tier.note}</div>`);
      row.appendChild(label);
      const cards = h("div", "tier-sources");
      srcs.forEach(s => cards.appendChild(sourceCard(s)));
      row.appendChild(cards);
      tiers.appendChild(row);
    });
    canvas.appendChild(tiers);
  }

  function sourceCard(s) {
    const card = h("button", "src-card");
    card.style.setProperty("--sc", cvar(s.id));
    if (state.sel.type === "source" && state.sel.id === s.id) card.classList.add("selected");
    card.innerHTML = `
      <div class="sc-name">${s.name}</div>
      <div class="sc-ess">${s.essence}</div>
      <div class="sc-foot">
        <span class="sc-sig">시그널 ${s.signals.length}종</span>
        <span class="sc-tags"><span class="sc-tag">${s.origin}</span><span class="sc-tag">해석부담 ${s.load}</span></span>
      </div>`;
    card.addEventListener("click", () => { state.sel = { type: "source", id: s.id }; render(); });
    return card;
  }

  /* ===== BOARD: INFO (dependency map) ===== */
  function renderInfoBoard() {
    const canvas = mapShell("증강 정보", "흩어진 시그널을 합쳐, 어느 소스에도 통째로 없던 정보를 만드는 일 · Description·Link·값 의미·Classification·Domain 다섯 가지");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "edges"); svg.id = "edges";
    canvas.appendChild(svg);

    const grid = h("div", "depmap");
    // left: sources
    const left = h("div", "dep-col");
    left.appendChild(h("div", "dep-col-head", "시그널 소스"));
    ["db", "code", "bi", "catalog"].forEach(id => {
      const s = SRC[id];
      const node = h("button", "dep-node src");
      node.dataset.id = id; node.dataset.kind = "src";
      node.style.setProperty("--sc", cvar(id));
      node.innerHTML = `<div class="dn-name">${s.name}</div><div class="dn-q">${s.essence}</div>`;
      node.addEventListener("click", () => { state.sel = { type: "source", id }; render(); });
      left.appendChild(node);
    });
    // right: info
    const right = h("div", "dep-col");
    right.appendChild(h("div", "dep-col-head", "증강 정보 — 5"));
    D.info.forEach(i => {
      const node = h("button", "dep-node info" + (i.exception ? " exception" : ""));
      node.dataset.id = i.id; node.dataset.kind = "info";
      node.innerHTML = `
        <div class="dn-name">${i.name}</div>
        <div class="dn-q">${i.q}</div>
        <div class="dn-meta"><span class="dn-tag${i.when === "런타임" ? " ex" : ""}">${i.when}</span><span class="dn-tag${i.scope === "일부" ? " ex" : ""}">${i.scope}</span></div>`;
      node.addEventListener("click", () => { state.sel = { type: "info", id: i.id }; render(); });
      right.appendChild(node);
    });
    grid.appendChild(left); grid.appendChild(right);
    canvas.appendChild(grid);
  }

  function layoutInfoEdges(canvas, svg) {
    const cr = canvas.getBoundingClientRect();
    svg.setAttribute("width", cr.width); svg.setAttribute("height", cr.height);
    svg.innerHTML = "";
    const rel = el => { const r = el.getBoundingClientRect(); return { x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height }; };
    const selId = state.sel.id, selType = state.sel.type;
    D.info.forEach(info => {
      const infoEl = canvas.querySelector(`.dep-node.info[data-id="${info.id}"]`);
      if (!infoEl) return;
      const ir = rel(infoEl);
      info.from.forEach(srcId => {
        const srcEl = canvas.querySelector(`.dep-node.src[data-id="${srcId}"]`);
        if (!srcEl) return;
        const sr = rel(srcEl);
        const x1 = sr.x + sr.w, y1 = sr.y + sr.h / 2;
        const x2 = ir.x, y2 = ir.y + ir.h / 2;
        const dx = (x2 - x1) * 0.5;
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`);
        const dashed = srcId === "bi";
        if (dashed) p.setAttribute("stroke-dasharray", "4 4");
        // highlight state
        let lit = false, dim = false;
        if (selType === "info") { lit = selId === info.id; dim = !lit; }
        else if (selType === "source") { lit = selId === srcId; dim = !lit; }
        if (lit) { p.classList.add("lit"); p.setAttribute("stroke", cvar(srcId)); }
        else if (dim) p.classList.add("dim");
        svg.appendChild(p);
        animateDrawIn(p, dashed);
      });
    });
    // dim/undim nodes
    canvas.querySelectorAll(".dep-node").forEach(n => {
      n.classList.remove("dim");
      if (selType === "info" && selId) {
        const info = INFO[selId];
        if (n.dataset.kind === "info") n.classList.toggle("dim", n.dataset.id !== selId);
        else n.classList.toggle("dim", !info.from.includes(n.dataset.id));
      } else if (selType === "source" && selId) {
        const src = SRC[selId];
        if (n.dataset.kind === "src") n.classList.toggle("dim", n.dataset.id !== selId);
        else n.classList.toggle("dim", !src.feeds.includes(n.dataset.id));
      }
    });
  }

  /* ===== BOARD: BOUNDARY (CH3.5 레이어의 경계) ===== */
  function renderBoundaryBoard() {
    const canvas = mapShell("레이어의 경계 — 에이전트가 추론으로 메울 수 없는 것",
      "행 = 빠졌을 때 에이전트가 짊어질 추론 · 카드 색 = 그 정보가 생겨나는 방식 · 카드를 클릭");
    canvas.classList.add("ag-canvas");
    BOUNDARY.build(canvas, state, nav);
  }

  /* ===== BOARD: CATALOG DRILL-IN ===== */
  function renderCatalogBoard() {
    const inner = h("div", "map-inner");
    const head = h("div", "map-head");
    head.appendChild(h("h2", null, "Asset은 어디에 속하는가"));
    head.appendChild(h("div", "hint", "정제된 소스의 내부 구조 · 의미 축(Term)과 소유 축(Domain)이 Asset에서 만나고, Link·Lineage를 타고 의미가 전파된다"));
    inner.appendChild(head);

    const canvas = h("div", "map-canvas");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "edges"); canvas.appendChild(svg);
    const grid = h("div", "drill-canvas");

    grid.appendChild(axisHead("의미 축 — 무슨 뜻인가", "var(--c-catalog)"));
    grid.appendChild(axisHead("소유 축 — 누구 것인가", "var(--c-db)"));

    const mStack = h("div", "axis-stack");
    D.catalog.meaningAxis.forEach(id => mStack.appendChild(catNode(id)));
    const oStack = h("div", "axis-stack");
    D.catalog.owningAxis.forEach(id => oStack.appendChild(catNode(id)));
    mStack.style.gridColumn = "1"; oStack.style.gridColumn = "2";
    grid.appendChild(mStack); grid.appendChild(oStack);

    // Link sits ON the Term → Asset connection, as a small inline node
    const linkNode = catNode("link"); linkNode.classList.add("cat-link-node");
    const asset = catNode("asset"); asset.classList.add("cat-asset");
    const lineageNode = catNode("lineage"); lineageNode.classList.add("cat-edge-node");
    const conv = h("div", "cat-converge");
    conv.appendChild(linkNode);    // between Term and Asset
    conv.appendChild(asset);       // convergence point
    conv.appendChild(lineageNode); // centered below Asset
    grid.appendChild(conv);

    canvas.appendChild(grid);
    inner.appendChild(canvas);
    mapEl.appendChild(inner);
  }
  function axisHead(label, color) {
    const a = h("div", "axis-head", `<span class="ax-dot" style="background:${color}"></span>${label}`);
    return a;
  }
  function catNode(id) {
    const n = D.catalog.nodes[id];
    const node = h("button", "cat-node");
    node.dataset.id = id;
    if (state.sel.type === "cat" && state.sel.id === id) node.classList.add("selected");
    node.innerHTML = `<div class="cn-name">${n.name}</div><div class="cn-ess">${n.essence}</div>`;
    node.addEventListener("click", () => { state.sel = { type: "cat", id }; render(); });
    return node;
  }
  function layoutCatalogEdges(canvas, svg, refs) {
    const cr = canvas.getBoundingClientRect();
    svg.setAttribute("width", cr.width); svg.setAttribute("height", cr.height);
    svg.innerHTML = "";
    const rel = el => { const r = el.getBoundingClientRect(); return { x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height }; };
    const center = el => { const r = rel(el); return { x: r.x + r.w / 2, y: r.y + r.h / 2, r }; };
    const get = id => canvas.querySelector(`.cat-node[data-id="${id}"]`);
    const sel = state.sel.type === "cat" ? state.sel.id : null;
    const line = (a, b, opt = {}) => {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", opt.d || `M ${a.x} ${a.y} L ${b.x} ${b.y}`);
      const touches = sel && opt.ends && opt.ends.includes(sel);
      if (opt.stroke && (!sel || touches)) p.setAttribute("stroke", opt.stroke);
      if (opt.dash) p.setAttribute("stroke-dasharray", opt.dash);
      if (sel) p.classList.add(touches ? "lit" : "dim");
      svg.appendChild(p);
      animateDrawIn(p, !!opt.dash);
      if (opt.label) {
        const NS = "http://www.w3.org/2000/svg";
        const mx = opt.lx != null ? opt.lx : (a.x + b.x) / 2;
        const my = opt.ly != null ? opt.ly : (a.y + b.y) / 2;
        const tw = opt.label.length * 6.6 + 14;
        const rect = document.createElementNS(NS, "rect");
        rect.setAttribute("x", mx - tw / 2); rect.setAttribute("y", my - 9);
        rect.setAttribute("width", tw); rect.setAttribute("height", 18); rect.setAttribute("rx", 4);
        rect.setAttribute("fill", "var(--bg)");
        if (sel && !touches) rect.setAttribute("opacity", "0.3");
        svg.appendChild(rect);
        const t = document.createElementNS(NS, "text");
        t.setAttribute("x", mx); t.setAttribute("y", my);
        t.setAttribute("fill", opt.stroke || "var(--fg-faint)");
        t.setAttribute("font-family", "var(--mono)"); t.setAttribute("font-size", "10.5");
        t.setAttribute("text-anchor", "middle"); t.setAttribute("dominant-baseline", "middle");
        if (sel && !touches) t.setAttribute("opacity", "0.3");
        t.textContent = opt.label;
        svg.appendChild(t);
        if (pendingDrawIn && !prefersReduced) {
          [rect, t].forEach(el => {
            const fin = (sel && !touches) ? "0.3" : "1";
            el.style.opacity = "0"; el.getBoundingClientRect();
            el.style.transition = "opacity 0.4s ease 0.4s";
            el.style.opacity = fin;
          });
        }
      }
    };
    // meaning axis chain
    const g = center(get("glossary")), c = center(get("category")), tm = center(get("term"));
    line({ x: g.x, y: g.r.y + g.r.h }, { x: c.x, y: c.r.y }, { ends: ["glossary", "category"] });
    line({ x: c.x, y: c.r.y + c.r.h }, { x: tm.x, y: tm.r.y }, { ends: ["category", "term"] });
    // owning axis chain
    const dm = center(get("domain")), sd = center(get("subdomain"));
    line({ x: dm.x, y: dm.r.y + dm.r.h }, { x: sd.x, y: sd.r.y }, { label: "belongs", lx: dm.x, ly: (dm.r.y + dm.r.h + sd.r.y) / 2, ends: ["domain", "subdomain"] });
    // Link mediates Term → Asset; Lineage hangs centered below Asset
    const as = center(get("asset"));
    const ln = center(get("lineage"));
    // Shift the Link node off-center onto the Term → Asset connection (left-of-center,
    // where the old "Link N:N" label sat). It stays in flex flow so it reserves vertical room.
    const lkEl = get("link");
    lkEl.style.transform = "";
    const lkBase = rel(lkEl);
    const desiredX = (tm.x + as.x) / 2;
    lkEl.style.transform = `translateX(${desiredX - (lkBase.x + lkBase.w / 2)}px)`;
    const termBot = { x: tm.x, y: tm.r.y + tm.r.h };
    const linkTop = { x: desiredX, y: lkBase.y };
    const linkBot = { x: desiredX, y: lkBase.y + lkBase.h };
    const assetTop = { x: as.x, y: as.r.y };
    const assetBot = { x: as.x, y: as.r.y + as.r.h };
    const sdBot = { x: sd.x, y: sd.r.y + sd.r.h };
    const lineageTop = { x: ln.x, y: ln.r.y };
    // Term → Link (curve) — the Link node itself replaces the old "Link N:N" label
    line(termBot, linkTop, { d: `M ${termBot.x} ${termBot.y} C ${termBot.x} ${termBot.y + 22}, ${linkTop.x} ${linkTop.y - 22}, ${linkTop.x} ${linkTop.y}`, stroke: "var(--c-catalog)", ends: ["term", "link", "asset"] });
    // Link → Asset (curve back to center)
    line(linkBot, assetTop, { d: `M ${linkBot.x} ${linkBot.y} C ${linkBot.x} ${linkBot.y + 22}, ${assetTop.x} ${assetTop.y - 22}, ${assetTop.x} ${assetTop.y}`, stroke: "var(--c-catalog)", ends: ["link", "asset"] });
    // Subdomain → Asset (curve, labeled)
    line(sdBot, assetTop, { d: `M ${sdBot.x} ${sdBot.y} C ${sdBot.x} ${sdBot.y + 50}, ${assetTop.x} ${assetTop.y - 50}, ${assetTop.x} ${assetTop.y}`, stroke: "var(--c-db)", label: "belongs 1:1", lx: (sdBot.x + assetTop.x) / 2 + 30, ly: (sdBot.y + assetTop.y) / 2, ends: ["subdomain", "asset"] });
    // Asset → Lineage (straight, below — flow/derivation, dashed)
    line(assetBot, lineageTop, { d: `M ${assetBot.x} ${assetBot.y} L ${lineageTop.x} ${lineageTop.y}`, stroke: "var(--c-catalog)", dash: "4 4", ends: ["asset", "lineage"] });

    // dim/lit the nodes themselves
    canvas.querySelectorAll(".cat-node").forEach(nd => {
      nd.classList.remove("dim");
      if (sel) {
        const rel = D.catalog.nodes[sel].relation;
        const related = rel && rel.to ? rel.to : [];
        nd.classList.toggle("dim", nd.dataset.id !== sel && !related.includes(nd.dataset.id));
      }
    });
  }

  /* ===== BOARD: DASHBOARD (CH4 적용) ===== */
  function renderDashboardBoard() {
    if (state.dataDrill) { renderDataDrill(); return; }
    const canvas = mapShell("대시보드 — 여신 건전성 모니터", "레이어가 실제로 쓰이는 자리 · 화면의 모든 숫자가 Term → Asset → 컬럼 계보로 떠받쳐진다");
    canvas.classList.add("ag-canvas");
    AGENT.buildDashboard(canvas, state, nav);
  }
  function renderDataDrill() {
    const inner = h("div", "map-inner");
    const back = h("button", "ag-back", "← 대시보드");
    back.addEventListener("click", () => nav.backCards());
    inner.appendChild(back);
    const head = h("div", "map-head");
    head.appendChild(h("h2", null, "원본 mock 데이터"));
    head.appendChild(h("div", "hint", "loans ⋈ customers · 컬럼 헤더를 클릭하면 그 컬럼의 Description·신뢰도가 오른쪽에 열립니다"));
    inner.appendChild(head);
    const canvas = h("div", "map-canvas ag-canvas");
    inner.appendChild(canvas);
    mapEl.appendChild(inner);
    AGENT.buildDataTables(canvas, state, nav);
  }

  /* ===== BOARD: CONSOLE (CH4 질의) ===== */
  function renderConsoleBoard() {
    const canvas = mapShell("질의 콘솔 — 예시 질문", "NL 에이전트가 레이어를 소비하는 과정 · 자연어 질문이 Term 매칭·값 변환·Link·join을 거쳐 답이 되기까지");
    canvas.classList.add("ag-canvas");
    AGENT.buildConsole(canvas, state, nav);
  }

  /* -------------------- PANEL -------------------- */
  function renderPanel() {
    const pad = h("div", "panel-pad");
    if (state.board === "catalog" && state.sel.type !== "cat") panelCatIntro(pad);
    else if (state.sel.type === "cat") panelCat(pad, state.sel.id);
    else if (state.sel.type === "source") panelSource(pad, state.sel.id);
    else if (state.sel.type === "info") panelInfo(pad, state.sel.id);
    else if (state.board === "info") panelInfoIntro(pad);
    else if (state.sel.type === "bound") BOUNDARY.panelItem(pad, state.sel.id);
    else if (state.board === "boundary") BOUNDARY.panelIntro(pad);
    else if (state.board === "dashboard") {
      if (state.dataDrill) { if (state.sel.type === "col") AGENT.panelCol(pad, state.sel.id); else AGENT.panelColIntro(pad); }
      else if (state.sel.type === "comp") AGENT.panelComp(pad, state.sel.id, nav);
      else AGENT.panelDashIntro(pad);
    }
    else if (state.board === "console") {
      if (state.sel.type === "q") AGENT.panelQuery(pad, state.sel.id);
      else AGENT.panelConsoleIntro(pad);
    }
    else panelIntro(pad);
    panelEl.innerHTML = ""; panelEl.appendChild(pad);
    panelEl.scrollTop = 0;
  }

  function sec(h_, bodyNode, accent) {
    const s = h("div", "p-sec");
    s.appendChild(h("div", "p-h" + (accent ? " accent" : ""), h_));
    if (typeof bodyNode === "string") s.appendChild(h("div", null, bodyNode));
    else s.appendChild(bodyNode);
    return s;
  }

  function panelIntro(pad) {
    pad.appendChild(h("div", "p-kicker", D.intro.kicker));
    pad.appendChild(h("h1", "p-title", D.intro.title));
    const lead = h("div"); D.intro.paras.forEach(p => lead.appendChild(h("p", "p-lead", p)));
    pad.appendChild(lead);
    D.intro.concepts.forEach(c =>
      pad.appendChild(sec(`${c.term}<span class="concept-tag">${c.tag}</span>`, c.body)));
  }

  function panelSource(pad, id) {
    const s = SRC[id];
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:${cvar(id)}"></span>${D.tiers.find(t => t.id === s.tier).name}`));
    pad.appendChild(h("h1", "p-title", s.name));
    pad.appendChild(h("p", "p-lead", s.lead));

    if (s.code) {
      const box = h("div"); box.appendChild(h("pre", null, `<code>${s.code}</code>`));
      pad.appendChild(sec("Enum 예시", box));
    }
    const sl = h("div", "sig-list");
    s.signals.forEach(([k, v]) => sl.appendChild(h("div", "sig-item", `<span class="si-k">${k}</span><span class="si-v">${v}</span>`)));
    pad.appendChild(sec("주는 시그널", sl));

    s.blocks.forEach(b => pad.appendChild(sec(b.h, h("p", null, b.p))));
  }

  function panelInfo(pad, id) {
    const i = INFO[id];
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--accent)"></span>증강 정보`));
    pad.appendChild(h("h1", "p-title", i.name));
    pad.appendChild(h("p", "p-q", `“${i.q}”`));

    const chips = h("div", "src-chips");
    i.from.forEach(sid => chips.appendChild(h("span", "src-chip", `<span class="cdot" style="background:${cvar(sid)}"></span>${SRC[sid].name}`)));
    const makeWrap = h("div");
    makeWrap.appendChild(h("p", null, i.make));
    makeWrap.appendChild(chips);
    pad.appendChild(sec("만드는 시그널", makeWrap, true));

    const mg = h("div", "meta-grid");
    mg.appendChild(h("div", "meta-box" + (i.when === "런타임" ? " ex" : ""), `<div class="mb-k">시점</div><div class="mb-v">${i.when}</div>`));
    mg.appendChild(h("div", "meta-box" + (i.scope === "일부" ? " ex" : ""), `<div class="mb-k">범위</div><div class="mb-v">${i.scope}</div>`));
    pad.appendChild(sec("채우는 시점 · 범위", mg));

    pad.appendChild(sec("성격", h("p", null, i.role)));
    pad.appendChild(sec("쓰임 (어떻게 활용되나)", h("p", null, i.usage)));

    const br = h("div", "breaks");
    br.appendChild(h("div", "br-k", "없으면"));
    br.appendChild(h("p", null, i.missing));
    const brWrap = h("div"); brWrap.appendChild(br);
    pad.appendChild(sec("", brWrap));
  }

  function panelInfoIntro(pad) {
    pad.appendChild(h("div", "p-kicker", "CH3 · 증강이란"));
    pad.appendChild(h("h2", "p-title", D.infoIntro.title));
    D.infoIntro.paras.forEach((p, idx) => pad.appendChild(h("p", idx === 0 ? "p-lead" : null, p)));
    pad.appendChild(sec("시점 × 범위", h("p", null, D.infoIntro.matrixNote), true));
    pad.appendChild(sec("탐색", h("div", "p-empty", "오른쪽 맵에서 <b>정보를 클릭</b>하면 그것을 만드는 소스로 연결선이 켜집니다. 왼쪽 <b>소스를 클릭</b>하면 그 소스가 어떤 정보에 기여하는지 보여줍니다.")));
  }

  function panelCatIntro(pad) {
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--c-catalog)"></span>Catalog · 내부 구조`));
    pad.appendChild(h("h1", "p-title", "두 질문이 한 Asset에 걸린다"));
    pad.appendChild(h("p", "p-lead", "같은 컬럼에 서로 다른 두 질문이 동시에 붙는다. “무슨 뜻인가”와 “누구 것인가”다. 앞은 <b>의미 축</b>(Glossary·Category·Term)이, 뒤는 <b>소유 축</b>(Domain·Subdomain)이 답한다. 둘은 같은 <b>Asset</b>에서 만난다."));
    pad.appendChild(sec("연결의 카디널리티", h("div", "sig-list", `
      <div class="sig-item"><span class="si-k">Link · N:N</span><span class="si-v">Term ↔ Asset — 하나의 Term이 여러 컬럼에, 하나의 컬럼이 여러 Term에 연결된다</span></div>
      <div class="sig-item"><span class="si-k">belongs · 1:1</span><span class="si-v">Subdomain → Asset — 한 Asset은 하나의 Domain에만 속한다</span></div>`), true));
    pad.appendChild(sec("탐색", h("div", "p-empty", "왼쪽 맵에서 <b>노드를 클릭</b>하세요. 특히 <b>Link</b>·<b>Lineage</b>를 누르면 분류가 전파되는 두 단계(확정 vs 후보)를 볼 수 있습니다.")));
  }

  function panelCat(pad, id) {
    const n = D.catalog.nodes[id];
    const axisLabel = { meaning: "의미 축", owning: "소유 축", cross: "교차점", edge: "연결" }[n.axis];
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--c-catalog)"></span>Catalog · ${axisLabel}`));
    pad.appendChild(h("h1", "p-title", n.name));
    pad.appendChild(h("p", "p-lead", n.essence));
    if (n.lead) pad.appendChild(h("p", null, n.lead));

    // distinct — comparison callout
    if (n.distinct) {
      const d = n.distinct;
      const box = h("div", "distinct");
      box.innerHTML = `
        <div class="dx-row"><span class="dx-a">${d.a}</span><span class="dx-v">${d.av}</span></div>
        <div class="dx-vs">vs</div>
        <div class="dx-row b"><span class="dx-a">${d.b}</span><span class="dx-v">${d.bv}</span></div>
        ${d.note ? `<div class="dx-note">${d.note}</div>` : ""}`;
      pad.appendChild(sec("다른 개념과의 구분", box, true));
    }

    // composition chips (Term)
    if (n.composition) {
      const chips = h("div", "comp-chips");
      n.composition.forEach(c => chips.appendChild(h("span", "comp-chip", c)));
      pad.appendChild(sec("Term의 구성", chips));
    }

    // facts
    if (n.facts && n.facts.length) {
      const sl = h("div", "sig-list");
      n.facts.forEach(([k, v]) => sl.appendChild(h("div", "sig-item", `<span class="si-k">${k}</span><span class="si-v">${v}</span>`)));
      pad.appendChild(sec("핵심", sl));
    }

    // term typed relations
    if (n.termRelations) {
      const box = h("div", "term-rels");
      n.termRelations.forEach(r => box.appendChild(h("div", "term-rel", `<span class="tr-a">${r.a}</span><span class="tr-type">${r.type}</span><span class="tr-b">${r.b}</span>`)));
      pad.appendChild(sec("Term 간 관계", box));
    }

    // link making methods
    if (n.methods) {
      const ol = h("div", "methods");
      n.methods.forEach(([k, v], i) => ol.appendChild(h("div", "method", `<span class="m-n">${i + 1}</span><span class="m-k">${k}</span><span class="m-v">${v}</span>`)));
      pad.appendChild(sec("Link 만드는 방식", ol));
    }

    // worked example (+ optional flow visual). flow가 있으면 예시를 propagation 앞에 둔다.
    const exampleSection = () => {
      if (!(n.example || n.inAction || n.flow)) return;
      const wrap = h("div", "ex-wrap");
      if (n.flow) {
        const flow = h("div", "lin-flow");
        flow.appendChild(h("div", "lf-dir up", "↑ 상류 · 출처"));
        n.flow.forEach((st, idx) => {
          const node = h("div", "lf-node " + (st.kind || ""));
          node.innerHTML = `<span class="lf-name">${st.node}</span><span class="lf-role">${st.role}</span>`;
          flow.appendChild(node);
          if (idx < n.flow.length - 1) flow.appendChild(h("div", "lf-arrow", "↓"));
        });
        flow.appendChild(h("div", "lf-dir down", "↓ 하류 · 영향"));
        wrap.appendChild(flow);
      }
      if (n.example) wrap.appendChild(h("div", "example-box", n.example));
      if (n.inAction) {
        const a = h("div", "example-box action");
        a.innerHTML = `<div class="exa-k">${n.inAction.k}</div>${n.inAction.v}`;
        wrap.appendChild(a);
      }
      pad.appendChild(sec("예시", wrap));
    };

    if (n.flow) exampleSection();

    // propagation mini for Link / Lineage (분류 전파는 두 edge 노드의 개념 — Asset에선 중복이라 제외)
    if (id === "link" || id === "lineage") {
      const mini = h("div", "prop-mini");
      const steps = D.catalog.propagation.steps;
      steps.forEach((st, idx) => {
        const stepEl = h("div", "prop-step " + st.kind);
        stepEl.innerHTML = `<div class="ps-node">${st.node}</div><div class="ps-note">${st.note}</div><span class="ps-tag">${st.tag}</span>`;
        mini.appendChild(stepEl);
        if (idx < steps.length - 1) mini.appendChild(h("div", "prop-conn"));
      });
      pad.appendChild(sec(D.catalog.propagation.title, mini, true));
    }

    if (!n.flow) exampleSection();

    // relation + nav chips
    if (n.relation) {
      const wrap = h("div");
      wrap.appendChild(h("p", null, n.relation.text));
      if (n.relation.chain) {
        const chain = h("div", "rel-chain");
        n.relation.chain.forEach((step, i) => {
          if (i > 0) chain.appendChild(h("span", "rc-arrow", "→"));
          chain.appendChild(h("span", "rc-step", step));
        });
        wrap.appendChild(chain);
      }
      if (n.relation.to && n.relation.to.length) {
        const nav = h("div", "rel-nav");
        n.relation.to.forEach(tid => {
          const t = D.catalog.nodes[tid];
          if (!t) return;
          const chip = h("button", "rel-chip", `${t.name} →`);
          chip.addEventListener("click", () => { state.sel = { type: "cat", id: tid }; render(); });
          nav.appendChild(chip);
        });
        wrap.appendChild(nav);
      }
      pad.appendChild(sec("관계 — 다른 노드로 이동", wrap, true));
    }
  }

  /* -------------------- RESIZE -------------------- */
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(relayout, 120); });

  /* -------------------- INIT -------------------- */
  syncTabs();
  render();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
})();
