// src/screens/auth/LandingScreen.js
const React = require('react');
const { View, Text, TouchableOpacity, Platform } = require('react-native');
const { Ionicons } = require('@expo/vector-icons');
const { LinearGradient } = require('expo-linear-gradient');
const { supabase } = require('../../../supabase');
const Colors = require('../../theme/Colors');
const AuthStyles = require('./AuthStyles');

const LandingScreen = ({ navigation }) => {
  const handleSocialLogin = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: 'suyavaraa://login-callback',
        },
      });

      if (error) throw error;
      
      // The browser will open for OAuth flow. 
      // In a real app, you'd handle the callback deep link.
    } catch (error) {
      console.error(`${provider} login error:`, error.message);
    }
  };

  return (
    <LinearGradient
      colors={[ '#4F46E5', '#8B5CF6', '#A855F7' ]}
      start={[0, 0]}
      end={[1, 1]}
      style={AuthStyles.centerContainer}
    >
      <View style={[AuthStyles.card, { width: '100%', maxWidth: 420 }]}> 
        <View style={AuthStyles.logo}>
          <View style={{
            width: 104,
            height: 104,
            borderRadius: 52,
            backgroundColor: '#EC4899',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 32, color: '#FFFFFF', fontWeight: '800' }}>SUYA</Text>
          </View>
        </View>

        <Text style={[AuthStyles.title, { color: '#111827' }]}>Welcome to Suyavaraa</Text>
        <Text style={[AuthStyles.subtitle, { color: '#6B7280' }]}>Build your profile and connect meaningfully.</Text>

      <View style={AuthStyles.buttonContainer}>
        <TouchableOpacity
          style={AuthStyles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={AuthStyles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[AuthStyles.button, AuthStyles.buttonOutline]}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={[AuthStyles.buttonText, AuthStyles.buttonOutlineText]}>Create Account</Text>
        </TouchableOpacity>

        <View style={AuthStyles.dividerContainer}>
          <View style={AuthStyles.dividerLine} />
          <Text style={AuthStyles.dividerText}>or continue with</Text>
          <View style={AuthStyles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[AuthStyles.socialButton, AuthStyles.socialButtonGoogle]}
          onPress={() => handleSocialLogin('google')}
        >
          <Ionicons name="logo-google" size={20} color="#EA4335" style={AuthStyles.socialIcon} />
          <Text style={[AuthStyles.socialButtonText, { color: '#374151' }]}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[AuthStyles.socialButton, AuthStyles.socialButtonApple]}
          onPress={() => handleSocialLogin('apple')}
        >
          <Ionicons name="logo-apple" size={22} color="#ffffff" style={AuthStyles.socialIcon} />
          <Text style={[AuthStyles.socialButtonText, { color: '#ffffff' }]}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>


    </View>
    </LinearGradient>
  );
};

module.exports = LandingScreen;
