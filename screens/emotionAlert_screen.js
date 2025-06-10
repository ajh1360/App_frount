import {React, useEffect} from 'react';
import {
  Modal, View, Text, TouchableWithoutFeedback, StyleSheet, Image
} from 'react-native';
import { emotionLabelMap } from '../assets/emotions';

export default function EmotionAnalysisAlert({ visible, emotionType, isDepressed, onClose }) {

  useEffect(() => {
    console.log('🧪 [Alert] visible:', visible, '| isDepressed:', isDepressed);
  }, [visible, isDepressed]);
  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertBox}>
              <Image source={require('../assets/hamster_loading_char.png')} style={styles.icon} />
              <Text style={styles.title}>
                잠깐만요!{'\n'}햄식이가 일기 속 감정을 분석했어요.🧸
              </Text>
              <Text style={styles.message}>
                오늘 일기에서 감지된 가장 강한 감정은{'\n'}
                바로 <Text style={styles.emotion}>‘{emotionLabelMap[emotionType]}’</Text>이에요.
              </Text>
              {isDepressed && (
                <Text style={styles.warning}>
                  {'\n'}지난 14일간의 일기 분석 결과 걱정되는 부분이 많아 햄식이가 GAD, PHQ 검사를 해드렸어요.{'\n'}
                  ✨ 하단의 진단결과를 확인해봐요! ✨
                </Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: 300,
    alignItems: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
  emotion: {
    fontWeight: 'bold',
    color: '#F99',
  },
  warning: {
    fontSize: 13,
    textAlign: 'center',
    color: '#FF5555',
    marginTop: 0,
  },
});
