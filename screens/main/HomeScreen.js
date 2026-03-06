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
const { supabase } = require('../../supabase');
const { LinearGradient } = require('expo-linear-gradient');
const { useMode } = require('../../context/ModeContext');

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch verified users excluding the current user (no matches yet)
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          city,
          date_of_birth,
          gender,
          user_profiles(primary_photo_url),
          user_tribes(tribes(name))
        `)
        .eq('is_verified', true)
        .eq('is_active', true)
        .eq('is_banned', false)
        .neq('id', user.id)
        .limit(20);

      if (error) throw error;

      if (users && users.length > 0) {
        const mapped = users.map(u => ({
          id: u.id,
          display_name: u.full_name,
          age: u.date_of_birth ? Math.floor((Date.now() - new Date(u.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000)) : null,
          city: u.city,
          profile_picture_url: u.user_profiles?.[0]?.primary_photo_url || null,
          tribes: u.user_tribes?.map(ut => ut.tribes) || []
        }));
        setProfiles(mapped);
        return;
      }

      throw new Error('No users found');
    } catch (error) {
      console.log('Load discover profiles error (mock fallback):', error.message);
      const mockProfiles = [
        { id: '1', display_name: 'Priya', age: 26, city: 'Mumbai', profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=60', tribes: [{ name: 'Foodie' }] },
        { id: '2', display_name: 'Ananya', age: 24, city: 'Bangalore', profile_picture_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=60', tribes: [{ name: 'Adventurer' }] },
        { id: '3', display_name: 'Kavya', age: 28, city: 'Chennai', profile_picture_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=60', tribes: [{ name: 'Artist' }] },
        { id: '4', display_name: 'Sneha', age: 25, city: 'Pune', profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=60', tribes: [{ name: 'Fitness' }] }
      ];
      setProfiles(mockProfiles);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action, profile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert swipe action into user_actions table
      const { data: actionResult, error } = await supabase
        .from('user_actions')
        .insert({
          actor_user_id: user.id,
          target_user_id: profile.id,
          action_type: action // 'like' | 'pass' | 'superlike'
        })
        .select()
        .single();

      // If liked, check if the other user also liked us (mutual match)
      if (!error && action === 'like') {
        const { data: mutual } = await supabase
          .from('user_actions')
          .select('id')
          .eq('actor_user_id', profile.id)
          .eq('target_user_id', user.id)
          .eq('action_type', 'like')
          .single();

        if (mutual) {
          // Create a match entry
          await supabase.from('matches').insert({
            user1_id: user.id,
            user2_id: profile.id
          });
          setMatchedProfile(profile);
          setShowMatch(true);
        }
      }

      // Move to next profile
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        loadDiscoverProfiles();
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Swipe action error:', error.message);
      // Still move to next card even if save fails
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
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


// ─── Matrimony Home Component ──────────────────────────────────────────────
const MatrimonyHome = ({ navigation }) => {
  const [allProfiles, setAllProfiles] = useState([]);
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sentInterests, setSentInterests] = useState({});
  const [activeFilter, setActiveFilter] = useState('All');

  const filterOptions = ['All', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Other'];

  const mockDataFallback = [
    {
      id: '201', display_name: 'Ananya Sharma', age: 28, city: 'Mumbai',
      primary_photo_url: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&q=60',
      religion: 'Hindu', mother_tongue: 'Hindi', marital_status: 'Never Married',
      education: 'MBA, IIM Bangalore', occupation: 'Marketing Manager', height_cm: 165,
      family_type: 'Nuclear', annual_income: '8-10 LPA', trust_level: 'green_verified',
      bio: 'Looking for a partner who values family and career equally. Love traveling and yoga.',
      interests: ['Travel', 'Yoga', 'Reading', 'Cooking'],
    },
    {
      id: '202', display_name: 'Priya Nair', age: 26, city: 'Kochi',
      primary_photo_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&q=60',
      religion: 'Hindu', mother_tongue: 'Malayalam', marital_status: 'Never Married',
      education: 'M.Tech, IIT Madras', occupation: 'Data Scientist', height_cm: 162,
      family_type: 'Nuclear', annual_income: '12-15 LPA', trust_level: 'green_verified',
      bio: 'Tech enthusiast who loves classical music and traditional values. Seeking an educated, family-oriented partner.',
      interests: ['Technology', 'Classical Music', 'Nature', 'Cooking'],
    },
    {
      id: '203', display_name: 'Kavya Reddy', age: 27, city: 'Hyderabad',
      primary_photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=60',
      religion: 'Hindu', mother_tongue: 'Telugu', marital_status: 'Never Married',
      education: 'MBBS, AIIMS Delhi', occupation: 'Doctor', height_cm: 163,
      family_type: 'Joint', annual_income: '15+ LPA', trust_level: 'green_verified',
      bio: 'Passionate doctor looking for an understanding partner who respects my profession.',
      interests: ['Healthcare', 'Dance', 'Social Work', 'Reading'],
    },
    {
      id: '204', display_name: 'Rohan Patel', age: 31, city: 'Bangalore',
      primary_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=60',
      religion: 'Hindu', mother_tongue: 'Gujarati', marital_status: 'Never Married',
      education: 'B.Tech, NIT Trichy', occupation: 'Senior Software Engineer at Google', height_cm: 178,
      family_type: 'Joint', annual_income: '20+ LPA', trust_level: 'green_verified',
      bio: 'Family-oriented person seeking a life partner who shares similar values. Love cricket and music.',
      interests: ['Cricket', 'Music', 'Cooking', 'Technology'],
    },
    {
      id: '205', display_name: 'Arjun Malhotra', age: 29, city: 'Delhi',
      primary_photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=60',
      religion: 'Hindu', mother_tongue: 'Punjabi', marital_status: 'Never Married',
      education: 'CA, ICAI', occupation: 'Chartered Accountant', height_cm: 182,
      family_type: 'Nuclear', annual_income: '12-15 LPA', trust_level: 'green_verified',
      bio: 'Looking for a life partner to share dreams and build a beautiful future together.',
      interests: ['Finance', 'Travel', 'Photography', 'Fitness'],
    },
    {
      id: '206', display_name: 'Sana Khan', age: 26, city: 'Pune',
      primary_photo_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&q=60',
      religion: 'Muslim', mother_tongue: 'Urdu', marital_status: 'Never Married',
      education: 'B.Arch', occupation: 'Architect', height_cm: 161,
      family_type: 'Nuclear', annual_income: '6-8 LPA', trust_level: 'green_verified',
      bio: 'Creative architect with a love for design, travel, and good food. Looking for someone kind.',
      interests: ['Architecture', 'Art', 'Travel', 'Poetry'],
    },
  ];

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id, full_name, city, date_of_birth, trust_level,
          user_profiles(
            primary_photo_url,
            marital_status, religion, mother_tongue,
            height_cm, family_type, education, occupation,
            annual_income, bio, interests
          ),
          user_tribes(tribes(name))
        `)
        .eq('is_active', true)
        .eq('is_banned', false)
        .neq('id', user.id)
        .limit(60);

      if (error) throw error;

      if (users && users.length > 0) {
        const mapped = users.map(u => {
          const p = u.user_profiles?.[0] || {};
          return {
            id: u.id,
            display_name: u.full_name,
            age: u.date_of_birth ? Math.floor((Date.now() - new Date(u.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000)) : null,
            city: u.city,
            trust_level: u.trust_level,
            primary_photo_url: p.primary_photo_url || null,
            marital_status: p.marital_status || 'Never Married',
            religion: p.religion || '',
            mother_tongue: p.mother_tongue || '',
            height_cm: p.height_cm || null,
            family_type: p.family_type || '',
            education: p.education || '',
            occupation: p.occupation || '',
            annual_income: p.annual_income || '',
            bio: p.bio || '',
            interests: p.interests || [],
          };
        });
        setAllProfiles(mapped);
        setRecentProfiles(mapped.slice(0, 4));
        return;
      }
      throw new Error('No users found');
    } catch (err) {
      console.log('Matrimony fallback:', err.message);
      setAllProfiles(mockDataFallback);
      setRecentProfiles(mockDataFallback.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  const sendInterest = async (profileId) => {
    if (sentInterests[profileId]) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase.from('user_actions').insert({
        actor_user_id: user.id,
        target_user_id: profileId,
        action_type: 'like',
      });

      setSentInterests(prev => ({ ...prev, [profileId]: true }));
      setShowDetailModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Send interest error:', err.message);
      Alert.alert('Error', 'Failed to send interest. Please try again.');
    }
  };

  const heightLabel = (cm) => {
    if (!cm) return null;
    const totalInches = Math.round(cm / 2.54);
    return `${Math.floor(totalInches / 12)}'${totalInches % 12}"  (${cm} cm)`;
  };

  const filteredProfiles = activeFilter === 'All'
    ? allProfiles
    : allProfiles.filter(p => p.religion === activeFilter);

  // ── Profile Detail Modal ──────────────────────────────────────────────────
  const ProfileDetailModal = () => {
    if (!selectedProfile) return null;
    const p = selectedProfile;
    const alreadySent = sentInterests[p.id];

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={matrimonyStyles.modalOverlay}>
          <View style={matrimonyStyles.detailSheet}>
            {/* Handle */}
            <View style={matrimonyStyles.sheetHandle} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Photo */}
              <View style={matrimonyStyles.detailPhotoContainer}>
                <Image
                  source={{ uri: p.primary_photo_url || 'https://via.placeholder.com/400' }}
                  style={matrimonyStyles.detailPhoto}
                />
                <View style={matrimonyStyles.detailPhotoOverlay}>
                  {p.trust_level === 'green_verified' && (
                    <View style={matrimonyStyles.verifiedPill}>
                      <Text style={{ fontSize: 10 }}>✅</Text>
                      <Text style={matrimonyStyles.verifiedPillText}> Verified</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={matrimonyStyles.detailBody}>
                {/* Name & Status */}
                <View style={matrimonyStyles.detailNameRow}>
                  <Text style={matrimonyStyles.detailName}>{p.display_name}</Text>
                  <Text style={matrimonyStyles.detailAge}>, {p.age}</Text>
                </View>
                <Text style={matrimonyStyles.detailMarital}>{p.marital_status} • {p.city}</Text>

                {/* Info Grid */}
                <View style={matrimonyStyles.infoGrid}>
                  {[
                    { icon: '🕉️', label: 'Religion', value: p.religion },
                    { icon: '🗣️', label: 'Mother Tongue', value: p.mother_tongue },
                    { icon: '🎓', label: 'Education', value: p.education },
                    { icon: '💼', label: 'Occupation', value: p.occupation },
                    { icon: '👨‍👩‍👧', label: 'Family Type', value: p.family_type },
                    { icon: '📏', label: 'Height', value: heightLabel(p.height_cm) },
                    { icon: '💰', label: 'Annual Income', value: p.annual_income },
                  ].filter(f => f.value).map((field, i) => (
                    <View key={i} style={matrimonyStyles.infoCell}>
                      <Text style={matrimonyStyles.infoCellIcon}>{field.icon}</Text>
                      <View>
                        <Text style={matrimonyStyles.infoCellLabel}>{field.label}</Text>
                        <Text style={matrimonyStyles.infoCellValue} numberOfLines={1}>{field.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Bio */}
                {p.bio ? (
                  <View style={matrimonyStyles.bioSection}>
                    <Text style={matrimonyStyles.bioTitle}>⭐ About Me</Text>
                    <Text style={matrimonyStyles.bioText}>{p.bio}</Text>
                  </View>
                ) : null}

                {/* Interests */}
                {p.interests && p.interests.length > 0 && (
                  <View style={matrimonyStyles.interestsSection}>
                    <Text style={matrimonyStyles.bioTitle}>Interests & Hobbies</Text>
                    <View style={matrimonyStyles.interestTags}>
                      {p.interests.map((tag, i) => (
                        <View key={i} style={matrimonyStyles.interestTag}>
                          <Text style={matrimonyStyles.interestTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Privacy Note */}
                <View style={matrimonyStyles.privacyNote}>
                  <Text style={{ fontSize: 16 }}>🔒</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={matrimonyStyles.privacyTitle}>Privacy Protected</Text>
                    <Text style={matrimonyStyles.privacyText}>
                      Contact details are shared only after both parties express interest and admin approval.
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={matrimonyStyles.detailActions}>
                  <TouchableOpacity
                    style={matrimonyStyles.closeDetailBtn}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Text style={matrimonyStyles.closeDetailBtnText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      matrimonyStyles.expressBtn,
                      alreadySent && { backgroundColor: colors.success }
                    ]}
                    onPress={() => sendInterest(p.id)}
                    disabled={alreadySent}
                  >
                    <Text style={matrimonyStyles.expressBtnText}>
                      {alreadySent ? '✓ Interest Sent' : '💛 Express Interest'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ── Success Modal ─────────────────────────────────────────────────────────
  const SuccessModal = () => (
    <Modal visible={showSuccessModal} transparent animationType="fade">
      <View style={matrimonyStyles.successOverlay}>
        <View style={matrimonyStyles.successCard}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>💛</Text>
          <Text style={matrimonyStyles.successTitle}>Interest Sent!</Text>
          <Text style={matrimonyStyles.successText}>
            We'll notify them about your interest. Contact details will be shared after mutual interest and admin approval.
          </Text>
          <TouchableOpacity
            style={matrimonyStyles.expressBtn}
            onPress={() => setShowSuccessModal(false)}
          >
            <Text style={matrimonyStyles.expressBtnText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ── Profile Card ──────────────────────────────────────────────────────────
  const ProfileCard = ({ item }) => {
    const alreadySent = sentInterests[item.id];
    return (
      <LinearGradient
        colors={['#ffffff', '#f9f9f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={matrimonyStyles.card}
      >
        <TouchableOpacity onPress={() => { setSelectedProfile(item); setShowDetailModal(true); }}>
          <Image
            source={{ uri: item.primary_photo_url || 'https://via.placeholder.com/300' }}
            style={matrimonyStyles.cardPhoto}
          />
          {item.trust_level === 'green_verified' && (
            <View style={matrimonyStyles.cardVerifiedBadge}>
              <Text style={{ fontSize: 10 }}>✅</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={matrimonyStyles.cardBody}>
          <View style={matrimonyStyles.cardNameRow}>
            <Text style={matrimonyStyles.cardName} numberOfLines={1}>{item.display_name}</Text>
            <Text style={matrimonyStyles.cardAge}>, {item.age}</Text>
          </View>

          {item.religion || item.mother_tongue ? (
            <Text style={matrimonyStyles.cardReligion} numberOfLines={1}>
              {[item.religion, item.mother_tongue].filter(Boolean).join(' • ')}
            </Text>
          ) : null}

          {item.occupation ? (
            <Text style={matrimonyStyles.cardOccupation} numberOfLines={1}>
              💼 {item.occupation}
            </Text>
          ) : null}

          {item.education ? (
            <Text style={matrimonyStyles.cardEducation} numberOfLines={1}>
              🎓 {item.education}
            </Text>
          ) : null}

          <Text style={matrimonyStyles.cardCity} numberOfLines={1}>
            📍 {item.city || 'Location not set'}
          </Text>

          <View style={matrimonyStyles.cardActions}>
            <TouchableOpacity
              style={matrimonyStyles.viewBtn}
              onPress={() => { setSelectedProfile(item); setShowDetailModal(true); }}
              activeOpacity={0.7}
            >
              <Text style={matrimonyStyles.viewBtnText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                matrimonyStyles.interestBtn,
                alreadySent && { backgroundColor: colors.success }
              ]}
              onPress={() => sendInterest(item.id)}
              disabled={alreadySent}
              activeOpacity={0.8}
            >
              <Text style={matrimonyStyles.interestBtnText}>
                {alreadySent ? '✓' : '💛'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  };

  // ── Horizontal Card ───────────────────────────────────────────────────────
  const HorizontalCard = ({ item }) => (
    <LinearGradient
      colors={['#ffffff', '#f9f9f9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={matrimonyStyles.hCard}
    >
      <TouchableOpacity onPress={() => { setSelectedProfile(item); setShowDetailModal(true); }}>
        <Image
          source={{ uri: item.primary_photo_url || 'https://via.placeholder.com/140' }}
          style={matrimonyStyles.hCardPhoto}
        />
        {item.trust_level === 'green_verified' && (
          <View style={matrimonyStyles.hCardBadge}><Text style={{ fontSize: 8 }}>✅</Text></View>
        )}
        <View style={matrimonyStyles.hCardInfo}>
          <Text style={matrimonyStyles.hCardName} numberOfLines={1}>{item.display_name}</Text>
          <Text style={matrimonyStyles.hCardMeta}>{item.age} • {item.city}</Text>
        </View>
      </TouchableOpacity>
    </LinearGradient>
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ProfileDetailModal />
      <SuccessModal />

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* ── Header ── */}
        <View style={matrimonyStyles.header}>
          <View>
            <Text style={matrimonyStyles.headerTitle}>💍 Matrimony</Text>
            <Text style={matrimonyStyles.headerSub}>{allProfiles.length} verified profiles</Text>
          </View>
          <TouchableOpacity style={matrimonyStyles.headerBtn} onPress={() => navigation.navigate('Filters')}>
            <Text style={{ fontSize: 20 }}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* ── Filter Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={matrimonyStyles.filterRow}
        >
          {filterOptions.map(f => (
            <TouchableOpacity
              key={f}
              style={[
                matrimonyStyles.filterChip,
                activeFilter === f && matrimonyStyles.filterChipActive
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[
                matrimonyStyles.filterChipText,
                activeFilter === f && matrimonyStyles.filterChipTextActive
              ]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Recently Added ── */}
        {recentProfiles.length > 0 && (
          <View style={matrimonyStyles.section}>
            <Text style={matrimonyStyles.sectionTitle}>✨ Recently Added</Text>
            <Text style={matrimonyStyles.sectionSub}>New members who joined recently</Text>
            <FlatList
              horizontal
              data={recentProfiles}
              renderItem={({ item }) => <HorizontalCard item={item} />}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            />
          </View>
        )}

        {/* ── All / Filtered Profiles ── */}
        <View style={matrimonyStyles.section}>
          <Text style={matrimonyStyles.sectionTitle}>
            👥 {activeFilter === 'All' ? 'All Members' : `${activeFilter} Profiles`}
          </Text>
          <Text style={matrimonyStyles.sectionSub}>
            {filteredProfiles.length} verified profiles
          </Text>

          {filteredProfiles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No profiles found</Text>
              <Text style={styles.emptySubtext}>Try a different filter or check back later</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={loadProfiles}>
                <Text style={styles.buttonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredProfiles}
              renderItem={({ item }) => <ProfileCard item={item} />}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={matrimonyStyles.grid}
              columnWrapperStyle={{ gap: 12 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Matrimony-specific Styles ─────────────────────────────────────────────
const matrimonyStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Filter chips
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  // Profile card (grid)
  grid: {
    paddingHorizontal: 16,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    // Enhanced shadow & depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardPhoto: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  cardVerifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    // Glassmorphism effect
    backdropFilter: 'blur(10px)',
  },
  cardBody: {
    padding: 12,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    letterSpacing: 0.3,
  },
  cardAge: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardReligion: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardOccupation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 3,
    fontWeight: '500',
  },
  cardEducation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 3,
    fontWeight: '500',
  },
  cardCity: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  viewBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  interestBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced shadow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  interestBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Horizontal card
  hCard: {
    width: 130,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  hCardPhoto: {
    width: 130,
    height: 160,
    resizeMode: 'cover',
  },
  hCardBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  hCardInfo: {
    padding: 10,
  },
  hCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },
  hCardMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  // Detail Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  detailPhotoContainer: {
    position: 'relative',
  },
  detailPhoto: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  detailPhotoOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  detailBody: {
    padding: 20,
  },
  detailNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  detailAge: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  detailMarital: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  infoCell: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  infoCellIcon: {
    fontSize: 18,
  },
  infoCellLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoCellValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  bioSection: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  bioTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  interestsSection: {
    marginBottom: 16,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  interestTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.primary + '22',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  interestTagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1A2E4A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A4E7A',
  },
  privacyTitle: {
    color: '#60A5FA',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 3,
  },
  privacyText: {
    color: '#93C5FD',
    fontSize: 12,
    lineHeight: 17,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  closeDetailBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  closeDetailBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  expressBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  expressBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
});



// Main Home Screen component that switches based on user mode
const HomeScreen = ({ navigation }) => {
  const { userMode, toggleMode, loading } = useMode();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }


  // Render the appropriate home screen along with a floating toggle button
  return (
    <View style={{ flex: 1 }}>
      {userMode === 'matrimony' ? (
        <MatrimonyHome navigation={navigation} />
      ) : (
        <DatingHome navigation={navigation} />
      )}

      {/* Temporary Toggle Button for development */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 50,
          left: 20,
          backgroundColor: userMode === 'matrimony' ? '#fff' : colors.primary,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          zIndex: 9999,
          flexDirection: 'row',
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3
        }}
        onPress={toggleMode}
      >
        <Text style={{
          color: userMode === 'matrimony' ? colors.primary : '#fff',
          fontSize: 12,
          fontWeight: 'bold',
          marginLeft: 4
        }}>
          {userMode === 'matrimony' ? '💍 Matrimony' : '🔥 Dating'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

module.exports = HomeScreen;
