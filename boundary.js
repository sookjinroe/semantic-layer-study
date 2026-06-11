/* ============================================================
   boundary.js — CH3.5 보드 빌더 + 패널
   window.BOUNDARY = { build, panelIntro, panelItem }
   app.js의 render()/renderPanel()에서 호출. 선택/모드필터 상태는
   app.js의 state(state.sel, state.modeFilter)로 관리한다.
   ============================================================ */
window.BOUNDARY = (function () {
  "use strict";
  const { MODES, TIERS, ITEMS, INTRO } = window.BOUNDARY_DATA;
  const h = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const sec = (head, bodyNode, accent) => {
    const s = h("div", "p-sec");
    s.appendChild(h("div", "p-h" + (accent ? " accent" : ""), head));
    if (typeof bodyNode === "string") s.appendChild(h("div", "p-b", bodyNode));
    else s.appendChild(bodyNode);
    return s;
  };

  /* -------------------- BOARD -------------------- */
  function build(canvas, state, nav) {
    const modeFilter = state.modeFilter || null;

    // supply-mode legend
    const modes = h("div", "bd-modes");
    Object.keys(MODES).forEach(m => {
      const md = MODES[m];
      const chip = h("button", "bd-mode-chip" + (modeFilter === m ? " on" : ""));
      chip.style.setProperty("--mc", md.color);
      chip.innerHTML = `<span class="bd-md" style="background:${md.color}"></span>${md.chip}`;
      chip.addEventListener("click", () => nav.setMode(modeFilter === m ? null : m));
      modes.appendChild(chip);
    });
    modes.appendChild(h("span", "bd-m-note", "칩을 누르면 그 방식의 정보만 밝게"));
    canvas.appendChild(modes);

    // tier rows + boundaries
    const tiers = h("div", "bd-tiers");
    TIERS.forEach(t => {
      if (t.boundary) {
        const b = h("div", "bd-boundary" + (t.soft ? " soft" : ""));
        b.innerHTML = `<span class="bd-b-tag">${t.tag}</span><span class="bd-b-line"></span><span class="bd-b-note">${t.note}</span>`;
        tiers.appendChild(b);
        return;
      }
      const row = h("div", "bd-tier");
      const label = h("div", "bd-tier-label",
        `<div class="bd-tl-name">${t.name}</div><div class="bd-tl-note">${t.note}</div>`);
      const cards = h("div", "bd-tier-cards");
      t.items.forEach(id => {
        const it = ITEMS[id];
        const mc = MODES[it.mode].color;
        const dim = modeFilter && it.mode !== modeFilter ? " dim" : "";
        const seld = state.sel.type === "bound" && state.sel.id === id ? " selected" : "";
        const card = h("button", "bd-card" + dim + seld);
        card.style.setProperty("--mc", mc);
        card.innerHTML = `<div class="bd-card-name">${it.name}</div><div class="bd-card-sub">${it.sub}</div>`;
        card.addEventListener("click", () => nav.select("bound", id));
        cards.appendChild(card);
      });
      row.appendChild(label);
      row.appendChild(cards);
      tiers.appendChild(row);
    });
    canvas.appendChild(tiers);
  }

  /* -------------------- PANEL: intro -------------------- */
  function panelIntro(pad) {
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--accent)"></span>${INTRO.kicker}`));
    pad.appendChild(h("h1", "p-title", INTRO.title));
    pad.appendChild(h("p", "p-q", `${INTRO.q}`));
    pad.appendChild(h("p", "p-lead", INTRO.lead));

    pad.appendChild(sec("경계", h("div", "p-b", INTRO.boundaryNote), true));

    const list = h("div", "sig-list");
    INTRO.modes.forEach(m => {
      const md = MODES[m.mode];
      list.appendChild(h("div", null,
        `<b style="color:${md.color}">${m.mode}</b> — ${m.text}`));
    });
    list.appendChild(h("div", null, `<span style="color:var(--fg-faint)">위 모드 칩으로 방식별로 볼 수 있다.</span>`));
    pad.appendChild(sec("카드의 색 — 정보가 생겨나는 세 방식", list));

    pad.appendChild(sec("탐색", h("div", "p-empty", "왼쪽 보드에서 <b>카드를 클릭</b>하면 그 정보가 어떻게 생기고, 빠지면 에이전트가 무엇으로 메우는지가 여기에 열립니다.")));
  }

  /* -------------------- PANEL: item -------------------- */
  function chainHtml(chain) {
    return `<div class="bd-map-chain">` + chain.map((n, i) =>
      (i % 2 === 0 ? `<span class="bd-mc-node">${n}</span>` : `<span class="bd-mc-arrow">—${n}→</span>`)).join("") + `</div>`;
  }

  function panelItem(pad, id) {
    const it = ITEMS[id];
    const mc = MODES[it.mode].color;
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:${mc}"></span>${it.mode} · ${it.sub}`));
    pad.appendChild(h("h1", "p-title", it.name));
    pad.appendChild(h("p", "p-q", it.q));

    pad.appendChild(sec("어떻게 생기나", h("div", "p-b", it.born)));
    pad.appendChild(sec("어디서 가져오나", h("div", "p-b", it.fetch)));
    pad.appendChild(sec("빠지면, 에이전트는", h("div", "p-b", it.miss), true));

    const exBody = it.ex.chain ? h("div", null, chainHtml(it.ex.chain)) : h("div", "p-b", it.ex.v);
    pad.appendChild(sec(it.ex.k, exBody));

    if (it.extra) pad.appendChild(sec("한 걸음 더", h("div", "p-b", it.extra)));
  }

  return { build, panelIntro, panelItem };
})();
