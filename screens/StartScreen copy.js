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
                    <View style={styles.logoIconBackground}>
                        <Image
                            source={require('../assets/echoLog_logo.png')} // Assuming same path as Login.js
                            style={styles.logoIconImage}
                        />
                    </View>
                    <Text style={styles.logoText}>Echo{"\n"}Log</Text>
                </View>
            </View>

            <View style={styles.mainContentSection}>
                <Text style={styles.mainCatchphrase}>오늘 하루, 어떻게 지냈나요?</Text>
                <Text style={styles.subCatchphrase}>
                    언제든 마음을 털어놓을 수 있는{"\n"}당신만의 공간, Echo Log
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
        justifyContent: 'space-around', // Distributes content vertically
        paddingHorizontal: 40,
        paddingVertical: 50, // Add some vertical padding
    },
    headerSection: {
        alignItems: 'center',
        // flex: 1, // Allow it to take up space
        justifyContent: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIconBackground: {
        width: 90, // Adjusted size to be visually prominent
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FDFCEC', // Light beige/yellowish color from image
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    logoIconImage: {
        width: 50, // Icon size within the circle
        height: 50,
    },
    logoText: {
        fontSize: 36, // Larger text for prominence
        color: '#76A488', // Green color from Login.js
        fontWeight: 'bold',
        lineHeight: 42, // Adjust line height for stacked text
    },
    mainContentSection: {
        alignItems: 'center',
        // flex: 1, // Allow it to take up space
        justifyContent: 'center',
        marginVertical: 40, // Add vertical margin
    },
    mainCatchphrase: {
        fontSize: 26, // Large and bold
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 15,
    },
    subCatchphrase: {
        fontSize: 15,
        color: '#4A4A4A', // Dark gray for readability
        textAlign: 'center',
        lineHeight: 22,
    },
    footerSection: {
        alignItems: 'center',
        width: '100%',
        // flex: 1, // Allow it to take up space
        justifyContent: 'center',
    },
    signUpButton: {
        backgroundColor: '#000',
        borderRadius: 30, // Pill-shaped button
        paddingVertical: 18,
        paddingHorizontal: 20,
        width: '100%', // Make button wide
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
        color: '#888', // Light gray for the prompt part
    },
    loginLinkText: {
        color: '#555', // Darker gray or black for the link part
        fontWeight: 'bold',
        textDecorationLine: 'underline', // Emphasize it's a link
    },
});