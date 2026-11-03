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
    { title: ["YOUR", "WORK"], description: "", image: "" },
    { title: ["YOUR", "WORLD"], description: "", image: "" }
  ]
};
