// 감정 조회용(GET🟢 /api/emotions/{emotionId})
export const mockGetEmotionById = (emotionId) => {
  const mockEmotions={
    3001 : { emotionId: 3001, emotionType: 'JOY', intensity: 0.8 },
  };
  return mockEmotions[emotionId];
};

// 감정 분석 요청용(POST🟡 /api/emotions?diaryId={diaryId})
export const mockPostEmotion = {
  emotionId: 3001,
  emotionType: "JOY",
  intensity: "0.8",
};

// 감정 수정용(PUT🟠 /api/emotions/{emotionId})
export const mockPutEmotion = {
  request: {
    emotionType: "SAD",
    intensity: "0.3",
  },
  response: {
    emotionId: 3001,
    emotionType: "SAD",
    intensity: "0.3",
  },
};