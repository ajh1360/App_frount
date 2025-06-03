import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASEURL = 'http://ceprj.gachon.ac.kr:60021';

export default function AnnouncementsScreen() {
  const navigation = useNavigation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);

    try {
      const userToken = await AsyncStorage.getItem('accessToken');
      if (!userToken) {
        Alert.alert("오류", "로그인이 필요합니다. 로그인 화면으로 이동합니다.");
        navigation.navigate('Login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${BASEURL}/api/notices?page=${currentPage}&size=${PAGE_SIZE}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`공지사항을 불러오는데 실패했습니다. (상태: ${response.status})\n${errorText}`);
      }

      const data = await response.json();
      setAnnouncements(data.notices || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.currentPage || 0);
    } catch (e) {
      console.error("Fetch announcements error:", e);
      setError(e.message);
      Alert.alert("오류", e.message || "공지사항을 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.announcementItem}>
      <Text style={styles.announcementTitle}>{item.title}</Text>
      <Text style={styles.announcementDate}>공지 ID: {item.noticeId}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>공지사항을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.errorText}>오류: {error}</Text>
        <TouchableOpacity onPress={fetchAnnouncements} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>공지사항</Text>
        <View style={{ width: 30 }} />
      </View>

      {announcements.length === 0 ? (
        <View style={styles.containerCentered}>
          <Text>등록된 공지사항이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          renderItem={renderItem}
          keyExtractor={(item) => item.noticeId.toString()}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
    paddingTop: 25,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listContentContainer: {
    paddingHorizontal: 20,
  },
  announcementItem: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  announcementDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
});