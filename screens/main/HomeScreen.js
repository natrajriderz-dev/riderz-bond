// screens/main/HomeScreen.js
const React = require('react');
const {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
  ActivityIndicator,
  Modal
} = require('react-native');
const { useState, useEffect, useRef } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const axios = require('axios');
const { LinearGradient } = require('expo-linear-gradient');

const { width, height } = Dimensions.get('window');

// Colors
const colors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2D2D2D',
  primary: '#D97706',
  primaryLight: '#F59E0B',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  error: '#EF4444',
  success: '#10B981',
  border: '#2D2D2D',
  gold: '#D97706',
  goldLight: '#FBBF24',
  like: '#10B981',
  pass: '#EF4444',
  superlike: '#3B82F6',
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  filterText: {
    color: colors.textSecondary,
    marginLeft: 8,
    fontSize: 14,
  },
  // Dating Card Styles
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  card: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'flex-end',
    padding: 20,
  },
  cardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardAge: {
    fontSize: 20,
    color: colors.text,
    marginLeft: 8,
  },
  cardCity: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 30,
    gap: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  actionButtonLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  actionButtonLike: {
    borderColor: colors.like,
  },
  actionButtonPass: {
    borderColor: colors.pass,
  },
  actionButtonSuperlike: {
    borderColor: colors.superlike,
  },
  // Swipe Labels
  swipeLabel: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    transform: [{ rotate: '-15deg' }],
  },
  swipeLabelLeft: {
    left: 20,
    borderWidth: 3,
    borderColor: colors.pass,
  },
  swipeLabelRight: {
    right: 20,
    borderWidth: 3,
    borderColor: colors.like,
  },
  swipeLabelText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  swipeLabelTextPass: {
    color: colors.pass,
  },
  swipeLabelTextLike: {
    color: colors.like,
  },
  // Match Animation
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchContent: {
    alignItems: 'center',
    padding: 20,
  },
  matchTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  matchProfiles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  matchProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
    marginHorizontal: 10,
  },
  matchHeart: {
    fontSize: 40,
    color: colors.primary,
    marginHorizontal: 10,
  },
  matchMessage: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  matchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  matchButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  // Matrimony Grid Styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  gridContainer: {
    paddingHorizontal: 12,
  },
  gridCard: {
    flex: 1,
    margin: 6,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  gridInfo: {
    padding: 12,
  },
  gridNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gridName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  gridAge: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  gridCity: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  gridBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  gridBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  interestButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  interestButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  // Horizontal Scroll Section
  horizontalScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  horizontalCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  horizontalImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  horizontalInfo: {
    padding: 10,
  },
  horizontalName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  horizontalAge: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
});

// Swipeable Card Component for Dating
const SwipeableCard = ({ profile, onSwipe, isTop }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const passOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      pan.setValue({ x: gesture.dx, y: gesture.dy });
      
      // Update like/pass opacity based on swipe direction
      if (gesture.dx > 50) {
        likeOpacity.setValue(Math.min(1, gesture.dx / 200));
      } else if (gesture.dx < -50) {
        passOpacity.setValue(Math.min(1, Math.abs(gesture.dx) / 200));
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) > 120) {
        // Swipe right (like) or left (pass)
        const direction = gesture.dx > 0 ? 'right' : 'left';
        const action = direction === 'right' ? 'like' : 'pass';
        
        Animated.timing(pan, {
          toValue: { x: gesture.dx > 0 ? 500 : -500, y: gesture.dy },
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          onSwipe(action, profile);
          pan.setValue({ x: 0, y: 0 });
          likeOpacity.setValue(0);
          passOpacity.setValue(0);
        });
      } else if (Math.abs(gesture.dy) > 100 && gesture.dy < 0) {
        // Swipe up (superlike)
        Animated.timing(pan, {
          toValue: { x: 0, y: -500 },
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          onSwipe('superlike', profile);
          pan.setValue({ x: 0, y: 0 });
        });
      } else {
        // Reset position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: false,
        }).start();
        likeOpacity.setValue(0);
        passOpacity.setValue(0);
      }
    },
  });

  const cardStyle = {
    transform: pan.getTranslateTransform(),
  };

  return (
    <Animated.View style={[styles.card, cardStyle]} {...panResponder.panHandlers}>
      <Image source={{ uri: profile.profile_picture_url || 'https://via.placeholder.com/400' }} style={styles.cardImage} />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardGradient}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.cardName}>{profile.display_name}</Text>
          <Text style={styles.cardAge}>{profile.age}</Text>
        </View>
        <Text style={styles.cardCity}>{profile.city || 'Location not set'}</Text>
      </LinearGradient>

      {profile.tribes && profile.tribes.length > 0 && (
        <View style={styles.cardBadge}>
          <Text>🏷️</Text>
          <Text style={styles.cardBadgeText}>{profile.tribes[0].name}</Text>
        </View>
      )}

      {/* Swipe indicators */}
      <Animated.View style={[styles.swipeLabel, styles.swipeLabelRight, { opacity: likeOpacity }]}>
        <Text style={[styles.swipeLabelText, styles.swipeLabelTextLike]}>LIKE</Text>
      </Animated.View>

      <Animated.View style={[styles.swipeLabel, styles.swipeLabelLeft, { opacity: passOpacity }]}>
        <Text style={[styles.swipeLabelText, styles.swipeLabelTextPass]}>PASS</Text>
      </Animated.View>
    </Animated.View>
  );
};

// Dating Home Component
const DatingHome = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadUserProfile();
    loadDiscoverProfiles();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUserProfile(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Load user profile error:', error);
    }
  };

  const loadDiscoverProfiles = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('http://100.115.92.194:3001/api/matches/discover', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 10 }
      });

      if (response.data.users) {
        setProfiles(response.data.users);
      }
    } catch (error) {
      console.error('Load discover profiles error:', error);
      Alert.alert('Error', 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action, profile) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post('http://100.115.92.194:3001/api/matches/action', 
        {
          targetUserId: profile.id,
          action: action
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check if match was created
      if (response.data.match) {
        setMatchedProfile(profile);
        setShowMatch(true);
      }

      // Move to next profile
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Load more profiles
        loadDiscoverProfiles();
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Swipe action error:', error);
      Alert.alert('Error', 'Failed to record action');
    }
  };

  const handleManualAction = (action) => {
    if (profiles.length > 0 && currentIndex < profiles.length) {
      handleSwipe(action, profiles[currentIndex]);
    }
  };

  const closeMatch = () => {
    setShowMatch(false);
    setMatchedProfile(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptySubtext, { marginTop: 20 }]}>Finding matches for you...</Text>
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No more profiles</Text>
        <Text style={styles.emptySubtext}>Check back later for new matches in your area</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadDiscoverProfiles}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Filters')}>
          <Text>🔍</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.filterButton}>
        <Text>📍</Text>
        <Text style={styles.filterText}>Within 50 miles • Ages 25-35</Text>
      </TouchableOpacity>

      <View style={styles.cardContainer}>
        {profiles.slice(currentIndex, currentIndex + 3).reverse().map((profile, index) => {
          const isTop = index === profiles.slice(currentIndex, currentIndex + 3).length - 1;
          return (
            <SwipeableCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              isTop={isTop}
            />
          );
        })}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonPass]}
          onPress={() => handleManualAction('pass')}
        >
          <Text style={{ fontSize: 30 }}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonLarge, styles.actionButtonSuperlike]}
          onPress={() => handleManualAction('superlike')}
        >
          <Text style={{ fontSize: 36, color: colors.superlike }}>⭐</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonLike]}
          onPress={() => handleManualAction('like')}
        >
          <Text style={{ fontSize: 30, color: colors.like }}>♥</Text>
        </TouchableOpacity>
      </View>

      {/* Match Animation Modal */}
      <Modal
        visible={showMatch}
        transparent
        animationType="fade"
        onRequestClose={closeMatch}
      >
        <View style={styles.matchOverlay}>
          <View style={styles.matchContent}>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            
            <View style={styles.matchProfiles}>
              <Image 
                source={{ uri: userProfile?.profile_picture_url || 'https://via.placeholder.com/100' }} 
                style={styles.matchProfileImage} 
              />
              <Text style={styles.matchHeart}>❤️</Text>
              <Image 
                source={{ uri: matchedProfile?.profile_picture_url || 'https://via.placeholder.com/100' }} 
                style={styles.matchProfileImage} 
              />
            </View>

            <Text style={styles.matchMessage}>
              You and {matchedProfile?.display_name} liked each other!
            </Text>

            <TouchableOpacity 
              style={styles.matchButton}
              onPress={() => {
                closeMatch();
                navigation.navigate('Chat', { 
                  userId: matchedProfile?.id,
                  userName: matchedProfile?.display_name 
                });
              }}
            >
              <Text style={styles.matchButtonText}>Send a Message</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.matchButton, { backgroundColor: 'transparent', marginTop: 10 }]}
              onPress={closeMatch}
            >
              <Text style={[styles.matchButtonText, { color: colors.textSecondary }]}>
                Keep Swiping
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Matrimony Home Component
const MatrimonyHome = ({ navigation }) => {
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [nearbyProfiles, setNearbyProfiles] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('http://100.115.92.194:3001/api/matches/discover', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 }
      });

      if (response.data.users) {
        // Split profiles into categories
        const now = new Date();
        const recent = response.data.users.filter(p => {
          // Mock logic - in real app, use joined_at date
          return Math.random() > 0.7;
        }).slice(0, 10);

        const nearby = response.data.users.filter(p => {
          // Mock logic - in real app, use distance calculation
          return Math.random() > 0.5;
        }).slice(0, 10);

        setRecentProfiles(recent);
        setNearbyProfiles(nearby);
        setAllProfiles(response.data.users);
      }
    } catch (error) {
      console.error('Load matrimony profiles error:', error);
      Alert.alert('Error', 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const sendInterest = async (profileId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post('http://100.115.92.194:3001/api/matches/action',
        {
          targetUserId: profileId,
          action: 'like'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert('Success', 'Interest sent successfully!');
    } catch (error) {
      console.error('Send interest error:', error);
      Alert.alert('Error', 'Failed to send interest');
    }
  };

  const renderProfileCard = ({ item }) => (
    <View style={styles.gridCard}>
      <Image source={{ uri: item.profile_picture_url || 'https://via.placeholder.com/200' }} style={styles.gridImage} />
      <View style={styles.gridInfo}>
        <View style={styles.gridNameRow}>
          <Text style={styles.gridName} numberOfLines={1}>{item.display_name}</Text>
          <Text style={styles.gridAge}>{item.age}</Text>
        </View>
        <Text style={styles.gridCity}>{item.city || 'Location not set'}</Text>
        
        {item.tribes && item.tribes.length > 0 && (
          <View style={styles.gridBadge}>
            <Text>🏷️</Text>
            <Text style={styles.gridBadgeText}>{item.tribes[0].name}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.interestButton}
          onPress={() => sendInterest(item.id)}
        >
          <Text style={styles.interestButtonText}>Send Interest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHorizontalCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.horizontalCard}
      onPress={() => navigation.navigate('Profile', { userId: item.id })}
    >
      <Image source={{ uri: item.profile_picture_url || 'https://via.placeholder.com/140' }} style={styles.horizontalImage} />
      <View style={styles.horizontalInfo}>
        <Text style={styles.horizontalName} numberOfLines={1}>{item.display_name}</Text>
        <Text style={styles.horizontalAge}>{item.age} years</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptySubtext, { marginTop: 20 }]}>Finding matches for you...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matrimony</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Filters')}>
          <Text>🔍</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.filterButton}>
        <Text>📍</Text>
        <Text style={styles.filterText}>Within 100 miles • Looking for life partner</Text>
      </TouchableOpacity>

      {/* Recently Added Section */}
      {recentProfiles.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>✨ Recently Added</Text>
          <Text style={styles.sectionSubtitle}>New members in your area</Text>
          <FlatList
            horizontal
            data={recentProfiles}
            renderItem={renderHorizontalCard}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          />
        </>
      )}

      {/* Nearby Profiles Section */}
      {nearbyProfiles.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>📍 Nearby</Text>
          <Text style={styles.sectionSubtitle}>Members close to your location</Text>
          <FlatList
            horizontal
            data={nearbyProfiles}
            renderItem={renderHorizontalCard}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          />
        </>
      )}

      {/* All Profiles Grid */}
      <Text style={styles.sectionTitle}>👥 All Members</Text>
      <Text style={styles.sectionSubtitle}>Browse all verified profiles</Text>
      
      <FlatList
        data={allProfiles}
        renderItem={renderProfileCard}
        keyExtractor={item => item.id}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContainer}
      />

      {allProfiles.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No profiles found</Text>
          <Text style={styles.emptySubtext}>Check back later or adjust your filters</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadProfiles}>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// Main Home Screen component that switches based on user mode
const HomeScreen = ({ navigation }) => {
  const [userMode, setUserMode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserMode();
  }, []);

  const loadUserMode = async () => {
    try {
      const mode = await AsyncStorage.getItem('userMode');
      setUserMode(mode || 'dating');
    } catch (error) {
      console.error('Load user mode error:', error);
      setUserMode('dating');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Render the appropriate home screen based on user mode
  if (userMode === 'matrimony') {
    return <MatrimonyHome navigation={navigation} />;
  } else {
    // Default to dating mode (includes hybrid as dating)
    return <DatingHome navigation={navigation} />;
  }
};

module.exports = HomeScreen;