// 일기 피드백 상세 조회용(GET🟢 /api/diary-feedbacks/{diaryFeedbackId})
export const mockGetDiaryFeedbackById = (diaryFeedbackId) => {
  const mockFeedbacks = {
    4001: {
      diaryFeedbackId: 4001,
      content: `오랜만에 예린이랑 좋은 시간 보냈구나!
바쁜 와중에 시간 내서 만난 거니까 더 소중하게 느껴졌을 것 같아.
날씨도 좋고, 이야기 많이 나눴다니 마음까지 따뜻해졌을 것 같아.
그 일레클 요금은 진짜 당황스러웠겠다ㅋㅋ
편안하게 하루 마무리한 것 같아서 보기 좋아 :)`,
      userReaction: 'LIKE',
    },
    4002: {
      diaryFeedbackId: 4002,
      content: '오늘 힘들었겠어요 힘내요~ (피드백)',
      userReaction: 'DISLIKE',
    },
  };
  return mockFeedbacks[diaryFeedbackId];
};
  
  //  일기 피드백 생성 요청용(POST🟡 /api/diary-feedbacks?diaryId={diaryId})
  export const mockPostDiaryFeedback = {
    diaryFeedbackId: 4002,
    content: '오늘 하루 정말 잘 보냈네요! 잘 했어요!',
    userReaction: 'LIKE'
    // 요청 시 diaryContent(원본일기내용)도 보낼 수 있지만 응답엔 포함되지 않음
  };
  
  //  일기 피드백 수정 요청용(PUT🟠 /api/diary-feedbacks/{diaryFeedbackId})
  export const mockPutDiaryFeedback = {
    diaryFeedbackId: 4001,
    content: '오늘 하루 정말 잘 보냈네요! 잘 했어요!',
    userReaction: 'DISLIKE'
  };