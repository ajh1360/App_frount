import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DiaryResultScreen({ route }) {
  const { content, date } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.content}>{content}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.grayBtn}>
          <Text style={styles.btnText}>수정할래요</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.redBtn}>
          <Text style={styles.btnText}>피드백 받을래요</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 80, flex: 1, backgroundColor: '#fff' },
  date: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    backgroundColor: '#f7f7f7',
    padding: 16,
    borderRadius: 15,
    marginBottom: 30
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  grayBtn: {
    backgroundColor: '#aaa',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25
  },
  redBtn: {
    backgroundColor: '#e88',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

