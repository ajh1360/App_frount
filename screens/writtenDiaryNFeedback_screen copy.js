import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, Image, ScrollView, TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { emotionImage, emotionTypeToKorean } from '../assets/emotions.js';
import { styles } from './styleSheet/writtenDiaryNFeedback_style.js';

const WrittenDiaryDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { diaryId, accessToken } = route.params;

  const [diary, setDiary] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [userReaction, setUserReaction] = useState(null);
  const [depression, setDepression] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isRewriteModalVisible, setIsRewriteModalVisible] = useState(false);

  useEffect(() => {
    fetchAllDiaryData();
  }, []);

  const fetchAllDiaryData = async () => {
    try {
      const diaryRes = await fetch(`http://ceprj.gachon.ac.kr:60021/api/diaries/${diaryId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!diaryRes.ok) throw new Error('일기 불러오기 실패');
      const diaryData = await diaryRes.json();
      setDiary(diaryData);

      const [emotionRes, feedbackRes, depressionRes] = await Promise.all([
        fetch(`http://ceprj.gachon.ac.kr:60021/api/emotions/${diaryData.emotionId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`http://ceprj.gachon.ac.kr:60021/api/diary-feedbacks/${diaryData.diaryFeedbackId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`http://ceprj.gachon.ac.kr:60021/api/depressions/${diaryData.depressionId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const emotionData = await emotionRes.json();
      const feedbackData = await feedbackRes.json();
      const depressionData = await depressionRes.json();

      setEmotion(emotionData);
      setFeedback(feedbackData);
      setUserReaction(feedbackData.userReaction);
      setDepression(depressionData);
    } catch (err) {
      console.error('❌ 통합 API 실패:', err.message);
    }
  };

  const updateUserReaction = async (reaction) => {
    try {
      const res = await fetch(
          `http://ceprj.gachon.ac.kr:60021/api/diary-feedbacks/${feedback.diaryFeedbackId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ userReaction: reaction, content: feedback.content }),
          }
      );

      if (!res.ok) throw new Error('반응 업데이트 실패');
      setUserReaction(reaction);
      console.log('✅ 반응 업데이트 완료:', reaction);
    } catch (err) {
      console.error('❌ 반응 PUT 실패:', err.message);
    }
  };

  if (!diary || !emotion || !feedback || !depression) {
    return <View style={styles.container}><Text>불러오는 중...</Text></View>;
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

          {/* 감정 메타 */}
          <View style={styles.metaInfoRow}>
            <Image source={emotionImage(emotion.emotionType)} style={styles.emotionIcon} />
            <View style={styles.metaTextGroup}>
              <Text style={styles.date}>
                {new Date(diary.writtenDate).toLocaleDateString('ko-KR', {
                  year: '2-digit', month: '2-digit', day: '2-digit'
                })}
              </Text>
              <Text style={styles.tag}>{emotionTypeToKorean(emotion.emotionType)}</Text>
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.smallButton_won} onPress={() => setShowOriginal(true)}>
                <Text style={styles.buttonText}>원본</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton_su} onPress={() => setIsRewriteModalVisible(true)}>
                <Text style={styles.buttonText}>수정</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.diaryContentBox}>
            <Text style={styles.diaryText}>{diary.transformContent}</Text>
          </View>

          <View style={styles.divider} />

          {/* 피드백 */}
          <View style={styles.feedbackCard}>
            <Image source={require('../assets/feedback.png')} style={styles.characterImage} />
            <View style={styles.feedbackBubble}>
              <Text style={styles.feedbackText}>{feedback.content}</Text>
              <View style={styles.reactionContainer}>
                <Text style={styles.likeit}>맘에 들었나요?</Text>
                <TouchableOpacity onPress={() => updateUserReaction('LIKE')}>
                  <Image
                      source={
                        userReaction === 'LIKE'
                            ? require('../assets/dislike_like/Like_pushed.png')
                            : require('../assets/dislike_like/Like_first.png')
                      }
                      style={styles.reactionIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => updateUserReaction('DISLIKE')}>
                  <Image
                      source={
                        userReaction === 'DISLIKE'
                            ? require('../assets/dislike_like/Dislike_pushed.png')
                            : require('../assets/dislike_like/Dislike_first.png')
                      }
                      style={styles.reactionIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 우울 분석 */}
          {depression.result && (
              <View style={styles.depressionBox}>
                <Text style={styles.depressionTitle}>
                  최근 14일간의 일기를 분석해봤는데,{'\n'}
                  요즘 너무 우울해하는 것 같아 걱정돼…🥲{'\n'}
                  전문가 상담 또는 기관의 도움을 받는 걸 추천해!
                </Text>
                <Text style={styles.depressionContact}>👇정신건강 위기상담전화👇{'\n'}1577-0199 또는 129</Text>
                <Text style={styles.depressionScore}>
                  {'\n'}최근 2주 간 일기 기반 점수{'\n'}• PHQ-9: {depression.phq9Score}점{'\n'}• GAD-7: {depression.gad7Score}점
                </Text>
                <Text style={styles.depressionNote}>
                  *PHQ·GAD는 우울증 증상을 측정, 진단하는 설문지로{'\n'}인지적, 정서적, 신체적 증상의 변화를 평가함
                </Text>
              </View>
          )}

          {/* 원본 보기 모달 */}
          <Modal visible={showOriginal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowOriginal(false)}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                <ScrollView>
                  <Text style={styles.modalContent}>{diary.content}</Text>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* 수정 모달 */}
          <Modal visible={isRewriteModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Image source={require('../assets/rewrite.png')} style={styles.modalImage} />
                <Text style={styles.modalTitle}>수정은 2번까지만 가능해요!{'\n'}수정할래요?</Text>
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setIsRewriteModalVisible(false)}>
                    <Text style={styles.modalBtnText}>아니요</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalBtnConfirm} 
                  onPress={() => {
                    setIsRewriteModalVisible(false);
                    navigation.navigate('DiaryModify', {
                      diaryId,
                      accessToken,
                    });
                  }}>
                    <Text style={styles.modalBtnTextWhite}>할래요</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
  );
};

export default WrittenDiaryDetailScreen;
