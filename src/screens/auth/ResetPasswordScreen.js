// src/screens/auth/ResetPasswordScreen.js
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
const { useState, useEffect } = React;
const { supabase } = require('../../../supabase');
const { Ionicons } = require('@expo/vector-icons');
const AuthStyles = require('./AuthStyles');
const Colors = require('../../theme/Colors');

const ResetPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in both fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      Alert.alert('Success', 'Your password has been updated successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      console.error('Update Password Error:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={AuthStyles.scrollContainer}>
      <Text style={AuthStyles.title}>Create New Password</Text>
      <Text style={AuthStyles.subtitle}>Enter your new password below</Text>

      <Text style={AuthStyles.inputLabel}>New Password</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TextInput
          style={[AuthStyles.input, { flex: 1, marginRight: 10 }]}
          value={password}
          onChangeText={setPassword}
          placeholder="New password (min 6 characters)"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.surface,
            borderRadius: 8,
          }}
        >
          <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={AuthStyles.inputLabel}>Confirm New Password</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TextInput
          style={[AuthStyles.input, { flex: 1, marginRight: 10 }]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.surface,
            borderRadius: 8,
          }}
        >
          <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {error ? <Text style={AuthStyles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={[AuthStyles.button, { marginTop: 20 }]} onPress={handleUpdatePassword} disabled={loading}>
        <Text style={AuthStyles.buttonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
      </TouchableOpacity>

      {loading && (
        <View style={AuthStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </ScrollView>
  );
};

module.exports = ResetPasswordScreen;
