import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { styles } from './styleSheet/DiaryConfirm_style';

export default function DiaryConfirmScreen({ route }) {
  const { diaryId, accessToken } = route.params;
  const navigation = useNavigation();

  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const res = await fetch(`http://ceprj.gachon.ac.kr:60021/api/diaries/${diaryId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error('일기 불러오기 실패');
        const data = await res.json();
        setDiary(data);
      } catch (error) {
        console.error('일기 가져오기 실패:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDiary();
  }, [diaryId]);

  const handleConfirm = async () => {
    try {
      // 1. 일기 정보 최신 조회
      const diaryRes = await fetch(`http://ceprj.gachon.ac.kr:60021/api/diaries/${diaryId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!diaryRes.ok) throw new Error('일기 조회 실패');
      const diaryData = await diaryRes.json();

      // 2. 감정 조회
      let emotionType = '';
      if (diaryData.emotionId) {
        const emoRes = await fetch(`http://ceprj.gachon.ac.kr:60021/api/emotions/${diaryData.emotionId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (emoRes.ok) {
          const emoData = await emoRes.json();
          emotionType = emoData.emotionType;
        }
      }

      // 3. 우울 결과 조회
      const depRes = await fetch(`http://ceprj.gachon.ac.kr:60021/api/depressions/${diaryData.depressionId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const depData = await depRes.json();

      // 4. WrittenDiary로 이동 (모달 조건 포함)
      navigation.navigate('WrittenDiary', {
        diaryId,
        accessToken,
        emotionType,
        isDepressed: depData.result === true,
        showEmotionAlert: true, // 모달 띄우기
        showFeedbackBlur: true, //새로 수정!!!
      });
    } catch (error) {
      console.error('확정 처리 실패:', error.message);
      Alert.alert('오류', '일기 확정 중 문제가 발생했습니다.');
    }
  };

  if (loading || !diary) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.whiteBox}>
        {/* 상단 네비게이션 */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Image source={require('../assets/echoLog_logo.png')} style={styles.logo} />
        </View>

        {/* 날짜 */}
        <View style={styles.metaInfoRow}>
          <View style={styles.metaTextGroup}>
            <Text style={styles.date}>
              {dayjs(diary.writtenDate).format('YY.MM.DD')}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />

        {/* 일기 내용 */}
        <Text style={[styles.diaryText, { marginBottom: 30 }]}>
          {diary.transformContent || '변환된 일기 내용이 없습니다.'}
        </Text>

        <View style={styles.divider} />

        {/* 버튼 그룹 */}
        <View style={styles.centeredButtonGroup}>
          <TouchableOpacity
            style={styles.smallButton_su}
            onPress={() =>
              navigation.navigate('DiaryModify', {
                diaryId,
                accessToken,
                from: 'DiaryConfirm',
              })
            }
          >
            <Text style={styles.buttonText}>수정할래요</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallButton_yee}
            onPress={handleConfirm}
          >
            <Text style={styles.buttonText}>이걸로 쓸래요</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
