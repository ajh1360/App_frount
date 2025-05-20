import { StyleSheet, Dimensions } from 'react-native';

const screenHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0E7', // 연한 초록 배경
  },
  whiteBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: screenHeight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 }, 
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8, 
  },
  divider: {
    height: 1,
    backgroundColor: '#C6C6C6',
    marginVertical: 15, // 위아래 여백
    marginHorizontal: 10,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 600,
  },
  logo: {
    width: 80,
    height: 30,
    resizeMode: 'contain',
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  metaTextGroup: {
    marginLeft: 12,
  },
  date: {
    fontSize: 28,
    fontWeight: '600',
  },
  diaryContentBox: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    borderWidth: 0.7,
    borderColor: '#C6C6C6',
  },
  diaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginHorizontal: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  smallButton_su: {
    backgroundColor: '#787878',
    width: '30%',                     // ✅ 버튼 너비 같게 설정
    paddingVertical: 15,             // ✅ 높이 키움
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  smallButton_yee: {
    backgroundColor: '#DBA5A5',
    width: '30%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  centeredButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',  // ✅ 간격 균등 배치
    marginTop: 20,
  },
});
