const React = require('react');
const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');
const { Text } = require('react-native');
const AsyncStorage = require('@react-native-async-storage/async-storage').default.default;
const { useState, useEffect } = React;

const HomeScreen = require('./HomeScreen');
const ChatStack = require('./ChatStack');
const ImpressScreen = require('./ImpressScreen');
const TribesScreen = require('./TribesScreen');
const ProfileStack = require('./ProfileStack');

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const [mode, setMode] = useState('dating');
  useEffect(() => {
    AsyncStorage.getItem('app_mode').then(m => { if (m) setMode(m); });
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1E1E1E', borderTopColor: '#2D2D2D', paddingBottom: 4, height: 60 },
        tabBarActiveTintColor: '#D97706',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>🏠</Text> }} />
      <Tab.Screen name="Chat" component={ChatStack}
        options={{ tabBarLabel: 'Matches', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>💬</Text> }} />
      <Tab.Screen name="Impress" component={ImpressScreen}
        options={{ tabBarLabel: mode === 'dating' ? 'IMPRESS' : 'Suyamvaram', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{mode === 'dating' ? '📸' : '🎭'}</Text> }} />
      <Tab.Screen name="Tribes" component={TribesScreen}
        options={{ tabBarLabel: mode === 'dating' ? 'Tribes' : 'Zones', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{mode === 'dating' ? '🏘️' : '🏛️'}</Text> }} />
      <Tab.Screen name="Profile" component={ProfileStack}
        options={{ tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>👤</Text> }} />
    </Tab.Navigator>
  );
};

module.exports = MainTabs;
