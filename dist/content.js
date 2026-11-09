// Replace these values when your final text and images are ready.
// Put image files in dist/assets/ and use paths such as "assets/portrait.webp".
window.PORTFOLIO_CONTENT = {
  name: ["XU", "KE"],
  heroImage: "assets/hero-person.png",
  heroHelmetImage: "assets/hero-helmet.png",
  message: {
    lines: ["YOUR STORY GOES HERE", "BE THE BEST OF THE BEST"]
  },
  gallery: Array.from({ length: 8 }, (_, i) => ({ image: "", caption: "IMAGE / " + String(i + 2).padStart(2, "0") })),
  footer: { portrait: "", headline: [["YOUR", "STORY"], ["GOES", "HERE"]], socials: [] },
  pages: {
    work: {
      title: ["专业", "作品"], english: "PROFESSIONAL WORK", mark: "WORK",
      heroImage: "", statementImage: "", statement: ["探索", "创造", "体验"],
      galleryTitle: "专业项目", projectsTitle: "个人项目", showStatement: false, showGallery: false, projectLayout: "covers",
      projects: ["项目01", "项目02", "项目03", "other work"].map((title, i) => ({
        slug: i < 3 ? "project-0" + (i + 1) : "other-work", title, image: "", category: "",
        year: "", role: "", overview: "",
        gallery: [{ image: "", caption: "" }, { image: "", caption: "" }]
      }))
    },
    life: {
      title: ["日常", "生活"], english: "DAILY LIFE", mark: "LIFE",
      profile: {
        name: 'XU KE',
        intro: '我是 XU KE，中国传媒大学动画专业游戏美术方向在读。我的创作围绕游戏设计与视觉展开，也担任校棒球队副队长。',
        facts: [
          { label: '学习', value: '中传', detail: '动画 · 游戏美术' },
          { label: '创作', value: '游戏', detail: '机制与视觉设计' },
          { label: '日常', value: '棒球', detail: '校队副队长' }
        ],
        background: [
          { date: '2023 — 2027（预计）', title: '中国传媒大学', text: '动画专业，游戏美术方向。' },
          { date: '2025.12 — 2026.04', title: '网易雷火 · 祝融工作室', text: '战斗策划，参与技能机制、数值平衡与战斗表现设计。' },
          { date: '棒球日常', title: '校棒球队副队长', text: '首都棒球赛：2024 年亚军；2025、2026 年季军。' }
        ],
        creative: [
          { date: '2026.03 起', title: 'Rewinder', text: '六人团队动作游戏，担任制作人，负责概念美术与战斗设计。' },
          { date: '2025', title: 'Money Ball', text: '从校队经历出发，独立设计并制作双人棒球策略桌游。', route: 'work/project-03' },
          { date: '2024', title: 'Poro Adventure', text: '作品作为《英雄联盟手游》冬季小游戏上线，获小游戏比赛第一名与最佳 IP 奖。' }
        ],
        recognition: '2025、2026 indiePlay 最佳 Game Jam 提名；2025 TapTap Spotlight 优秀作品奖；2025 大广赛 POP MART 企业专项奖。',
        tools: ['Unreal Engine 5', 'Blender', 'Procreate', 'Photoshop', '3DCoat', 'ZBrush']
      },
      heroImage: "", statementImage: "", statement: ["日常", "片段", "记录"],
      galleryTitle: "日常记录", projectsTitle: "生活片段",
      projects: Array.from({ length: 3 }, (_, i) => ({ title: "片段 / " + String(i + 1).padStart(2, "0"), image: "", detailImage: "", category: "MOMENT / CONTENT PLACEHOLDER" }))
    }
  },
  entries: [
    { title: ["专业", "作品"], eyebrow: "01 / PROFESSIONAL WORK", description: "", image: "" },
    { title: ["日常", "生活"], eyebrow: "02 / DAILY LIFE", description: "", image: "" }
  ]
};
Object.assign(window.PORTFOLIO_CONTENT.pages.work.projects[2], {
  caseTitle: 'Money Ball', image: 'assets/moneyball/image2.jpeg', year: '2025',
  role: '独立设计与制作', category: '双人棒球策略桌游',
  overview: '把球场上一瞬间的判断，转化为桌面上可以观察、预测和调整的选择。'
});
window.PORTFOLIO_CONTENT.pages.work.projects[2].playtestPhotos = [
  { image: '', title: '试玩全景', caption: '双人对局与桌面布局' },
  { image: '', title: '投打操作', caption: '标记、预测与揭牌的过程' },
  { image: '', title: '守备与跑垒', caption: '掷骰判定与跑者推进' },
  { image: '', title: '测试交流', caption: '规则确认与玩家反馈' }
];
