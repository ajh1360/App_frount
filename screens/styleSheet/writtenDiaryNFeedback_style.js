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
      backgroundColor: '#ccc',
      marginVertical: 24, 
    },
    navRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
    },
    backButton: {
      fontSize: 24,
      fontWeight: 'bold',
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
    emotionIcon: {
      width: 50,
      height: 50,
    },
    metaTextGroup: {
      marginLeft: 12,
    },
    date: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    tag: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    buttonGroup: {
      flexDirection: 'row',
      marginLeft: 'auto',
    },
    smallButton_won: {
      backgroundColor: '#DBA5A5',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: 6,
    },
    smallButton_su: {
      backgroundColor: '#787878',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: 6,
    },
    buttonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFF',
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
    },
    feedbackCard: {
      flexDirection: 'row',
      marginTop: 20,
      alignItems: 'flex-start',
      
    },
    characterImage: {
      width: 60,
      height: 70,
      marginRight: 12,
    },
    feedbackBubble: {
      flex: 1,
      backgroundColor: '#f5f0ff',
      padding: 14,
      borderRadius: 20,
      borderWidth: 0.7,                
      borderColor: '#C6C6C6', 
      position: 'relative',
    },
    feedbackText: {
      fontSize: 15,
      color: '#444',
      lineHeight: 22,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      width: '85%',
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 20,
      maxHeight: '80%',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 15,
      zIndex: 1,
    },
    closeText: {
      fontSize: 20,
      color: '#999',
    },
    modalContent: {
      marginTop: 30,
      fontSize: 16,
      lineHeight: 24,
      color: '#333',
    },  
    modalImage: {
      width: 70,
      height: 70,
      alignSelf: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 15,
    },
    modalBtnRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
    },
    modalBtnCancel: {
      backgroundColor: '#EDEDED',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 14,
    },
    modalBtnConfirm: {
      backgroundColor: '#DBA5A5',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 14,
    },
    modalBtnText: {
      fontSize: 14,
      color: '#444',
    },
    modalBtnTextWhite: {
      fontSize: 14,
      color: '#FFF',
    },
    
    //피드백 맘에 드나 
    reactionContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
    },
    reactionIcon: {
      width: 20,
      height: 20,
      marginHorizontal: 6,
    },
    likeit: { 
      fontSize: 11,
      color: '#C6C6C6'

    },

    //우울증 전문가 도움 추천 부분
    depressionBox: { 
      marginTop: 20,
      padding: 16,
      borderRadius: 20,
      marginTop: 40,
      backgroundColor: '#EFEFFF',
      borderWidth: 0.7,                
      borderColor: '#C6C6C6', 
    },
    
    depressionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: '#424242',
      marginBottom: 8,
      textAlign: 'center',
    },
    
    depressionContact: {
      fontSize: 14,
      color: '#424242',
      textAlign: 'center',
    },
    
    depressionScore: {
      fontSize: 14,
      fontWeight: '500',
      color: '#6C6C6C',
      textAlign: 'center',
    },
    
    depressionNote: {
      fontSize: 11,
      color: '#6C6C6C',
      marginTop: 8,
      lineHeight: 16,
      textAlign: 'center',
    },
    blurredOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      zIndex: 10,
    },
    
    blurredText: {
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '300',
      color: '#333',
      lineHeight: 24,
      textShadowColor: '#fff',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 2,
    }
  });