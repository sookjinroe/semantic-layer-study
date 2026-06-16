/* ============================================================
   data.js — Semantic Layer Explorer content model
   window.DATA = { intro, sources, info, edges, catalog }
   ============================================================ */
window.DATA = (function () {

  /* ---- CH1 intro (default panel / overview) ---- */
  const intro = {
    kicker: "Semantic Layer · 스터디",
    title: "데이터에 의미를 채워 AI가 쓰게 만들기",
    paras: [
      "컬럼명과 타입만으로는 그 컬럼이 무엇인지 알 수 없다. <code>TAX_EXMP_FLG CHAR(1)</code>을 받아도 값이 무엇을 뜻하는지·어떤 업무에 쓰이는지·누가 책임지는지는 컬럼 밖에 있다. 그 ‘컬럼 밖의 의미’는 DB 안에 없고 코드·BI·카탈로그에 흩어져 있으며, 상당 부분은 아직 어디에도 없다. 이 스터디는 그 흩어진 의미를 모아 채워 AI 에이전트가 데이터를 쓰게 만드는 일을 다룬다.",
    ],
    concepts: [
      { term: "semantic layer", tag: "시장 용어 · 의미를 좁혀 씀",
        body: "이름·타입 너머에 있는 그 ‘의미’ 층 — 값이 뜻하는 바, 업무 용도, 소유·책임, 민감도를 가리킨다. 시장에선 메트릭 레이어(dbt·Cube)·context layer 등 여러 뜻으로도 쓰이지만, 이 글에선 ‘의미·맥락’으로 좁혀 쓴다." },
      { term: "데이터웨어하우스 ↔ 카탈로그", tag: "둘 다 시장 표준",
        body: "<b>웨어하우스</b>는 데이터(행·값), <b>카탈로그</b>는 그 데이터에 관한 정보(의미·소유·계보·민감도)다. <code>DLNQ_FLG</code>의 <code>'Y'</code>는 웨어하우스에 있지만, 그 <code>'Y'</code>가 ‘연체’라는 뜻은 카탈로그에 있다. semantic layer가 가리키는 건 이 카탈로그 쪽 ‘의미’다." },
      { term: "signal", tag: "이 글의 개념",
        body: "의미를 추론할 단서. semantic layer는 한곳에 정리돼 있지 않고, 이런 단서 조각으로 여러 소스에 흩어져 있다 — 컬럼 이름 토큰, 코드의 Enum, BI 사용 패턴처럼." },
      { term: "signal source", tag: "이 글의 프레임",
        body: "signal이 사는 출처 — DB·Code·BI·Catalog. 여기서 Catalog는 위에서 정의한 그 카탈로그이자, 동시에 이 출처들 중 하나다. 소스마다 의미가 어떤 형태로, 얼마나 바로 쓸 수 있게 들어 있는지가 다르다." },
    ],
  };

  /* ---- CH2 sources (top→bottom follows doc body order: raw→refined) ---- */
  const tiers = [
    { id: "raw", name: "원시 시그널", note: "구조와 구현 — 가장 많은 해석이 필요하다" },
    { id: "behavior", name: "행동 증거", note: "사용 패턴 — 의미로 바꾸려면 해석을 거쳐야 한다" },
    { id: "refined", name: "정제된 의미", note: "사람이 검토해 둔 정의 — 읽으면 바로 쓸 수 있다" },
  ];

  const sources = [
    {
      id: "catalog", name: "Catalog", tier: "refined", color: "catalog",
      essence: "사람이 검토해 둔 정의를 제공",
      origin: "수기 관리", load: "낮음", drillIn: true,
      lead: "Catalog는 시그널 중 정제된 의미를 담는 소스다. 다른 소스가 해석을 거쳐야 하는 원시 시그널·행동 증거인 반면, Catalog는 사람이 이미 검토해 둔 정의를 제공한다.",
      signals: [
        ["Glossary · Term", "비즈니스 용어의 공식 정의와 개념 단위"],
        ["Domain · Subdomain", "데이터의 소유·책임 조직 단위"],
        ["Link · Lineage", "Term–Asset 연결과 Asset 간 흐름"],
        ["Classification · Tags", "이미 부여된 PII·기밀 등 분류"],
        ["기존 Description · README", "과거 수동 작성된 설명"],
      ],
      blocks: [
        { h: "소스이자 목적지", p: "다른 소스에 없는 이중 역할을 한다. Term·Domain·Lineage를 증강의 입력 시그널로 제공하는 동시에, 증강 결과(Description·Link·Classification)가 다시 Catalog로 들어온다." },
        { h: "순환 구조", p: "그래서 Catalog는 정적인 저장소가 아니라, 채워질수록 더 나은 시그널을 제공하는 순환 구조의 일부가 된다." },
      ],
      drillNote: "Catalog는 내부 구조(의미 축·소유 축·Asset·Link·Lineage)가 풍부합니다. 아래 버튼으로 깊게 탐색하세요.",
      feeds: ["description", "link", "domain"],
    },
    {
      id: "bi", name: "BI", tier: "behavior", color: "bi",
      essence: "데이터가 실제로 어떻게 쓰이는지",
      origin: "자동 축적", load: "중간",
      lead: "BI 도구에서는 데이터가 실제로 어떻게 쓰이는지가 시그널이 된다. 어떤 컬럼이 어느 대시보드에서 필터·집계에 쓰이는지, 어떤 부서가 접근하는지, 사용 빈도가 어떤지.",
      signals: [
        ["사용 빈도", "컬럼의 중요도를 시사"],
        ["접근 부서", "소유 도메인을 시사"],
        ["대시보드 사용", "필터·집계 맥락"],
        ["지표·라벨 이름", "비즈니스 사용자가 쓰는 실제 용어 (\"세금면제율\")"],
        ["join 패턴", "함께 쓰이는 컬럼 관계"],
      ],
      blocks: [
        { h: "Term-worthiness의 근거", p: "코드 반복은 \"시스템에 이 개념이 있다\"까지만 말하고, BI 사용은 \"이 개념을 사람들이 실제로 쓴다\"를 말한다. 후자가 어떤 개념을 Term으로 만들 가치의 시그널이다." },
        { h: "한계", p: "사용 빈도가 곧 중요도는 아니다. 자주 쓰이지만 잘못 쓰이는 컬럼도 있고, 신규 데이터는 사용 이력이 없으며, SQL을 직접 쓰는 팀의 패턴은 BI에 잡히지 않는다." },
      ],
      feeds: ["link"],
    },
    {
      id: "db", name: "DB", tier: "raw", color: "db",
      essence: "스키마의 형태와 관계",
      origin: "자동 축적", load: "높음",
      lead: "스키마는 별도 연동 없이 조회할 수 있다. 시그널이 되는 건 그 안의 패턴이다.",
      signals: [
        ["이름 토큰", "TAX_EXMP_FLG → 세금·면제·플래그"],
        ["타입", "CHAR(1) → 단일 코드값"],
        ["제약조건", "CHECK·UNIQUE·NOT NULL → 허용값 범위·필수 여부"],
        ["FK · 접미사", "테이블 관계, _dt·_cd·_flg 포맷"],
        ["샘플값 · 카디널리티", "실제 값 분포"],
        ["쿼리 로그", "자주 조회되는 컬럼"],
      ],
      blocks: [
        { h: "DB 단독의 한계", p: "제약조건(CHECK)이나 샘플값이 있으면 값의 <b>집합</b>(Y·N·P·X)까지는 좁혀진다. 그러나 Y가 면세인지 과세인지 — 값의 <b>의미</b>는 끝까지 나오지 않는다. 형태와 관계는 잡혀도 의미와 업무 맥락은 컬럼 밖에 있다." },
      ],
      feeds: ["description", "classification", "domain"],
    },
    {
      id: "code", name: "Code", tier: "raw", color: "code",
      essence: "데이터를 다루는 로직 속 의미",
      origin: "자동 축적", load: "높음",
      lead: "소스코드는 데이터를 다루는 로직을 담고 있고, 그 안에 컬럼의 의미가 들어 있다. 카탈로그나 DB에서는 얻을 수 없는 종류의 시그널이다. 가장 직접적인 건 Enum이다.",
      code: 'enum TaxExemption {\n    Y("면세"), N("과세"),\n    P("부분면세"), X("해당없음")\n}',
      signals: [
        ["Enum", "Y=면세 — 값의 의미는 코드에만 있다"],
        ["ORM 매핑", "tax_exmp_flg → taxExemption"],
        ["i18n 라벨", "화면에 표시되는 이름"],
        ["어노테이션 · 검증", "@PersonalInfo(민감도), @Size·정규식(포맷)"],
        ["주석 · docstring", "설계 의도"],
        ["분기 로직 · 커밋", "if(==P) 같은 특수 처리, 변경 이유"],
      ],
      blocks: [
        { h: "값 의미의 유일한 출처", p: "<code>Y</code>가 \"면세\"를 뜻한다는 사실은 코드에만 있다. DB는 <code>CHAR(1)</code>까지만 알고, 카탈로그에도 이 매핑은 없다. 코드를 보지 않으면 Y·N·P·X가 각각 무엇인지 확정할 방법이 없다." },
        { h: "비용", p: "Git 저장소 연동·파싱 파이프라인이 필요하고, 주석이 없거나 변수명이 모호하면 시그널 밀도가 떨어진다. 코드와 스키마 변경이 항상 같이 일어나지 않아 최신이라는 보장도 없다." },
      ],
      feeds: ["description", "value", "classification"],
    },
  ];

  /* ---- CH3 augmented information ---- */
  const info = [
    {
      id: "description", name: "컬럼 Description", q: "무엇인가", foundation: true,
      from: ["db", "code", "catalog"],
      when: "미리", scope: "전체", exception: false,
      make: "DB 형태 + Code 의도 + Catalog 맥락을 합쳐 만든다.",
      role: "다른 정보가 이 위에 쌓이는 토대다. Link도 Description을 Term과 비교해 만들고, Classification 판단도 컬럼이 무엇인지 알아야 시작된다.",
      usage: "NL2SQL 에이전트가 질문에 해당하는 컬럼을 고를 때 읽는다. \"세금 면제된 건\"에서 TAX_EXMP_FLG가 그 개념임을 판단하는 근거.",
      missing: "어떤 컬럼이 질문에 해당하는지 못 찾아 쿼리가 틀리거나 만들어지지 않는다. Code가 빠지면 \"세금 관련 단일 코드\" 수준에 머문다.",
    },
    {
      id: "link", name: "Link", q: "어떤 개념인가",
      from: ["catalog", "bi"],
      when: "미리", scope: "전체", exception: false,
      make: "Description을 Glossary Term과 대조해 만든다. (Description 위에 쌓인다)",
      role: "한 Term에 여러 컬럼이 연결되므로, 흩어진 관련 컬럼을 한 번에 모을 수도 있다.",
      usage: "비즈니스 용어로 데이터를 찾을 때 쓴다. \"세금면제\"로 물으면 이름이 전혀 다른 물리 컬럼 TAX_EXMP_FLG를 Link가 찾아준다.",
      missing: "비즈니스 용어로 검색해도 컬럼이 걸리지 않는다 — 이름이 다르기 때문이다.",
    },
    {
      id: "value", name: "값 의미", q: "코드값이 각각 무엇인가", exception: true,
      from: ["code"],
      when: "런타임", scope: "전체",
      make: "Code의 Enum을 읽어 만든다.",
      role: "다섯 중 유일하게 미리 채우지 않는다. 전체 코드베이스 파싱은 비싸고, 실제로 해석이 필요한 컬럼은 일부라, 필요한 순간 해당 컬럼만 처리한다.",
      usage: "NL2SQL 에이전트가 조건절을 만들 때. \"면세된 건\"을 쿼리하려면 Y가 면세라는 걸 알아야 WHERE TAX_EXMP_FLG = 'Y'를 생성할 수 있다.",
      missing: "Y·N·P·X 중 무엇이 면세인지 모른 채 추측해 틀린 조건을 쓰거나, 해석하지 못해 쿼리를 포기한다.",
    },
    {
      id: "classification", name: "Classification", q: "어떤 민감도인가", exception: true,
      from: ["db", "code"],
      when: "미리", scope: "일부",
      make: "DB 패턴(_EMAIL 접미사) + Code 어노테이션(@PersonalInfo). 두 독립 소스가 일치하면 신뢰도가 높다.",
      role: "모든 컬럼이 아니라 민감한 컬럼에만. Link·Lineage를 따라 전파되는 구조라 관련 컬럼에 미리 번져 있어야 한다.",
      usage: "실행 단계에서 쓰인다. 결과에 CUST_EMAIL이 포함되면 PII 분류를 보고 마스킹 후 반환, 권한이 없으면 컬럼을 제외한다.",
      missing: "개인정보가 그대로 나가 규제를 위반한다. (PII 외에도 기밀·신용정보·PHI·PCI·영업비밀 등 여러 축)",
      propagation: {
        title: "분류 전파 — 두 단계",
        steps: [
          { node: "“이메일” Term", tag: "PII", note: "분류를 가진 Term", kind: "term" },
          { node: "CUST_EMAIL", tag: "PII 확정", note: "직접 Link된 Asset · 즉시 확정", kind: "confirmed" },
          { node: "EMAIL_BACKUP", tag: "PII 후보", note: "Lineage 파생 · 검토 대상", kind: "candidate" },
        ],
      },
    },
    {
      id: "domain", name: "Domain", q: "누구 것인가",
      from: ["db", "catalog"],
      when: "미리", scope: "전체",
      make: "명명 패턴과 테이블 소속으로 정한다. 대부분 규칙으로 정해지고(fin_ → Finance), 경계가 모호한 경우에만 판단이 필요하다.",
      role: "다른 정보의 입력 시그널이다. 같은 이름의 컬럼이 여러 시스템에 있을 때 Description·Link가 Domain으로 구분한다.",
      usage: "검색 범위를 좁힌다. \"고객 데이터\"를 물으면 Customer 도메인으로 한정해 노이즈를 줄인다.",
      missing: "검색이 전사로 번지고, 동명 컬럼이 충돌한다.",
    },
  ];

  /* ---- CH3 intro (default panel for info board) ---- */
  const infoIntro = {
    title: "시그널을 조합해 증강하는 정보",
    paras: [
      "DB는 <code>TAX_EXMP_FLG·CHAR(1)</code>까지, Code는 <code>Y=면세</code>까지 안다. 둘을 합치면 \"대출 건의 세금 면제 상태 코드, Y=면세·N=과세·P=부분면세·X=해당없음\"이 된다. 어느 소스에도 통째로 들어 있지 않던 정보다.",
      "증강은 흩어진 시그널을 합쳐 이런 정보를 만드는 일이다. 컬럼을 곧장 Term에 매칭하기보다, 먼저 <b>Description</b>을 만들고 그 의미를 Term과 비교하는 간접 방식이 정확도가 높다 — 의미를 한 번 만들어두면 다른 정보의 토대가 되기 때문이다.",
    ],
    matrixNote: "다섯 중 넷은 미리 채운다. <b>값 의미</b>만 런타임에, <b>Classification</b>만 일부 컬럼이 대상 — 둘이 예외다.",
  };

  /* ---- Catalog structure (CH2 board: "Asset은 어디에 속하는가") ----
     Each node: essence, lead, distinct?, facts[], composition?, termRelations?,
     methods?, example, relation{ text, chain?, to[] } ---- */
  const catalog = {
    nodes: {
      glossary: {
        name: "Glossary", axis: "meaning", essence: "비즈니스 용어의 공식 정의를 모아둔 곳",
        lead: "같은 단어가 부서마다 다르게 쓰이는 걸 막는 단일 기준이다.",
        distinct: { a: "데이터 딕셔너리", av: "타입·NULL 같은 기술 정보를 자동으로 뽑는다", b: "Glossary", bv: "사람이 합의한 비즈니스 의미를 담는다" },
        facts: [["여러 개 공존", "Finance Glossary, HR Glossary가 따로 운영되고 서로의 용어는 동의어로 연결한다. 부서마다 용어 체계와 담당자가 달라서, 한 덩어리로 묶으면 누가 무엇을 관리하는지 흐려진다 — 나눠야 각 부서가 자기 용어를 책임진다."]],
        example: "“활성 사용자”를 마케팅은 “월 1회 접속”, 재무는 “유료 결제 중”으로 본다. Glossary가 “최근 30일 내 유료 결제”를 공식 정의로 등록해두면, 누가 “활성 사용자 수” 리포트를 돌려도 같은 숫자가 나온다 — 없으면 부서마다 다른 수를 들고 와 회의가 멈춘다.",
        relation: { text: "Category를 담고, Category가 Term을 담는 최상위다.", chain: ["Finance Glossary", "“대출 운영” Category", "“세금면제” Term"], to: ["category", "term"] },
      },
      category: {
        name: "Category", axis: "meaning", essence: "한 Glossary 안에서 Term을 묶는 그룹",
        facts: [
          ["왜 묶나", "Term이 수백 개로 늘면 평면 목록에서는 찾을 수 없다. 의미가 가까운 것끼리 묶어 계층으로 탐색한다."],
          ["과하면", "“고객 식별 › 개인고객 › 신규 › 온라인 › 모바일”까지 내려가면 신규 온라인 고객 Term을 어디 둘지 사람마다 달라진다 — 분류가 탐색을 돕는 게 아니라 방해하는 지점이다."],
        ],
        example: "Finance Glossary의 Term 300개를 “고객 식별 / 대출 운영 / 리스크 지표”로 묶으면, “세금면제” 관련 용어를 찾을 때 전체를 훑지 않고 “대출 운영”만 열어보면 된다.",
        relation: { text: "위로 Glossary에 속하고 아래로 Term을 묶는 중간 계층이다.", chain: ["“세금면제” Term", "“대출 운영” Category 밑에 배치"], to: ["glossary", "term"] },
      },
      term: {
        name: "Term", axis: "meaning", essence: "Glossary의 기본 단위 · 하나의 비즈니스 개념",
        lead: "하나의 비즈니스 개념을 정의·연결·거버넌스로 구조화한다.",
        composition: ["이름", "짧은 정의", "긴 운영 맥락(README)", "연결된 Asset", "관계(동의어 등)", "담당자·상태"],
        termRelations: [
          { a: "Customer", type: "동의어", b: "Client" },
          { a: "Cust", type: "권장 용어", b: "Customer" },
          { a: "Loan Status", type: "허용값", b: "Pending · Approved · Rejected" },
        ],
        example: "“세금면제” Term — 정의 “특정 거래에 세금이 부과되지 않는 상태”, 연결 컬럼 TAX_EXMP_FLG·TAX_EXMP_RSN_CD 등 3개, 동의어 “면세”, 상태 Verified.",
        inAction: { k: "관계가 일하는 예", v: "분석가가 “Client 수”를 물어도, “Client”가 “Customer”의 동의어로 등록돼 있으면 같은 Term으로 연결돼 같은 결과가 나온다. 용어가 달라도 개념이 하나로 모인다." },
        relation: { text: "Category에 속하고, Link를 통해 Asset에 연결된다. 의미 축과 물리 데이터가 만나는 접점이다.", chain: ["“세금면제” Term", "Link", "TAX_EXMP_FLG 컬럼"], to: ["category", "link", "asset"] },
      },
      domain: {
        name: "Domain", axis: "owning", essence: "데이터의 소유·책임을 정하는 조직 단위",
        lead: "“누구 것인가”를 답한다.",
        distinct: { a: "Glossary", av: "무슨 뜻인가", b: "Domain", bv: "누구 것인가", note: "같은 컬럼에 둘 다 붙지만 답하는 질문이 다르다." },
        facts: [["한 Asset은 한 Domain", "공동 소유하면 책임 경계가 흐려진다. 보통 테이블에 지정하고 컬럼은 상속받는다."]],
        example: "LOAN_APPL_HIST 테이블을 Finance Domain에 지정하면 하위 컬럼 전부가 자동으로 Finance 소속이 된다. 나중에 컬럼을 추가해도 자동으로 Finance를 따라간다.",
        inAction: { k: "소유가 일하는 예", v: "TAX_EXMP_FLG 값이 이상하다는 리포트가 올라오면, 이 컬럼이 Finance 소속이라 Finance 데이터팀에게 간다. Domain이 없으면 누구에게 물어야 할지부터 막힌다." },
        relation: { text: "Glossary와 별개 축이다. 같은 Asset에 의미(Term)와 소유(Domain)가 동시에 붙는다.", chain: ["TAX_EXMP_FLG", "“세금면제” Term + Finance Domain 소속"], to: ["subdomain", "asset"] },
      },
      subdomain: {
        name: "Subdomain", axis: "owning", essence: "Domain 하위의 세분 단위",
        lead: "Domain이 너무 크면 실제 책임 팀이 모호해진다.",
        example: "Finance Domain에 대출·리스크·고객이 섞여 있으면 어느 팀 책임인지 불명확하다. “Finance › Loan”(대출팀), “Finance › Risk”(리스크팀)으로 쪼개면 소유가 팀 단위로 좁혀진다.",
        inAction: { k: "조직 변경 예", v: "대출팀이 다른 팀과 합쳐지면 “Finance › Loan” Subdomain의 테이블을 새 팀으로 한 번에 옮긴다. Domain 레벨에서만 관리했다면 Finance 전체를 뒤져 대출 관련만 골라내야 한다." },
        relation: { text: "Domain 아래 단계. Asset은 Domain 대신 Subdomain에 직접 붙기도 한다.", chain: ["LOAN_APPL_HIST", "Finance › Loan Subdomain"], to: ["domain", "asset"] },
      },
      asset: {
        name: "Asset", axis: "cross", essence: "카탈로그가 관리하는 대상 · 의미가 붙는 단위",
        lead: "모든 축이 만나는 지점이다.",
        facts: [
          ["종류", "테이블·컬럼·뷰(DB), 대시보드·지표(분석), 쿼리·dbt 모델(파이프라인)."],
          ["붙는 메타데이터", "Description(짧은 정의), README(긴 맥락), Classification(PII 등 민감도)."],
          ["Asset 간 관계", "contains(DB→테이블→컬럼 계층), lineage(데이터 흐름), referenced by(쓰는 대시보드·쿼리)."],
        ],
        example: "같은 카탈로그가 TAX_EXMP_FLG(컬럼)도, 그걸 쓰는 “면세 대출 현황” 대시보드도, 둘 사이 ETL 쿼리도 모두 Asset으로 관리한다 — 종류는 달라도 한 카탈로그 안의 같은 단위다.",
        inAction: { k: "수렴 예", v: "TAX_EXMP_FLG 하나에 “세금면제”(의미) + Finance(소유) + 세금계산 결과로 흐름(lineage)이 모두 붙는다." },
        relation: { text: "위로는 Term이 Link로 의미를 주고, 옆으로는 Domain이 소유를 주고, 자기들끼리는 lineage로 이어진다.", chain: ["TAX_EXMP_FLG", "“세금면제”(의미) + Finance(소유) + lineage(흐름)"], to: ["term", "domain", "link", "lineage"] },
      },
      link: {
        name: "Link", axis: "edge", card: "N:N", essence: "Term과 Asset을 잇는 연결 · 자체 속성을 가진 객체",
        lead: "단순 표시가 아니라 자체 속성을 가진 객체다.",
        facts: [["자체 속성", "언제 연결됐는지, 신뢰도(High/Med/Low), 누가 만들었는지(수동·룰·AI)."]],
        methods: [
          ["수동", "사람이 직접 연결"],
          ["룰", "_id 접미사 → ID 용어"],
          ["AI", "컬럼 맥락을 분석해 추천"],
          ["일괄 import", "외부 매핑을 가져오기"],
        ],
        example: "“세금면제” ↔ TAX_EXMP_FLG (AI 생성, 신뢰도 High → 자동 확정). AI가 만든 연결이라도 신뢰도가 Low면 사람 검토 큐로 간다.",
        relation: { text: "Term의 한쪽 끝과 Asset의 다른 쪽 끝을 잡는다. 이 연결을 타고 Term의 의미가 Asset에 닿는다.", to: ["term", "asset"] },
      },
      lineage: {
        name: "Lineage", axis: "edge", essence: "Asset 사이의 흐름 기록",
        lead: "Asset에서 Asset으로 데이터가 어떻게 흐르는지 기록한다. 같은 흐름을 두 방향으로 읽는다 — <b>어디서 왔나</b>(상류·출처)와 <b>바꾸면 어디가 영향받나</b>(하류·영향).",
        facts: [
          ["상류 — 출처 추적", "값이 이상하거나 정의가 헷갈릴 때, 원천 컬럼·변환 로직까지 거슬러 올라가 근거를 찾는다."],
          ["하류 — 영향 분석", "컬럼을 바꾸거나 폐기하기 전에, 그 값을 쓰는 파생 테이블·지표·대시보드를 미리 본다."],
        ],
        example: "같은 사슬을 방향만 바꿔 읽는다. 위로 읽으면 ‘면세 현황’ 대시보드 숫자가 어느 원천 컬럼에서 왔는지 거슬러 올라가고, 아래로 읽으면 TAX_EXMP_FLG가 어디까지 흘러가 영향을 주는지 내려간다.",
        flow: [
          { node: "TAX_EXMP_FLG", role: "원천 컬럼", kind: "lf-col" },
          { node: "세금계산 모듈", role: "변환 로직", kind: "lf-logic" },
          { node: "TAX_SUMMARY_DT", role: "파생 컬럼", kind: "lf-col" },
          { node: "‘면세 현황’ 대시보드", role: "화면", kind: "lf-dash" },
        ],
        inAction: { k: "영향 분석 예", v: "TAX_EXMP_FLG의 정의를 바꾸려 하면, Lineage를 따라 영향받는 TAX_SUMMARY_DT와 ‘면세 현황’ 대시보드가 목록으로 뜬다 — 바꾸기 전에 무엇이 깨질지 안다." },
        relation: { text: "Asset과 Asset을 잇는다. 한 컬럼의 값이 다른 컬럼·지표·화면으로 흘러간 경로를 기록한다.", to: ["asset"] },
      },
    },
    meaningAxis: ["glossary", "category", "term"],
    owningAxis: ["domain", "subdomain"],
  };

  return { intro, tiers, sources, info, infoIntro, catalog };
})();
