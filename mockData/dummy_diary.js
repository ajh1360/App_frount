//일기 단건 조회용 (🟢 GET /api/diaries/{diaryId})
// - diaryId에 해당하는 하나의 일기 상세 정보를 조회할 때 사용
export const mockGetDiaryById = (diaryId) => {
  const mockDiary = {
    1: {diaryId: 1, memberId: 1001, 
      content: `예린이랑 어케저케 시간 내서 편맥하기루
회의가 아직 안끝나서 폰으로 디코하면서 회의 겨우 끝내구
걷다가 중간에 일레클 타고 갔는데 햐~
날씨가 참~~~ 좋았어요
뭔가 살짝 추운데 따뜻한 이너낌....
근데 5분타고 1600원 냄 시불
이 양아취들 
오랜만에 만난거라 얘기할게 참 많아서 조아뜸
진대도 많이하구 잼얘도 많이 하구....
밖에서 1시간반정도 있다가 
예린이 집가서 이모랑 같이 넷플보고
12시반쯤인가 집 갔더욤​`, 
        writtenDate: "2025-04-21",
        transformDiaryId: 2001, 
        transformContent: `오늘은 예린이와 시간을 맞춰 오랜만에 만나 맥주를 마셨다. 
회의가 길어져 끝나지 않아 휴대폰으로 디스코드를 하며 회의를 겨우 마쳤다. 
걷다가 중간에 일레클을 타고 이동했는데, 날씨가 정말 좋았다. 
약간 쌀쌀했지만 동시에 따뜻한 느낌이 들어 기분이 좋았다.
근데 5분 정도밖에 타지 않았는데 1600원이 나와서 황당했다.
오랜만에 만난 예린이와는 나눌 이야기가 정말 많았다. 
진지한 대화도 많이 나눴고, 재미있는 이야기도 함께 나누며 즐거운 시간을 보냈다.
밖에서 한 시간 반 정도 있다가 예린이 집에 가서 이모와 함께 넷플릭스를 보고 
밤 12시 반쯤 집으로 돌아왔다.`,
        emotionId: 3001,diaryFeedbackId: 4001, depressionId: 5001}
  };
  return mockDiary[diaryId];
};

// 회원 일기 목록 조회용(🟢 GET /api/diaries?memberId={memberId})
//특정 회원이 작성한 일기 목록과 감정 요약을 가져올 때 사용
export const mockGetDiariesByMember = (memberId) => {
  const mockData = {
    1001: {
      memberId: 1001,
      diaries: [
        { diaryId: 1, writtenDate: "2025-04-21", emotionType: "JOY" },
        { diaryId: 2, writtenDate: "2025-04-22", emotionType: "EMBARRASSED" },
        { diaryId: 3, writtenDate: "2025-04-23", emotionType: "SAD" },
      ],
    },
    
    1002: {
      memberId: 1002,
      diaries: [
        { diaryId: 4, writtenDate: "2025-04-21", emotionType: "SAD" },
        { diaryId: 5, writtenDate: "2025-04-22", emotionType: "ANGRY" },
      ],
    },
  };

  return mockData[memberId] || { memberId, diaries: [] };
};

//일기 작성 요청용 (🟡 POST /api/diaries?temp=false) 
//새로운 일기를 생성할 때 요청에 사용되는 데이터 구조
export const mockPostDiaryRequest = {
  writtenDate: "2025-04-21",
  content: "오늘은 정말 힘든 하루였다...(변환된 일기임)",
  temp: false,
};

//일기 작성 응답 예시 (🟡 POST 응답 예시)
//일기 작성 후 백엔드에서 응답으로 보내주는 데이터 구조
export const mockPostDiaryResponse = {
  diaryId: 1,
  memberId: 1001,
  content: "오늘은 정말 힘든 하루였다...(변환된 일기임)",
  writtenDate: "2025-04-21",
  transformDiaryId: 2001,
  emotionId: 3001,
  diaryFeedbackId: 4001,
  depressionId: 5001,
};

//일기 수정 요청용 (PUT🟠 /api/diaries/{diaryId})
//기존 일기 내용을 수정할 때 요청에 사용하는 데이터 구조
export const mockPutDiaryRequest = {
  content: "오늘은 정말 힘든 하루였다...(변환된 일기임)",
};

//일기 수정 응답 예시 (PUT🟠 /api/diaries/{diaryId})
//수정이 완료된 후 백에서 응답해주는 일기 데이터 구조
export const mockPutDiaryResponse = {
  diaryId: 1,
  memberId: 1001,
  content: "오늘은 정말 힘든 하루였다...(변환된 일기임)",
  writtenDate: "2025-04-21",
  transformDiaryId: 2001,
  emotionId: 3001,
  diaryFeedbackId: 4001,
  depressionId: 5001,
};