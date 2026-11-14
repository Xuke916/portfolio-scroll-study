// Replace these values when your final text and images are ready.
// Put image files in dist/assets/ and use paths such as "assets/portrait.webp".
window.PORTFOLIO_CONTENT = {
  name: ["XU", "KE"],
  heroImage: "assets/hero-person.webp",
  heroHelmetImage: "assets/hero-helmet.webp",
  heroImageSmall: "assets/hero-person-small.webp",
  heroHelmetImageSmall: "assets/hero-helmet-small.webp",
  message: {
    lines: ["GREAT OF ALL TIME", "BE THE BEST OF THE BEST"]
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
        intro: '我是 XU KE，中国传媒大学动画专业游戏美术方向在读。我做游戏制作、战斗设计与概念美术，也担任校棒球队副队长。',
        facts: [
          { label: '学习', value: '中传', detail: '动画 · 游戏美术' },
          { label: '创作', value: '游戏', detail: '机制与视觉设计' },
          { label: '日常', value: '棒球', detail: '校队副队长' }
        ],
        background: [
          { date: '2023.09 — 2027.09（预计）', title: '中国传媒大学', text: '动画专业艺术学学士在读，游戏美术方向。' },
          { date: '2025.06 — 至今', title: 'Absolutely Games · 制作人', text: '为工作室原创动作游戏 Rewinder 获得投资，推进项目制作。' },
          { date: '2025.12 — 2026.04', title: '网易雷火 · 祝融工作室', text: '担任战斗策划，负责《虹猫蓝兔七侠传》IP 联动双分支终结技能的设计与实现，涵盖机制、数值平衡与表现。与美术、程序协作推进功能上线，并优化击退与赛季饰品的战斗反馈。' },
          { date: '棒球日常', title: '校棒球队副队长', text: '首都棒球赛：2024 年亚军；2025、2026 年季军。' }
        ],
        creative: [
          { date: '2026.03 — 至今', title: 'Rewinder', route: 'work/project-02', text: '受《师父》启发的原创动作游戏。与团队开发，担任制作人，负责概念美术与战斗设计。' },
          { date: '2025.02 — 2025.06', title: 'Money Ball', text: '从中国传媒大学棒球队经历出发，独立设计并制作双人棒球竞技桌游。', route: 'work/project-03' },
          { date: '2024.10 — 2024.12', title: 'Poro Adventure', route: 'work/project-01', text: '设计并开发的作品作为《英雄联盟手游》冬季小游戏上线，获小游戏比赛第一名与最佳 IP 奖。' }
        ],
        recognition: '2025、2026 indiePlay 最佳 Game Jam 提名；2025 TapTap Spotlight 优秀作品奖；2025 大广赛 POP MART 企业专项奖。',
        skills: ['战斗机制', '技能设计', '数值平衡', '场景概念设计'],
        tools: ['Unreal Engine 5', 'Blender', 'Procreate', 'Photoshop', '3DCoat', 'ZBrush']
      },
      heroImage: "", statementImage: "", statement: ["日常", "片段", "记录"],
      showGallery: false,
      galleryTitle: "日常记录", projectsTitle: "生活片段",
      team: {
        "title": "我与我的球队",
        "english": "ME & MY TEAM",
        "items": [
          {
            "title": "球队合影",
            "category": "OUR TEAM",
            "image": "assets/team/together-01.webp",
            "detailImage": "assets/team/together-02.webp",
            "photos": [
              {
                "image": "assets/team/together-01.webp",
                "thumbnail": "assets/team/together-01-small.webp",
                "width": 850,
                "height": 476,
                "smallWidth": 640,
                "alt": "球队合影 · 棚拍"
              },
              {
                "image": "assets/team/together-02.webp",
                "thumbnail": "assets/team/together-02-small.webp",
                "width": 850,
                "height": 476,
                "smallWidth": 640,
                "alt": "球队合影 · 球场"
              }
            ]
          },
          {
            "title": "球员照",
            "category": "PLAYER PORTRAITS",
            "image": "assets/team/portraits-01.webp",
            "detailImage": "assets/team/portraits-02.webp",
            "photos": [
              {
                "image": "assets/team/portraits-01.webp",
                "thumbnail": "assets/team/portraits-01-small.webp",
                "width": 1279,
                "height": 1919,
                "smallWidth": 587,
                "alt": "球员照 · 手套与球服"
              },
              {
                "image": "assets/team/portraits-02.webp",
                "thumbnail": "assets/team/portraits-02-small.webp",
                "width": 1280,
                "height": 1920,
                "smallWidth": 587,
                "alt": "球员照 · 球棒与球服"
              }
            ]
          },
          {
            "title": "投球与训练",
            "category": "PITCHING & PRACTICE",
            "image": "assets/team/pitching-01.webp",
            "detailImage": "assets/team/pitching-03.webp",
            "photos": [
              {
                "image": "assets/team/pitching-01.webp",
                "thumbnail": "assets/team/pitching-01-small.webp",
                "width": 1600,
                "height": 1067,
                "smallWidth": 640,
                "alt": "投球与训练 · 室内投球"
              },
              {
                "image": "assets/team/pitching-03.webp",
                "thumbnail": "assets/team/pitching-03-small.webp",
                "width": 1600,
                "height": 1067,
                "smallWidth": 640,
                "alt": "投球与训练 · 球场练习"
              },
              {
                "image": "assets/team/pitching-04.webp",
                "thumbnail": "assets/team/pitching-04-small.webp",
                "width": 1280,
                "height": 1920,
                "smallWidth": 587,
                "alt": "投球与训练 · 投球瞬间"
              }
            ]
          },
          {
            "title": "球场日常",
            "category": "DAYS ON THE FIELD",
            "image": "assets/team/field-days-01.webp",
            "detailImage": "assets/team/field-days-02.webp",
            "photos": [
              {
                "image": "assets/team/field-days-01.webp",
                "thumbnail": "assets/team/field-days-01-small.webp",
                "width": 1280,
                "height": 1707,
                "smallWidth": 640,
                "alt": "球场日常 · 训练后的冰敷"
              },
              {
                "image": "assets/team/field-days-02.webp",
                "thumbnail": "assets/team/field-days-02-small.webp",
                "width": 1600,
                "height": 1067,
                "smallWidth": 640,
                "alt": "球场日常 · 球场边的装备"
              },
              {
                "image": "assets/team/field-days-03.webp",
                "thumbnail": "assets/team/field-days-03-small.webp",
                "width": 1280,
                "height": 1920,
                "smallWidth": 587,
                "alt": "球场日常 · 挥棒练习"
              },
              {
                "image": "assets/team/field-days-04.webp",
                "thumbnail": "assets/team/field-days-04-small.webp",
                "width": 1600,
                "height": 1067,
                "smallWidth": 640,
                "alt": "球场日常 · 与队友一起"
              }
            ]
          },
          {
            "title": "挥棒瞬间",
            "category": "AT BAT",
            "image": "assets/team/at-bat-01.webp",
            "detailImage": "assets/team/at-bat-02.webp",
            "photos": [
              {
                "image": "assets/team/at-bat-01.webp",
                "thumbnail": "assets/team/at-bat-01-small.webp",
                "width": 1600,
                "height": 1067,
                "smallWidth": 640,
                "alt": "挥棒瞬间 · 01"
              },
              {
                "image": "assets/team/at-bat-02.webp",
                "thumbnail": "assets/team/at-bat-02-small.webp",
                "width": 1600,
                "height": 1067,
                "smallWidth": 640,
                "alt": "挥棒瞬间 · 02"
              }
            ]
          },
          {
            "title": "在新加坡打球",
            "category": "BASEBALL IN SINGAPORE",
            "image": "assets/team/singapore-01.webp",
            "detailImage": "assets/team/singapore-02.webp",
            "photos": [
              {
                "image": "assets/team/singapore-01.webp",
                "thumbnail": "assets/team/singapore-01-small.webp",
                "width": 1600,
                "height": 1200,
                "smallWidth": 640,
                "alt": "在新加坡打球 · 球场练习"
              },
              {
                "image": "assets/team/singapore-02.webp",
                "thumbnail": "assets/team/singapore-02-small.webp",
                "width": 1280,
                "height": 960,
                "smallWidth": 640,
                "alt": "在新加坡打球 · 与球队合影"
              }
            ]
          },
          {
            "title": "为球队画的宣传画",
            "category": "ART FOR MY TEAM",
            "image": "assets/team/team-art-01.webp",
            "detailImage": "assets/team/team-art-02.webp",
            "photos": [
              {
                "image": "assets/team/team-art-01.webp",
                "thumbnail": "assets/team/team-art-01-small.webp",
                "width": 1280,
                "height": 1811,
                "smallWidth": 622,
                "alt": "我为球队画的宣传画 · 十五周年纪念"
              },
              {
                "image": "assets/team/team-art-02.webp",
                "thumbnail": "assets/team/team-art-02-small.webp",
                "width": 1600,
                "height": 1200,
                "smallWidth": 640,
                "alt": "我为球队画的宣传画 · 与作品合影"
              }
            ]
          }
        ]
      },
      projects: Array.from({ length: 3 }, (_, i) => ({ title: "片段 / " + String(i + 1).padStart(2, "0"), image: "", detailImage: "", category: "MOMENT / CONTENT PLACEHOLDER" }))
    }
  },
  entries: [
    { title: ["专业", "作品"], eyebrow: "01 / PROFESSIONAL WORK", description: "", image: "" },
    { title: ["日常", "生活"], eyebrow: "02 / DAILY LIFE", description: "", image: "" }
  ]
};
Object.assign(window.PORTFOLIO_CONTENT.pages.work.projects[2], {
  caseTitle: 'Money Ball', image: 'assets/moneyball/photos/hero.webp', year: '2025',
  role: '独立设计与制作', category: '双人棒球策略桌游',
  overview: '把球场上一瞬间的判断，转化为桌面上可以观察、预测和调整的选择。'
});
Object.assign(window.PORTFOLIO_CONTENT.pages.work.projects[0], {
  caseTitle: '魄罗大冒险', image: 'assets/poro/launch-cn.jpg', year: '2024.10 — 2025.01',
  role: '项目负责人 / 玩法策划 / 美术与动画', category: '2D 像素平台动作游戏',
  overview: '从魄罗柔软、活泼的形象出发，用钩锁、碰撞反弹与坠落风险组织移动体验。'
});
Object.assign(window.PORTFOLIO_CONTENT.pages.work.projects[1], {
  caseTitle:'Rewinder', image:'assets/rewinder/image-01.webp',
  category:'第三人称近战动作游戏', role:'战斗策划 · 概念美术',
  overview:'用回溯扭转眼前的交锋，也面对改写过去留下的后果。'
});
window.PORTFOLIO_CONTENT.pages.work.projects[2].playtestPhotos = [
   {image:'assets/moneyball/photos/test.webp',title:'试玩全景',caption:'双人对局与桌面布局'},
   {image:'assets/moneyball/photos/test-pov.webp',title:'投打操作',caption:'玩家选择球种并准备揭牌'},
   {image:'assets/moneyball/photos/test-layout.webp',title:'阵容配置',caption:'球员卡与守备位置的对应'},
   {image:'assets/moneyball/photos/grid.webp',title:'位置标记',caption:'在可擦写格子卡上记录投打选择'}
  ];


// Personal life photo groups, in the user-provided order.
window.PORTFOLIO_CONTENT.pages.life.projects = [
  {
    "title": "我的宠物",
    "category": "PETS",
    "image": "assets/life/pets-01.webp",
    "detailImage": "assets/life/pets-02.webp",
    "photos": [
      {
        "image": "assets/life/pets-01.webp",
        "thumbnail": "assets/life/pets-01-small.webp",
        "width": 1280,
        "height": 1707,
        "smallWidth": 640,
        "alt": "我的宠物 · 01"
      },
      {
        "image": "assets/life/pets-02.webp",
        "thumbnail": "assets/life/pets-02-small.webp",
        "width": 1280,
        "height": 1707,
        "smallWidth": 640,
        "alt": "我的宠物 · 02"
      },
      {
        "image": "assets/life/pets-03.webp",
        "thumbnail": "assets/life/pets-03-small.webp",
        "width": 1600,
        "height": 1200,
        "smallWidth": 640,
        "alt": "我的宠物 · 03"
      }
    ]
  },
  {
    "title": "我的收藏",
    "category": "COLLECTION",
    "image": "assets/life/collection-02.webp",
    "detailImage": "assets/life/collection-03.webp",
    "photos": [
      {
        "image": "assets/life/collection-02.webp",
        "thumbnail": "assets/life/collection-02-small.webp",
        "width": 1280,
        "height": 1707,
        "smallWidth": 640,
        "alt": "我的收藏 · 02"
      },
      {
        "image": "assets/life/collection-03.webp",
        "thumbnail": "assets/life/collection-03-small.webp",
        "width": 1600,
        "height": 1200,
        "smallWidth": 640,
        "alt": "我的收藏 · 03"
      },
      {
        "image": "assets/life/collection-04.webp",
        "thumbnail": "assets/life/collection-04-small.webp",
        "width": 1280,
        "height": 1707,
        "smallWidth": 640,
        "alt": "我的收藏 · 04"
      },
      {
        "image": "assets/life/collection-05.webp",
        "thumbnail": "assets/life/collection-05-small.webp",
        "width": 1600,
        "height": 1200,
        "smallWidth": 640,
        "alt": "我的收藏 · 05"
      },
      {
        "image": "assets/life/collection-06.webp",
        "thumbnail": "assets/life/collection-06-small.webp",
        "width": 1600,
        "height": 1200,
        "smallWidth": 640,
        "alt": "我的收藏 · 06"
      },
      {
        "image": "assets/life/collection-07.webp",
        "thumbnail": "assets/life/collection-07-small.webp",
        "width": 960,
        "height": 1280,
        "smallWidth": 640,
        "alt": "我的收藏 · 07"
      }
    ]
  },
  {
    "title": "滑雪",
    "category": "SNOW",
    "image": "assets/life/snow-01.webp",
    "detailImage": "assets/life/snow-02.webp",
    "photos": [
      {
        "image": "assets/life/snow-01.webp",
        "thumbnail": "assets/life/snow-01-small.webp",
        "width": 1280,
        "height": 1707,
        "smallWidth": 640,
        "alt": "滑雪 · 01"
      },
      {
        "image": "assets/life/snow-02.webp",
        "thumbnail": "assets/life/snow-02-small.webp",
        "width": 1280,
        "height": 1707,
        "smallWidth": 640,
        "alt": "滑雪 · 02"
      },
      {
        "image": "assets/life/snow-03.webp",
        "thumbnail": "assets/life/snow-03-small.webp",
        "width": 1600,
        "height": 1206,
        "smallWidth": 640,
        "alt": "滑雪 · 03"
      }
    ]
  },
  {
    "title": "动捕中",
    "category": "MOCAP",
    "image": "assets/life/mocap-01.webp",
    "detailImage": "assets/life/mocap-02.webp",
    "photos": [
      {
        "image": "assets/life/mocap-01.webp",
        "thumbnail": "assets/life/mocap-01-small.webp",
        "width": 1600,
        "height": 1067,
        "smallWidth": 640,
        "alt": "动捕中 · 01"
      },
      {
        "image": "assets/life/mocap-02.webp",
        "thumbnail": "assets/life/mocap-02-small.webp",
        "width": 1600,
        "height": 1067,
        "smallWidth": 640,
        "alt": "动捕中 · 02"
      }
    ]
  },
  {
    "title": "我的纹身",
    "category": "TATTOO",
    "image": "assets/life/tattoo-01.webp",
    "detailImage": "",
    "photos": [
      {
        "image": "assets/life/tattoo-01.webp",
        "thumbnail": "assets/life/tattoo-01-small.webp",
        "width": 1280,
        "height": 1707,
        "smallWidth": 640,
        "alt": "我的纹身 · 01"
      }
    ]
  }
];
Object.assign(window.PORTFOLIO_CONTENT.pages.life.profile, {heroPhoto:'assets/life/xu-ke-portrait.webp',heroPhotoSmall:'assets/life/xu-ke-portrait-small.webp',heroPhotoWidth:1344,heroPhotoHeight:2400,heroPhotoAlt:'XU KE 的日常照片',heroPhotoCaption:'XU KE / EVERYDAY LIFE'});
