import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e6f0e7',
    paddingHorizontal: 16,
    paddingTop: 60,
  },

  // 상단 헤더
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 24,
    resizeMode: 'contain',
  },
  dateText: {
    color: '#586247',
    fontSize: 20,
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: 18,
    marginHorizontal: 10,
    color: '#444',
  },

  // 달력 전체 박스
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 40,
    paddingVertical: 30,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },

  // 요일 헤더
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  weekDay: {
    width: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#576146',
  },

  // 날짜 칸들
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayWrapper: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    marginVertical: 4,
  },

  // 날짜 숫자
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#576146',
  },

 

  // 감정 아이콘 자리
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },


  // 감정 이미지
  dayIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // ✅ 일기 카드 (하단 바 위에 띄우기 위해 position 변경)
  diaryCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // 하단 바 높이만큼 위로
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 100,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // 왼쪽 정렬
    paddingHorizontal: 16,
  },
  
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 좌우 양쪽 정렬
    paddingHorizontal: 16,
  },
  emotionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notyetIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  diaryDate: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#333',
  },
  emotionTag: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  diaryContent: {
    fontSize: 15,
    color: '#444',
    marginTop: 10,
    marginBottom: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  diaryButton: {
    backgroundColor: '#dba5a5',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
  },
  diaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noDiaryText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 20,
  },

  // 추가: 하단 바 스타일
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 10,
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomIcon: {
    width: 50,
    height: 50,
    marginBottom: 1,
    //tintColor: '#666',
  },
  bottomLabel: {
    fontSize: 12,
    color: '#666',
  },
});
