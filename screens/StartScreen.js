import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Image
} from 'react-native';
import PropTypes from 'prop-types';

StartScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
    }).isRequired,
};

export default function StartScreen({ navigation }) {
    const handleNavigateToSignUp = () => {
        navigation.navigate('SignUp');
    };

    const handleNavigateToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/echoLog_logo.png')} 
                        style={styles.logoImage} 
                        resizeMode="contain"
                    />
                </View>
            </View>

            <View style={styles.mainContentSection}>
                <Text style={styles.mainCatchphrase}>오늘 하루, 어떤 기분이었나요?</Text>
            </View>

            <View style={styles.footerSection}>
                <TouchableOpacity style={styles.signUpButton} onPress={handleNavigateToSignUp}>
                    <Text style={styles.signUpButtonText}>회원가입</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNavigateToLogin}>
                    <Text style={styles.loginPromptText}>
                        이미 계정이 있나요?{' '}
                        <Text style={styles.loginLinkText}>로그인</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'space-between', 
      paddingHorizontal: 40,
      paddingVertical: 160, 
    },
    headerSection: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 150, 
    },
    logoImage: {
      width: 160,
      height: 80,
    },
    mainContentSection: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10, 
    },
    mainCatchphrase: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'center',
      marginBottom: 15,
    },
    subCatchphrase: {
      fontSize: 15,
      color: '#4A4A4A',
      textAlign: 'center',
      lineHeight: 22,
    },
    footerSection: {
      alignItems: 'center',
      width: '100%',
      justifyContent: 'center',
    },
    signUpButton: {
      backgroundColor: '#000',
      borderRadius: 30,
      paddingVertical: 18,
      paddingHorizontal: 20,
      width: '100%',
      alignItems: 'center',
      marginBottom: 20,
    },
    signUpButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loginPromptText: {
      fontSize: 14,
      color: '#888',
    },
    loginLinkText: {
      color: '#555',
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
  });
  