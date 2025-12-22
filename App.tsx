import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_ASSESSMENT_DATA } from './constants';
import { Scores, ResultRule } from './types';
import { calculateResult } from './services/engine';
import { ProgressBar } from './components/ProgressBar';
import { OptionCard } from './components/OptionCard';
import { ChevronRight, RefreshCw, Share2, Sparkles } from 'lucide-react';

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

  // Use the config from constants
  const data = MOCK_ASSESSMENT_DATA;
  const currentQuestion = data.questions[currentQuestionIndex];

  // Start the quiz
  const handleStart = () => {
    setAppState(AppState.QUIZ);
    setCurrentQuestionIndex(0);
    setScores({});
    setResult(null);
  };

  // Handle Option Click
  const handleOptionClick = (optionValue: string, optionScore: number) => {
    // 1. Update Scores based on logic
    const newScores = { ...scores };
    
    // For 'dimension' mode: accumulate keys like 'E' or 'I'
    // For 'score' mode: we can accumulate a 'total' key or just specific category keys
    if (data.testConfig.mode === 'dimension') {
      newScores[optionValue] = (newScores[optionValue] || 0) + optionScore;
    } else {
      // Score mode - generic accumulation
      newScores['total'] = (newScores['total'] || 0) + optionScore;
    }
    
    setScores(newScores);

    // 2. Navigate
    if (currentQuestionIndex < data.questions.length - 1) {
      // Delay slightly for visual feedback if needed, but requirements say "automatic next question"
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz(newScores);
    }
  };

  const finishQuiz = (finalScores: Scores) => {
    setAppState(AppState.CALCULATING);
    
    // Simulate calculation delay for dramatic effect
    setTimeout(() => {
      const calculatedResult = calculateResult(data, finalScores);
      setResult(calculatedResult);
      setAppState(AppState.RESULT);
    }, 1500);
  };

  // --- RENDERERS ---

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center fade-in">
      <div className="relative mb-8 w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        <img 
          src={data.testConfig.coverImage} 
          alt="Cover" 
          className="object-cover w-full h-full opacity-80 hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-left">
            <span className="inline-block px-3 py-1 mb-2 text-xs font-bold tracking-wider text-white uppercase bg-pink-600 rounded-full">
                专业测评
            </span>
        </div>
      </div>

      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 mb-4">
        {data.testConfig.title}
      </h1>
      
      <p className="text-lg text-slate-300 mb-8 max-w-md leading-relaxed">
        {data.testConfig.description}
      </p>

      <div className="flex items-center gap-2 text-sm text-slate-400 mb-10">
        <span className="px-2 py-1 bg-white/5 rounded border border-white/10">{data.testConfig.totalQuestions} 道题目</span>
        <span className="px-2 py-1 bg-white/5 rounded border border-white/10">约 3 分钟</span>
      </div>

      <button 
        onClick={handleStart}
        className="group relative px-8 py-4 bg-white text-slate-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all active:scale-95 flex items-center gap-2"
      >
        开始测评
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  const renderQuizScreen = () => (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto px-5 py-8 fade-in">
      {/* Header / Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
          <span>第 {currentQuestionIndex + 1} 题</span>
          <span>共 {data.questions.length} 题</span>
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={data.questions.length} />
      </div>

      {/* Question */}
      <div className="flex-grow flex flex-col justify-center">
        <h2 className="text-2xl font-semibold text-white mb-8 leading-snug">
          {currentQuestion.text}
        </h2>

        {/* Options */}
        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <OptionCard 
              key={idx}
              index={idx}
              option={option}
              onClick={() => handleOptionClick(option.value, option.score)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderCalculatingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 fade-in">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-pink-500 rounded-full animate-spin"></div>
        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-purple-400 animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">正在分析数据...</h2>
      <p className="text-slate-400">正在生成您的专属报告</p>
    </div>
  );

  const renderResultScreen = () => {
    if (!result) return null;

    return (
      <div className="flex flex-col min-h-screen fade-in">
        {/* Hero Section of Result */}
        <div className="relative bg-gradient-to-b from-purple-900/50 to-slate-900 pb-12 pt-16 px-6 text-center rounded-b-[3rem] shadow-2xl border-b border-white/10">
            {result.imageUrl && (
                <div className="w-32 h-32 mx-auto mb-6 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-purple-600 shadow-xl">
                    <img src={result.imageUrl} alt={result.title} className="w-full h-full rounded-full object-cover border-4 border-slate-900" />
                </div>
            )}
            <div className="mb-2">
                 <span className="text-sm font-bold tracking-[0.2em] text-pink-400 uppercase">{result.resultId}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{result.title}</h1>
            <p className="text-lg text-purple-200 font-light leading-relaxed max-w-md mx-auto">
                {result.summary}
            </p>
        </div>

        {/* Detail Content */}
        <div className="px-6 py-10 max-w-lg mx-auto w-full">
            <div className="glass-panel p-6 rounded-2xl mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    深度分析
                </h3>
                <p className="text-slate-300 leading-relaxed text-justify">
                    {result.details}
                </p>
            </div>

            {/* Dimension Breakdown - Only show if dimensions exist and have length */}
            {data.dimensions && data.dimensions.length > 0 && (
                 <div className="glass-panel p-6 rounded-2xl mb-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">维度分析</h3>
                    <div className="space-y-4">
                        {data.dimensions.map(dim => {
                            const left = scores[dim.left] || 0;
                            const right = scores[dim.right] || 0;
                            const total = left + right || 1; 
                            const leftPct = (left / total) * 100;
                            
                            return (
                                <div key={dim.code} className="flex items-center gap-3 text-xs font-bold text-slate-300">
                                    <span className="w-4 text-center">{dim.left}</span>
                                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden flex">
                                        <div style={{ width: `${leftPct}%`}} className="bg-pink-500 h-full"></div>
                                        <div className="flex-1 bg-indigo-500 h-full"></div>
                                    </div>
                                    <span className="w-4 text-center">{dim.right}</span>
                                </div>
                            )
                        })}
                    </div>
                 </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={handleStart}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors border border-white/10"
                >
                    <RefreshCw className="w-4 h-4" />
                    重新测试
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition-all shadow-lg shadow-purple-900/50">
                    <Share2 className="w-4 h-4" />
                    分享结果
                </button>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-slate-200">
        <div className="max-w-2xl mx-auto min-h-screen bg-black/10 shadow-2xl relative">
            {/* Background texture or noise could go here */}
            {appState === AppState.START && renderStartScreen()}
            {appState === AppState.QUIZ && renderQuizScreen()}
            {appState === AppState.CALCULATING && renderCalculatingScreen()}
            {appState === AppState.RESULT && renderResultScreen()}
        </div>
    </div>
  );
};

export default App;