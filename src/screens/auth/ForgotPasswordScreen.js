// src/screens/auth/ForgotPasswordScreen.js
const React = require('react');
const {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} = require('react-native');
const { useState } = React;
const { supabase } = require('../../../supabase');
const AuthStyles = require('./AuthStyles');
const Colors = require('../../theme/Colors');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'suyavaraa://reset-password',
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err) {
      console.error('Reset Error:', err);
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={AuthStyles.scrollContainer}>
      <Text style={AuthStyles.title}>Reset Password</Text>
      <Text style={AuthStyles.subtitle}>Enter your email to receive a password reset link</Text>

      {success ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>✉️</Text>
          <Text style={{ color: Colors.text, fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
            Check your inbox! We've sent password reset instructions to {email}.
          </Text>
          <TouchableOpacity style={AuthStyles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={AuthStyles.buttonText}>Return to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={AuthStyles.inputLabel}>Email</Text>
          <TextInput
            style={AuthStyles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {error ? <Text style={AuthStyles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={[AuthStyles.button, { marginTop: 20 }]} onPress={handleReset} disabled={loading}>
            <Text style={AuthStyles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 24 }}>
            <Text style={[AuthStyles.linkText, { textAlign: 'center' }]}>Back to Login</Text>
          </TouchableOpacity>
        </>
      )}

      {loading && (
        <View style={AuthStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </ScrollView>
  );
};

module.exports = ForgotPasswordScreen;
