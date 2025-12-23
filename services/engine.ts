import { AssessmentData, ResultRule, Scores } from '../types';

/**
 * Calculates the final result based on the mode defined in testConfig.
 */
export const calculateResult = (
  data: AssessmentData, 
  userScores: Scores
): ResultRule | null => {
  const { mode } = data.testConfig;

  if (mode === 'dimension') {
    return calculateDimensionResult(data, userScores);
  } else if (mode === 'score') {
    return calculateScoreResult(data, userScores);
  } else if (mode === 'category') {
    // In category mode (Holland), the UI calculates the rank (RIA...).
    // We just return a generic "Completed" rule.
    return data.resultRules[0] || null;
  }
  
  return null;
};

const calculateDimensionResult = (data: AssessmentData, userScores: Scores): ResultRule | null => {
  if (!data.dimensions) return null;
  let resultId = "";
  data.dimensions.forEach((dim) => {
    if (!dim.left || !dim.right) return;
    const leftScore = userScores[dim.left] || 0;
    const rightScore = userScores[dim.right] || 0;
    resultId += (leftScore >= rightScore) ? dim.left : dim.right;
  });
  return data.resultRules.find(r => r.resultId === resultId) || {
    resultId: 'UNKNOWN',
    title: '未知类型',
    summary: '无法计算结果',
  };
};

const calculateScoreResult = (data: AssessmentData, userScores: Scores): ResultRule | null => {
  const totalScore = Object.values(userScores).reduce((acc, curr) => acc + curr, 0);
  return data.resultRules.find(r => {
    const min = r.minScore ?? Number.NEGATIVE_INFINITY;
    const max = r.maxScore ?? Number.POSITIVE_INFINITY;
    return totalScore >= min && totalScore <= max;
  }) || {
    resultId: 'DEFAULT',
    title: '测评完成',
    summary: `您的总分为 ${totalScore}`,
  };
};