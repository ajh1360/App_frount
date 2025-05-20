// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import dayjs from 'dayjs';

// export default function DiaryWriteScreen() {
//   const navigation = useNavigation();
//   const [content, setContent] = useState('');
//   const [isRecognizing, setIsRecognizing] = useState(false);
//   const [recognizedText, setRecognizedText] = useState('');

//   const today = dayjs().format('YY.MM.DD');

//   const handleVoiceRecognition = () => {
//     // 음성인식 시작/종료 토글
//     if (!isRecognizing) {
//       // 실제 음성 인식 로직은 외부 라이브러리 연동 필요
//       setIsRecognizing(true);
//       setTimeout(() => {
//         const fakeResult = '학교 끝나고 집 가는데 날씨가 진짜 미쳤다라.';
//         setRecognizedText(fakeResult);
//         setContent(fakeResult); // 자동 입력
//         setIsRecognizing(false);
//       }, 2000); // 예시로 2초 뒤 텍스트 입력
//     }
//   };

//   const handleSubmit = () => {
//     navigation.navigate('DiaryResult', { content, date: today });
//   };

//   return (
//     <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//       <Text style={styles.date}>{today}</Text>

//       <TextInput
//         placeholder="오늘은 무슨 일이 있었어?"
//         value={content}
//         onChangeText={setContent}
//         style={styles.input}
//         multiline
//       />

//       <TouchableOpacity onPress={handleVoiceRecognition} style={styles.voiceBtn}>
//         <Text style={styles.voiceBtnText}>
//           {isRecognizing ? '듣는 중...' : '편하게 음성작성🎙️'}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
//         <Text style={styles.submitText}>등록</Text>
//       </TouchableOpacity>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, paddingTop: 80, backgroundColor: '#f5f9f6', flex: 1 },
//   date: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     height: 200,
//     textAlignVertical: 'top',
//     backgroundColor: '#fff',
//     marginBottom: 15,
//   },
//   voiceBtn: {
//     backgroundColor: '#e0f3ea',
//     padding: 12,
//     borderRadius: 25,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   voiceBtnText: {
//     color: '#34a47c',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   submitBtn: {
//     backgroundColor: '#000',
//     padding: 14,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   submitText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });


import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';

export default function DiaryWriteScreen() {
  const navigation = useNavigation();
  const [content, setContent] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);

  const today = dayjs().format('YY.MM.DD');

  const handleVoiceRecognition = () => {
    if (!isRecognizing) {
      setIsRecognizing(true);
      setTimeout(() => {
        const fakeResult = '학교 끝나고 집 가는데 날씨가 진짜 미쳤다라.';
        setContent(fakeResult);
        setIsRecognizing(false);
      }, 2000);
    }
  };

  const handleSubmit = () => {
    navigation.navigate('DiaryResult', { content, date: today });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* 상단바 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.submitText}>등록</Text>
          </TouchableOpacity>
        </View>

        {/* 날짜 */}
        <Text style={styles.date}>{today}</Text>
        <View style={styles.separator} />

        {/* 입력창 */}
        <TextInput
          placeholder="오늘은 무슨 일이 있었어?"
          placeholderTextColor="#aaa"
          value={content}
          onChangeText={setContent}
          style={styles.input}
          multiline
          textAlignVertical="top"
        />

        {/* 음성버튼 */}
        <TouchableOpacity onPress={handleVoiceRecognition} style={styles.voiceBtn}>
          <Text style={styles.voiceBtnText}>
            {isRecognizing ? '듣는 중...' : '편하게 음성작성🎙️'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'white',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  date: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'left',
    marginTop: 10,
    marginBottom: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginBottom: 16,
  },
  input: {
    fontSize: 18,
    color: 'black',
    height: 200,
    padding: 0,
  },
  voiceBtn: {
    backgroundColor: '#e0f3ea',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  voiceBtnText: {
    color: '#34a47c',
    fontWeight: '600',
    fontSize: 14,
  },
  submitText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
});
