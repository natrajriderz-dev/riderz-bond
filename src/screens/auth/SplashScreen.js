// src/screens/auth/SplashScreen.js
const React = require('react');
const { View, Text, ActivityIndicator, Image } = require('react-native');
const { useState, useEffect } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const Colors = require('../../theme/Colors');
const AuthStyles = require('./AuthStyles');

const SplashScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');

        if (token && userData) {
          // In a real app, confirm session with Supabase here
        }
        navigation.replace('Landing');
      } catch (error) {
        console.error('Session check error:', error);
        navigation.replace('Landing');
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  return (
    <View style={[AuthStyles.centerContainer, { backgroundColor: '#000' }]}>
      <View style={AuthStyles.logo}>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={{ width: 250, height: 250, resizeMode: 'contain' }} 
        />
      </View>
      <Text style={[AuthStyles.subtitle, { color: Colors.primary, marginTop: -20 }]}>Find your perfect match</Text>
      {isLoading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />}
    </View>
  );
};

module.exports = SplashScreen;
