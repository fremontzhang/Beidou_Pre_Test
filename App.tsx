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

// Internal component to handle image fallback gracefully
const QrCodeImage: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const localImage = "https://beidou-file-images.tos-cn-beijing.volces.com/market/20251223-111722.png";
  // Fallback to a generic QR code if local file is missing
  const fallbackImage = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Please%20Contact%20Support";

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        <img 
          src={fallbackImage} 
          alt="Fallback QR" 
          className="w-32 h-32 object-contain rounded-lg p-2 bg-white"
        />
        <p className="text-[10px] text-slate-400 max-w-[150px] leading-tight text-center">
          (二维码加载失败，显示示例)
        </p>
      </div>
    );
  }

  return (
    <img 
      src={localImage} 
      alt="Contact QR" 
      className="w-32 h-32 object-contain rounded-lg shadow-md"
      onError={() => setHasError(true)}
    />
  );
};

// Helper to generate Short Drama AI Analysis based on the dominant code
const getShortDramaAnalysis = (topCode: string) => {
  const analyses: Record<string, string> = {
    "A": "你天生具备敏锐的审美和创作力。在短剧推广中，这种能力能帮你捕捉最有爆发力的黄金3秒视频片段，让流量信手拈来。你更适合在家里随性创作，不受办公室枷锁限制，用创意引爆流量。",
    "I": "你擅长逻辑分析与数据钻研。短剧推广不仅仅是发视频，更是一场数据博弈。你通过复盘播放量与转化率来优化投放策略的能力，让你即使在家办公，也能像操盘手一样精准获利。",
    "R": "你具备极强的执行力与技术落地能力。短剧推广需要持续的剪辑产出与细节把控，你这种“实干派”非常适合居家建立自己的剪辑流水线，靠稳定的产出获得丰厚回报，是行业急需的中流砥柱。",
    "C": "你做事严谨、极具计划性。短剧推广需要长期经营和精细化排期，你擅长做计划的特质能保证账号稳定权重，非常适合把居家办公做成一份长久的事业，通过稳定的执行力战胜90%的竞争者。",
    "E": "你拥有敏锐的市场嗅觉和掌控欲。短剧行业不仅需要内容，更需要懂得投流与变现的操盘思维。你适合掌控全局，通过运营账号矩阵实现收益最大化，是天生的短剧项目操盘手。",
    "S": "你拥有极强的共情能力，懂人性。短剧的核心就是调动观众情绪，你天生知道观众爱看什么、痛点在哪里。这种天赋能让你写出或选出爆款剧本，直击人心，轻松获得高播放量。"
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
                <h2 className="text-slate-400 text-xs mb-2">你的短剧事业基因</h2>
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
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
                   <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <span key={i} className="text-purple-400">★</span>)}
                   </div>
                   <span>居家/自由职业指数 MAX</span>
                </div>
            </div>
        </div>

        {/* 3. Conversion / Funnel Area */}
        <div className="px-6 mb-8 relative z-10">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-0.5 shadow-[0_0_30px_rgba(79,70,229,0.25)]">
                <div className="bg-slate-900/95 rounded-[22px] p-6 text-center backdrop-blur-md">
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                        <span className="text-purple-300">短剧实战：</span>零基础居家创收全攻略
                    </h3>
                    <p className="text-slate-400 text-xs mb-6">
                        你的 {resultString} 潜能 + 我们的实战方法 = 变现
                    </p>

                    <div className="space-y-3 mb-6 text-left bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 min-w-[16px] h-4 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-bold">✓</div>
                            <span className="text-sm text-slate-300">零基础上手，手把手教剪辑与运营</span>
                        </div>
                        <div className="flex items-start gap-3">
                             <div className="mt-0.5 min-w-[16px] h-4 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-bold">✓</div>
                            <span className="text-sm text-slate-300">独家高转化剧源库，内部通道直连</span>
                        </div>
                        <div className="flex items-start gap-3">
                             <div className="mt-0.5 min-w-[16px] h-4 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-bold">✓</div>
                            <span className="text-sm text-slate-300">导师 1V1 指导，解决账号限流难题</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="bg-white p-2 rounded-xl shadow-lg">
                             <QrCodeImage />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-white mb-1">
                                扫码获取 <span className="text-yellow-400">试听课程</span>
                            </p>
                            <p className="text-[10px] text-slate-500">
                                备注“{resultString}”优先领取资料
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
                <div className="mt-4 glass-panel rounded-2xl p-6 border-white/5 fade-in bg-slate-900/50">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">六维图谱数据</h3>
                    <div className="space-y-4">
                        {data.dimensions?.map(dim => {
                            const score = scores[dim.code] || 0;
                            const maxScore = 15;
                            const pct = (score / maxScore) * 100;
                            const isTop3 = top3.some(t => t[0] === dim.code);

                            return (
                                <div key={dim.code}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold w-4 ${isTop3 ? 'text-purple-400' : 'text-slate-500'}`}>{dim.code}</span>
                                            <span className={`${isTop3 ? 'text-white' : 'text-slate-400'}`}>{dim.name.split('-')[1] || dim.name}</span>
                                        </div>
                                        <span className="text-slate-500 font-mono">{score}</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${isTop3 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-slate-700'}`} 
                                            style={{ width: `${pct}%`}} 
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-1 pl-6">
                                        {dim.code === "R" && "定义：重视技能与工具操作，追求实际产出。"}
                                        {dim.code === "I" && "定义：重视逻辑与分析，追求探究事物原理。"}
                                        {dim.code === "A" && "定义：重视创意与表达，追求独特与美感。"}
                                        {dim.code === "S" && "定义：重视人际与共情，追求帮助他人。"}
                                        {dim.code === "E" && "定义：重视影响力与目标，追求管理与收益。"}
                                        {dim.code === "C" && "定义：重视秩序与规范，追求稳定与准确。"}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
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