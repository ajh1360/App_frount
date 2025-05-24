import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { styles } from './styleSheet/mainHome_style';
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

  useEffect(() => {
    // This effect is for when navigating back to MainHome with a specific date selected
    // e.g., from a notification or after creating a diary for a past date.
    if (route.params?.selectedDate && route.params.selectedDate !== selectedDate) {
        const newSelectedDate = route.params.selectedDate;
        setSelectedDate(newSelectedDate);
        const parsedDate = dayjs(newSelectedDate);
        // Only change month if the selectedDate is in a different month than current
        if (!parsedDate.isSame(currentDate, 'month')) {
            setCurrentDate(parsedDate.startOf('month'));
        } else {
            // If it's the same month, just fetch for the current month again
            // This ensures diaryData is up-to-date if a new diary was just added
            fetchDiaryListFor(currentDate);
        }
    }
  }, [route.params?.selectedDate]);


  const fetchDiaryListFor = async (targetDate) => {
    try {
      const res = await fetch(
        `http://ceprj.gachon.ac.kr:60021/api/diaries?year=${targetDate.year()}&month=${targetDate.month() + 1}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res.ok) throw new Error('일기 목록 가져오기 실패');
      const data = await res.json();
      setDiaryData(data.diaries || []);
    } catch (err) {
      console.error('❌ diary list (fetch for target) error:', err.message);
    }
  };

  // useEffect to fetch diary list when currentDate changes (e.g., month change)
  useEffect(() => {
    fetchDiaryListFor(currentDate);
  }, [currentDate, accessToken]); // Added accessToken dependency

  // useEffect to fetch detail if selectedDate changes and a diary exists for it
   useEffect(() => {
    if (selectedDate) {
      const diaryEntry = getDiaryByDate(selectedDate);
      if (diaryEntry && !diaryDetailMap[diaryEntry.diaryId]) {
        fetchDiaryDetail(diaryEntry.diaryId);
      }
    }
  }, [selectedDate, diaryData]); // diaryData is important here


  const fetchDiaryDetail = async (diaryId) => {
    if (diaryDetailMap[diaryId]) return; // Avoid re-fetching if already present
    try {
      const res = await fetch(
        `http://ceprj.gachon.ac.kr:60021/api/diaries/${diaryId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res.ok) throw new Error(`일기 상세 실패 (ID: ${diaryId})`);
      const data = await res.json();
      setDiaryDetailMap((prev) => ({ ...prev, [diaryId]: data }));
    } catch (err) {
      console.error('❌ diary detail error:', err.message);
    }
  };


  const changeMonth = (offset) => {
    setCurrentDate(prevDate => prevDate.add(offset, 'month').startOf('month'));
    setSelectedDate(null); // Clear selected date when month changes
    // setDiaryData([]); // Let fetchDiaryListFor handle data update via useEffect on currentDate
    setDiaryDetailMap({}); // Clear details for the new month
  };

  const getDiaryByDate = (dateStr) =>
    diaryData.find((d) => d.writtenDate === dateStr);

  const startOfMonth = currentDate.startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0 (Sun) to 6 (Sat)

  const calendarDays = [];
  // Add blank cells for days before the start of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Add actual day cells
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(currentDate.date(i));
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // Ensure 'Login' screen is defined in your navigator
      });
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
    }
  };

  // Effect to listen for focus event to refresh data if needed
  // This is useful if a diary is added/updated and we navigate back to MainHome
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refetch the diary list for the current month when the screen comes into focus
      // This helps if a diary was added in DiaryWriteScreen and then navigated back.
      // If route.params.selectedDate is set, the other useEffect will handle specific date logic.
      // Otherwise, just refresh the current month's view.
      if (!route.params?.selectedDate) {
          fetchDiaryListFor(currentDate);
      }
    });
    return unsubscribe;
  }, [navigation, currentDate, route.params?.selectedDate]);


  return (
    <TouchableWithoutFeedback onPress={() => { setSelectedDate(null); Keyboard.dismiss(); }}>
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

                const dateStr = date.format('YYYY-MM-DD');
                const diary = getDiaryByDate(dateStr);
                const icon = diary
                  ? emotionImage(diary.emotionType)
                  : require('../assets/grayCircle.png');

                return (
                  <TouchableOpacity
                    key={dateStr} // Use dateStr for a more stable key
                    style={[
                        styles.dayWrapper,
                        selectedDate === dateStr ? styles.selectedDayWrapper : {}
                    ]}
                    onPress={() => {
                      setSelectedDate(dateStr);
                      // fetchDiaryDetail will be called by useEffect based on selectedDate change
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                        styles.dayText,
                        date.isSame(dayjs(), 'day') ? styles.todayText : {}
                    ]}>{date.date()}</Text>
                    <View style={styles.iconCircle}>
                      <Image source={icon} style={styles.dayIcon} resizeMode="cover" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {selectedDate && (
            <View style={styles.diaryCard}>
              <View style={
                getDiaryByDate(selectedDate)
                  ? styles.cardHeaderLeft
                  : styles.cardHeaderRight
              }>
                {getDiaryByDate(selectedDate) ? (
                  <>
                    <Image
                      source={emotionImage(getDiaryByDate(selectedDate)?.emotionType)}
                      style={styles.emotionIcon}
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.diaryDate}>
                        {dayjs(selectedDate).format('YY.MM.DD')}
                      </Text>
                      <Text style={styles.emotionTag}>
                        {emotionTypeToKorean(getDiaryByDate(selectedDate)?.emotionType)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={{flex:1}}>
                      <Text style={styles.diaryDate}>{dayjs(selectedDate).format('YY.MM.DD')}</Text>
                      <Text style={styles.emotionTag}>작성되지 않음</Text>
                    </View>
                    <Image
                      source={require('../assets/notyet.png')}
                      style={styles.notyetIcon}
                    />
                  </>
                )}
              </View>

              {getDiaryByDate(selectedDate) ? (
                <>
                  <Text style={styles.diaryContent} numberOfLines={2} ellipsizeMode="tail">
                    {(() => {
                      const diary = getDiaryByDate(selectedDate);
                      const fullDetail = diaryDetailMap[diary?.diaryId]; // Use optional chaining
                      // Prefer full detail content if available, otherwise summary
                      const content = fullDetail?.transformContent || diary?.summary || '내용을 불러오는 중...';
                      return content; // Let Text numberOfLines handle truncation
                    })()}
                  </Text>
                  <TouchableOpacity
                    style={styles.diaryButton}
                    onPress={() => {
                      const diary = getDiaryByDate(selectedDate);
                      if (diary) {
                        navigation.navigate('WrittenDiary', { // Ensure 'WrittenDiary' screen is defined
                          diaryId: diary.diaryId,
                          accessToken: accessToken
                        });
                      }
                    }}
                  >
                    <Text style={styles.diaryButtonText}>일기 보러가기</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.noDiaryText}>아직 일기가 작성되지 않았어요!</Text>
                  <TouchableOpacity
                    style={styles.diaryButton}
                    onPress={() => {
                      navigation.navigate('DiaryWriteScreen', {
                        selectedDate: selectedDate, // Pass the selected date (YYYY-MM-DD)
                        accessToken: accessToken
                      });
                    }}
                  >
                    <Text style={styles.diaryButtonText}>일기 쓰러가기</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* 하단 네비게이션 바 */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomItem} onPress={handleLogout}>
              <Image source={logoutIcon} style={styles.bottomIcon} />
              <Text style={styles.bottomLabel}>로그아웃</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomItem}
              onPress={() => navigation.navigate('RecapScreen', { accessToken })} // Ensure 'RecapScreen' is defined
            >
              <Image source={recapIcon} style={styles.bottomIcon} />
              <Text style={styles.bottomLabel}>감정통계</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomItem}
              onPress={() => navigation.navigate('Settings')} // Ensure 'Settings' screen is defined
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