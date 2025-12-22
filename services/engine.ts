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
  }
  
  return null;
};

/**
 * Logic for MBTI-style dimension scoring.
 * 1. Iterates through defined dimensions (e.g., EI, SN).
 * 2. Compares scores for left vs right (e.g., E vs I).
 * 3. Constructs a result ID string (e.g., "INTJ").
 * 4. Finds the matching rule.
 */
const calculateDimensionResult = (data: AssessmentData, userScores: Scores): ResultRule | null => {
  if (!data.dimensions) return null;

  let resultId = "";

  data.dimensions.forEach((dim) => {
    const leftScore = userScores[dim.left] || 0;
    const rightScore = userScores[dim.right] || 0;
    
    // Simple tie-breaker: if equal, default to Left, otherwise take the higher one
    // In a real app, you might have specific tie-breaking logic
    resultId += (leftScore >= rightScore) ? dim.left : dim.right;
  });

  // Find the rule that matches the generated code
  return data.resultRules.find(r => r.resultId === resultId) || {
    resultId: 'UNKNOWN',
    title: '未知类型',
    summary: '您的选择组合非常独特，暂未匹配到对应的标准类型。',
    details: `生成代码: ${resultId}`
  };
};

/**
 * Logic for total score based assessments (e.g., Depression scale).
 * 1. Sums all values in the userScores object.
 * 2. Finds a rule where the sum falls between minScore and maxScore.
 */
const calculateScoreResult = (data: AssessmentData, userScores: Scores): ResultRule | null => {
  // In 'score' mode, userScores might look like { 'total': 45 } or distributed keys.
  // The 'handleOptionClick' logic in the UI usually aggregates scores. 
  // But here we sum everything just to be safe if keys are different.
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