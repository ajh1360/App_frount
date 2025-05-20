export const emotionImage = (emotionType) => {
  const emotions = {
    ANXIETY: require('./emotions/anxiety.jpg'),
    SAD: require('./emotions/sad.png'),
    HURT: require('./emotions/hurt.jpg'),
    JOY: require('./emotions/joy.png'),
    ANGRY: require('./emotions/angry.jpg'),
    EMBARRASSED: require('./emotions/embarrassed.jpg'),
  };
  return emotions[emotionType];
};

export const emotionTypeToKorean = (type) => {
  const map = {
    JOY: '#기쁨',
    SAD: '#슬픔',
    HURT: '#상처',
    EMBARRASSED: '#당황',
    ANXIETY: '#불안',
    ANGRY: '#화남',
  };
  return map[type] || '#감정없음';
};

export const emotionLabelMap = {
  JOY: '기쁨',
  ANXIETY: '불안',
  SAD: '슬픔',
  ANGRY: '화남',
  EMBARRASSED: '당황',
  HURT: '상처',
};

export const emotionLabelMap_e = {
  JOY: '기쁨😊',
  ANXIETY: '불안😣',
  SAD: '슬픔😭',
  ANGRY: '화남😡',
  EMBARRASSED: '당황😥',
  HURT: '상처🤕',
};

export const emotionFeedbackMap = {
  JOY: `기분 좋은 하루였네요!\n이렇게 웃을 수 있는 날이 있다는 건 정말 소중한 일이에요.\n오늘의 기분을 오래 기억해봐요.\n앞으로도 이런 날들이 자주 찾아올 거예요.`,
  ANXIETY: `불안한 마음이 계속 마음을 흔들었나 봐요.\n하지만 지금 이 순간에 집중해보는 것도 하나의 방법이에요.\n모든 걸 잘 해내지 않아도 괜찮아요.\n천천히, 나만의 속도로 나아가요.`,
  SAD: `요즘 힘든 일이 많은 것 같아요.\n때로는 쉬어가도 괜찮아요.\n아무것도 하지 않아도 \n당신은 여전히 소중한 사람이에요.`,
  ANGRY: `많이 답답하고 억울한 하루였나 봐요.\n감정을 참기보다 인정해주는 것도 필요해요.\n잠깐 숨 돌릴 시간을 가져보는 건 어때요?\n당신의 감정은 소중하고, 표현할 자격이 있어요.`,
  EMBARRASSED: `오늘 조금 당황스러운 일이 있었던 것 같네요.\n그런 순간은 누구에게나 생겨요.\n너무 깊게 마음에 담아두지 않아도 괜찮아요.\n금방 아무 일도 아니게 느껴질 거예요.`,
  HURT: `마음이 많이 다쳤나 봐요.\n아무 일 아닌 듯 지나가는 말이 오래 남을 때가 있어요.\n그런 감정을 스스로도 인정해주는 게 중요해요.\n당신의 아픔은 무시해도 되는 게 아니에요.`,
};