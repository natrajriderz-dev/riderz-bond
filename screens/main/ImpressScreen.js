// screens/main/ImpressScreen.js
const React = require('react');
const {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions
} = require('react-native');
const { useState, useEffect } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const axios = require('axios');
const ImagePicker = require('expo-image-picker');
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
  interested: '#3B82F6',
  inspired: '#8B5CF6',
  impressed: '#EC4899',
  love: '#EF4444',
};

// Reaction types
const REACTIONS = [
  { type: 'interested', icon: '🤔', color: colors.interested, label: 'Interested' },
  { type: 'inspired', icon: '✨', color: colors.inspired, label: 'Inspired' },
  { type: 'impressed', icon: '👏', color: colors.impressed, label: 'Impressed' },
  { type: 'love', icon: '❤️', color: colors.love, label: 'Love' },
];

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  // Post Card Styles
  postCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  postUserMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  postTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  verifiedBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  verifiedText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  tribeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  tribeBadgeText: {
    color: colors.textSecondary,
    fontSize: 10,
    marginLeft: 4,
  },
  postImage: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  postCaption: {
    padding: 12,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  // Reactions Bar
  reactionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reactionButtonActive: {
    backgroundColor: colors.primary + '20',
  },
  reactionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  reactionCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  reactionCountActive: {
    color: colors.primary,
  },
  // Reactions Summary
  reactionsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  reactionChips: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reactionChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -6,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  totalReactions: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  // Create Post Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  // Photo Upload
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadPlaceholderText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  uploadButtonText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 8,
  },
  // Caption Input
  captionInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  // Visibility Options
  visibilityContainer: {
    marginBottom: 20,
  },
  visibilityTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  visibilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visibilityOption: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  visibilityOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  visibilityOptionText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  visibilityOptionTextSelected: {
    color: colors.primary,
  },
  // Submit Button
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  // Tribe Tags
  tribeTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tribeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tribeTagSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  tribeTagText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  // Loading States
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
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading More
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

// Post Card Component
const PostCard = ({ post, currentUserId, onReaction, onUserPress }) => {
  const [showFullCaption, setShowFullCaption] = useState(false);
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderReactions = () => {
    return REACTIONS.map((reaction) => {
      const count = post.reaction_counts?.[reaction.type] || 0;
      const isActive = post.user_reaction?.type === reaction.type;

      return (
        <TouchableOpacity
          key={reaction.type}
          style={[styles.reactionButton, isActive && styles.reactionButtonActive]}
          onPress={() => onReaction(post.id, reaction.type)}
        >
          <Text style={styles.reactionIcon}>{reaction.icon}</Text>
          <Text style={[styles.reactionCount, isActive && styles.reactionCountActive]}>
            {count}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const renderReactionSummary = () => {
    const total = post.reaction_counts?.total || 0;
    if (total === 0) return null;

    // Get top 3 reactions by count
    const topReactions = REACTIONS
      .map(r => ({ ...r, count: post.reaction_counts?.[r.type] || 0 }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return (
      <View style={styles.reactionsSummary}>
        <View style={styles.reactionChips}>
          {topReactions.map((reaction, index) => (
            <View key={reaction.type} style={[styles.reactionChip, { zIndex: 3 - index }]}>
              <Text style={{ fontSize: 12 }}>{reaction.icon}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.totalReactions}>
          {total} {total === 1 ? 'reaction' : 'reactions'}
        </Text>
      </View>
    );
  };

  const truncatedCaption = post.caption.length > 150 && !showFullCaption
    ? post.caption.substring(0, 150) + '... '
    : post.caption;

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <TouchableOpacity 
        style={styles.postHeader}
        onPress={() => onUserPress(post.user_id)}
      >
        <Image 
          source={{ uri: post.user?.profile_picture_url || 'https://via.placeholder.com/40' }} 
          style={styles.postAvatar} 
        />
        <View style={styles.postUserInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.postUserName}>{post.user?.display_name}</Text>
            {post.user?.trust_level === 'green_verified' && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.postUserMeta}>
            <Text>{post.user?.location || 'Location not set'}</Text>
            <Text style={styles.postTime}>• {formatTime(post.created_at)}</Text>
          </View>
        </View>
        {post.tribe_tags && post.tribe_tags.length > 0 && (
          <View style={styles.tribeBadge}>
            <Text>🏷️</Text>
            <Text style={styles.tribeBadgeText}>{post.tribe_tags[0]}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Post Image */}
      {post.media_urls && post.media_urls.length > 0 && (
        <Image 
          source={{ uri: post.media_urls[0] }} 
          style={styles.postImage} 
        />
      )}

      {/* Caption */}
      <View style={{ padding: 12 }}>
        <Text style={styles.postCaption}>
          {truncatedCaption}
          {post.caption.length > 150 && !showFullCaption && (
            <Text 
              style={{ color: colors.primary }}
              onPress={() => setShowFullCaption(true)}
            >
              more
            </Text>
          )}
        </Text>
      </View>

      {/* Reactions Bar */}
      <View style={styles.reactionsBar}>
        {renderReactions()}
      </View>

      {/* Reactions Summary */}
      {renderReactionSummary()}
    </View>
  );
};

// Create Post Modal
const CreatePostModal = ({ visible, onClose, onSubmit }) => {
  const [photo, setPhoto] = useState(null);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [selectedTribes, setSelectedTribes] = useState([]);
  const [userTribes, setUserTribes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadUserTribes();
    }
  }, [visible]);

  const loadUserTribes = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('http://100.115.92.194:3001/api/tribes/my', {
        headers: { Authorization: `Bearer ${token}` },
        params: { user_id: (await AsyncStorage.getItem('userId')) }
      });

      if (response.data.tribes) {
        setUserTribes(response.data.tribes.map(t => t.tribe));
      }
    } catch (error) {
      console.error('Load user tribes error:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePhotoUpload = () => {
    Alert.alert(
      'Upload Photo',
      'Choose a photo for your post',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
      ]
    );
  };

  const toggleTribe = (tribeId) => {
    setSelectedTribes(prev =>
      prev.includes(tribeId)
        ? prev.filter(id => id !== tribeId)
        : [...prev, tribeId]
    );
  };

  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert('Error', 'Please select a photo');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }

    setLoading(true);
    try {
      // In real app, you'd upload the image first
      const formData = new FormData();
      formData.append('photo', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'post.jpg',
      });
      formData.append('caption', caption);
      formData.append('visibility', visibility);
      formData.append('tribe_tags', JSON.stringify(selectedTribes));

      // Mock success for now
      setTimeout(() => {
        onSubmit({
          photo: photo.uri,
          caption,
          visibility,
          tribe_tags: selectedTribes,
        });
        setPhoto(null);
        setCaption('');
        setVisibility('public');
        setSelectedTribes([]);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Create post error:', error);
      Alert.alert('Error', 'Failed to create post');
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Post</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Photo Upload */}
            <View style={styles.photoUploadContainer}>
              <TouchableOpacity 
                style={styles.photoPreview}
                onPress={handlePhotoUpload}
              >
                {photo ? (
                  <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera" size={48} color={colors.textSecondary} />
                    <Text style={styles.uploadPlaceholderText}>Tap to add photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handlePhotoUpload}
              >
                <Ionicons name="images" size={20} color={colors.text} />
                <Text style={styles.uploadButtonText}>
                  {photo ? 'Change Photo' : 'Upload Photo'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Caption Input */}
            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="Write a caption..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
            />

            {/* Visibility Options */}
            <View style={styles.visibilityContainer}>
              <Text style={styles.visibilityTitle}>Visibility</Text>
              <View style={styles.visibilityOptions}>
                {['public', 'tribe_only', 'connections'].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.visibilityOption,
                      visibility === opt && styles.visibilityOptionSelected
                    ]}
                    onPress={() => setVisibility(opt)}
                  >
                    <Text style={[
                      styles.visibilityOptionText,
                      visibility === opt && styles.visibilityOptionTextSelected
                    ]}>
                      {opt === 'public' ? '🌍 Public' :
                       opt === 'tribe_only' ? '👥 Tribes' : '🤝 Connections'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tribe Tags (if visibility is tribe_only) */}
            {visibility === 'tribe_only' && userTribes.length > 0 && (
              <View style={styles.visibilityContainer}>
                <Text style={styles.visibilityTitle}>Select Tribes</Text>
                <View style={styles.tribeTagsContainer}>
                  {userTribes.map((tribe) => (
                    <TouchableOpacity
                      key={tribe.id}
                      style={[
                        styles.tribeTag,
                        selectedTribes.includes(tribe.id) && styles.tribeTagSelected
                      ]}
                      onPress={() => toggleTribe(tribe.id)}
                    >
                      <Text>🏷️</Text>
                      <Text style={styles.tribeTagText}>{tribe.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Text style={styles.submitButtonText}>Share Post</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// Main Impress Screen
const ImpressScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userMode, setUserMode] = useState('dating');

  useEffect(() => {
    loadUserData();
    loadFeed();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const mode = await AsyncStorage.getItem('userMode');
      setCurrentUserId(userId);
      setUserMode(mode || 'dating');
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const loadFeed = async (refresh = false) => {
    if (refresh) {
      setPage(0);
      setHasMore(true);
    }

    const currentPage = refresh ? 0 : page;
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      
      const response = await axios.get('http://100.115.92.194:3001/api/impress/feed', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          user_id: userId,
          limit: 10,
          offset: currentPage * 10
        }
      });

      if (response.data.posts) {
        setPosts(prev => refresh ? response.data.posts : [...prev, ...response.data.posts]);
        setHasMore(response.data.pagination.has_more);
        if (!refresh) {
          setPage(currentPage + 1);
        }
      }
    } catch (error) {
      console.error('Load feed error:', error);
      Alert.alert('Error', 'Failed to load feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      loadFeed();
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      const response = await axios.post('http://100.115.92.194:3001/api/impress/react',
        {
          post_id: postId,
          user_id: userId,
          reaction_type: reactionType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const newReaction = response.data.reaction;
          
          // Update reaction counts
          const reactionCounts = { ...post.reaction_counts };
          if (post.user_reaction) {
            // Remove old reaction
            reactionCounts[post.user_reaction.type] = (reactionCounts[post.user_reaction.type] || 1) - 1;
          }
          
          if (newReaction) {
            // Add new reaction
            reactionCounts[newReaction.type] = (reactionCounts[newReaction.type] || 0) + 1;
          }

          // Recalculate total
          reactionCounts.total = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

          return {
            ...post,
            user_reaction: newReaction ? {
              id: newReaction.id,
              type: newReaction.reaction_type,
              created_at: newReaction.created_at
            } : null,
            reaction_counts: reactionCounts
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Reaction error:', error);
      Alert.alert('Error', 'Failed to react to post');
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      // In real app, you'd upload to API here
      const newPost = {
        id: Date.now().toString(),
        user_id: currentUserId,
        user: {
          display_name: 'You',
          profile_picture_url: null,
          trust_level: 'green_verified',
          location: 'Your City'
        },
        caption: postData.caption,
        media_urls: [postData.photo],
        tribe_tags: postData.tribe_tags,
        visibility: postData.visibility,
        created_at: new Date().toISOString(),
        reaction_counts: {
          interested: 0,
          inspired: 0,
          impressed: 0,
          love: 0,
          total: 0
        },
        user_reaction: null
      };

      setPosts(prev => [newPost, ...prev]);
      setShowCreateModal(false);
      Alert.alert('Success', 'Post created successfully! It will appear in feeds after approval.');
    } catch (error) {
      console.error('Create post error:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleUserPress = (userId) => {
    navigation.navigate('Profile', { userId });
  };

  // Don't show Impress in matrimony mode
  if (userMode === 'matrimony') {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Impress Feed</Text>
        <Text style={styles.emptySubtext}>
          The Impress feed is only available in Dating mode. Switch to Dating mode to share and view posts.
        </Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => navigation.navigate('ModeSelect')}
        >
          <Text style={styles.buttonText}>Switch Mode</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptySubtext, { marginTop: 20 }]}>Loading feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Impress</Text>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={currentUserId}
            onReaction={handleReaction}
            onUserPress={handleUserPress}
          />
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share your story! Tap the + button to create your first post.
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={30} color={colors.text} />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
    </View>
  );
};

module.exports = ImpressScreen;