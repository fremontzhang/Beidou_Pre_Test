import React, { useState } from 'react';
import { MOCK_ASSESSMENT_DATA } from './constants';
import { Scores, ResultRule } from './types';
import { calculateResult } from './services/engine';
import { ProgressBar } from './components/ProgressBar';
import { ChevronRight, RefreshCw, Check, X, Sparkles } from 'lucide-react';

enum AppState {
  START,
  QUIZ,
  CALCULATING,
  RESULT
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.START);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Scores>({});
  const [result, setResult] = useState<ResultRule | null>(null);

  const data = MOCK_ASSESSMENT_DATA;
  const currentQuestion = data.questions[currentQuestionIndex];

  const handleStart = () => {
    setAppState(AppState.QUIZ);
    setCurrentQuestionIndex(0);
    setScores({});
    setResult(null);
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
    <div className="flex flex-col min-h-screen max-w-lg mx-auto px-6 py-10 fade-in">
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

      {/* Simplified Yes/No Buttons for speed since there are 90 questions */}
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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 fade-in">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-emerald-400 animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">正在分析六维数据...</h2>
      <p className="text-slate-400">正在匹配职业兴趣模型</p>
    </div>
  );

  const renderResultScreen = () => {
    if (!result) return null;

    // Calculate Top 3 Ranking
    const sortedCategories = Object.entries(scores)
        .sort(([, scoreA], [, scoreB]) => (scoreB as number) - (scoreA as number));
    
    const top3 = sortedCategories.slice(0, 3);
    const resultString = top3.map(([code]) => code).join('');

    return (
      <div className="flex flex-col min-h-screen fade-in bg-slate-900 pb-12">
        {/* Header */}
        <div className="pt-12 pb-8 px-6 text-center bg-gradient-to-b from-emerald-900/40 to-slate-900">
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">您的霍兰德代码</h2>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tighter mb-6">
                {resultString}
            </h1>
            <p className="text-slate-300 text-sm px-8">
                结果已生成！根据得分高低排序，前三项代表您的核心职业兴趣倾向。
            </p>
        </div>

        {/* Chart / Scores */}
        <div className="px-6 mb-8">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">得分详情</h3>
                <div className="space-y-3">
                    {data.dimensions?.map(dim => {
                        const score = scores[dim.code] || 0;
                        const maxScore = 15;
                        const pct = (score / maxScore) * 100;
                        const isTop3 = top3.some(t => t[0] === dim.code);

                        return (
                            <div key={dim.code} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isTop3 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    {dim.code}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className={isTop3 ? 'text-white' : 'text-slate-400'}>{dim.name}</span>
                                        <span className="text-slate-500">{score}分</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${isTop3 ? 'bg-emerald-500' : 'bg-slate-600'}`} 
                                            style={{ width: `${pct}%`}} 
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

        {/* Funnel / Call to Action */}
        <div className="px-6">
            <div className="glass-panel p-8 rounded-3xl text-center border-emerald-500/30 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">
                    想要获取详细解读？
                </h3>
                
                <div className="bg-white p-4 rounded-xl inline-block mb-4">
                    {/* Placeholder QR Code - In production replace with real image */}
                    <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://xiaohongshu.com" 
                        alt="Contact QR" 
                        className="w-32 h-32"
                    />
                </div>
                
                <div className="text-left text-sm text-slate-300 space-y-3 bg-slate-800/50 p-4 rounded-xl">
                    <p className="flex items-start gap-2">
                        💡 <span className="flex-1">因为最终排列组合多达120种（6个字母任取3个排序），无法在此全部展示。</span>
                    </p>
                    <p className="flex items-start gap-2">
                        🎁 <span className="flex-1 text-emerald-400 font-bold">评论区回复你的结果（如：RIA）</span>，即可获得您的专属职业报告详细解读！
                    </p>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                    <button 
                        onClick={handleStart}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        再测一次
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-emerald-500 selection:text-white">
       {/* Removed max-w wrapper to feel more like a native app on mobile, handled by inner containers */}
       {appState === AppState.START && renderStartScreen()}
       {appState === AppState.QUIZ && renderQuizScreen()}
       {appState === AppState.CALCULATING && renderCalculatingScreen()}
       {appState === AppState.RESULT && renderResultScreen()}
    </div>
  );
};

export default App;