import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image
} from 'react-native';
import { styles } from './styleSheet/recap_style';
import { useNavigation, CommonActions } from '@react-navigation/native';
import recapImage from '../assets/recap.png';

import { emotionLabelMap, emotionFeedbackMap, emotionLabelMap_e } from '../assets/emotions';

function getTopEmotion(emotionList) {
  const priority = ['SAD', 'HURT', 'ANXIETY', 'ANGRY', 'EMBARRASSED', 'JOY'];
  for (const emotion of priority) {
    if (emotionList.some(e => e.type === emotion)) {
      return emotion;
    }
  }
  return null;
}

export default function RecapScreen({ route }) {
  const accessToken = route?.params?.accessToken ?? null;
  const [emotionData, setEmotionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (!accessToken) return;

    const fetchEmotionData = async () => {
      try {
        const response = await fetch('http://ceprj.gachon.ac.kr:60021/api/recap/emotion', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('서버 응답 오류');

        const data = await response.json();
        const formatted = Object.entries(data).map(([type, count]) => ({
          type,
          label: emotionLabelMap[type],
          count,
        }));

        setEmotionData(formatted);
      } catch (err) {
        console.error('감정 통계 요청 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmotionData();
  }, [accessToken]);

  const maxCount = Math.max(...emotionData.map(e => e.count), 1);
  const mostFeltEmotions = emotionData.filter(e => e.count === maxCount && maxCount > 0);
  const topEmotionType = getTopEmotion(mostFeltEmotions);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.whiteBox}>
        {/* 헤더 */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'MainHome', params: { accessToken } }],
                })
              );
            }}
          >
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/echoLog_logo.png')}
            style={styles.logoImage}
          />
        </View>

        {/* 차트 */}
        <View style={styles.chartContainer}>
          {emotionData.map((e, idx) => {
            const barHeight = Math.max((e.count / maxCount) * 100, 8);
            const isMax = mostFeltEmotions.some(m => m.type === e.type);

            return (
              <View key={idx} style={styles.barItem}>
                <View style={styles.barArea}>
                  <Text style={[styles.barCountInBar, { bottom: `${barHeight}%` }]}>
                    {e.count}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      isMax && styles.barHighlight,
                      { height: `${barHeight}%` },
                    ]}
                  />
                </View>

                {/* ✅ 실선 + 라벨 묶기 */}
                <View style={styles.barBaseArea}>
                  <View style={styles.barBaseLine} />
                  <Text style={styles.barLabel}>{e.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* 요약 문장 */}
        <Text style={styles.summaryText}>
          최근 14일 동안 제일 많았던 감정은{'\n'}
          <Text style={styles.highlight}>
            {mostFeltEmotions.map(e => `‘${emotionLabelMap_e[e.type]}’`).join(', ')}
          </Text>
          이었어요.
        </Text>

        {/* 피드백 */}
        <View style={[styles.feedbackCard, { flexDirection: 'row', alignItems: 'center' }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedbackText}>
              {emotionFeedbackMap[topEmotionType]}
            </Text>
          </View>
          <Image source={recapImage} style={styles.feedbackImage} />
        </View>
      </View>
    </ScrollView>
  );
}
