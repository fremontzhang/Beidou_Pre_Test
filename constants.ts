import { AssessmentData } from './types';

/**
 * MANAGING THIS FILE:
 * To change questions, simply edit the 'questions' array.
 * To change scoring logic, toggle 'mode' between 'dimension' and 'score'.
 * To add results, add entries to 'resultRules'.
 */

export const MOCK_ASSESSMENT_DATA: AssessmentData = {
  testConfig: {
    testId: "short_drama_001",
    title: "北斗帮你测测推广短剧的潜力",
    description: "短剧推广是当下的风口，你是否具备打造爆款、月入过万的潜质？花3分钟完成这10道专业测试，AI将为你揭晓答案。",
    coverImage: "https://picsum.photos/800/600?grayscale",
    mode: "score", 
    totalQuestions: 10
  },
  
  // Empty for score mode
  dimensions: [],

  questions: [
    {
      id: 1,
      text: "平时你自己刷短视频或短剧的频率是？",
      options: [
        { content: "几乎不看，觉得浪费时间", value: "total", score: 0 },
        { content: "偶尔看，打发时间", value: "total", score: 5 },
        { content: "重度用户，经常一看就停不下来", value: "total", score: 10 }
      ]
    },
    {
      id: 2,
      text: "看到一个爆款视频，你的第一反应通常是？",
      options: [
        { content: "纯粹觉得好笑或好看", value: "total", score: 2 },
        { content: "思考它为什么会火，bgm还是文案？", value: "total", score: 10 },
        { content: "赶紧划走，不感兴趣", value: "total", score: 0 }
      ]
    },
    {
      id: 3,
      text: "对于视频剪辑软件（如剪映），你的熟练程度是？",
      options: [
        { content: "完全不会，没听说过", value: "total", score: 0 },
        { content: "会基础操作，能剪辑简单视频", value: "total", score: 5 },
        { content: "非常熟练，懂关键帧、蒙版等高级功能", value: "total", score: 10 }
      ]
    },
    {
      id: 4,
      text: "如果让你给一个霸道总裁短剧起标题，你会选？",
      options: [
        { content: "霸道总裁爱上我", value: "total", score: 2 },
        { content: "这个男人太帅了", value: "total", score: 0 },
        { content: "新婚夜，植物人老公突然站起来了！", value: "total", score: 10 }
      ]
    },
    {
      id: 5,
      text: "面对新事物或新平台规则，你的学习习惯是？",
      options: [
        { content: "遇到问题再查，懒得钻研", value: "total", score: 2 },
        { content: "主动搜索教程，愿意花时间研究玩法", value: "total", score: 10 },
        { content: "等别人教我", value: "total", score: 0 }
      ]
    },
    {
      id: 6,
      text: "做推广初期可能流量很差，你会？",
      options: [
        { content: "深受打击，觉得我不适合这行", value: "total", score: 0 },
        { content: "有点焦虑，但会坚持发几天看看", value: "total", score: 5 },
        { content: "分析数据，优化素材，不断测试直到跑通", value: "total", score: 10 }
      ]
    },
    {
      id: 7,
      text: "你对“爽点”和“槽点”的敏感度如何？",
      options: [
        { content: "很难get到大家为什么激动", value: "total", score: 0 },
        { content: "大概知道大众喜欢看什么", value: "total", score: 5 },
        { content: "秒懂观众high点，知道哪里最吸睛", value: "total", score: 10 }
      ]
    },
    {
      id: 8,
      text: "每天能投入在副业或推广上的时间是？",
      options: [
        { content: "半小时以内，很忙", value: "total", score: 2 },
        { content: "1-2小时，比较稳定", value: "total", score: 8 },
        { content: "3小时以上，时间充裕", value: "total", score: 10 }
      ]
    },
    {
      id: 9,
      text: "对于“付费投流”获取更高收益，你的看法是？",
      options: [
        { content: "绝对不花钱，只做免费流量", value: "total", score: 2 },
        { content: "看情况，如果ROI为正可以尝试", value: "total", score: 10 },
        { content: "风险太大，不敢碰", value: "total", score: 0 }
      ]
    },
    {
      id: 10,
      text: "你认为短剧推广的核心竞争力是？",
      options: [
        { content: "运气好，碰到爆款", value: "total", score: 2 },
        { content: "执行力+网感+数据分析能力", value: "total", score: 10 },
        { content: "账号粉丝多", value: "total", score: 5 }
      ]
    }
  ],

  resultRules: [
    {
      minScore: 0,
      maxScore: 40,
      resultId: "LEVEL_1",
      title: "潜力萌新",
      summary: "你对短剧行业尚处于懵懂阶段，建议先多看多学。",
      details: "你的网感和技能储备目前还有提升空间。如果想入局，建议先从“养号”和“刷剧”开始，培养对爆款内容的敏感度，不要急于求成。",
      imageUrl: "https://picsum.photos/seed/level1/600/400"
    },
    {
      minScore: 41,
      maxScore: 70,
      resultId: "LEVEL_2",
      title: "进阶推手",
      summary: "你具备基本的推广潜质，只需补齐技能短板。",
      details: "你有不错的网感，对行业也有一定认知。现在的关键是提升剪辑硬技能和文案能力，只要坚持执行，出单只是时间问题。",
      imageUrl: "https://picsum.photos/seed/level2/600/400"
    },
    {
      minScore: 71,
      maxScore: 85,
      resultId: "LEVEL_3",
      title: "爆款预备役",
      summary: "你的潜力巨大，离爆款只差一个机会！",
      details: "你对用户心理和平台规则有很深的理解，这是最宝贵的天赋。保持对数据的敏感度，大胆尝试不同的素材风格，你很有可能成为下一个带货达人。",
      imageUrl: "https://picsum.photos/seed/level3/600/400"
    },
    {
      minScore: 86,
      maxScore: 100,
      resultId: "LEVEL_4",
      title: "天选操盘手",
      summary: "简直是为短剧推广而生！大神请受我一拜。",
      details: "无论是网感、逻辑还是执行力，你都处于顶尖水平。你不仅能自己跑通闭环，甚至有能力带领团队。建议尝试矩阵化运营或付费投流，放大收益。",
      imageUrl: "https://picsum.photos/seed/level4/600/400"
    }
  ]
};
