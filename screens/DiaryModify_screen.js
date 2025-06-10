import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { styles } from './styleSheet/DiaryModify_style';

export default function DiaryModifyScreen({ route }) {
  const { diaryId, accessToken, from } = route?.params ?? {};
  const navigation = useNavigation();
  const [diary, setDiary] = useState(null);
  const [content, setContent] = useState('');

  // 일기 상세 조회
  useEffect(() => {
    fetch(`http://ceprj.gachon.ac.kr:60021/api/diaries/${diaryId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('일기 조회 실패');
        return res.json();
      })
      .then((data) => {
        setDiary(data);
        setContent(data.transformContent || '');
      })
      .catch((err) => {
        console.error('일기 불러오기 실패:', err);
        Alert.alert('오류', '일기 불러오기 중 문제가 발생했습니다.');
      });
  }, [diaryId]);

  // 등록 버튼 로직
  const handleSubmit = async () => {
    try {
      const { transformDiaryId } = diary;
      if (!transformDiaryId) {
        Alert.alert('에러', '변환된 일기 ID가 없습니다.');
        return;
      }

      // 변환된 일기 업데이트
      const res1 = await fetch(
        `http://ceprj.gachon.ac.kr:60021/api/transform-diaries/${transformDiaryId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content }),
        }
      );
      if (!res1.ok) throw new Error('일기 등록 실패');

      // 최신 일기 다시 조회
      const res2 = await fetch(
        `http://ceprj.gachon.ac.kr:60021/api/diaries/${diaryId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res2.ok) throw new Error('일기 재조회 실패');
      const updatedDiary = await res2.json();

      // 3. 감정 타입 조회
      let emotionType = '';
      if (updatedDiary.emotionId) {
        const emotionRes = await fetch(
          `http://ceprj.gachon.ac.kr:60021/api/emotions/${updatedDiary.emotionId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (emotionRes.ok) {
          const emotionData = await emotionRes.json();
          emotionType = emotionData.emotionType;
        }
      }

      // 우울증 결과 조회
      const depressionId = updatedDiary.depressionId;
      const res3 = await fetch(
        `http://ceprj.gachon.ac.kr:60021/api/depressions/${depressionId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res3.ok) throw new Error('우울증 결과 조회 실패');
      const depressionData = await res3.json();

      // WrittenDiary 화면으로 이동 + alert 조건
      navigation.navigate('WrittenDiary', {
        accessToken,
        diaryId,
        emotionType, // 감정 타입 넘김
        isDepressed: depressionData.result === true,
        showEmotionAlert: (from === 'DiaryConfirm' || from === 'writtenDiary'),
        showFeedbackBlur: true, //새로 수정!!

      });

    } catch (err) {
      console.error('등록 실패:', err);
      Alert.alert('오류', '등록에 실패했습니다.');
    }
  };

  if (!diary) {
    return (
      <View style={styles.container}>
        <Text>일기 정보를 불러오는 중입니다...</Text>
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

          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.submitText}>등록</Text>
          </TouchableOpacity>
        </View>

        {/* 날짜 표시 */}
        <View style={styles.metaInfoRow}>
          <View style={styles.metaTextGroup}>
            <Text style={styles.date}>
              {dayjs(diary.writtenDate).format('YY.MM.DD')}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />

        {/* 입력창 */}
        <TextInput
          style={[styles.diaryText, { marginBottom: 30 }]}
          multiline
          scrollEnabled={false}
          value={content}
          onChangeText={setContent}
          placeholder="변환된 일기 내용을 입력하세요"
        />
      </View>
    </ScrollView>
  );
}
