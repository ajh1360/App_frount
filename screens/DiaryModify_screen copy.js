import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, TextInput, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { styles } from './styleSheet/DiaryModify_style';

export default function DiaryModifyScreen({ route }) {
  const { diaryId, accessToken } = route?.params ?? {};
  const navigation = useNavigation();
  const [diary, setDiary] = useState(null);
  const [content, setContent] = useState('');

  // ✅ 일기 상세 조회 (GET /api/diaries/{diaryId})
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
        console.error('❌ 일기 불러오기 실패:', err);
        Alert.alert('오류', '일기 불러오기 중 문제가 발생했습니다.');
      });
  }, [diaryId]);

  // ✅ 등록 버튼 → PUT /api/transform-diaries/{transformDiaryId}
  const handleSubmit = async () => {
    try {
      const { transformDiaryId } = diary;
      if (!transformDiaryId) {
        Alert.alert('에러', '변환된 일기 ID가 없습니다.');
        return;
      }

      const response = await fetch(
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

      if (!response.ok) throw new Error('등록 실패');

      // ✅ 등록 완료 → MainHomeScreen으로 이동
      navigation.navigate('MainHome', { accessToken, selectedDate: diary.writtenDate, });
    } catch (err) {
      console.error('❌ 등록 실패:', err);
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

        {/* 변환된 일기 수정 입력창 */}
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

