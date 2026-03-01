// screens/main/TribesScreen.js
const React = require('react');
const {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions
} = require('react-native');
const { useState, useEffect } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const axios = require('axios');
const { Ionicons } = require('@expo/vector-icons');

const { width } = Dimensions.get('window');

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
  premium: '#D97706',
  locked: '#4B5563',
};

// Tribe/Zone data (8 items)
const tribesData = [
  {
    id: '1',
    dating: {
      name: 'Adventurer Tribe',
      icon: '🧗',
      description: 'Mountain climbers, hikers, and outdoor enthusiasts',
    },
    matrimony: {
      name: 'Explorer Zone',
      icon: '🧗',
      description: 'Seeking partners who love adventure and exploration',
    }
  },
  {
    id: '2',
    dating: {
      name: 'Nomad Tribe',
      icon: '✈️',
      description: 'Digital nomads, travelers, and wanderlust souls',
    },
    matrimony: {
      name: 'Traveller Zone',
      icon: '✈️',
      description: 'Looking for a partner to explore the world with',
    }
  },
  {
    id: '3',
    dating: {
      name: 'Foodie Tribe',
      icon: '🍜',
      description: 'Restaurant hoppers, home cooks, and culinary explorers',
    },
    matrimony: {
      name: 'Culinary Zone',
      icon: '🍜',
      description: 'Share your love for cooking and dining together',
    }
  },
  {
    id: '4',
    dating: {
      name: 'Athlete Tribe',
      icon: '⚡',
      description: 'Gym enthusiasts, runners, and sports lovers',
    },
    matrimony: {
      name: 'Active Living Zone',
      icon: '⚡',
      description: 'Find a partner who shares your active lifestyle',
    }
  },
  {
    id: '5',
    dating: {
      name: 'Creator Tribe',
      icon: '🎨',
      description: 'Artists, designers, musicians, and creative minds',
    },
    matrimony: {
      name: 'Creative Arts Zone',
      icon: '🎨',
      description: 'Connect with artistic souls for a creative partnership',
    }
  },
  {
    id: '6',
    dating: {
      name: 'Govt Staff Tribe',
      icon: '🏛️',
      description: 'Government employees and public service professionals',
    },
    matrimony: {
      name: 'Public Service Zone',
      icon: '🏛️',
      description: 'Meet others in government and public service',
    }
  },
  {
    id: '7',
    dating: {
      name: 'Professional Tribe',
      icon: '💼',
      description: 'Corporate professionals and career-focused individuals',
    },
    matrimony: {
      name: 'Career Zone',
      icon: '💼',
      description: 'Find a partner who understands your career ambitions',
    }
  },
  {
    id: '8',
    dating: {
      name: 'Nightlife Tribe',
      icon: '🌙',
      description: 'Club goers, party enthusiasts, and night owls',
    },
    matrimony: {
      name: 'Modern Lifestyle Zone',
      icon: '🌙',
      description: 'For those who enjoy modern urban living and nightlife',
    }
  },
];

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
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
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
  // Premium Badge
  premiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  premiumDescription: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  // My Tribes Section
  myTribesSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionCount: {
    color: colors.primary,
    fontSize: 14,
  },
  myTribesScroll: {
    paddingLeft: 20,
  },
  myTribeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    width: 140,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  myTribePrimary: {
    borderColor: colors.primary,
  },
  myTribeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  myTribeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  myTribeMemberCount: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  myTribeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  myTribeBadgeText: {
    color: colors.primary,
    fontSize: 9,
    marginLeft: 2,
  },
  // All Tribes Grid
  tribesGrid: {
    paddingHorizontal: 12,
  },
  tribeCard: {
    flex: 1,
    margin: 6,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    minHeight: 160,
  },
  tribeCardLocked: {
    opacity: 0.7,
  },
  tribeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tribeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  tribeMemberCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  tribeDescription: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 14,
  },
  lockOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.surfaceLight,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Tribe Inner Page Styles
  tribeInnerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tribeHeader: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tribeCover: {
    height: 150,
    backgroundColor: colors.primary + '40',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  tribeHeaderIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    marginBottom: 10,
  },
  tribeHeaderName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  tribeHeaderStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  joinButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: colors.error,
  },
  // Members List
  membersContainer: {
    padding: 16,
  },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  memberAge: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  memberLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  memberBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  verifiedText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  primaryBadge: {
    backgroundColor: colors.gold + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '600',
  },
  // Premium Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: colors.surfaceLight,
  },
  modalCloseButtonText: {
    color: colors.textSecondary,
  },
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
});

// Tribe Inner Page Component
const TribeInnerPage = ({ route, navigation }) => {
  const { tribe, userMode, isPremium, userTribes } = route.params;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    loadMembers();
    checkMembership();
  }, []);

  const loadMembers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`http://100.115.92.194:3001/api/tribes/${tribe.id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 }
      });

      if (response.data.members) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Load members error:', error);
      Alert.alert('Error', 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = () => {
    const member = userTribes.find(t => t.tribe.id === tribe.id);
    if (member) {
      setIsMember(true);
      setIsPrimary(member.is_primary);
    }
  };

  const handleJoin = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      await axios.post('http://100.115.92.194:3001/api/tribes/join',
        {
          user_id: userId,
          tribe_id: tribe.id,
          is_primary: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsMember(true);
      Alert.alert('Success', `You've joined ${tribe.name}!`);
      
      // Refresh members list
      loadMembers();
    } catch (error) {
      console.error('Join tribe error:', error);
      if (error.response?.status === 403) {
        Alert.alert('Limit Reached', 'You can only join up to 3 tribes. Leave a tribe first.');
      } else {
        Alert.alert('Error', 'Failed to join tribe');
      }
    }
  };

  const handleLeave = async () => {
    Alert.alert(
      'Leave Tribe',
      `Are you sure you want to leave ${tribe.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const userId = await AsyncStorage.getItem('userId');

              await axios.delete('http://100.115.92.194:3001/api/tribes/leave',
                {
                  headers: { Authorization: `Bearer ${token}` },
                  data: {
                    user_id: userId,
                    tribe_id: tribe.id
                  }
                }
              );

              setIsMember(false);
              setIsPrimary(false);
              Alert.alert('Success', `You've left ${tribe.name}`);
              
              // Refresh members list
              loadMembers();
            } catch (error) {
              console.error('Leave tribe error:', error);
              Alert.alert('Error', 'Failed to leave tribe');
            }
          }
        }
      ]
    );
  };

  const handleSetPrimary = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      await axios.put('http://100.115.92.194:3001/api/tribes/primary',
        {
          user_id: userId,
          tribe_id: tribe.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsPrimary(true);
      Alert.alert('Success', `${tribe.name} is now your primary tribe`);
    } catch (error) {
      console.error('Set primary error:', error);
      Alert.alert('Error', 'Failed to set as primary');
    }
  };

  const renderMember = ({ item }) => (
    <TouchableOpacity 
      style={styles.memberCard}
      onPress={() => navigation.navigate('Profile', { userId: item.user_id })}
    >
      <Image 
        source={{ uri: item.user.profile_picture_url || 'https://via.placeholder.com/50' }} 
        style={styles.memberAvatar} 
      />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{item.user.display_name}</Text>
          <Text style={styles.memberAge}>{item.user.age}</Text>
        </View>
        <Text style={styles.memberLocation}>{item.user.location || 'Location not set'}</Text>
        <View style={styles.memberBadges}>
          {item.user.trust_level === 'green_verified' && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
          {item.is_primary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>⭐ Primary</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const itemType = userMode === 'dating' ? 'Tribe' : 'Zone';

  return (
    <View style={styles.tribeInnerContainer}>
      <ScrollView>
        <View style={styles.tribeHeader}>
          <View style={styles.tribeCover}>
            <View style={styles.tribeHeaderIcon}>
              <Text style={{ fontSize: 40 }}>{tribe.icon}</Text>
            </View>
            <Text style={styles.tribeHeaderName}>{tribe.name}</Text>
            <Text style={[styles.tribeDescription, { color: colors.textSecondary, paddingHorizontal: 20, textAlign: 'center' }]}>
              {tribe.description}
            </Text>

            {isMember ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {!isPrimary && (
                  <TouchableOpacity 
                    style={[styles.joinButton, { backgroundColor: colors.surfaceLight }]}
                    onPress={handleSetPrimary}
                  >
                    <Text style={[styles.joinButtonText, { color: colors.primary }]}>Make Primary</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.joinButton, styles.leaveButton]}
                  onPress={handleLeave}
                >
                  <Text style={styles.joinButtonText}>Leave {itemType}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={handleJoin}
              >
                <Text style={styles.joinButtonText}>Join {itemType}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tribeHeaderStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{members.length}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>🏷️</Text>
              <Text style={styles.statLabel}>{itemType}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {isMember ? '✓' : '✗'}
              </Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>
        </View>

        <View style={styles.membersContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Members</Text>
          
          {members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No members yet. Be the first to join!</Text>
            </View>
          ) : (
            <FlatList
              data={members}
              renderItem={renderMember}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Main Tribes Screen
const TribesScreen = ({ navigation }) => {
  const [userMode, setUserMode] = useState('dating');
  const [isPremium, setIsPremium] = useState(false);
  const [userTribes, setUserTribes] = useState([]);
  const [allTribes, setAllTribes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedTribe, setSelectedTribe] = useState(null);

  useEffect(() => {
    loadUserData();
    loadTribes();
  }, []);

  const loadUserData = async () => {
    try {
      const mode = await AsyncStorage.getItem('userMode');
      const premium = await AsyncStorage.getItem('isPremium') === 'true';
      setUserMode(mode || 'dating');
      setIsPremium(premium);

      // Load user's tribes
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      
      const response = await axios.get('http://100.115.92.194:3001/api/tribes/my', {
        headers: { Authorization: `Bearer ${token}` },
        params: { user_id: userId }
      });

      if (response.data.tribes) {
        setUserTribes(response.data.tribes);
      }
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const loadTribes = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('http://100.115.92.194:3001/api/tribes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.tribes) {
        // Merge API data with our static tribe data
        const mergedTribes = tribesData.map(tribe => {
          const apiTribe = response.data.tribes.find(t => t.id === tribe.id);
          const modeData = userMode === 'dating' ? tribe.dating : tribe.matrimony;
          return {
            id: tribe.id,
            ...modeData,
            member_count: apiTribe?.member_count || Math.floor(Math.random() * 100) + 20,
          };
        });
        setAllTribes(mergedTribes);
      }
    } catch (error) {
      console.error('Load tribes error:', error);
      // Fallback to static data with random member counts
      const fallbackTribes = tribesData.map(tribe => {
        const modeData = userMode === 'dating' ? tribe.dating : tribe.matrimony;
        return {
          id: tribe.id,
          ...modeData,
          member_count: Math.floor(Math.random() * 100) + 20,
        };
      });
      setAllTribes(fallbackTribes);
    } finally {
      setLoading(false);
    }
  };

  const handleTribePress = (tribe) => {
    const isUserTribe = userTribes.some(t => t.tribe.id === tribe.id);
    
    if (isUserTribe || isPremium) {
      // Can enter
      navigation.navigate('TribeInner', {
        tribe,
        userMode,
        isPremium,
        userTribes
      });
    } else {
      // Show premium modal
      setSelectedTribe(tribe);
      setShowPremiumModal(true);
    }
  };

  const renderTribeCard = ({ item }) => {
    const isUserTribe = userTribes.some(t => t.tribe.id === item.id);
    const canEnter = isUserTribe || isPremium;

    return (
      <TouchableOpacity
        style={[
          styles.tribeCard,
          !canEnter && styles.tribeCardLocked
        ]}
        onPress={() => handleTribePress(item)}
      >
        <View style={styles.tribeIcon}>
          <Text style={{ fontSize: 30 }}>{item.icon}</Text>
        </View>
        <Text style={styles.tribeName}>{item.name}</Text>
        <Text style={styles.tribeMemberCount}>{item.member_count} members</Text>
        <Text style={styles.tribeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        {!canEnter && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={16} color={colors.locked} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMyTribe = ({ item }) => (
    <TouchableOpacity
      style={[styles.myTribeCard, item.is_primary && styles.myTribePrimary]}
      onPress={() => handleTribePress(item.tribe)}
    >
      <View style={styles.myTribeIcon}>
        <Text style={{ fontSize: 24 }}>{item.tribe.icon}</Text>
      </View>
      <Text style={styles.myTribeName} numberOfLines={1}>{item.tribe.name}</Text>
      <Text style={styles.myTribeMemberCount}>{item.tribe.member_count} members</Text>
      {item.is_primary && (
        <View style={styles.myTribeBadge}>
          <Text>⭐</Text>
          <Text style={styles.myTribeBadgeText}>Primary</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const itemType = userMode === 'dating' ? 'Tribes' : 'Zones';
  const itemSingular = userMode === 'dating' ? 'Tribe' : 'Zone';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{itemType}</Text>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Premium Banner */}
        {!isPremium && (
          <TouchableOpacity 
            style={styles.premiumContainer}
            onPress={() => setShowPremiumModal(true)}
          >
            <View style={styles.premiumIcon}>
              <Text>⭐</Text>
            </View>
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>Unlock All {itemType}</Text>
              <Text style={styles.premiumDescription}>
                Go Premium to join and explore any {itemSingular.toLowerCase()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* My Tribes Section */}
        {userTribes.length > 0 && (
          <View style={styles.myTribesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My {itemType}</Text>
              <Text style={styles.sectionCount}>{userTribes.length}/3</Text>
            </View>
            <FlatList
              horizontal
              data={userTribes}
              renderItem={renderMyTribe}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.myTribesScroll}
            />
          </View>
        )}

        {/* All Tribes Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All {itemType}</Text>
          <Text style={styles.sectionCount}>{allTribes.length}</Text>
        </View>

        <FlatList
          data={allTribes}
          renderItem={renderTribeCard}
          keyExtractor={item => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.tribesGrid}
        />
      </ScrollView>

      {/* Premium Modal */}
      <Modal
        visible={showPremiumModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPremiumModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPremiumModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text>⭐</Text>
            </View>
            <Text style={styles.modalTitle}>Unlock Premium</Text>
            <Text style={styles.modalText}>
              {selectedTribe ? (
                `Join "${selectedTribe.name}" and explore all ${itemType.toLowerCase()} with Premium membership.`
              ) : (
                `Get Premium to join any ${itemSingular.toLowerCase()} and connect with more like-minded people.`
              )}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowPremiumModal(false);
                navigation.navigate('Premium');
              }}
            >
              <Text style={styles.modalButtonText}>View Premium Plans</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton]}
              onPress={() => setShowPremiumModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Export the stack with both screens
const TribesStack = ({ navigation }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="TribesMain" component={TribesScreen} />
      <Stack.Screen name="TribeInner" component={TribeInnerPage} />
    </Stack.Navigator>
  );
};

module.exports = TribesStack;