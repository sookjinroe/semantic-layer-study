/* ============================================================
   agent-data.js — CH4 적용편 (agent demo) 데이터 모델
   여신 건전성 모니터 · loans ⋈ customers mock 데이터
   window.AGENT_DATA = { 데이터, 계산, COMP, LINK, CATALOG, Q, bridge, ... }
   순수 데이터 + 숫자 계산만. DOM 렌더링은 agent.js.
   ============================================================ */
window.AGENT_DATA = (function () {

  /* ---------- mock dataset ---------- */
  const STAT = { "01": "정상", "02": "연체", "03": "기한이익상실", "04": "상환완료" };
  const customers = [
    { CUST_ID: "C01", CUST_NM: "김민수", REGION: "서울", CUST_GRD: "A", CUST_EMAIL: "minsu.kim@kmail.com" },
    { CUST_ID: "C02", CUST_NM: "이지은", REGION: "서울", CUST_GRD: "B", CUST_EMAIL: "jieun.lee@kmail.com" },
    { CUST_ID: "C03", CUST_NM: "박철수", REGION: "부산", CUST_GRD: "C", CUST_EMAIL: "cspark@bmail.net" },
    { CUST_ID: "C04", CUST_NM: "최영희", REGION: "경기", CUST_GRD: "A", CUST_EMAIL: "yh.choi@kmail.com" },
    { CUST_ID: "C05", CUST_NM: "정대현", REGION: "부산", CUST_GRD: "B", CUST_EMAIL: "dh.jung@bmail.net" },
    { CUST_ID: "C06", CUST_NM: "강수진", REGION: "경기", CUST_GRD: "B", CUST_EMAIL: "sj.kang@kmail.com" },
    { CUST_ID: "C07", CUST_NM: "윤서연", REGION: "대구", CUST_GRD: "C", CUST_EMAIL: "syyoon@dmail.org" },
    { CUST_ID: "C08", CUST_NM: "임재호", REGION: "서울", CUST_GRD: "A", CUST_EMAIL: "jhlim@kmail.com" },
  ];
  const loans = [
    { LOAN_ID: "L01", CUST_ID: "C01", LOAN_AMT: 800, INT_RATE: 3.9, LOAN_STAT_CD: "01", DLNQ_FLG: "N", DLNQ_DAYS: 0 },
    { LOAN_ID: "L02", CUST_ID: "C01", LOAN_AMT: 500, INT_RATE: 4.2, LOAN_STAT_CD: "04", DLNQ_FLG: "N", DLNQ_DAYS: 0 },
    { LOAN_ID: "L03", CUST_ID: "C02", LOAN_AMT: 1200, INT_RATE: 5.8, LOAN_STAT_CD: "02", DLNQ_FLG: "Y", DLNQ_DAYS: 35 },
    { LOAN_ID: "L04", CUST_ID: "C03", LOAN_AMT: 300, INT_RATE: 6.5, LOAN_STAT_CD: "02", DLNQ_FLG: "Y", DLNQ_DAYS: 12 },
    { LOAN_ID: "L05", CUST_ID: "C03", LOAN_AMT: 2000, INT_RATE: 7.1, LOAN_STAT_CD: "03", DLNQ_FLG: "Y", DLNQ_DAYS: 95 },
    { LOAN_ID: "L06", CUST_ID: "C04", LOAN_AMT: 1500, INT_RATE: 4.0, LOAN_STAT_CD: "01", DLNQ_FLG: "N", DLNQ_DAYS: 0 },
    { LOAN_ID: "L07", CUST_ID: "C05", LOAN_AMT: 650, INT_RATE: 4.5, LOAN_STAT_CD: "01", DLNQ_FLG: "N", DLNQ_DAYS: 0 },
    { LOAN_ID: "L08", CUST_ID: "C05", LOAN_AMT: 400, INT_RATE: 6.8, LOAN_STAT_CD: "02", DLNQ_FLG: "Y", DLNQ_DAYS: 22 },
    { LOAN_ID: "L09", CUST_ID: "C06", LOAN_AMT: 900, INT_RATE: 5.2, LOAN_STAT_CD: "01", DLNQ_FLG: "N", DLNQ_DAYS: 0 },
    { LOAN_ID: "L10", CUST_ID: "C07", LOAN_AMT: 750, INT_RATE: 5.5, LOAN_STAT_CD: "02", DLNQ_FLG: "Y", DLNQ_DAYS: 40 },
    { LOAN_ID: "L11", CUST_ID: "C07", LOAN_AMT: 1100, INT_RATE: 6.9, LOAN_STAT_CD: "03", DLNQ_FLG: "Y", DLNQ_DAYS: 120 },
    { LOAN_ID: "L12", CUST_ID: "C08", LOAN_AMT: 1600, INT_RATE: 4.1, LOAN_STAT_CD: "01", DLNQ_FLG: "N", DLNQ_DAYS: 0 },
    { LOAN_ID: "L13", CUST_ID: "C08", LOAN_AMT: 700, INT_RATE: 4.6, LOAN_STAT_CD: "04", DLNQ_FLG: "N", DLNQ_DAYS: 0 },
  ];
  const custOf = {}; customers.forEach(c => custOf[c.CUST_ID] = c);

  /* ---------- numeric helpers ---------- */
  const isY = r => r.DLNQ_FLG === "Y";
  const sum = a => a.reduce((x, y) => x + y, 0), avg = a => a.length ? sum(a) / a.length : 0;
  const won = n => n.toLocaleString() + "만원", pct = n => n.toFixed(1) + "%";

  const M = {
    balance: () => sum(loans.map(r => r.LOAN_AMT)),
    dlnqrate: () => loans.filter(isY).length / loans.length * 100,
    custDlnqrate: () => new Set(loans.filter(isY).map(r => r.CUST_ID)).size / customers.length * 100,
    dlnqamt: () => sum(loans.filter(isY).map(r => r.LOAN_AMT)),
    avgrate: () => avg(loans.map(r => r.INT_RATE)),
    avgloan: () => avg(loans.map(r => r.LOAN_AMT)),
    dlnqdays: () => avg(loans.filter(isY).map(r => r.DLNQ_DAYS)),
  };
  const maskEmail = e => e[0] + "***@" + e.split("@")[1];
  const statDist = () => { const m = {}; loans.forEach(r => m[r.LOAN_STAT_CD] = (m[r.LOAN_STAT_CD] || 0) + 1); return m; };
  const rateBy = (order, keyFn) => order.map(k => { const g = loans.filter(r => keyFn(r) === k); return { k, rate: g.length ? g.filter(isY).length / g.length * 100 : 0, n: g.length }; });
  const regionDlnq = () => rateBy(["서울", "부산", "경기", "대구"], r => custOf[r.CUST_ID].REGION);
  const gradeDlnq = () => rateBy(["A", "B", "C"], r => custOf[r.CUST_ID].CUST_GRD);
  const daysBucket = r => r.DLNQ_DAYS <= 30 ? "1–30일" : r.DLNQ_DAYS <= 90 ? "31–90일" : "91일+";
  const daysDist = () => { const order = ["1–30일", "31–90일", "91일+"]; const dl = loans.filter(isY); return order.map(k => { const g = dl.filter(r => daysBucket(r) === k); return { k, n: g.length, amt: sum(g.map(r => r.LOAN_AMT)) }; }); };

  /* ---------- dashboard components (각 카드 = 하나의 Asset + 계보) ---------- */
  const COMP = {
    balance: { title: "총 여신잔액", tag: "단일 Term · 파생", val: () => won(M.balance()), terms: ["대출금액"], role: "measured_by", gloss: "대출금액 Term을 전체 합계로 집계한 값", asset: "총여신잔액", kind: "metric", grain: "집계 · 대출 단위", expr: "SUM(LOAN_AMT)", cols: ["LOAN_AMT"] },
    dlnqrate: { title: "대출 기준 연체율", tag: "그레인: 대출 · 파생", val: () => pct(M.dlnqrate()), terms: ["연체"], role: "measured_by", gloss: "연체 Term을 대출 건수 비율로 집계한 값", asset: "연체율", kind: "metric", grain: "집계 · 대출 단위", expr: "COUNT(DLNQ_FLG='Y') / COUNT(*)", cols: ["DLNQ_FLG"], note: "대출 한 건을 단위로 센 연체율. '차주 기준'과 분모가 달라 — grain 차이." },
    custdlnqrate: { title: "차주 기준 연체율", tag: "그레인 재집계 · join", val: () => pct(M.custDlnqrate()), terms: ["연체", "고객"], role: "measured_by", gloss: "연체 Term을 고객 단위 비율로 집계한 값", asset: "차주연체율", kind: "metric", grain: "집계 · 고객 단위", expr: "연체 보유 고객 수 / 전체 고객 수", cols: ["CUST_ID", "DLNQ_FLG"], combo: 1, join: "loans ⋈ customers · CUST_ID", note: "대출 단위 데이터를 고객 단위로 재집계 — 한 고객이 여러 대출을 가질 수 있어 대출 기준(46.2%)과 값이 달라짐(그레인 증강)." },
    dlnqamt: { title: "연체채권액", tag: "두 Term 결합 · 파생", val: () => won(M.dlnqamt()), terms: ["연체", "대출금액"], role: "measured_by", gloss: "연체 대출의 대출금액을 합계로 집계한 값", asset: "연체채권액", kind: "metric", grain: "집계 · 대출 단위", expr: "SUM(LOAN_AMT) WHERE DLNQ_FLG='Y'", cols: ["LOAN_AMT", "DLNQ_FLG"], combo: 1, note: "두 개념(연체·대출금액)이 한 지표로 묶임." },
    dlnqratio: { title: "금액 기준 연체율", tag: "지표÷지표 · 저작", val: () => pct(M.dlnqamt() / M.balance() * 100), terms: ["연체", "대출금액"], role: "measured_by", gloss: "연체채권액을 총여신잔액으로 나눠 집계한 값", asset: "연체채권비율", kind: "metric", grain: "집계 · 대출 단위", expr: "연체채권액 ÷ 총여신잔액", cols: ["LOAN_AMT", "DLNQ_FLG"], combo: 1, note: "메트릭으로 등록된 파생 지표 — 두 지표의 비율을 식으로 박아둠(메트릭 증강)." },
    avgrate: { title: "평균 금리", tag: "단일 Term · 파생", val: () => pct(M.avgrate()), terms: ["금리"], role: "measured_by", gloss: "금리 Term을 평균으로 집계한 값", asset: "평균금리", kind: "metric", grain: "집계 · 대출 단위", expr: "AVG(INT_RATE)", cols: ["INT_RATE"] },
    chartRegion: { title: "지역별 연체율", tag: "교차표 join · 파생", val: () => "분포", terms: ["지역", "연체"], role: "exposed_as × measured_by", asset: "지역(필드) × 연체율(지표)", kind: "field", grain: "차원 × 집계", expr: "JOIN customers → GROUP BY REGION → 연체율", cols: ["CUST_ID", "REGION", "DLNQ_FLG"], combo: 1, join: "loans ⋈ customers · CUST_ID(FK)", note: "지역은 customers 테이블에 있어 join해야 쪼갤 수 있음(join 증강)." },
    chartDays: { title: "연체일수 구간별 연체채권액", tag: "파생 차원 · 저작", val: () => "분포", terms: ["연체일수", "연체", "대출금액"], role: "exposed_as × measured_by", asset: "연체일수 구간(파생 필드) × 연체채권액(지표)", kind: "field", grain: "차원 × 집계", expr: "WHERE DLNQ_FLG='Y' → BUCKET(DLNQ_DAYS: 1–30 / 31–90 / 91+) → GROUP BY 구간 → SUM(LOAN_AMT)", cols: ["DLNQ_DAYS", "LOAN_AMT", "DLNQ_FLG"], combo: 1, join: "없음 — DLNQ_DAYS·LOAN_AMT 모두 loans에 있어 join 불필요", note: "연체일수를 구간으로 묶은 파생 필드를 축으로 삼아 그 위에서 연체채권액을 잰 것. 구간 정의가 asset이고 loans 한 표 안에서 끝나 join 불필요." },
    chartStat: { title: "대출상태별 건수", tag: "차원 분해 · 값 사전", val: () => "분포", terms: ["대출상태"], role: "exposed_as", asset: "대출상태", kind: "field", grain: "차원", expr: "GROUP BY LOAN_STAT_CD → COUNT(*)", cols: ["LOAN_STAT_CD"], note: "loans 안에서 끝나 join 불필요. 코드값은 값 사전으로 라벨링." },
  };
  const KPI_ORDER = ["balance", "dlnqamt", "avgrate", "dlnqrate", "custdlnqrate", "dlnqratio"];
  const CHART_ORDER = ["chartRegion", "chartDays", "chartStat"];

  const KIND_KO = { metric: "지표", field: "필드", column: "컬럼", dashboard: "대시보드" };
  const ROLE_GLOSS = { measured_by: "Term을 숫자로 집계한 값", exposed_as: "데이터를 쪼개 보는 기준축", stored_as: "원본이 실제로 담긴 컬럼", shown_in: "이 Term이 등장하는 화면" };
  const GRAIN_GLOSS = { "집계 · 대출 단위": "여러 대출을 묶어 숫자 하나", "집계 · 고객 단위": "고객 단위로 다시 묶어 숫자 하나", "차원": "묶음을 나누는 기준", "행": "한 줄이 한 건" };

  const LINK = {
    balance: { conf: "HIGH", sig: "식이 LOAN_AMT를 참조 → Term '대출금액'을 물려받아 매칭" },
    dlnqrate: { conf: "HIGH", sig: "식이 DLNQ_FLG를 참조 → Term '연체'를 물려받아 매칭" },
    custdlnqrate: { conf: "HIGH", sig: "DLNQ_FLG(연체) + CUST_ID(고객 키)를 참조 → '연체'를 고객 단위로 잰 지표로 매칭" },
    dlnqamt: { conf: "HIGH", sig: "LOAN_AMT·DLNQ_FLG를 함께 참조 → '대출금액'·'연체' 두 Term에 매칭" },
    dlnqratio: { conf: "HIGH", sig: "두 지표(연체채권액·총여신잔액)를 나눈 파생 지표로 등록 — 계산식이 Asset에 고정" },
    avgrate: { conf: "HIGH", sig: "식이 INT_RATE를 참조 → Term '금리'를 물려받아 매칭" },
    chartRegion: { conf: "HIGH", sig: "필드가 customers.REGION을 참조 → '지역'에 매칭(join 키 CUST_ID로 연결)" },
    chartDays: { conf: "HIGH", sig: "필드가 loans.DLNQ_DAYS를 구간 규칙으로 가공 → '연체일수 구간'(파생 필드)에 매칭하고, 그 축 위에서 '연체'·'대출금액'을 연체채권액(지표)으로 잰다. 원본 값이 아니라 구간 정의가 asset이 된다." },
    chartStat: { conf: "HIGH", sig: "필드가 LOAN_STAT_CD를 참조 → '대출상태'에 매칭" },
  };
  const PLAIN = {
    balance: "지금 나가 있는 대출 원금을 전부 더한 금액.",
    dlnqrate: "전체 대출 건 중 연체된 건의 비율. 대출 한 건을 세는 단위, 즉 그레인으로 삼기 때문에 고객을 그레인으로 삼는 '차주 기준'과는 분모가 달라진다.",
    custdlnqrate: "전체 고객 중 연체를 하나라도 가진 고객의 비율. 한 고객이 여러 대출을 가질 수 있어, 대출 그레인을 고객 그레인으로 끌어올려 다시 집계하면 대출 기준 연체율 46.2%와 값이 달라진다.",
    dlnqamt: "연체된 건들의 대출 금액만 따로 더한 값. 두 Term(연체 · 대출금액)이 한 지표로 묶인다.",
    dlnqratio: "전체 잔액 중 연체 채권이 차지하는 비중. 연체채권액을 총여신잔액으로 나누는 계산식을 하나의 메트릭으로 미리 등록해 둔 파생 지표다.",
    avgrate: "모든 대출의 금리를 평균낸 값.",
    chartRegion: "고객 지역별로 나눠 각 지역의 연체율을 잰 것. 지역이 고객 표(customers)에 있어 두 표를 CUST_ID로 join해야 지역별로 쪼개 볼 수 있다.",
    chartDays: "연체된 대출을 연체일수 구간으로 묶어 채권액을 합한 것. DLNQ_DAYS를 그대로 쓰지 않고 1–30 / 31–90 / 91일+ 구간으로 계산해서 만든 차원이다 — 원본 컬럼이 아니라 구간 정의가 asset.",
    chartStat: "대출을 상태별(정상 · 연체 등)로 나눠 건수를 센 것. loans 한 표 안에서 끝나 join이 필요 없고, 코드값은 값 사전으로 라벨링한다.",
  };

  /* ---------- card 링크/증강 (카드 상세: term ─role▶ asset 줄 + 증강 주석) ---------- */
  const CARD_LINK = {
    balance: { links: [{ terms: ["대출금액"], role: "measured_by", asset: "총여신잔액", kind: "metric", tag: "지표" }] },
    dlnqrate: { links: [{ terms: ["연체"], role: "measured_by", asset: "연체율", kind: "metric", tag: "지표" }] },
    custdlnqrate: { links: [{ terms: ["연체", "고객"], role: "measured_by", asset: "차주 연체율", kind: "metric", tag: "지표 · 고객 단위" }], aug: { lab: "그레인", txt: "대출 단위 데이터를 고객 단위로 재집계하도록 그레인을 증강한 것." } },
    dlnqamt: { links: [{ terms: ["연체", "대출금액"], role: "measured_by", asset: "연체채권액", kind: "metric", tag: "지표" }], aug: { lab: "combo", txt: "'연체'와 '대출금액' 두 개념을 한 지표로 결합(combo)하도록 증강한 것." } },
    dlnqratio: { links: [{ terms: ["연체", "대출금액"], role: "measured_by", asset: "연체채권 비율", kind: "metric", tag: "파생 지표" }], aug: { lab: "파생 메트릭", txt: "두 지표의 비(연체채권액 ÷ 총여신잔액)를 식으로 고정해 파생 지표로 증강한 것." } },
    avgrate: { links: [{ terms: ["금리"], role: "measured_by", asset: "평균 금리", kind: "metric", tag: "지표" }] },
    chartRegion: { links: [{ terms: ["지역"], role: "exposed_as", asset: "지역", kind: "field", tag: "필드" }, { terms: ["연체"], role: "measured_by", asset: "연체율", kind: "metric", tag: "지표" }], aug: { lab: "join", txt: "다른 표(customers)의 지역을 CUST_ID로 끌어와 쪼갤 수 있도록 join으로 증강한 것." } },
    chartDays: { links: [{ terms: ["연체일수"], role: "exposed_as", asset: "연체일수 구간", kind: "field", tag: "파생 필드" }, { terms: ["연체", "대출금액"], role: "measured_by", asset: "연체채권액", kind: "metric", tag: "지표" }], aug: { lab: "파생 필드", txt: "DLNQ_DAYS를 1–30 / 31–90 / 91+ 구간으로 묶어 원본 컬럼이 아닌 파생 필드로 증강한 것." } },
    chartStat: { links: [{ terms: ["대출상태"], role: "exposed_as", asset: "대출상태", kind: "field", tag: "필드" }], aug: { lab: "값 사전", txt: "코드값(01~04)에 의미(정상·연체·기익상실·상환완료)를 붙이도록 값 사전으로 증강한 것." } },
  };

  /* ---------- column catalog (CH3 증강 결과: Description + 신뢰도 + 근거) ---------- */
  const LOAN_COLS = ["LOAN_ID", "CUST_ID", "LOAN_AMT", "INT_RATE", "LOAN_STAT_CD", "DLNQ_FLG", "DLNQ_DAYS"];
  const CUST_COLS = ["CUST_ID", "CUST_NM", "REGION", "CUST_GRD"];
  const CATALOG = {
    LOAN_ID: { label: "대출 식별자", type: "VARCHAR", desc: "개별 대출 건의 고유 번호(PK). 한 행 = 한 대출.", conf: "HIGH", src: "DB 스키마 · 기본키" },
    CUST_ID: { label: "고객 식별자", type: "VARCHAR", desc: "대출의 차주를 가리키는 고객 번호. customers에선 PK, loans에선 그 고객을 참조하는 외래키(FK) — 두 표를 잇는 join 키.", conf: "HIGH", src: "DB 스키마 · PK/FK 제약" },
    LOAN_AMT: { label: "대출금액", type: "INTEGER", desc: "대출 실행 원금. 만원 단위 정수.", conf: "HIGH", src: "DB 타입 + 카탈로그 단위 정의" },
    INT_RATE: { label: "적용 금리", type: "DECIMAL", desc: "대출 건에 적용된 연이율(%).", conf: "HIGH", src: "카탈로그 정의" },
    LOAN_STAT_CD: { label: "대출상태 코드", type: "CHAR(2)", desc: "대출 건의 현재 상태. 01 정상 · 02 연체 · 03 기한이익상실 · 04 상환완료.", conf: "HIGH", src: "카탈로그 코드값(01~04)" },
    DLNQ_FLG: { label: "연체 여부", type: "CHAR(1)", desc: "연체 여부 플래그. Y=연체, N=정상.", conf: "HIGH", src: "카탈로그 코드값(Y/N)" },
    DLNQ_DAYS: { label: "연체 일수", type: "INTEGER", desc: "연체 경과 일수, 정상 건은 0. 산정 기준일은 미확인이나 핵심 의미엔 영향 없다.", conf: "HIGH", src: "컬럼명 + DLNQ_FLG 동시 출현" },
    CUST_NM: { label: "고객명", type: "VARCHAR", desc: "차주(고객)의 이름.", conf: "HIGH", src: "DB 스키마" },
    REGION: { label: "지역", type: "VARCHAR", desc: "고객의 관리 지역(서울·부산·경기·대구 등).", conf: "HIGH", src: "DB 값 분포 + 카탈로그" },
    CUST_GRD: { label: "고객 등급", type: "CHAR(1)", desc: "고객 신용등급으로 추정. A·B·C 3단계이나 등급 산정 기준·서열 의미가 미확인이라 핵심 의미가 추정에 의존.", conf: "MEDIUM", src: "DB 값 분포만(카탈로그 없음)" },
  };
  const CONF_GLOSS = {
    HIGH: "설명의 핵심이 카탈로그·코드값 같은 확실한 근거에 닿아 있어요.",
    MEDIUM: "대체로 맞지만 의미의 일부가 아직 추정이라 확인이 필요해요.",
    LOW: "근거가 약해 추정에 가까워요.",
  };

  /* ---------- agent console: 예시 질문 ---------- */
  const Q = [
    {
      q: "연체율이 어떻게 돼?", grp: "ok", tag: "measured_by · 그레인 정본",
      think: "‘연체율’은 측정 요청 — 비율을 직접 계산하지 않고, 정의가 박힌 연체율 지표(대출 기준)를 그대로 쓴다.",
      steps: [{ l: "Term 매칭", flow: [{ q: '"연체율"' }, { term: "연체" }, { dim: "+ 측정 의도" }] }],
      links: [{ term: "연체", role: "measured_by", asset: "연체율", kind: "metric", conf: "HIGH" }],
      plan: [["fn", "SELECT"], ["t", " COUNT(DLNQ_FLG="], ["st", "'Y'"], ["t", ") / COUNT(*)\n"], ["kw", "FROM"], ["t", " loans"]],
      result: () => ({ type: "scalar", label: "대출 기준 연체율", val: pct(M.dlnqrate()) }), cols: ["DLNQ_FLG"],
    },
    {
      q: "연체된 대출 목록 보여줘", grp: "ok", tag: "stored_as · 목록은 행",
      think: "‘목록’은 숫자가 아니라 행 — 연체를 지표가 아니라 원본 컬럼(DLNQ_FLG)으로 걸러 행을 뽑는다.",
      steps: [
        { l: "Term 매칭", flow: [{ q: '"연체된"' }, { term: "연체" }, { dim: '· "목록" → 행이 필요' }] },
        { l: "grain 분기", text: "측정(46.2%)이 아니라 <b>행</b>으로 — 목록 요청이라 stored_as 선택" },
      ],
      links: [{ term: "연체", role: "stored_as", asset: "DLNQ_FLG", kind: "column", conf: "HIGH" }],
      plan: [["fn", "SELECT"], ["t", " LOAN_ID, CUST_ID, LOAN_AMT, DLNQ_DAYS\n"], ["kw", "FROM"], ["t", " loans "], ["kw", "WHERE"], ["t", " DLNQ_FLG="], ["st", "'Y'"]],
      result: () => ({ type: "table", head: ["LOAN_ID", "CUST_ID", "LOAN_AMT", "DLNQ_DAYS"], body: loans.filter(isY).map(r => [r.LOAN_ID, r.CUST_ID, won(r.LOAN_AMT), r.DLNQ_DAYS + "일"]) }), cols: ["DLNQ_FLG"],
    },
    {
      q: "기한이익상실 건 총액", grp: "ok", tag: "값 사전 · 런타임 검색",
      think: "‘기한이익상실’은 코드값 — 값 사전에서 LOAN_STAT_CD=‘03’을 찾아 거른 뒤 금액을 합한다.",
      steps: [
        { l: "Term 매칭", flow: [{ q: '"기한이익상실" →' }, { term: "대출상태" }, { dim: '의 코드값 · "총액" → 금액 합' }] },
        { l: "값 사전", text: "<b>기한이익상실</b> → LOAN_STAT_CD=<code>'03'</code> <span class='ag-dim'>(코드↔의미 사전)</span>" },
      ],
      links: [
        { term: "대출상태", role: "stored_as", asset: "LOAN_STAT_CD", kind: "column", conf: "HIGH", via: "값 사전: 기한이익상실 → '03' 으로 필터" },
        { term: "대출금액", role: "measured_by", asset: "SUM(LOAN_AMT)", kind: "metric", conf: "HIGH" },
      ],
      plan: [["fn", "SELECT"], ["t", " SUM(LOAN_AMT)\n"], ["kw", "FROM"], ["t", " loans "], ["kw", "WHERE"], ["t", " LOAN_STAT_CD="], ["st", "'03'"]],
      result: () => ({ type: "scalar", label: "기한이익상실 건 총액", val: won(sum(loans.filter(r => r.LOAN_STAT_CD === "03").map(r => r.LOAN_AMT))) }), cols: ["LOAN_STAT_CD", "LOAN_AMT"],
    },
    {
      q: "연체 채권 얼마야?", grp: "ok", tag: "두 Term → 한 지표",
      think: "‘연체’와 ‘대출금액’ 두 개념을 한 번에 — 연체로 거른 위에서 대출금액을 합한 지표로 답한다.",
      steps: [{ l: "Term 매칭", flow: [{ term: "연체" }, { dim: "+" }, { term: "대출금액" }, { dim: "→ 연체 필터 위 금액 합" }] }],
      links: [{ terms: ["연체", "대출금액"], role: "measured_by", asset: "연체채권액", kind: "metric", conf: "HIGH" }],
      plan: [["fn", "SELECT"], ["t", " SUM(LOAN_AMT)\n"], ["kw", "FROM"], ["t", " loans "], ["kw", "WHERE"], ["t", " DLNQ_FLG="], ["st", "'Y'"]],
      result: () => ({ type: "scalar", label: "연체채권액", val: won(M.dlnqamt()) }), cols: ["LOAN_AMT", "DLNQ_FLG"],
    },
    {
      q: "금액 기준 연체율은?", grp: "ok", tag: "등록된 파생 지표 · 저작",
      think: "‘금액 기준’ 연체율은 따로 정의돼 있다 — 연체채권액÷총여신잔액을 식으로 박아둔 등록 지표를 쓴다.",
      steps: [
        { l: "Term 매칭", text: '"금액 기준 연체율" → 등록된 파생 지표' },
        { l: "메트릭", text: "두 지표를 나눈 식이 <b>메트릭 Asset</b>으로 등록돼 있어 식을 안 지어냄" },
      ],
      links: [{ terms: ["연체", "대출금액"], role: "measured_by", asset: "연체채권비율 (파생)", kind: "metric", conf: "HIGH" }],
      plan: [["fn", "SELECT"], ["t", " 연체채권액 / 총여신잔액   "], ["cm", "// 등록된 파생 지표"]],
      result: () => ({ type: "scalar", label: "금액 기준 연체율", val: pct(M.dlnqamt() / M.balance() * 100) }), cols: ["LOAN_AMT", "DLNQ_FLG"],
    },
    {
      q: "지역별 연체율", grp: "ok", tag: "exposed_as · join 차원",
      think: "‘지역별’은 쪼개 보기 — 지역은 다른 표(customers)에 있어 join으로 끌어와 축으로 삼고, 그 위에서 연체율을 잰다.",
      steps: [
        { l: "Term 매칭", flow: [{ term: "지역" }, { dim: "축" }, { term: "연체" }, { dim: "값" }] },
        { l: "join", text: "<span class='ag-join'>JOIN</span> 지역은 customers에 있음 → loans ⋈ customers <span class='ag-dim'>(CUST_ID FK)</span>" },
      ],
      links: [
        { term: "지역", role: "exposed_as", asset: "REGION 필드", kind: "field", conf: "HIGH", join: 1 },
        { term: "연체", role: "measured_by", asset: "연체율", kind: "metric", conf: "HIGH" },
      ],
      plan: [["fn", "SELECT"], ["t", " c.REGION, COUNT(DLNQ_FLG="], ["st", "'Y'"], ["t", ")/COUNT(*)\n"], ["kw", "FROM"], ["t", " loans l "], ["kw", "JOIN"], ["t", " customers c "], ["kw", "ON"], ["t", " l.CUST_ID=c.CUST_ID\n"], ["kw", "GROUP BY"], ["t", " c.REGION"]],
      result: () => ({ type: "dist", rows: regionDlnq().map(x => ({ l: `${x.k} (${x.n}건)`, v: x.rate, max: 100, suf: "%", metric: 1, fixed: 1 })) }), cols: ["CUST_ID", "REGION", "DLNQ_FLG"],
    },
    {
      q: "차주 기준 연체율은?", grp: "ok", tag: "그레인 재집계",
      think: "‘차주 기준’은 단위가 다르다 — 대출 단위 데이터를 고객 단위로 다시 묶어 비율을 낸다. 대출 기준과 값이 달라진다.",
      steps: [
        { l: "Term 매칭", flow: [{ term: "연체" }, { dim: "+ 단위 = 차주(고객)" }] },
        { l: "그레인 재집계", text: "대출 단위를 <b>고객 단위</b>로 다시 묶음 — 연체 보유 고객 ÷ 전체 고객" },
        { l: "대비", text: () => `grain이 다르면 답이 달라짐 — 대출 기준 ${pct(M.dlnqrate())} vs 차주 기준 ${pct(M.custDlnqrate())}` },
      ],
      links: [{ terms: ["연체", "고객"], role: "measured_by", asset: "차주연체율", kind: "metric", conf: "HIGH" }],
      plan: [["fn", "SELECT"], ["t", " COUNT("], ["kw", "DISTINCT"], ["t", " CASE "], ["kw", "WHEN"], ["t", " DLNQ_FLG="], ["st", "'Y'"], ["t", " "], ["kw", "THEN"], ["t", " CUST_ID "], ["kw", "END"], ["t", ")\n     / COUNT("], ["kw", "DISTINCT"], ["t", " CUST_ID)\n"], ["kw", "FROM"], ["t", " loans"]],
      result: () => ({ type: "metrics", rows: [{ l: "대출 기준 연체율", v: pct(M.dlnqrate()) }, { l: "차주 기준 연체율", v: pct(M.custDlnqrate()) }] }), cols: ["CUST_ID", "DLNQ_FLG"],
    },
    {
      q: "여신 건전성 요약", grp: "ok", tag: "다중 Link 조립",
      think: "한 질문에 지표가 여럿 — 잔액·연체율·연체채권액 등 여러 Link를 한 번에 조립해 요약을 만든다.",
      steps: [
        { l: "Term 매칭", flow: [{ q: '"요약" → 핵심 Term' }, { term: "대출금액" }, { term: "연체" }, { term: "금리" }] },
        { l: "조립", text: "아래 여러 링크를 동시에 끌어와 한 답으로 — 매칭이 넓을수록 요약이 풍부" },
      ],
      links: [
        { term: "대출금액", role: "measured_by", asset: "총여신잔액", kind: "metric", conf: "HIGH" },
        { term: "연체", role: "measured_by", asset: "연체율", kind: "metric", conf: "HIGH" },
        { terms: ["연체", "대출금액"], role: "measured_by", asset: "연체채권액", kind: "metric", conf: "HIGH" },
        { term: "금리", role: "measured_by", asset: "평균금리", kind: "metric", conf: "HIGH" },
      ],
      plan: [["fn", "SELECT"], ["t", " 총여신잔액, 연체율, 연체채권액, 연체채권비율, 평균_금리"]],
      result: () => ({ type: "metrics", rows: [{ l: "총 여신잔액", v: won(M.balance()) }, { l: "연체율(대출)", v: pct(M.dlnqrate()) }, { l: "연체채권액", v: won(M.dlnqamt()) }, { l: "금액 기준 연체율", v: pct(M.dlnqamt() / M.balance() * 100) }, { l: "평균 금리", v: pct(M.avgrate()) }] }), cols: ["LOAN_AMT", "DLNQ_FLG", "INT_RATE"],
    },
    {
      q: "연체 현황 어디서 봐?", grp: "ok", tag: "shown_in · 안내",
      think: "계산이 아니라 위치를 묻는다 — 연체가 나오는 화면(대시보드)을 찾아 안내한다.",
      steps: [{ l: "Term 매칭", flow: [{ term: "연체" }, { dim: "→ 위치/탐색 의도" }] }],
      links: [{ term: "연체", role: "shown_in", asset: "여신 건전성 모니터", kind: "dashboard", conf: "HIGH" }],
      plan: [["cm", "// 쿼리 생성 아님 — 기존 BI로 안내"]],
      result: () => ({ type: "nav", val: "여신 건전성 모니터 ▸ 연체율 · 연체채권액 · 지역별 카드" }), cols: ["DLNQ_FLG"], nav: 1,
    },

    /* ---------- 경계가 드러나는 경로 (04 레이어의 경계 개념의 실연) ---------- */
    {
      q: "고객 등급별로 연체율 쪼개줘", grp: "edge", tag: "Link 없음 → Description 폴백",
      think: "‘고객 등급’에 맞는 Link가 없다 — Description 유사도로 후보를 찾되 신뢰도를 낮추고 폴백임을 밝힌다.",
      steps: [
        { l: "Term 매칭", text: `<span class="ag-dim">"연체"</span> → <span class="ag-badge ag-b-term">연체</span> <span class="ag-dim">hit · "등급" →</span> <span class="ag-badge ag-b-none">Term 없음</span> <span class="ag-dim">(글로서리 미등록)</span>` },
        { l: "폴백 — Description 추론", text: `확정 Link 없음 → 컬럼 Description 탐색 → <code>CUST_GRD</code> <span class="ag-dim">"고객 신용등급으로 추정. A·B·C 3단계이나 등급 산정 기준·서열 의미 미확인"</span> <span class="ag-badge ag-b-med">MEDIUM</span>` },
        { l: "한계 표시", text: `답은 내되, 축의 의미가 <b>추정</b>임을 결과에 명시 — 확정이 아니라 접근` },
      ],
      links: [
        { term: "연체", role: "measured_by", asset: "연체율", kind: "metric", conf: "HIGH" },
        { termHtml: `<span class="ag-badge ag-b-none">(미등록)</span>`, role: "exposed_as", asset: "CUST_GRD", kind: "column", conf: "MEDIUM", via: "Description 추론 — 확정 Link 없음, 유사도 기반" },
      ],
      plan: [["fn", "SELECT"], ["t", " c.CUST_GRD, COUNT(DLNQ_FLG="], ["st", "'Y'"], ["t", ")/COUNT(*)\n"], ["kw", "FROM"], ["t", " loans l "], ["kw", "JOIN"], ["t", " customers c "], ["kw", "ON"], ["t", " l.CUST_ID=c.CUST_ID\n"], ["kw", "GROUP BY"], ["t", " c.CUST_GRD"]],
      result: () => ({ type: "table", head: ["CUST_GRD", "연체율", "건수"], body: gradeDlnq().map(g => [g.k, pct(g.rate), g.n + "건"]), note: `등급 축은 <b>Description 추론(MEDIUM)</b> 기반 — 확정 Link가 없고, 등급 서열의 의미는 미확인입니다.` }), cols: ["CUST_ID", "CUST_GRD", "DLNQ_FLG"],
    },
    {
      q: "건당 평균 대출금액은?", grp: "edge", tag: "파생 Link 즉석 합성",
      think: "‘건당 평균’ 지표는 등록돼 있지 않다 — 대출금액 합을 건수로 나누는 파생을 즉석에서 만들어 답한다.",
      steps: [
        { l: "Term 매칭", text: `<span class="ag-dim">"평균 대출금액" →</span> <span class="ag-badge ag-b-term">대출금액</span> <span class="ag-dim">+ 평균 의도</span>` },
        { l: "Link 조회", text: `BI에 '평균대출금액' 메트릭은 등록돼 있으나 — asset→Term Link는 <b>적힌 줄 없음</b>` },
        { l: "즉석 합성", text: `references: <code>AVG(LOAN_AMT)</code> → <code>LOAN_AMT</code> → <span class="ag-dim">(컬럼→Term)</span> → <span class="ag-badge ag-b-term">대출금액</span> · 집계식 메트릭 → 역할 <code>measured_by</code> 자동` },
      ],
      links: [{ term: "대출금액", role: "measured_by", asset: "평균대출금액", kind: "metric", conf: "HIGH", via: "즉석 합성 — references ∘ 컬럼→Term · 신뢰도는 입력(컬럼 Link HIGH)을 상속" }],
      plan: [["fn", "SELECT"], ["t", " AVG(LOAN_AMT)\n"], ["kw", "FROM"], ["t", " loans"]],
      result: () => ({ type: "scalar", label: "건당 평균 대출금액", val: won(Math.round(M.avgloan() * 10) / 10) }), cols: ["LOAN_AMT"],
    },
    {
      q: "연체 고객 명단이랑 이메일 줘", grp: "edge", tag: "Classification · 실행 게이트",
      think: "이메일은 PII로 분류돼 있다 — 명단은 뽑되 실행 단계에서 이메일을 마스킹해 내보낸다.",
      steps: [
        { l: "Term 매칭", text: `<span class="ag-badge ag-b-term">연체</span> <span class="ag-dim">+</span> <span class="ag-badge ag-b-term">고객</span> <span class="ag-dim">· "명단" → 행 필요 → stored_as</span>` },
        { l: "쿼리 조립", text: `정상 — <span class="ag-dim">여기까지 답은 '맞다'</span>` },
        { l: "실행 게이트", text: `결과 컬럼 민감도 확인 → <code>CUST_EMAIL</code> = <b>PII</b> → 마스킹 후 반환 <span class="ag-dim">(쿼리가 아니라 실행 단계의 게이트)</span>` },
      ],
      links: [
        { term: "연체", role: "stored_as", asset: "DLNQ_FLG", kind: "column", conf: "HIGH" },
        { term: "고객", role: "stored_as", asset: "CUST_EMAIL", kind: "column", conf: "HIGH", via: "Classification: PII — 실행 직전 마스킹" },
      ],
      plan: [["fn", "SELECT DISTINCT"], ["t", " c.CUST_ID, c.CUST_NM, c.CUST_EMAIL\n"], ["kw", "FROM"], ["t", " customers c "], ["kw", "JOIN"], ["t", " loans l "], ["kw", "ON"], ["t", " c.CUST_ID=l.CUST_ID\n"], ["kw", "WHERE"], ["t", " l.DLNQ_FLG="], ["st", "'Y'"], ["t", "   "], ["cm", "— 쿼리 자체는 무수정"]],
      result: () => {
        const ids = [...new Set(loans.filter(isY).map(r => r.CUST_ID))];
        return { type: "table", head: ["CUST_ID", "CUST_NM", "CUST_EMAIL"], body: ids.map(id => [id, custOf[id].CUST_NM, { mask: maskEmail(custOf[id].CUST_EMAIL) }]), note: `<b>PII 분류</b>에 따라 이메일이 마스킹됐습니다 — 답이 틀려서가 아니라, 맞는 답을 그대로 내보내지 않기 위한 실행 단계의 게이트.` };
      }, cols: ["DLNQ_FLG", "CUST_EMAIL"],
    },
    {
      q: "그 연체율 숫자, 어디서 나온 거야?", grp: "edge", tag: "lineage · 출처 추적",
      think: "값이 아니라 출처를 묻는다 — 그 숫자가 어느 컬럼·식·정의에서 나왔는지 계보를 거슬러 보여준다.",
      steps: [
        { l: "의도 분기", text: `값 요청이 아니라 <b>출처 질문</b> → 쿼리 생성 아님, 계보(lineage) 탐색` },
        { l: "상류 추적", text: `<span class="ag-badge ag-b-term">연체</span>의 지표 <code>연체율</code> ← 식 <code>COUNT(DLNQ_FLG='Y')/COUNT(*)</code> ← 원천 컬럼 <code>loans.DLNQ_FLG</code>` },
      ],
      links: [{ term: "연체", role: "measured_by", asset: "연체율", kind: "metric", conf: "HIGH", via: "lineage 상류 — 라우팅이 아니라 출처 질문에서 동원되는 정보" }],
      plan: [["cm", "// 쿼리 생성 아님 — 계보 탐색"]],
      result: () => ({ type: "nav", val: "연체율 ← COUNT(DLNQ_FLG='Y')/COUNT(*) ← loans.DLNQ_FLG" }), cols: ["DLNQ_FLG"], nav: 1,
    },
  ];

  /* ---------- 질문 그룹 (정상 / 경계) ---------- */
  const Q_GROUPS = {
    ok:   { name: "정상 경로", note: "레이어가 완비됐을 때 — 같은 의미 구조를 역할·그레인 따라 탄다" },
    edge: { name: "경계가 드러나는 경로", note: "정보가 없거나, 적혀 있지 않거나, 게이트가 걸릴 때 (→ 04 레이어의 경계)" },
  };

  /* ---------- bridge: 개념 복습 (개념을 주어로, 카드 속 위치를 색 단서로) ---------- */
  const bridge = {
    lead: "앞의 세 장에서 정의한 개념들이 이 대시보드 위에 그대로 올라가 있다. 카드를 읽기 전에, 각 개념이 무엇이었는지 한 줄로 짚어 둔다.",
    review: [
      { c: "Term", v: "Glossary에 등록된 비즈니스 개념 한 단위 — 카드가 답하는 '무엇'(연체 · 대출금액 · 금리)이 모두 Term이다.", ch: "CH2" },
      { c: "Link · 역할", v: "Term을 Asset에 잇는 연결(엣지). 역할은 그 연결의 종류로, Term이 어떤 Asset에 어떻게 닿는지를 정한다.", ch: "CH2", roles: [
        { role: "measured_by", dot: "ag-d-metric", name: "지표", desc: "재는 값" },
        { role: "exposed_as", dot: "ag-d-field", name: "필드", desc: "쪼개 보는 축" },
        { role: "stored_as", dot: "ag-d-column", name: "컬럼", desc: "원본" },
        { role: "shown_in", dot: "ag-d-dash", name: "대시보드", desc: "등장 화면" },
      ] },
      { c: "Asset 종류", v: "Term이 '무엇'이라면 Asset은 그 무엇이 어떤 형태로 구현됐나이고, 어떤 Asset으로 등록됐느냐에 따라 쓰임이 갈린다.", ch: "CH2", kinds: [
        { dot: "ag-d-column", name: "컬럼", sub: "원본", desc: "물리적으로 저장된 자산. 한 행 = 한 건. 가장 아래층." },
        { dot: "ag-d-field", name: "필드", sub: "차원", desc: "쪼개 보는 축(GROUP BY 기준)." },
        { dot: "ag-d-metric", name: "지표", sub: "집계", desc: "재는 값(SUM · AVG · 비율 등)." },
        { dot: "ag-d-dash", name: "대시보드", sub: "화면", desc: "자산들이 모여 등장하는 화면." },
      ] },
      { c: "그레인", v: "한 행이 '무엇 하나'를 뜻하는지, 곧 세는 단위. 같은 '연체'라도 단위가 다르면 답이 달라진다.", exLabel: "세는 단위에 따라", ex: ["대출 단위로 세면 → 46.2% (연체 대출 6 ÷ 전체 13)", "고객 단위로 세면 → 50.0% (연체 보유 고객 4 ÷ 전체 8)"], ch: "신규", isNew: 1 },
      { c: "Lineage", v: "데이터가 Asset에서 Asset으로 이어진 경로. 한 표에 없는 값은 join을 타고 들어온다.", exLabel: "join 흐름", ex: ["loans ⋈ customers (CUST_ID 외래키)", "→ 고객 표의 지역·등급을 대출 집계에 결합 → 지역별·등급별 차트"], ch: "CH2" },
    ],
  };

  return {
    STAT, customers, loans, custOf,
    isY, sum, avg, won, pct, M, statDist, regionDlnq, gradeDlnq, daysDist,
    COMP, KPI_ORDER, CHART_ORDER, KIND_KO, ROLE_GLOSS, GRAIN_GLOSS,
    LINK, PLAIN, CARD_LINK, LOAN_COLS, CUST_COLS, CATALOG, CONF_GLOSS, Q, Q_GROUPS, bridge, maskEmail,
  };
})();
