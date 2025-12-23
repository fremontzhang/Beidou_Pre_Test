import React, { useState } from 'react';
import { MOCK_ASSESSMENT_DATA } from './constants';
import { Scores, ResultRule } from './types';
import { calculateResult } from './services/engine';
import { ProgressBar } from './components/ProgressBar';
import { ChevronRight, RefreshCw, Check, X, Sparkles, ImageOff, ChevronDown, ChevronUp } from 'lucide-react';

enum AppState {
  START,
  QUIZ,
  CALCULATING,
  RESULT
}

// Detailed descriptions for Holland Codes
const HOLLAND_DETAILS: Record<string, { traits: string; jobs: string }> = {
  "R": {
    traits: "愿意使用工具从事操作性工作，动手能力强，做事手脚灵活，动作协调。偏好于具体任务，不善言辞，做事保守，较为谦虚。缺乏社交能力，通常喜欢独立做事。",
    jobs: "技术性职业（计算机硬件人员、摄影师、制图员、机械装配工），技能性职业（木匠、厨师、技工、修理工、农民、一般劳动）。"
  },
  "I": {
    traits: "思想家而非实干家，抽象思维能力强，求知欲强，肯动脑，善思考，不愿动手。喜欢独立的和富有创造性的工作。知识渊博，有学识才能，不善于领导他人。考虑问题理性，做事喜欢精确，喜欢逻辑分析和推理。",
    jobs: "科学研究人员、教师、工程师、电脑编程人员、医生、系统分析员。"
  },
  "A": {
    traits: "有创造力，乐于创造新颖、与众不同的成果，渴望表现自己的个性，实现自身的价值。做事理想化，追求完美，不重实际。具有一定的艺术才能和个性。善于表达、怀旧、心态较为复杂。",
    jobs: "艺术方面（演员、导演、艺术设计师、雕刻家、建筑师、摄影家、广告制作人），音乐方面（歌唱家、作曲家、乐队指挥），文学方面（小说家、诗人、剧作家）。"
  },
  "S": {
    traits: "喜欢与人交往、不断结交新的朋友、善言谈、愿意教导别人。关心社会问题、渴望发挥自己的社会作用。寻求广泛的人际关系，比较看重社会义务和社会道德。",
    jobs: "教育工作者（教师、教育行政人员），社会工作者（咨询人员、公关人员）。"
  },
  "E": {
    traits: "追求权力、权威和物质财富，具有领导才能。喜欢竞争、敢冒风险、有野心、抱负。为人务实，习惯以利益得失，权利、地位、金钱等来衡量做事的价值，做事有较强的目的性。",
    jobs: "项目经理、销售人员，营销管理人员、政府官员、企业领导、法官、律师。"
  },
  "C": {
    traits: "尊重权威和规章制度，喜欢按计划办事，细心、有条理，习惯接受他人的指挥和领导。喜欢关注实际和细节情况，通常较为谨慎和保守。不喜欢冒险和竞争，富有自我牺牲精神。",
    jobs: "秘书、办公室人员、记事员、会计、行政助理、图书馆管理员、出纳员、打字员、投资分析员。"
  }
};

// Helper to generate Short Drama AI Analysis based on the dominant code
const getShortDramaAnalysis = (topCode: string) => {
  const analyses: Record<string, string> = {
    "R": "你具备极强的执行力与技术落地能力，这样的“实干派”非常适合居家建立自己的流水线，靠稳定的产出获得丰厚回报，是行业急需的中流砥柱。海外短剧推广里，快速剪辑爆点、给视频加个让人眼前一亮的特效、甚至研究各个平台的发布“黑科技”，那可都是你的主场。当别人被技术问题卡住时，你能稳准狠地搞定，确保每条片子“出厂设置”就是高水准，这本身就是巨大的竞争力！",
    "I": "你擅长逻辑分析与数据钻研，以海外短剧推广来举例的话，通过复盘播放量与转化率来优化投放策略的能力，让你即使在家办公，也能像操盘手一样精准获利。海外观众到底爱看啥？为什么这个剧在东南亚火了在法国却不行？数据背后的流量密码，就靠你来破译。你能从一堆冰冷的数据里，挖出下一个热门趋势，提前布局内容方向。你不是在盲目跟风，你是在引领风向，这才是推广的核心大脑！",
    "A": "宝子，你的一生最怕平平无奇！海外短剧的推广这活儿简直为你量身定做！一个绝佳的创意改编、一个让人过目不忘的封面、一段踩中全球嗨点的魔性BGM混剪……全都需要你那源源不断的创造力。你能把原始剧集，变成更符合本地口味、更易传播的“爆款二创”，你就是内容场的魔法师！",
    "S": "你的魅力就是最好的工具！以海外短剧推广来举例的话，这份副业不再是单方面扔内容，而是变成了交朋友。你能在评论区里跟各国网友唠成一片，能精准感知粉丝情绪，能用共情力建立起有温度的粉丝社群。当用户因为你而信任这个剧集账号，粘性和转化自然就来了。你就是连接剧集和观众之间的情感桥梁！",
    "E": "你骨子里对影响力和资源的敏锐度，在海外短剧这片战场上简直是降维打击。 你对政治、经济环境的天然关注，让你能快速判断：某个国家政策松动是不是入场时机？当地的经济波动是否改变了用户的付费意愿？你用宏观视角规避风险，捕捉别人看不见的浪潮。",
    "C": "你做事严谨、极具计划性。短剧推广需要长期经营和精细化排期，你擅长做计划的特质能保证账号稳定权重，非常适合把居家办公做成一份长久的事业。别小看“规划”的力量！在同时管理多个账号、应对不同时区发布、处理海量素材和版权信息的日常里，你的秩序感就是团队的“定海神针”。你能把杂乱的推广流程变得井井有条，确保每一环都精准无误。稳定的内容输出节奏和清晰的资源管理，才是收益持续增长的隐形引擎！"
  };
  return analyses[topCode] || "你拥有独特的综合潜力。短剧行业包容性极强，无论你是哪种类型，只要找到对的方法，都能在这个风口上找到属于自己的位置。";
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.START);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Scores>({});
  const [result, setResult] = useState<ResultRule | null>(null);
  const [isReportExpanded, setIsReportExpanded] = useState(false);

  const data = MOCK_ASSESSMENT_DATA;
  const currentQuestion = data.questions[currentQuestionIndex];

  const handleStart = () => {
    setAppState(AppState.QUIZ);
    setCurrentQuestionIndex(0);
    setScores({});
    setResult(null);
    setIsReportExpanded(false);
  };

  const handleOptionClick = (optionValue: string, optionScore: number) => {
    const newScores = { ...scores };
    // For Holland (category mode), accumulate score for R, I, A, etc.
    newScores[optionValue] = (newScores[optionValue] || 0) + optionScore;
    
    setScores(newScores);

    if (currentQuestionIndex < data.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz(newScores);
    }
  };

  const finishQuiz = (finalScores: Scores) => {
    setAppState(AppState.CALCULATING);
    setTimeout(() => {
      const calculatedResult = calculateResult(data, finalScores);
      setResult(calculatedResult);
      setAppState(AppState.RESULT);
    }, 1500);
  };

  // --- RENDERERS ---

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center fade-in bg-slate-900">
      <div className="mb-2">
        <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-300 bg-green-900/50 border border-green-700/50 rounded-full uppercase">
            职业规划必备
        </span>
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-6 leading-tight">
        {data.testConfig.title}
        <span className="block text-lg font-normal text-slate-400 mt-2">完整版 (90题)</span>
      </h1>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-4">
        <p className="text-slate-200">💫 还在纠结自己是不是因为工作而内耗吗？</p>
        <p className="text-slate-200">🔮 试试用“霍兰德职业兴趣测评”，看自己喜欢的、又能赚到钱的工作是什么吧！</p>
        <p className="text-xs text-slate-500 pt-2 border-t border-white/10">
          🌈 愿你我：在这焦虑的时代，过不焦虑的人生！
        </p>
      </div>

      <button 
        onClick={handleStart}
        className="w-full max-w-xs px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full shadow-lg shadow-green-900/50 hover:scale-105 transition-all flex items-center justify-center gap-2"
      >
        开始探索
        <ChevronRight className="w-5 h-5" />
      </button>
      
      <p className="mt-6 text-xs text-slate-500">
        共 {data.testConfig.totalQuestions} 题 · 预计 5-8 分钟
      </p>
    </div>
  );

  const renderQuizScreen = () => (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto px-6 py-10 fade-in bg-slate-900">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-3">
            <span className="text-4xl font-bold text-slate-100">{currentQuestionIndex + 1}</span>
            <span className="text-sm font-medium text-slate-500 pb-1">/ {data.questions.length}</span>
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={data.questions.length} />
      </div>

      <div className="flex-grow flex flex-col justify-center mb-12">
        <h2 className="text-2xl font-medium text-slate-100 leading-relaxed text-center">
          {currentQuestion.text}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
         {currentQuestion.options.map((option, idx) => {
             const isYes = option.score === 1;
             return (
                <button
                    key={idx}
                    onClick={() => handleOptionClick(option.value, option.score)}
                    className={`py-6 rounded-2xl font-bold text-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-2
                        ${isYes 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-500' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    {isYes ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                    {option.content}
                </button>
             )
         })}
      </div>
    </div>
  );

  const renderCalculatingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 fade-in bg-slate-950">
      <div className="relative w-28 h-28 mb-8">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">AI 正在计算匹配度...</h2>
      <div className="space-y-2 text-center text-sm text-slate-400">
         <p className="animate-pulse">正在构建六维能力模型</p>
         <p>Matching Short Drama Database...</p>
      </div>
    </div>
  );

  const renderResultScreen = () => {
    if (!result) return null;

    // Calculate Top 3 Ranking
    const sortedCategories = Object.entries(scores)
        .sort(([, scoreA], [, scoreB]) => (scoreB as number) - (scoreA as number));
    
    const top3 = sortedCategories.slice(0, 3);
    const resultString = top3.map(([code]) => code).join('');
    const primaryCode = top3[0][0]; // Most dominant trait

    return (
      <div className="flex flex-col min-h-screen fade-in bg-slate-950 pb-16">
        {/* 1. Core Conclusion Header (Short Drama Theme) */}
        <div className="relative pt-14 pb-10 px-6 text-center overflow-hidden">
             {/* Dynamic Background Effect */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/30 via-slate-950/0 to-slate-950 z-0"></div>
             
             <div className="relative z-10">
                <div className="inline-block mb-3 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
                    <span className="text-purple-300 text-[10px] font-bold uppercase tracking-[0.2em]">AI 智能潜力分析</span>
                </div>
                {/* Title removed here */}
                <div className="inline-block relative">
                    <div className="absolute inset-0 bg-purple-500 blur-[50px] opacity-20"></div>
                    <h1 className="relative text-7xl font-black text-white tracking-tighter mb-2 drop-shadow-2xl">
                        {resultString}
                        <span className="text-2xl text-purple-400 ml-1 font-light">型</span>
                    </h1>
                </div>
             </div>
        </div>

        {/* 2. AI Job Match Analysis */}
        <div className="px-6 mb-8 relative z-10">
            <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-purple-500 bg-slate-800/40">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">职业契合度分析</h3>
                </div>
                <div className="text-slate-200 text-sm leading-relaxed text-justify">
                    {getShortDramaAnalysis(primaryCode)}
                </div>
                <div className="mt-4 pb-4 border-b border-white/10 flex items-center gap-2 text-xs text-slate-400">
                   <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <span key={i} className="text-purple-400">★</span>)}
                   </div>
                   <span>居家/自由职业指数 MAX</span>
                </div>

                {/* Additional Marketing Content & Image */}
                <div className="mt-6 pt-2">
                    <div className="text-sm text-slate-300 space-y-4 leading-relaxed text-justify">
                        <p>
                            海外短剧推广是一项典型的低门槛高回报副业，变现路径简单粗暴，无需漫长培育期，通过广告分成快速赚取佣金。AI制作素材效率高、周期短，一部短剧可多平台、多地区循环投放，持续产生收益。更关键的是，海外市场空白大，国产短剧凭借差异化题材和成熟制作经验，轻松抢占全球流量红利，新手也能快速起号赚钱，堪称当下的黄金赛道！
                        </p>
                        <p className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/20">
                            <span className="text-purple-300 font-bold">北斗智影</span>作为国内头部海外短剧推广平台，为进一步降低普通人的参与门槛，现在还提供<span className="text-white font-bold">新手测试账号</span>帮你省去软件、设备的准备和养号步骤，直接取得收益，机会有限先到先得！
                        </p>
                    </div>
                    <div className="mt-6">
                        <img 
                            src="https://beidou-file-images.tos-cn-beijing.volces.com/market/850X850.PNG" 
                            alt="北斗智影活动" 
                            className="w-full rounded-xl shadow-xl border border-white/10"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Conversion / Funnel Area REMOVED */}

        {/* 4. Deep Analysis (Collapsible) */}
        <div className="px-6 relative z-10 pb-8">
             <button 
                onClick={() => setIsReportExpanded(!isReportExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-white/5 text-slate-300 hover:bg-slate-800 transition-colors group"
             >
                <div className="flex flex-col items-start">
                    <span className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">查看完整六维测评报告</span>
                    <span className="text-[10px] text-slate-500">包含详细得分与维度定义</span>
                </div>
                {isReportExpanded ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
             </button>
             
             {isReportExpanded && (
                <div className="mt-4 space-y-4 fade-in">
                    {data.dimensions?.map(dim => {
                        const score = scores[dim.code] || 0;
                        const maxScore = 15;
                        const pct = (score / maxScore) * 100;
                        const isTop3 = top3.some(t => t[0] === dim.code);
                        const details = HOLLAND_DETAILS[dim.code];

                        return (
                            <div key={dim.code} className="glass-panel rounded-2xl p-5 border-white/5 bg-slate-900/50">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isTop3 ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/50' : 'bg-slate-800 text-slate-500'}`}>
                                            {dim.code}
                                        </div>
                                        <span className={`font-bold ${isTop3 ? 'text-white' : 'text-slate-400'}`}>
                                            {dim.name.split('-')[1]}
                                        </span>
                                    </div>
                                    <span className="text-sm font-mono text-slate-400">{score}分</span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${isTop3 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-slate-700'}`} 
                                        style={{ width: `${pct}%`}} 
                                    ></div>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">共同特征</h4>
                                        <p className="text-xs text-slate-300 leading-relaxed text-justify">
                                            {details?.traits || "暂无描述"}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">典型职业</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed text-justify">
                                            {details?.jobs || "暂无描述"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
             )}
             
             <button 
                onClick={handleStart} 
                className="mt-8 flex items-center justify-center gap-1 mx-auto text-slate-500 hover:text-white transition-colors text-xs"
             >
                <RefreshCw className="w-3 h-3" /> 重新测试
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
       {appState === AppState.START && renderStartScreen()}
       {appState === AppState.QUIZ && renderQuizScreen()}
       {appState === AppState.CALCULATING && renderCalculatingScreen()}
       {appState === AppState.RESULT && renderResultScreen()}
    </div>
  );
};

export default App;