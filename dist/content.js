// Replace these values when your final text and images are ready.
// Put image files in dist/assets/ and use paths such as "assets/portrait.webp".
window.PORTFOLIO_CONTENT = {
  name: ["YOUR", "NAME"],
  heroImage: "",
  message: {
    lines: ["YOUR STORY GOES HERE", "YOUR WORDS GO HERE"]
  },
  gallery: Array.from({ length: 8 }, (_, i) => ({ image: "", caption: "IMAGE / " + String(i + 2).padStart(2, "0") })),
  entries: [
    { title: ["专业", "作品"], eyebrow: "01 / PROFESSIONAL WORK", description: "", image: "" },
    { title: ["日常", "生活"], eyebrow: "02 / DAILY LIFE", description: "", image: "" }
  ]
};
