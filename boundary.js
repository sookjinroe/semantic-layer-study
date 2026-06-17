/* ============================================================
   boundary.js — CH4 보드 빌더 + 패널
   window.BOUNDARY = { build, panelIntro, panelItem }
   app.js의 render()/renderPanel()에서 호출. 선택 상태는 app.js의
   state(state.sel)로 관리한다. 좌측: 신호 → 4조건 → 연결 파이프라인.
   ============================================================ */
window.BOUNDARY = (function () {
  "use strict";
  const { INTRO, CONDITIONS } = window.BOUNDARY_DATA;
  const h = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const sec = (head, bodyNode, accent) => {
    const s = h("div", "p-sec");
    s.appendChild(h("div", "p-h" + (accent ? " accent" : ""), head));
    if (typeof bodyNode === "string") s.appendChild(h("div", "p-b", bodyNode));
    else s.appendChild(bodyNode);
    return s;
  };

  /* -------------------- BOARD: signal → conditions → connection -------------------- */
  function build(canvas, state, nav) {
    const flow = h("div", "cond-flow");
    flow.appendChild(h("div", "cond-cap", "신호 — 소스에서 읽은 것"));
    flow.appendChild(h("div", "cond-arrow", "↓"));
    CONDITIONS.forEach((c, i) => {
      const seld = state.sel.type === "bound" && state.sel.id === c.id ? " selected" : "";
      const node = h("button", "cond-node" + seld);
      node.innerHTML =
        `<span class="cn-num">${c.n}</span>` +
        `<span class="cn-body"><span class="cn-title">${c.title}</span><span class="cn-gist">${c.gist}</span></span>`;
      node.addEventListener("click", () => nav.select("bound", c.id));
      flow.appendChild(node);
      flow.appendChild(h("div", "cond-arrow", "↓"));
    });
    flow.appendChild(h("div", "cond-cap", "연결 — CH3의 산출"));
    canvas.appendChild(flow);
  }

  /* -------------------- PANEL: intro -------------------- */
  function panelIntro(pad) {
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--accent)"></span>${INTRO.kicker}`));
    pad.appendChild(h("h1", "p-title", INTRO.title));
    pad.appendChild(h("p", "p-lead", INTRO.lead));
    pad.appendChild(sec("여섯 가지 조건", h("div", "p-b", INTRO.note)));
  }

  /* -------------------- PANEL: condition -------------------- */
  function panelItem(pad, id) {
    const c = CONDITIONS.find(x => x.id === id);
    if (!c) return panelIntro(pad);
    pad.appendChild(h("div", "p-kicker", `<span class="swatch" style="background:var(--accent)"></span>조건 ${c.n}`));
    pad.appendChild(h("h1", "p-title", c.title));
    pad.appendChild(sec("신호의 성질", h("div", "p-b", c.signal)));
    pad.appendChild(sec("따라오는 요구", h("div", "p-b", c.requirement), true));
  }

  return { build, panelIntro, panelItem };
})();
