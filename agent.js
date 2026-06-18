/* ============================================================
   agent.js — CH4 적용편 렌더러 (window.AGENT)
   대시보드 보드 · mock 데이터 드릴인 · 질의 콘솔 + 우측 패널
   순수 빌더: app.js가 state/nav를 넘기고 render()를 소유한다.
   nav = { select(type,id), drillData(colId), backCards() }
   ============================================================ */
window.AGENT = (function () {
  const A = window.AGENT_DATA;
  const esc = s => String(s);
  const h = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  /* 패널 섹션 헬퍼 — 스터디 본문과 동일한 마크업(.p-sec/.p-h) */
  function sec(title, bodyNode, accent) {
    const s = h("div", "p-sec");
    if (title) s.appendChild(h("div", "p-h" + (accent ? " accent" : ""), title));
    if (typeof bodyNode === "string") s.appendChild(h("div", null, bodyNode));
    else if (bodyNode) s.appendChild(bodyNode);
    return s;
  }

  /* ---------- 색 역할 매핑 (라이트 리스킨) ---------- */
  const DOT = { metric: "ag-d-metric", field: "ag-d-field", column: "ag-d-column", dashboard: "ag-d-dash" };
  const BADGE = { metric: "ag-b-metric", field: "ag-b-field", column: "ag-b-col", dashboard: "ag-b-dash" };
  const CONFB = { HIGH: "ag-b-high", MEDIUM: "ag-b-med", LOW: "ag-b-low" };
  const CDOT = { HIGH: "ag-cc-high", MEDIUM: "ag-cc-med", LOW: "ag-cc-low" };

  const badge = (t, cls) => `<span class="ag-badge ${cls}">${t}</span>`;
  const termB = t => badge(t, "ag-b-term");
  const termsB = arr => arr.map(termB).join(" ");

  function glossLine(c) {
    const r = c.gloss || A.ROLE_GLOSS[c.role];
    return r ? `<div class="ag-gloss"><b>${c.role}</b> — ${r}</div>` : "";
  }

  /* ============================================================
     맵: 대시보드 (KPI + 차트 카드)
     ============================================================ */
  function buildDashboard(canvas, state, nav) {
    const wrap = h("div", "ag-dash");
    const bar = h("div", "ag-dash-bar",
      `<span class="ag-dash-name">여신 건전성 모니터</span>`);
    wrap.appendChild(bar);

    const kpis = h("div", "ag-kpis");
    A.KPI_ORDER.forEach(id => kpis.appendChild(kpiCard(id, state, nav)));
    wrap.appendChild(kpis);

    const charts = h("div", "ag-charts");
    charts.appendChild(chartCard("chartRegion", rateBars(A.regionDlnq(), x => `${x.k} (${x.n})`), state, nav));
    charts.appendChild(chartCard("chartDays", daysBars(), state, nav));
    charts.appendChild(chartCard("chartStat", statBars(), state, nav));
    wrap.appendChild(charts);

    // 원본 데이터 드릴인 진입부 — 좌측 메인 섹션에 위치
    const entry = h("button", "ag-data-entry",
      `<span class="ag-de-l"><span class="ag-de-icon">▤</span>원본 데이터 <span class="ag-de-sub">loans ⋈ customers · 13건 + 8명</span></span><span class="ag-de-ar">펼쳐보기 →</span>`);
    entry.addEventListener("click", () => nav.drillData(null));
    wrap.appendChild(entry);

    canvas.appendChild(wrap);
  }

  function selected(state, id) { return state.sel.type === "comp" && state.sel.id === id; }
  function dotClass(c) { return c.combo ? "ag-d-combo" : (DOT[c.kind] || "ag-d-metric"); }

  function kpiCard(id, state, nav) {
    const c = A.COMP[id];
    const card = h("button", "ag-card" + (selected(state, id) ? " on" : ""));
    const tag = c.tag ? `<span class="ag-card-tag">${c.tag}</span>` : "";
    card.innerHTML = `<div class="ag-lab">${c.title}</div><div class="ag-num">${c.val()}</div>${tag}`;
    card.addEventListener("click", () => nav.select("comp", id));
    return card;
  }
  function chartCard(id, inner, state, nav) {
    const c = A.COMP[id];
    const card = h("button", "ag-card ag-card-chart" + (selected(state, id) ? " on" : ""));
    const tag = c.tag ? `<span class="ag-card-tag">${c.tag}</span>` : "";
    card.innerHTML = `<div class="ag-lab">${c.title}</div>${inner}${tag}`;
    card.addEventListener("click", () => nav.select("comp", id));
    return card;
  }
  function rateBars(arr, labelFn) {
    return `<div class="ag-bars ag-bars-stack">` + arr.map(x =>
      `<div class="ag-bar ag-bar-metric"><span class="ag-bl">${labelFn(x)}</span><span class="ag-bt" style="width:${x.rate}%;min-width:${x.rate > 0 ? 6 : 0}px"></span><span class="ag-bv">${A.pct(x.rate)}</span></div>`
    ).join("") + `</div>`;
  }
  function statBars() {
    const sd = A.statDist(), sMax = Math.max(...Object.values(sd));
    return `<div class="ag-bars ag-bars-stack">` + Object.keys(A.STAT).map(k =>
      `<div class="ag-bar"><span class="ag-bl">${A.STAT[k]} (${k})</span><span class="ag-bt" style="width:${(sd[k] || 0) / sMax * 100}%"></span><span class="ag-bv">${sd[k] || 0}건</span></div>`
    ).join("") + `</div>`;
  }
  function daysBars() {
    const dd = A.daysDist(), dMax = Math.max(...dd.map(x => x.amt), 1);
    return `<div class="ag-bars ag-bars-stack">` + dd.map(x =>
      `<div class="ag-bar ag-bar-metric"><span class="ag-bl">${x.k}</span><span class="ag-bt" style="width:${x.amt / dMax * 100}%;min-width:${x.amt > 0 ? 6 : 0}px"></span><span class="ag-bv">${A.won(x.amt)}</span></div>`
    ).join("") + `</div>`;
  }

  /* ============================================================
     맵: mock 데이터 드릴인 (loans ⋈ customers)
     ============================================================ */
  function buildDataTables(canvas, state, nav) {
    const wrap = h("div", "ag-data");
    wrap.appendChild(tableBlock("loans", "13건 · 한 행 = 한 대출", A.LOAN_COLS, A.loans, state, nav));
    wrap.appendChild(h("div", "ag-fk-note", "loans.CUST_ID&nbsp;&nbsp;──FK──▶&nbsp;&nbsp;customers.CUST_ID"));
    wrap.appendChild(tableBlock("customers", "8명 · 한 행 = 한 고객", A.CUST_COLS, A.customers, state, nav));
    wrap.appendChild(legend());
    canvas.appendChild(wrap);
  }
  function tableBlock(name, sub, cols, data, state, nav) {
    const block = h("div", "ag-dt-block");
    block.appendChild(h("div", "ag-dt-title", `${name} <span>${sub}</span>`));
    const dtWrap = h("div", "ag-dt-wrap");
    const tbl = h("table", "ag-dt");
    const selCol = state.sel.type === "col" ? state.sel.id : null;
    const head = cols.map(c => {
      const on = selCol === c ? " colon" : "";
      const hl = selCol === c ? " hl" : "";
      return `<th data-col="${c}" class="${on}${hl}">${c}</th>`;
    }).join("");
    const body = data.map(r => `<tr>` + cols.map(c => {
      let v = r[c];
      if (c === "LOAN_STAT_CD") v = `${v} ${A.STAT[v]}`;
      if (c === "INT_RATE") v = v.toFixed(1);
      const yes = (c === "DLNQ_FLG" && v === "Y") ? " ag-yes" : "";
      const hl = selCol === c ? " hl" : "";
      return `<td data-col="${c}" class="${yes}${hl}">${v}</td>`;
    }).join("") + `</tr>`).join("");
    tbl.innerHTML = `<thead><tr>${head}</tr></thead><tbody>${body}</tbody>`;
    tbl.querySelectorAll("thead th").forEach(th => th.addEventListener("click", () => nav.select("col", th.dataset.col)));
    dtWrap.appendChild(tbl);
    block.appendChild(dtWrap);
    return block;
  }
  function legend() {
    const l = h("div", "ag-legend");
    l.innerHTML = `
      <span><span class="ag-dot ag-d-metric"></span>지표 (measured_by · 집계)</span>
      <span><span class="ag-dot ag-d-field"></span>필드 (exposed_as · 차원)</span>
      <span><span class="ag-dot ag-d-column"></span>컬럼 (stored_as · 행)</span>
      <span><span class="ag-dot ag-d-term"></span>Term</span>`;
    return l;
  }

  /* ============================================================
     맵: 질의 콘솔 (예시 질문 갤러리)
     ============================================================ */
  function buildConsole(canvas, state, nav) {
    const G = A.Q_GROUPS;
    ["ok", "edge"].forEach(g => {
      const items = A.Q.map((it, i) => ({ it, i })).filter(x => (x.it.grp || "ok") === g);
      if (!items.length) return;
      const group = h("div", "ag-qgroup");
      const gd = g === "edge" ? "var(--accent)" : "var(--fg-faint)";
      group.appendChild(h("div", "ag-qgrp",
        `<span class="ag-gd" style="background:${gd}"></span>${G[g].name}<span class="ag-gn">— ${G[g].note}</span>`));
      const stack = h("div", "ag-qstack");
      items.forEach(({ it, i }) => {
        const on = state.sel.type === "q" && state.sel.id === i;
        const chip = h("button", "ag-chip" + (on ? " on" : ""));
        const tag = it.tag ? `<span class="ag-chip-tag${g === "edge" ? " edge" : ""}">${it.tag}</span>` : "";
        chip.innerHTML = `<span class="ag-chip-q">❯</span><span class="ag-chip-t">${it.q}</span>${tag}`;
        chip.addEventListener("click", () => nav.select("q", i));
        stack.appendChild(chip);
      });
      group.appendChild(stack);
      canvas.appendChild(group);
    });
  }

  /* ============================================================
     패널: 대시보드 기본 (CH1–3 ↔ 적용편 다리)
     ============================================================ */
  function panelDashIntro(pad) {
    const b = A.bridge;
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--accent)"></span>CH4 · 적용`));
    pad.appendChild(h("h2", "p-title", "Link를 따라 읽는 대시보드"));
    pad.appendChild(h("p", "p-lead", b.lead));

    const list = h("div", "ag-rev");
    b.review.forEach(r => {
      const row = h("div", "ag-rev-row" + (r.isNew ? " is-new" : ""));
      let html =
        `<div class="ag-rev-top"><span class="ag-rev-c">${r.c}</span><span class="ag-rev-ch">${r.ch}</span></div>` +
        `<div class="ag-rev-v">${r.v}</div>`;
      if (r.ex) html += `<div class="ag-rev-ex"><div class="ag-rev-ex-lab">${r.exLabel}</div>` +
        r.ex.map(l => `<div class="ag-rev-ex-row">${l}</div>`).join("") + `</div>`;
      if (r.kinds) html += `<div class="ag-rev-kinds">` + r.kinds.map(k =>
        `<div class="ag-rev-kind"><span class="ag-rk-head"><span class="ag-dot ${k.dot}"></span><span class="ag-rk-name">${k.name}</span><span class="ag-rk-sub">(${k.sub})</span></span><span class="ag-rk-desc">— ${k.desc}</span></div>`
      ).join("") + `</div>`;
      if (r.roles) html += `<div class="ag-rev-kinds">` + r.roles.map(k =>
        `<div class="ag-rev-role-row"><code class="ag-rr-role">${k.role}</code><span class="ag-rr-ar">→</span><span class="ag-dot ${k.dot}"></span><span class="ag-rk-name">${k.name}</span><span class="ag-rk-desc">(${k.desc})</span></div>`
      ).join("") + `</div>`;
      row.innerHTML = html;
      list.appendChild(row);
    });
    pad.appendChild(sec("개념 복습", list, true));
  }

  /* ============================================================
     패널: 카드 데이터 계보
     ============================================================ */
  function panelComp(pad, id, nav) {
    closeColPop();
    const c = A.COMP[id];
    const cl = A.CARD_LINK[id];
    const kindColor = { metric: "var(--c-code)", field: "var(--c-db)", column: "var(--ag-column)", dashboard: "var(--c-catalog)" }[c.kind] || "var(--accent)";

    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:${kindColor}"></span>대시보드 · 데이터 계보`));
    pad.appendChild(h("div", "ag-lin-head", `<span class="ag-lin-t">${c.title}</span>`));
    if (A.PLAIN[id]) pad.appendChild(h("p", "p-lead ag-comp-lead", A.PLAIN[id]));

    // Term ──link──▶ Asset 3열 정렬 + 증강 주석
    if (cl) {
      const box = h("div", "ag-links");
      let rows = "";
      cl.links.forEach(L => {
        const terms = L.terms.map(termB).join(`<span class="ag-lplus">+</span>`);
        rows +=
          `<span class="ag-tz">${terms}</span>` +
          `<span class="ag-conn"><span class="ag-conn-line"></span><span class="ag-role">${L.role}</span><span class="ag-conn-line"></span><span class="ag-conn-head">▶</span></span>` +
          `<span class="ag-az"><span class="ag-badge ${BADGE[L.kind]}">${L.asset}</span><span class="ag-ltag">${L.tag}</span></span>`;
      });
      let html =
        `<div class="ag-linkgrid">` +
          `<span class="ag-colh">Term</span><span class="ag-colh ag-colh-link">Link</span><span class="ag-colh">Asset</span>` +
          `<span class="ag-linkrule"></span>` +
          rows +
        `</div>`;
      if (cl.aug) html += `<div class="ag-aug"><span class="ag-aug-lab">${cl.aug.lab}</span><span class="ag-aug-txt">${cl.aug.txt}</span></div>`;
      box.innerHTML = html;
      pad.appendChild(box);
    }

    // 원본 컬럼(클릭 → 정의 팝오버) · 계산식 · 현재 값
    const kv = h("div", "ag-kv");
    const colBadges = c.cols.map(x => `<button class="ag-badge ag-b-col ag-col-btn" data-col="${x}">${x}</button>`).join(" ");
    kv.innerHTML =
      `<span class="ag-k">원본 컬럼</span><span class="ag-v"><div class="ag-cols">${colBadges}</div></span>` +
      `<span class="ag-k">계산식</span><span class="ag-v"><div class="ag-expr">${c.expr}</div></span>` +
      `<span class="ag-k">현재 값</span><span class="ag-v ag-v-num">${c.val()}</span>`;
    kv.querySelectorAll(".ag-col-btn").forEach(btn => btn.addEventListener("click", ev => { ev.stopPropagation(); openColPop(btn.dataset.col, btn); }));
    pad.appendChild(sec("", kv));
  }

  /* 컬럼 정의 팝오버 (카드 계보 맥락 유지) */
  function closeColPop() {
    const p = document.getElementById("ag-colpop");
    if (p) { if (p._cleanup) p._cleanup(); p.remove(); }
  }
  function openColPop(colId, anchor) {
    closeColPop();
    const e = A.CATALOG[colId];
    if (!e) return;
    const pop = document.createElement("div");
    pop.className = "ag-colpop"; pop.id = "ag-colpop";
    pop.innerHTML =
      `<button class="ag-colpop-x" aria-label="닫기">×</button>` +
      `<div class="ag-colpop-head"><span class="ag-lin-t ag-mono" style="font-size:15px">${colId}</span><span class="ag-badge ag-b-col">${e.label}</span></div>` +
      `<div class="ag-kv">` +
      `<span class="ag-k">타입</span><span class="ag-v ag-mono">${e.type}</span>` +
      `<span class="ag-k">설명</span><span class="ag-v">${e.desc}</span>` +
      `<span class="ag-k">근거</span><span class="ag-v ag-v-muted">${e.src}</span>` +
      `</div>`;
    document.body.appendChild(pop);
    const r = anchor.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let left = r.left;
    let top = r.bottom + 8;
    if (left + pw > window.innerWidth - 12) left = window.innerWidth - 12 - pw;
    if (top + ph > window.innerHeight - 12) top = r.top - 8 - ph;
    pop.style.left = Math.max(12, left) + "px";
    pop.style.top = Math.max(12, top) + "px";
    pop.querySelector(".ag-colpop-x").addEventListener("click", closeColPop);
    const outside = ev => { if (!pop.contains(ev.target) && ev.target !== anchor) closeColPop(); };
    const esc = ev => { if (ev.key === "Escape") closeColPop(); };
    setTimeout(() => document.addEventListener("mousedown", outside), 0);
    document.addEventListener("keydown", esc);
    pop._cleanup = () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", esc); };
  }

  /* ============================================================
     패널: mock 데이터 기본 / 컬럼 카탈로그
     ============================================================ */
  function panelColIntro(pad) {
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--ag-column)"></span>원본 데이터 · 한 단계 아래`));
    pad.appendChild(h("h2", "p-title", "지표가 착지하는 두 개의 표"));
    pad.appendChild(h("p", "p-lead", "위 대시보드의 모든 숫자는 결국 이 두 mock 테이블의 컬럼에서 나온다. <b>loans</b>(대출 13건)와 <b>customers</b>(고객 8명)는 <code>CUST_ID</code> 외래키로 이어져, 지역·등급처럼 고객 표에만 있는 값도 join해서 함께 본다."));
    pad.appendChild(sec("컬럼 헤더", h("div", "p-empty", "헤더를 <b>클릭</b>하면 그 컬럼의 비즈니스 Description과 근거가 열립니다 — CH3에서 만든 증강 정보가 여기 담깁니다."), true));
    pad.appendChild(sec("돌아가기", h("div", "p-empty", "왼쪽 위 <b>← 대시보드</b> 버튼으로 카드 화면으로 올라갑니다.")));
  }

  function panelCol(pad, id) {
    const e = A.CATALOG[id];
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--ag-column)"></span>원본 데이터 · 컬럼 카탈로그`));
    const head = h("div", "ag-lin-head");
    head.innerHTML = `<span class="ag-lin-t ag-mono">${id}</span><span class="ag-badge ag-b-col">${e.label}</span>`;
    pad.appendChild(head);

    const kv = h("div", "ag-kv");
    kv.innerHTML =
      `<span class="ag-k">타입</span><span class="ag-v ag-mono">${e.type}</span>` +
      `<span class="ag-k">설명</span><span class="ag-v">${e.desc}</span>` +
      `<span class="ag-k">근거</span><span class="ag-v ag-v-muted">${e.src}</span>`;
    pad.appendChild(sec("컬럼 Description", kv));
  }

  /* ============================================================
     패널: 질의 콘솔 기본 / 처리 과정(trace)
     ============================================================ */
  function panelConsoleIntro(pad) {
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--accent)"></span>Agent · 질의 콘솔`));
    pad.appendChild(h("h2", "p-title", "Trace 읽는 법"));
    pad.appendChild(h("p", "p-lead", "대시보드가 미리 만든 카드라면, 에이전트는 즉석에서 같은 의미 구조를 타고 답을 만든다. 질문을 고르면 우측에 처리 <b>trace</b>가 펼쳐지는데, 각 줄을 이렇게 읽는다."));

    const steps = h("div", "ag-pipe");
    [["Term 매칭", "질문 속 단어를 Glossary의 <b>Term</b>에 건다 — 주황 뱃지"],
    ["사용한 링크", "그 Term이 어떤 <b>Asset</b>에 어떤 <b>역할</b>로 걸리는지 Link를 꺼낸다"],
    ["쿼리 플랜", "역할 · 그레인 · join을 반영해 SQL을 조립한다"],
    ["실행", "같은 mock 데이터 위에서 답을 낸다"]].forEach(([k, v], i) => {
      steps.appendChild(h("div", "ag-pipe-step", `<span class="ag-pipe-n">${i + 1}</span><div><div class="ag-pipe-k">${k}</div><div class="ag-pipe-v">${v}</div></div>`));
    });
    pad.appendChild(sec("처리 단계 — 우측 trace 읽는 순서", steps, true));

    const paths = h("div", "ag-pipe");
    [["정상 경로", "레이어가 완비됐을 때 — 같은 의미 구조를 역할·그레인 따라 깔끔하게 탄다"],
    ["경계가 드러나는 경로", "정보가 없거나, 적혀 있지 않거나, 게이트가 걸릴 때 — <b>04 레이어의 경계</b>의 개념이 실제로 드러난다"]].forEach(([k, v]) => {
      paths.appendChild(h("div", "ag-pipe-step", `<span class="ag-pipe-n">·</span><div><div class="ag-pipe-k">${k}</div><div class="ag-pipe-v">${v}</div></div>`));
    });
    pad.appendChild(sec("두 갈래 — 왼쪽 질문 목록의 두 그룹", paths, true));

    pad.appendChild(h("div", "ag-note", "핵심 — 같은 <b>연체</b>라도 <b>목록</b>이면 컬럼(stored_as)으로, <b>비율</b>이면 지표(measured_by)로 내려간다. 질문의 의도에 따라 같은 개념이 다른 Link를 타는 데 주목하세요."));
  }

  function panelQuery(pad, id) {
    const item = A.Q[id];
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--accent)"></span>질의 콘솔 · 처리 과정`));
    pad.appendChild(h("div", "ag-q-echo", `<span class="ag-qi">❯</span><span>${item.q}</span>`));

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let n = 0;
    const stepEl = (label, bodyHtml) => {
      const s = h("div", "ag-step");
      s.innerHTML = `<div class="ag-sl"><span class="ag-sn">${++n}</span>${label}</div>${bodyHtml}`;
      return s;
    };

    item.steps.forEach(st => {
      let body = "";
      if (st.flow) body = `<div class="ag-tflow">${st.flow.map(f =>
        f.term ? termB(f.term) : f.q ? `<span class="ag-tq">${f.q}</span>` : `<span class="ag-dim">${f.dim}</span>`
      ).join(" ")}</div>`;
      else body = `<div class="ag-tflow">${typeof st.text === "function" ? st.text() : st.text}</div>`;
      pad.appendChild(stepEl(st.l, body));
    });
    pad.appendChild(stepEl("사용한 링크 · term ↔ asset", renderLinks(item.links)));
    pad.appendChild(stepEl("쿼리 플랜", `<div class="ag-plan">${renderPlan(item.plan)}</div>`));
    pad.appendChild(stepEl("실행 (mock 데이터)", renderResult(item.result())));

    if (!reduce) {
      pad.querySelectorAll(".ag-step").forEach((st, k) => { st.style.animationDelay = (k * 0.09) + "s"; st.classList.add("ag-rise"); });
    }
  }

  /* ---------- console 내부 렌더러 ---------- */
  function renderPlan(tokens) {
    return tokens.map(([cls, t]) => `<span class="ag-pl-${cls}">${t}</span>`).join("");
  }
  function renderLinks(links) {
    return links.map(L => {
      const terms = L.termHtml || (L.terms || [L.term]).map(termB).join(" ");
      const kc = BADGE[L.kind] || "ag-b-metric", kk = A.KIND_KO[L.kind] || L.kind;
      const conf = L.conf ? ` ${badge(L.conf, CONFB[L.conf])}` : "";
      const jt = L.join ? `<span class="ag-joinbadge">JOIN</span>` : "";
      const doTxt = (A.ROLE_DO && A.ROLE_DO[L.role]) || "";
      const doLine = (doTxt || L.role)
        ? `<div class="ag-lr-do">${doTxt ? `<span class="ag-lr-dotxt">${doTxt}</span>` : ""}<span class="ag-lr-roletag">${L.role}</span></div>`
        : "";
      const via = L.via ? `<div class="ag-lr-via">${L.via}</div>` : "";
      return `<div class="ag-linkwrap"><div class="ag-linkrow">` +
        `<div class="ag-lr-node"><div>${terms}</div><div class="ag-lr-kind">Term</div></div>` +
        `<div class="ag-lr-mid"><span class="ag-lr-ar">──▶</span></div>` +
        `<div class="ag-lr-node"><div>${badge(L.asset, kc)}${conf}</div><div class="ag-lr-kind">${kk}</div></div>` +
        `${jt}</div>${doLine}${via}</div>`;
    }).join("");
  }
  function renderResult(r) {
    if (r.type === "scalar") return `<div class="ag-result"><div class="ag-rl">결과 · ${r.label}</div><div class="ag-big">${r.val}</div></div>`;
    if (r.type === "nav") return `<div class="ag-result ag-nav"><div class="ag-rl">안내</div><div class="ag-big">${r.val}</div></div>`;
    if (r.type === "table") {
      const cell = c => (c && typeof c === "object" && c.mask) ? `<td class="ag-rmask">${c.mask}</td>` : `<td>${c}</td>`;
      const note = r.note ? `<div class="ag-rnote">${r.note}</div>` : "";
      return `<div class="ag-result"><div class="ag-rl">결과 · ${r.body.length}건</div><table class="ag-rtable"><thead><tr>${r.head.map(x => `<th>${x}</th>`).join("")}</tr></thead><tbody>${r.body.map(row => `<tr>${row.map(cell).join("")}</tr>`).join("")}</tbody></table>${note}</div>`;
    }
    if (r.type === "dist") return `<div class="ag-result"><div class="ag-rl">결과 · 분포</div><div class="ag-bars">${r.rows.map(x => `<div class="ag-bar ${x.metric ? "ag-bar-metric" : ""}"><span class="ag-bl">${x.l}</span><span class="ag-bt" style="width:${x.v / x.max * 100}%;min-width:${x.v > 0 ? 6 : 0}px"></span><span class="ag-bv">${x.fixed ? x.v.toFixed(1) : x.v}${x.suf}</span></div>`).join("")}</div></div>`;
    if (r.type === "metrics") return `<div class="ag-result"><div class="ag-rl">결과 · ${r.rows.length}개 지표</div><table class="ag-rtable ag-rtable-kv"><tbody>${r.rows.map(x => `<tr><td class="ag-rk">${x.l}</td><td class="ag-rv">${x.v}</td></tr>`).join("")}</tbody></table></div>`;
    return "";
  }

  return {
    buildDashboard, buildDataTables, buildConsole,
    panelDashIntro, panelComp, panelColIntro, panelCol, panelConsoleIntro, panelQuery,
  };
})();
