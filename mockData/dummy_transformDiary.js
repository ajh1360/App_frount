//변환 일기 단건 조회용 (GET🟢 /api/transform-diaries/{transformDiaryId})
//transformDiaryId에 해당하는 변환된 일기 내용을 조회할 때 사용
export const mockGetTransformDiaryById = (transformDiaryId) => {
    const mockTransformDiary = {
      2001: {transformDiaryId: 2001,
    content: `오늘은 예린이와 시간을 맞춰 오랜만에 만나 맥주를 마셨다. 
  회의가 길어져 끝나지 않아 휴대폰으로 디스코드를 하며 회의를 겨우 마쳤다. 
  걷다가 중간에 일레클을 타고 이동했는데, 날씨가 정말 좋았다. 
  약간 쌀쌀했지만 동시에 따뜻한 느낌이 들어 기분이 좋았다.
  근데 5분 정도밖에 타지 않았는데 1600원이 나와서 황당했다.
  오랜만에 만난 예린이와는 나눌 이야기가 정말 많았다. 
  진지한 대화도 많이 나눴고, 재미있는 이야기도 함께 나누며 즐거운 시간을 보냈다.
  밖에서 한 시간 반 정도 있다가 예린이 집에 가서 이모와 함께 넷플릭스를 보고 
  밤 12시 반쯤 집으로 돌아왔다.`}
  };
  return mockTransformDiary[transformDiaryId];
};
  
//변환 일기 생성 요청 및 응답 예시 (POST🟡 /api/transform-diaries?diaryId={diaryId})
//기존 일기(diaryId 기준)를 AI가 분석해 변환된 일기를 생성할 때 사용
export const mockPostTransformDiary = {
    transformDiaryId: 2001,
    content: `오늘은 예린이와 시간을 맞춰 오랜만에 만나 맥주를 마셨다. 
  회의가 길어져 끝나지 않아 휴대폰으로 디스코드를 하며 회의를 겨우 마쳤다. 
  걷다가 중간에 일레클을 타고 이동했는데, 날씨가 정말 좋았다. 
  약간 쌀쌀했지만 동시에 따뜻한 느낌이 들어 기분이 좋았다.
  근데 5분 정도밖에 타지 않았는데 1600원이 나와서 황당했다.
  오랜만에 만난 예린이와는 나눌 이야기가 정말 많았다. 
  진지한 대화도 많이 나눴고, 재미있는 이야기도 함께 나누며 즐거운 시간을 보냈다.
  밖에서 한 시간 반 정도 있다가 예린이 집에 가서 이모와 함께 넷플릭스를 보고 
  밤 12시 반쯤 집으로 돌아왔다.`,
  };
    
//변환 일기 수정 요청 및 응답 예시 (PUT🟠 /api/transform-diaries/{transformDiaryId})
//기존의 변환된 일기 내용을 수정하고 다시 받아올 때 사용
export const mockPutTransformDiary = {
transformDiaryId: 2001,
content: "오늘은 정말 힘든 하루였다.(변환된 일기임)",
  };