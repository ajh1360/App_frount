// 우울증 평가 조회용 (GET🟢 /api/depressions/{depressionId})
export const mockGetDepressionById=(depressionId) => {
  const mockDepression = {
    5001: {
      depressionId: 5001,
      result: true,
      emotionScore: 7.8,
      depressionWordScore: 6.3,
      phq9Score: 15.2,
      gad7Score: 6.62
    }
  };
  return mockDepression[depressionId];
};
  
  // 우울증 분석 요청용 (POST🟡 /api/depressions?diaryId={diaryId})
  export const mockPostDepression = {
    request: {
      diaryId: 1,
    },
    response: {
      depressionId: 5001,
      result: true,
      emotionScore: 7.8,
      depressionWordScore: 6.3,
      phq9Score: 15.2,
      gad7Score: 6.62
    },
  };
  
  // 우울증 평가 수정용 (PUT🟠 /api/depressions/{depressionId})
  export const mockPutDepression = {
    request: {
      result: true,
      emotionScore: 7.8,
      depressionWordScore: 6.3,
      phq9Score: 15.2,
      gad7Score: 6.62
    },
    response: {
      depressionId: 5001,
      result: true,
      emotionScore: 7.8,
      depressionWordScore: 6.3,
      phq9Score: 15.2,
      gad7Score:6.62
    },
  };