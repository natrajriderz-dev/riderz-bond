// screens/main/TribesScreen.js
const React = require('react');
const { createStackNavigator } = require('@react-navigation/stack');
const Colors = require('../../src/theme/Colors');
const TribesScreen = require('../../src/screens/main/TribesScreen');
const TribeInnerPage = require('../../src/screens/main/TribeInnerPage');
const TribeSearchScreen = require('../../src/screens/main/TribeSearchScreen');
const MemberProfileScreen = require('../../src/screens/main/MemberProfileScreen');
const PremiumScreen = require('../../src/screens/main/PremiumScreen');

const Stack = createStackNavigator();

const TribesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="TribesMain" component={TribesScreen} />
      <Stack.Screen name="TribeInner" component={TribeInnerPage} />
      <Stack.Screen name="Search" component={TribeSearchScreen} />
      <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
    </Stack.Navigator>
  );
};

module.exports = TribesStack;
