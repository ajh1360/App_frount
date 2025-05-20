import { StyleSheet, Dimensions } from 'react-native';

const screenHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0E7',
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
    marginVertical: 15,
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
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaTextGroup: {
    marginLeft: 12,
  },
  date: {
    fontSize: 28,
    fontWeight: '600',
  },
  diaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 0,
    textAlignVertical: 'top',
    minHeight: 200,          
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  
  submitText: {
    fontSize: 20,
    fontWeight: 450,
    color: '#3C5741',
    paddingHorizontal: 10,
    paddingVertical: 25,
  },

});
