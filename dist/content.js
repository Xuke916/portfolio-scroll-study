// Replace these values when your final text and images are ready.
// Put image files in dist/assets/ and use paths such as "assets/portrait.webp".
window.PORTFOLIO_CONTENT = {
  name: ["YOUR", "NAME"],
  heroImage: "",
  message: {
    lines: ["YOUR STORY GOES HERE", "YOUR WORDS GO HERE"]
  },
  gallery: Array.from({ length: 8 }, (_, i) => ({ image: "", caption: "IMAGE / " + String(i + 2).padStart(2, "0") })),
  pages: {
    work: {
      title: ["专业", "作品"], english: "PROFESSIONAL WORK", mark: "WORK",
      heroImage: "", statementImage: "", statement: ["探索", "创造", "体验"],
      galleryTitle: "专业项目", projectsTitle: "个人项目",
      projects: Array.from({ length: 3 }, (_, i) => ({ title: "项目 / " + String(i + 1).padStart(2, "0"), image: "", detailImage: "", category: "PROJECT / CONTENT PLACEHOLDER" }))
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
