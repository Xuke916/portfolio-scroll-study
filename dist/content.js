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
