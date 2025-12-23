import React, { useState } from 'react';
import { MOCK_ASSESSMENT_DATA } from './constants';
import { Scores, ResultRule } from './types';
import { calculateResult } from './services/engine';
import { ProgressBar } from './components/ProgressBar';
import { ChevronRight, RefreshCw, Check, X, Sparkles, ImageOff, ChevronDown, ChevronUp, Lock } from 'lucide-react';

enum AppState {
  START,
  QUIZ,
  CALCULATING,
  RESULT
}

// Internal component to handle image fallback gracefully
const QrCodeImage: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const localImage = "./qrcode.jpg";
  // Fallback to a generic QR code if local file is missing
  const fallbackImage = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Short%20Drama%20Course";

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        <img 
          src={fallbackImage} 
          alt="Fallback QR" 
          className="w-36 h-36 object-contain rounded-lg p-2 bg-white"
        />
        <p className="text-[10px] text-slate-400 max-w-[150px] leading-tight text-center">
          (未找到 qrcode.jpg，显示示例码)
        </p>
      </div>
    );
  }

  return (
    <img 
      src={localImage} 
      alt="Contact QR" 
      className="w-36 h-36 object-contain rounded-lg p-2 bg-white shadow-lg"
      onError={() => setHasError(true)}
    />
  );
};

// Helper to generate AI Analysis based on PRD logic
const getShortDramaAnalysis = (topCode: string) => {
  const analyses: Record<string, string> = {
    "A": "你天生具备敏锐的审美和创作力。在短剧推广中，这种能力能帮你捕捉最有爆发力的黄金3秒视频片段，让流量信手拈来。你更适合在家里随性创作，不受办公室枷锁限制，用创意引爆流量。",
    "I": "你擅长逻辑分析与数据钻研。短剧推广不仅仅是发视频，更是一场数据博弈。你通过复盘播放量与转化率来优化投放策略的能力，让你即使在家办公，也能像操盘手一样精准获利，用数据驱动高收益。",
    "R": "你具备极强的执行力与技术落地能力。短剧推广需要持续的剪辑产出与细节把控，你这种“实干派”非常适合居家建立自己的剪辑流水线，靠稳定的产出获得丰厚回报，是短剧行业最需要的中流砥柱。",
    "C": "你做事严谨、极具计划性。短剧推广需要长期经营和精细化排期，你擅长做计划的特质能保证账号稳定权重，非常适合把居家办公做成一份长久的事业，通过稳定的执行力战胜90%的竞争者。",
    "E": "你拥有敏锐的市场嗅觉和把控能力。短剧行业不仅需要内容，更需要懂得投流与变现的操盘思维。你适合掌控全局，通过运营账号矩阵实现收益最大化，是天生的短剧项目操盘手。",
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
    }, 2000); // Increased time slightly for AI effect
  };

  // --- RENDERERS ---

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center fade-in bg-animate relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-4 inline-block">
          <span className="px-4 py-1.5 text-xs font-bold tracking-widest text-purple-200 bg-purple-900/50 border border-purple-500/50 rounded-full uppercase shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              AI智能 · 职业分析
          </span>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-2 leading-tight tracking-tight drop-shadow-xl">
          短剧行业
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            潜力测评
          </span>
        </h1>
        <p className="text-slate-400 text-sm font-medium mb-8 tracking-wide">
          HOLLAND CAREER ASSESSMENT
        </p>
        
        <div className="glass-panel rounded-2xl p-6 mb-8 text-left space-y-4 border-l-4 border-purple-500">
          <p className="text-slate-200 leading-relaxed">
            🎬 <span className="text-white font-bold">短剧风口</span>已至，你是否适合在这个行业掘金？
          </p>
          <p className="text-slate-200 leading-relaxed">
            🧠 我们结合<span className="text-purple-300">AI算法</span>与霍兰德职业模型，精准分析你的“短剧基因”。
          </p>
          <p className="text-xs text-slate-400 pt-3 border-t border-white/10 mt-2">
            📊 累计已有 10W+ 用户参与测评，准确率高达 98%
          </p>
        </div>

        <button 
          onClick={handleStart}
          className="group relative w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 overflow-hidden"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
          立即开启测评
          <ChevronRight className="w-6 h-6" />
        </button>
        
        <p className="mt-6 text-xs text-slate-500 font-mono">
           FULL VERSION (90 QUESTIONS)
        </p>
      </div>
    </div>
  );

  const renderQuizScreen = () => (
    <div className="flex flex-col min-h-screen w-full max-w-md mx-auto px-6 py-8 fade-in relative">
       {/* Background Decor */}
       <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-purple-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="mb-8 z-10">
        <div className="flex justify-between items-end mb-4">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">{currentQuestionIndex + 1}</span>
            <span className="text-sm font-medium text-slate-500 pb-2 tracking-wider">/ {data.questions.length}</span>
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={data.questions.length} />
      </div>

      <div className="flex-grow flex flex-col justify-center mb-10 z-10">
        <h2 className="text-2xl font-bold text-white leading-relaxed text-center drop-shadow-md">
          {currentQuestion.text}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto z-10 pb-8">
         {currentQuestion.options.map((option, idx) => {
             const isYes = option.score === 1;
             return (
                <button
                    key={idx}
                    onClick={() => handleOptionClick(option.value, option.score)}
                    className={`h-32 rounded-2xl font-bold text-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-3 border
                        ${isYes 
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-purple-400/30 shadow-[0_4px_20px_rgba(124,58,237,0.4)]' 
                            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                >
                    {isYes ? <Check className="w-10 h-10" /> : <X className="w-10 h-10" />}
                    {option.content}
                </button>
             )
         })}
      </div>
    </div>
  );

  const renderCalculatingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 fade-in bg-slate-950">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">AI 正在计算...</h2>
      <div className="space-y-2 text-center">
        <p className="text-slate-400 text-sm animate-pulse">正在构建六维能力模型</p>
        <p className="text-slate-500 text-xs">Matching Short Drama Database...</p>
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
    const primaryCode = top3[0][0]; // The single most dominant trait

    return (
      <div className="flex flex-col min-h-screen fade-in bg-slate-950 pb-16">
        {/* 1. Core Conclusion Header */}
        <div className="relative pt-14 pb-10 px-6 text-center overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/40 via-slate-900/0 to-slate-900 z-0"></div>
             <div className="relative z-10">
                <h2 className="text-purple-300 text-xs font-bold uppercase tracking-[0.3em] mb-4">你的短剧事业基因</h2>
                <div className="inline-block relative">
                    <div className="absolute inset-0 bg-purple-500 blur-[60px] opacity-30"></div>
                    <h1 className="relative text-7xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
                        {resultString}
                        <span className="text-2xl text-purple-400 ml-1 font-light">型</span>
                    </h1>
                </div>
             </div>
        </div>

        {/* 2. AI Job Match Analysis */}
        <div className="px-6 mb-8 relative z-10">
            <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-purple-500">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">AI 职业匹配分析</h3>
                </div>
                <div className="text-slate-200 text-sm leading-relaxed text-justify">
                    {getShortDramaAnalysis(primaryCode)}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
                   <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   推荐指数：<span className="text-yellow-400">★★★★★</span> (居家/自由职业)
                </div>
            </div>
        </div>

        {/* 3. Conversion / Funnel Area */}
        <div className="px-6 mb-8 relative z-10">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-1 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                <div className="bg-slate-900/90 rounded-[22px] p-6 text-center backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-2">
                        短剧实战特训：零基础居家创收
                    </h3>
                    <p className="text-slate-400 text-xs mb-6">
                        你的 {resultString} 潜能 + 我们的实战方法 = 变现
                    </p>

                    <div className="space-y-3 mb-6 text-left bg-black/20 p-4 rounded-xl">
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
                        <div className="relative">
                             <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20"></div>
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
        <div className="px-6 relative z-10">
             <button 
                onClick={() => setIsReportExpanded(!isReportExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-white/5 text-slate-300 hover:bg-slate-800 transition-colors"
             >
                <span className="font-bold text-sm">查看完整六维测评报告</span>
                {isReportExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
             </button>
             
             {isReportExpanded && (
                <div className="mt-4 glass-panel rounded-2xl p-6 border-white/5 fade-in">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">得分详情 (90题精准版)</h3>
                    <div className="space-y-4">
                        {data.dimensions?.map(dim => {
                            const score = scores[dim.code] || 0;
                            const maxScore = 15;
                            const pct = (score / maxScore) * 100;
                            const isTop3 = top3.some(t => t[0] === dim.code);

                            return (
                                <div key={dim.code}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className={`font-bold ${isTop3 ? 'text-purple-300' : 'text-slate-400'}`}>
                                            {dim.name}
                                        </span>
                                        <span className="text-slate-500 font-mono">{score} / 15</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${isTop3 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-600'}`} 
                                            style={{ width: `${pct}%`}} 
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {dim.code === "R" && "实际、操作、户外"}
                                        {dim.code === "I" && "思考、研究、逻辑"}
                                        {dim.code === "A" && "创作、直觉、表达"}
                                        {dim.code === "S" && "助人、合作、共情"}
                                        {dim.code === "E" && "领导、说服、野心"}
                                        {dim.code === "C" && "细节、计划、秩序"}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
             )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] text-slate-600 pb-8">
            <p>Copyright © 2024 Short Drama Career Assessment</p>
            <button 
                onClick={handleStart} 
                className="mt-4 flex items-center justify-center gap-1 mx-auto text-slate-500 hover:text-white transition-colors"
            >
                <RefreshCw className="w-3 h-3" /> 重测
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
       {appState === AppState.START && renderStartScreen()}
       {appState === AppState.QUIZ && renderQuizScreen()}
       {appState === AppState.CALCULATING && renderCalculatingScreen()}
       {appState === AppState.RESULT && renderResultScreen()}
    </div>
  );
};

export default App;