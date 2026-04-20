// App.js
const React = require('react');
const { NavigationContainer, createNavigationContainerRef } = require('@react-navigation/native');
const { createStackNavigator } = require('@react-navigation/stack');
const { useEffect, useState } = React;
const { View, ActivityIndicator, LogBox, Platform, StyleSheet } = require('react-native');
const { supabase } = require('./supabase');
const { ModeProvider } = require('./context/ModeContext');
const ErrorBoundary = require('./src/components/shared/ErrorBoundary');
const notificationService = require('./src/services/notificationService');
const decoyRequestScheduler = require('./src/jobs/decoyRequestScheduler');

// Navigation Stacks
const AuthStack = require('./screens/auth/AuthStack');
const OnboardingStack = require('./screens/onboarding/OnboardingStack');
const MainTabs = require('./screens/main/MainTabs');
const PremiumScreen = require('./src/screens/main/PremiumScreen');

const Stack = createStackNavigator();

LogBox.ignoreLogs([
  'Method getInfoAsync imported from "expo-file-system" is deprecated.',
]);

const navigationRef = createNavigationContainerRef();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Auth');
  const [onboardingScreen, setOnboardingScreen] = useState('BasicInfo');

  useEffect(() => {
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the reset password link in their email
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('Auth', { screen: 'ResetPassword' });
          }
        }, 500); // Slight delay to ensure navigation is mounted
      }
    });

    return () => {
      decoyRequestScheduler.stop();
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      const session = data?.session;
      
      if (session) {
        console.log('Session found for user:', session.user.id);
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('profile_complete, verification_status')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.warn('Profile fetch error:', profileError);
        }

        const { data: modeProfile, error: modeError } = await supabase
          .from('user_profiles')
          .select('about')
          .eq('user_id', session.user.id)
          .single();

        if (modeError) {
          console.warn('Mode profile fetch error:', modeError);
        }

        if (!profile?.profile_complete) {
          console.log('Profile incomplete, routing to BasicInfo');
          setOnboardingScreen('BasicInfo');
          setInitialRoute('Onboarding');
        } else if (!profile?.verification_status || profile.verification_status === 'unverified') {
          console.log('Unverified, routing to VideoVerification');
          setOnboardingScreen('VideoVerification');
          setInitialRoute('Onboarding');
        } else if (!modeProfile?.about) {
          console.log('No mode profile about text, routing to ModeSelect');
          setOnboardingScreen('ModeSelect');
          setInitialRoute('Onboarding');
        } else {
          console.log('Fully onboarded, routing to Main');
          setInitialRoute('Main');
          notificationService.registerForPushNotifications(session.user.id);
        }

        decoyRequestScheduler.start();
      } else {
        console.log('No session found, navigating to Auth');
        setInitialRoute('Auth');
      }
    } catch (error) {
      console.error('CRITICAL: Session check error:', error);
      setInitialRoute('Auth');
    } finally {
      setLoading(false);
      console.log('Session check complete, loading set to false');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ModeProvider>
        <View style={appStyles.webWrapper}>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Auth" component={AuthStack} />
              <Stack.Screen 
                name="Onboarding" 
                component={OnboardingStack} 
                initialParams={{ screen: onboardingScreen }} 
              />
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Premium" component={PremiumScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </ModeProvider>
    </ErrorBoundary>
  );
};

const appStyles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 500 : undefined,
    alignSelf: 'center',
    backgroundColor: '#000',
    overflow: 'hidden',
    boxShadow: Platform.OS === 'web' ? '0px 0px 20px rgba(0,0,0,0.5)' : undefined,
  }
});

module.exports = App;
