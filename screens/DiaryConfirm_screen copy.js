import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator
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
        console.error('❌ 일기 가져오기 실패:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDiary();
  }, [diaryId]);

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

          {/* 날짜 + 아래 선 */}
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
              })
            }
          >
            <Text style={styles.buttonText}>수정할래요</Text>
          </TouchableOpacity>

            <TouchableOpacity
                style={styles.smallButton_yee}
                onPress={() =>
                    navigation.navigate('MainHome', {
                      selectedDate: diary.writtenDate,
                      accessToken: accessToken
                    })
                }
            >
              <Text style={styles.buttonText}>이걸로 쓸래요</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
  );
}

