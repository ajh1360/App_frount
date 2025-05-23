// mainHome_screen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image, TouchableWithoutFeedback, Keyboard, Alert, Modal, StyleSheet as ModalStyleSheet // Modal, Alert 추가
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { styles } from './styleSheet/mainHome_style'; // 기존 스타일
import { emotionImage, emotionTypeToKorean } from '../assets/emotions';
import logoutIcon from '../assets/nav/logout_logo.png';
import recapIcon from '../assets/nav/recap_logo.png';
import settingsIcon from '../assets/nav/setting_logo.png';

export default function MainHome({ route }) {
  const { accessToken } = route.params;
  const navigation = useNavigation();

  const [currentDate, setCurrentDate] = useState(dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState(null);
  const [diaryData, setDiaryData] = useState([]);
  const [diaryDetailMap, setDiaryDetailMap] = useState({});

  // 모달 상태
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [selectedDiaryForAction, setSelectedDiaryForAction] = useState(null); // { diary, dateStr }

  const fetchDiaryListFor = useCallback(async (targetDate, isRefresh = false) => {
    // console.log(`[API] Fetching diaries for: ${targetDate.format('YYYY-MM')}, Refresh: ${isRefresh}`);
    try {
      const res = await fetch(
        `http://ceprj.gachon.ac.kr:60021/api/diaries?year=${targetDate.year()}&month=${targetDate.month() + 1}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res.ok) {
         const errorData = await res.json().catch(() => ({ message: '일기 목록 가져오기 실패' }));
         console.error('[API Error] 일기 목록 API 응답 오류:', res.status, errorData);
         throw new Error(errorData.message || `서버 응답: ${res.status}`);
      }
      const data = await res.json();
      // console.log('[API Success] Fetched diary data:', JSON.stringify(data.diaries, null, 2));
      setDiaryData(data.diaries || []);
      if (isRefresh) {
          setDiaryDetailMap({});
          if (selectedDate) {
              const currentDiaryEntry = (data.diaries || []).find(d => d.writtenDate === selectedDate);
              if (currentDiaryEntry && currentDiaryEntry.emotionType && currentDiaryEntry.status !== 'TEMP') {
                  fetchDiaryDetail(currentDiaryEntry.diaryId);
              }
          }
      }
    } catch (err) {
      console.error('❌ diary list (fetch for target) error:', err.message);
      // Alert.alert("오류", `일기 목록을 가져오는 중 오류가 발생했습니다: ${err.message}`); // 기본 Alert 문제로 주석 처리 또는 다른 알림 방식으로 대체
      console.log("오류: 일기 목록을 가져오는 중 오류가 발생했습니다:", err.message); // 콘솔 로그로 대체
      setDiaryData([]);
    }
  }, [accessToken, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      // console.log("MainHome focused or route params changed:", route.params);
      const shouldRefreshForSpecificDate = route.params?.selectedDateForUpdate && route.params.selectedDateForUpdate !== selectedDate;
      const shouldRefreshCurrentMonth = route.params?.diaryUpdated;

      if (shouldRefreshForSpecificDate) {
        const newSelectedDate = route.params.selectedDateForUpdate;
        const parsedDate = dayjs(newSelectedDate);
        if (!parsedDate.isSame(currentDate, 'month')) {
          setCurrentDate(parsedDate.startOf('month'));
        } else {
          fetchDiaryListFor(currentDate, true);
        }
        setSelectedDate(newSelectedDate);
        navigation.setParams({ diaryUpdated: false, selectedDateForUpdate: null });
      } else if (shouldRefreshCurrentMonth) {
        fetchDiaryListFor(currentDate, true);
        navigation.setParams({ diaryUpdated: false });
      } else {
         fetchDiaryListFor(currentDate);
      }
    }, [route.params, currentDate, fetchDiaryListFor, navigation, selectedDate])
  );


   useEffect(() => {
    if (selectedDate) {
      const diaryEntry = getDiaryByDate(selectedDate);
      if (diaryEntry && diaryEntry.emotionType && diaryEntry.status !== 'TEMP' && !diaryDetailMap[diaryEntry.diaryId]) {
        fetchDiaryDetail(diaryEntry.diaryId);
      }
    }
  }, [selectedDate, diaryData, diaryDetailMap]);


  const fetchDiaryDetail = async (diaryId) => {
    if (diaryDetailMap[diaryId] && diaryDetailMap[diaryId].transformContent) return;
    try {
      const res = await fetch(
        `http://ceprj.gachon.ac.kr:60021/api/diaries/${diaryId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res.ok) {
          const errorData = await res.json().catch(()=>({}));
          throw new Error(`일기 상세 실패 (ID: ${diaryId}): ${errorData.message || res.status}`);
      }
      const data = await res.json();
      setDiaryDetailMap((prev) => ({ ...prev, [diaryId]: data }));
    } catch (err) {
      console.error('❌ diary detail error:', err.message);
    }
  };

  const changeMonth = (offset) => {
    setCurrentDate(prevDate => prevDate.add(offset, 'month').startOf('month'));
    setSelectedDate(null);
    setDiaryDetailMap({});
  };

  const getDiaryByDate = (dateStr) =>
    diaryData.find((d) => d.writtenDate === dateStr);

  const startOfMonth = currentDate.startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  const startDayOfWeek = startOfMonth.day();

  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(currentDate.date(i));
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
    }
  };

  const handleCalendarDayPress = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const diary = getDiaryByDate(dateStr);

    console.log(`[handleCalendarDayPress] Date: ${dateStr}, Diary found: ${JSON.stringify(diary, null, 2)}`);

    const isTempSaved = diary && (diary.status === 'TEMP' || (!diary.emotionType && diary.diaryId && typeof diary.status === 'undefined'));
    
    console.log(`[handleCalendarDayPress] isTempSaved: ${isTempSaved}`);

    if (isTempSaved) {
      setSelectedDiaryForAction({ diary, dateStr });
      setIsActionModalVisible(true);
    } else {
      setSelectedDate(dateStr);
    }
  };

  // --- 모달 액션 핸들러 ---
  const handleModalContinue = () => {
    if (!selectedDiaryForAction) return;
    const { diary, dateStr } = selectedDiaryForAction;
    console.log("[Modal Action] 이어서 쓰기 선택됨");
    navigation.navigate('DiaryWriteScreen', {
      selectedDate: dateStr,
      accessToken: accessToken,
      tempDiaryId: diary.diaryId
    });
    setIsActionModalVisible(false);
    setSelectedDiaryForAction(null);
  };

  const handleModalDeleteAndWriteNew = () => {
    if (!selectedDiaryForAction) return;
    const { diary, dateStr } = selectedDiaryForAction;
    console.log("[Modal Action] 지우고 새로 쓰기 선택됨, 삭제 확인 Alert 시도");


    (async () => {
        console.log("[Modal Action] (No Confirm) 지우고 새로 쓰기 실행");
        try {
            const response = await fetch(`http://ceprj.gachon.ac.kr:60021/api/diaries/${diary.diaryId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "삭제 중 서버 오류 발생" }));
                throw new Error(errorData.message || `삭제 실패: ${response.status}`);
            }
            console.log("임시 저장된 일기가 삭제되었습니다.");
            fetchDiaryListFor(currentDate, true); // 달력 목록 새로고침
            navigation.navigate('DiaryWriteScreen', { // 일기 작성 화면으로 이동
                selectedDate: dateStr,
                accessToken: accessToken,
                // tempDiaryId는 전달하지 않음 (새로 작성)
            });
        } catch (err) {
            console.error("임시 일기 삭제 오류:", err);
            console.log("오류:", err.message || "삭제 중 오류가 발생했습니다.");
            // 사용자에게 오류 알림 (예: 커스텀 알림 또는 간단한 텍스트 표시)
            Alert.alert("오류", err.message || "삭제 중 오류가 발생했습니다."); // 이 Alert도 문제가 될 수 있으므로, 필요시 다른 방식으로 대체
        } finally {
            setIsActionModalVisible(false);
            setSelectedDiaryForAction(null);
        }
    })();
  };
    


  const handleModalCancel = () => {
    console.log("[Modal Action] 취소 선택됨");
    if (selectedDiaryForAction) {
        // "취소" 시에는 하단에 해당 날짜의 임시저장 카드 정보를 보여주기 위해 selectedDate 설정
        setSelectedDate(selectedDiaryForAction.dateStr);
    }
    setIsActionModalVisible(false);
    setSelectedDiaryForAction(null);
  };


  return (
    <TouchableWithoutFeedback onPress={() => { setSelectedDate(null); Keyboard.dismiss(); setIsActionModalVisible(false); }}>
      <View style={{ flex: 1 }}>
        <View style={styles.screen}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }} />
            <Image source={require('../assets/echoLog_logo.png')} style={styles.logo} />
          </View>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
                <Text style={styles.dropdownIcon}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.dateText}>{currentDate.format('YYYY년 M월')}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
                <Text style={styles.dropdownIcon}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarContainer} pointerEvents="box-none">
            <View style={styles.weekRow}>
              {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                <Text key={d} style={styles.weekDay}>{d}</Text>
              ))}
            </View>
            <View style={styles.daysContainer}>
              {calendarDays.map((date, idx) => {
                if (!date) return <View key={`empty-${idx}`} style={styles.dayWrapper} />;
                const diary = getDiaryByDate(date.format('YYYY-MM-DD'));
                const isTempIcon = diary && (diary.status === 'TEMP' || (!diary.emotionType && diary.diaryId && typeof diary.status === 'undefined'));
                const iconSource = diary
                                   ? (isTempIcon
                                     ? require('../assets/grayCircle.png')
                                     : (diary.emotionType ? emotionImage(diary.emotionType) : require('../assets/grayCircle.png'))
                                   )
                                   : require('../assets/grayCircle.png');

                return (
                  <TouchableOpacity
                    key={date.format('YYYY-MM-DD')}
                    style={[
                        styles.dayWrapper,
                        selectedDate === date.format('YYYY-MM-DD') ? styles.selectedDayWrapper : {}
                    ]}
                    onPress={() => handleCalendarDayPress(date)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                        styles.dayText,
                        date.isSame(dayjs(), 'day') ? styles.todayText : {}
                    ]}>{date.date()}</Text>
                    <View style={styles.iconCircle}>
                      <Image source={iconSource} style={styles.dayIcon} resizeMode="cover" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {selectedDate && !isActionModalVisible && (() => {
            const diary = getDiaryByDate(selectedDate);
            if (diary) {
              const isConsideredTempForCard = diary.status === 'TEMP' || (!diary.emotionType && diary.diaryId && typeof diary.status === 'undefined');

              if (isConsideredTempForCard) {
                return (
                  <View style={styles.diaryCard}>
                    <View style={styles.cardHeaderRight}>
                      <View style={{flex:1}}>
                        <Text style={styles.diaryDate}>{dayjs(selectedDate).format('YY.MM.DD')}</Text>
                        <Text style={styles.emotionTag}>임시 저장됨</Text> 
                      </View>
                    </View>
                    <Text style={styles.diaryContent} numberOfLines={2} ellipsizeMode="tail">
                      작성 중인 일기가 있습니다.
                    </Text>
                    <TouchableOpacity
                      style={styles.diaryButton}
                      onPress={() => {
                        // 이 카드는 모달에서 "취소"를 눌렀을 때만 보이므로,
                        // 클릭 시 다시 모달을 띄우거나, 바로 이어쓰기로 이동 가능.
                        // 여기서는 다시 모달을 띄워 사용자에게 선택권을 줌.
                        setSelectedDiaryForAction({ diary, dateStr: selectedDate });
                        setIsActionModalVisible(true);
                      }}
                    >
                      <Text style={styles.diaryButtonText}>이어서 쓰기</Text>
                    </TouchableOpacity>
                  </View>
                );
              } else { 
                const fullDetail = diaryDetailMap[diary.diaryId];
                const contentSummary = fullDetail?.transformContent || diary?.summary || '내용 요약 없음';

                return (
                  <View style={styles.diaryCard}>
                    <View style={styles.cardHeaderLeft}>
                      <Image
                        source={diary.emotionType ? emotionImage(diary.emotionType) : require('../assets/grayCircle.png')}
                        style={styles.emotionIcon}
                      />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.diaryDate}>
                          {dayjs(selectedDate).format('YY.MM.DD')}
                        </Text>
                        <Text style={styles.emotionTag}>
                          {diary.emotionType ? emotionTypeToKorean(diary.emotionType) : '감정 분석 전'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.diaryContent} numberOfLines={2} ellipsizeMode="tail">
                      {contentSummary}
                    </Text>
                    <TouchableOpacity
                      style={styles.diaryButton}
                      onPress={() => {
                        navigation.navigate('WrittenDiary', {
                          diaryId: diary.diaryId,
                          accessToken: accessToken
                        });
                      }}
                    >
                      <Text style={styles.diaryButtonText}>일기 보러가기</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
            } else { 
              return (
                <View style={styles.diaryCard}>
                  <View style={styles.cardHeaderRight}>
                    <View style={{flex:1}}>
                      <Text style={styles.diaryDate}>{dayjs(selectedDate).format('YY.MM.DD')}</Text>
                      <Text style={styles.emotionTag}>작성되지 않음</Text>
                    </View>
                    <Image
                      source={require('../assets/notyet.png')}
                      style={styles.notyetIcon}
                    />
                  </View>
                  <Text style={styles.noDiaryText}>아직 일기가 작성되지 않았어요!</Text>
                  <TouchableOpacity
                    style={styles.diaryButton}
                    onPress={() => {
                      navigation.navigate('DiaryWriteScreen', {
                        selectedDate: selectedDate,
                        accessToken: accessToken
                      });
                    }}
                  >
                    <Text style={styles.diaryButtonText}>일기 쓰러가기</Text>
                  </TouchableOpacity>
                </View>
              );
            }
          })()}

          <Modal
            transparent={true}
            visible={isActionModalVisible}
            onRequestClose={handleModalCancel}
            animationType="fade"
          >
            <TouchableWithoutFeedback onPress={handleModalCancel}>
              <View style={modalStyles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={modalStyles.modalContainer}>
                    <Text style={modalStyles.modalTitle}>작업 선택</Text>
                    <Text style={modalStyles.modalMessage}>임시 저장된 일기가 있습니다. 어떤 작업을 하시겠습니까?</Text>
                    <View style={modalStyles.modalButtonContainer}>
                      <TouchableOpacity style={[modalStyles.modalButton, modalStyles.continueButton]} onPress={handleModalContinue}>
                        <Text style={modalStyles.modalButtonText}>이어서 쓰기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[modalStyles.modalButton, modalStyles.deleteButton]} onPress={handleModalDeleteAndWriteNew}>
                        <Text style={modalStyles.modalButtonText}>다시 쓰기</Text>
                      </TouchableOpacity>
                      {/* <TouchableOpacity style={[modalStyles.modalButton, modalStyles.cancelButton]} onPress={handleModalCancel}>
                        <Text style={modalStyles.modalButtonText}>취소</Text>
                      </TouchableOpacity> */}
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomItem} onPress={handleLogout}>
              <Image source={logoutIcon} style={styles.bottomIcon} />
              <Text style={styles.bottomLabel}>로그아웃</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomItem}
              onPress={() => navigation.navigate('RecapScreen', { accessToken })}
            >
              <Image source={recapIcon} style={styles.bottomIcon} />
              <Text style={styles.bottomLabel}>감정통계</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <Image source={settingsIcon} style={styles.bottomIcon} />
              <Text style={styles.bottomLabel}>설정</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const modalStyles = ModalStyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%', // 가로로 배치된 버튼들을 위해 너비 약간 조정
    maxWidth: 400, // 큰 화면에서의 최대 너비 설정
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#555',
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row', // 버튼들을 가로로 배열
    justifyContent: 'space-between', // 버튼 사이에 공간 배분
    width: '100%', // 컨테이너가 모달 내용 영역의 전체 너비를 차지하도록 설정
  },
  modalButton: {
    flex: 1, // 각 버튼이 modalButtonContainer 내에서 동일한 공간을 차지
    paddingVertical: 12, // 텍스트 가독성을 위한 세로 패딩 조정
    paddingHorizontal: 10, // 가로 패딩
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5, // 버튼 사이에 약간의 가로 여백 추가
  },
  continueButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 15, // 필요시 폰트 크기 조정
    fontWeight: '600',
    textAlign: 'center', // 텍스트를 버튼 중앙에 정렬
  },
});