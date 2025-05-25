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
                {/* 로고 컨테이너: 단일 전체 이미지로 변경 */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/echoLog_logo.png')} // 전체 로고 이미지 경로
                        style={styles.logoImage} // Login.js와 동일한 스타일명 사용
                        resizeMode="contain"
                    />
                </View>
            </View>

            <View style={styles.mainContentSection}>
                <Text style={styles.mainCatchphrase}>오늘 하루, 어떤 기분이었나요?</Text>
                <Text style={styles.subCatchphrase}>
                    당신의 일기를 AI가 함께 읽고,{"\n"}
                    감정의 작은 변화도 놓치지 않아요.{"\n"}
                    우울증 조기 감지를 위한{"\n"}
                    당신만의 감정 공간, Echo Log
                </Text>
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
        justifyContent: 'space-around',
        paddingHorizontal: 40,
        paddingVertical: 50,
    },
    headerSection: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        // flexDirection: 'row', // 단일 이미지이므로 row 방향 불필요
        alignItems: 'center', // 이미지 중앙 정렬
        justifyContent: 'center', // 이미지 중앙 정렬
        // marginRight: 15, // 더 이상 필요 없음
        // 이전 logoIconBackground와 logoText를 합친 것보다 충분한 공간을 확보하기 위해 마진 추가 가능
        // 예: marginBottom: 20, 또는 headerSection에서 패딩 조절
    },
    // logoIconBackground 스타일 삭제
    // logoIconImage 스타일을 logoImage로 변경하고 전체 로고에 맞게 수정
    logoImage: {
        width: 240, // Login.js와 동일한 크기로 설정 (필요시 조절)
        height: 80, // Login.js와 동일한 크기로 설정 (필요시 조절)
    },
    // logoText 스타일 삭제
    mainContentSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 40,
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