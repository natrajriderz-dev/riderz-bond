// screens/main/ChatStack.js
const React = require('react');
const {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl
} = require('react-native');
const { createStackNavigator } = require('@react-navigation/stack');
const { useState, useEffect, useRef } = React;
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const axios = require('axios');
const { Ionicons } = require('@expo/vector-icons');

const Stack = createStackNavigator();

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
  messageMine: '#D97706',
  messageTheirs: '#2D2D2D',
  online: '#10B981',
  offline: '#6B7280',
  sent: '#6B7280',
  delivered: '#9CA3AF',
  read: '#3B82F6',
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Matches List Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
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
  matchesList: {
    paddingHorizontal: 20,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  matchTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  matchLastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    flex: 1,
  },
  matchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.online,
    marginRight: 6,
  },
  offlineDot: {
    backgroundColor: colors.offline,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    marginLeft: 2,
  },
  // Chat Screen Styles
  chatContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatUserInfo: {
    flex: 1,
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  chatUserStatus: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    marginLeft: 16,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  messageMine: {
    alignSelf: 'flex-end',
  },
  messageTheirs: {
    alignSelf: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    maxWidth: '100%',
  },
  messageBubbleMine: {
    backgroundColor: colors.messageMine,
    borderBottomRightRadius: 4,
  },
  messageBubbleTheirs: {
    backgroundColor: colors.messageTheirs,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  statusIcon: {
    marginLeft: 4,
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  // Media Message Styles
  mediaMessage: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageMessage: {
    width: 200,
    height: 150,
    borderRadius: 16,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 20,
    minWidth: 150,
  },
  voiceWave: {
    flex: 1,
    height: 30,
    backgroundColor: colors.primary + '40',
    borderRadius: 15,
    marginHorizontal: 8,
  },
  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  attachButton: {
    padding: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  // Attachment Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  attachmentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  attachmentOption: {
    alignItems: 'center',
  },
  attachmentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  // Report Modal
  reportModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  reportOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reportOptionText: {
    color: colors.text,
    fontSize: 16,
  },
  reportOptionDanger: {
    color: colors.error,
  },
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
});

// Matches List Screen
const MatchesListScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
    loadMatches();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const loadMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('http://100.115.92.194:3001/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 }
      });

      if (response.data.conversations) {
        setMatches(response.data.conversations);
      }
    } catch (error) {
      console.error('Load matches error:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

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

  const getStatusIcon = (status) => {
    if (status === 'online') return '🟢';
    if (status === 'offline') return '⚪';
    return '';
  };

  const renderMatchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('Chat', { 
        conversationId: item.id,
        otherUser: item.other_user,
        matchId: item.match_id
      })}
    >
      <Image 
        source={{ uri: item.other_user.profile_picture_url || 'https://via.placeholder.com/60' }} 
        style={styles.matchPhoto} 
      />
      
      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={styles.matchName}>{item.other_user.display_name}</Text>
            {item.other_user.trust_level === 'green_verified' && (
              <View style={styles.badge}>
                <Text>✅</Text>
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            )}
          </View>
          <Text style={styles.matchTime}>{formatTime(item.last_message_at)}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.onlineDot, item.other_user.online ? {} : styles.offlineDot]} />
          <Text style={[styles.matchLastMessage, { flex: 1 }]} numberOfLines={1}>
            {item.last_message ? (
              <>
                {item.last_message.sender_id === userData?.id ? 'You: ' : ''}
                {item.last_message.message_type === 'image' ? '📷 Photo' : 
                 item.last_message.message_type === 'voice' ? '🎤 Voice message' : 
                 item.last_message.message_text}
              </>
            ) : (
              'Start a conversation'
            )}
          </Text>
        </View>

        <View style={styles.matchFooter}>
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread_count}</Text>
            </View>
          )}
          {item.last_message && item.last_message.read_at && (
            <Text style={[styles.matchTime, { marginLeft: 8 }]}>✓✓</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptySubtext, { marginTop: 20 }]}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Home')}>
          <Text>❤️</Text>
        </TouchableOpacity>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubtext}>
            When you match with someone, they'll appear here. Start swiping to find your match!
          </Text>
          <TouchableOpacity 
            style={[styles.sendButton, { width: 200 }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Find Matches</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.matchesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
};

// Chat Screen
const ChatScreen = ({ navigation, route }) => {
  const { conversationId, otherUser, matchId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [otherUserStatus, setOtherUserStatus] = useState('offline');
  
  const flatListRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    loadUserData();
    loadMessages();
    startPolling();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`http://100.115.92.194:3001/api/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 }
      });

      if (response.data.messages) {
        setMessages(response.data.messages);
        scrollToBottom();
        
        // Mark messages as read
        await markMessagesAsRead();
      }
    } catch (error) {
      console.error('Load messages error:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    pollingRef.current = setInterval(async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await axios.get(`http://100.115.92.194:3001/api/chat/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50, since: messages[0]?.created_at }
        });

        if (response.data.messages && response.data.messages.length > 0) {
          setMessages(prev => [...prev, ...response.data.messages]);
          scrollToBottom();
          
          // Mark new messages as read
          await markMessagesAsRead();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  };

  const markMessagesAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put('http://100.115.92.194:3001/api/chat/messages/read',
        { conversation_id: conversationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post('http://100.115.92.194:3001/api/chat/messages',
        {
          conversation_id: conversationId,
          message_text: messageText,
          message_type: 'text'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.data) {
        setMessages(prev => [...prev, response.data.data]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const sendMediaMessage = async (type) => {
    setShowAttachModal(false);
    
    // Simulate media picker
    Alert.alert('Coming Soon', `${type} messages will be available soon!`);
    
    // In real implementation:
    // - Image: Launch image picker, upload to server, send message with URL
    // - Voice: Record audio, upload, send message with URL
  };

  const reportUser = async (reason) => {
    setShowReportModal(false);
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post('http://100.115.92.194:3001/api/reports',
        {
          reported_user_id: otherUser.id,
          match_id: matchId,
          reason: reason,
          conversation_id: conversationId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. Our team will review it shortly.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Report error:', error);
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatus = (message) => {
    if (message.read_at) return { icon: '✓✓', color: colors.read };
    if (message.delivered_at) return { icon: '✓✓', color: colors.delivered };
    return { icon: '✓', color: colors.sent };
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender_id === userData?.id;
    const status = isMine ? getMessageStatus(item) : null;

    const renderMessageContent = () => {
      switch (item.message_type) {
        case 'image':
          return (
            <TouchableOpacity style={styles.mediaMessage}>
              <Image source={{ uri: item.message_text }} style={styles.imageMessage} />
            </TouchableOpacity>
          );
        case 'voice':
          return (
            <View style={styles.voiceMessage}>
              <Text>🎤</Text>
              <View style={styles.voiceWave} />
              <Text style={[styles.messageTime, { marginTop: 0 }]}>0:30</Text>
            </View>
          );
        default:
          return (
            <Text style={styles.messageText}>{item.message_text}</Text>
          );
      }
    };

    return (
      <View style={[styles.messageContainer, isMine ? styles.messageMine : styles.messageTheirs]}>
        <View style={styles.messageRow}>
          {!isMine && (
            <Image 
              source={{ uri: otherUser.profile_picture_url || 'https://via.placeholder.com/30' }} 
              style={styles.messageAvatar} 
            />
          )}
          
          <View style={[
            styles.messageBubble,
            isMine ? styles.messageBubbleMine : styles.messageBubbleTheirs
          ]}>
            {renderMessageContent()}
            
            <View style={[styles.messageStatus, isMine ? { justifyContent: 'flex-end' } : {}]}>
              <Text style={styles.messageTime}>{formatMessageTime(item.created_at)}</Text>
              {status && (
                <Text style={[styles.statusIcon, { color: status.color }]}>
                  {status.icon}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Custom Header */}
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Image 
            source={{ uri: otherUser.profile_picture_url || 'https://via.placeholder.com/40' }} 
            style={styles.chatAvatar} 
          />
          
          <View style={styles.chatUserInfo}>
            <Text style={styles.chatUserName}>{otherUser.display_name}</Text>
            <Text style={styles.chatUserStatus}>
              <View style={[styles.onlineDot, otherUserStatus === 'online' ? {} : styles.offlineDot]} />
              {' '}{otherUserStatus === 'online' ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => navigation.navigate('Profile', { userId: otherUser.id })}
          >
            <Ionicons name="person" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => setShowReportModal(true)}
          >
            <Ionicons name="flag" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        inverted={false}
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => setShowAttachModal(true)}
          >
            <Ionicons name="add-circle" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons name="send" size={20} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Attachment Modal */}
      <Modal
        visible={showAttachModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share to chat</Text>
            
            <View style={styles.attachmentOptions}>
              <TouchableOpacity 
                style={styles.attachmentOption}
                onPress={() => sendMediaMessage('image')}
              >
                <View style={styles.attachmentIcon}>
                  <Text>📷</Text>
                </View>
                <Text style={styles.attachmentText}>Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.attachmentOption}
                onPress={() => sendMediaMessage('voice')}
              >
                <View style={styles.attachmentIcon}>
                  <Text>🎤</Text>
                </View>
                <Text style={styles.attachmentText}>Voice</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.attachmentOption}
                onPress={() => sendMediaMessage('video')}
              >
                <View style={styles.attachmentIcon}>
                  <Text>🎥</Text>
                </View>
                <Text style={styles.attachmentText}>Video</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowAttachModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReportModal(false)}
        >
          <View style={styles.reportModalContent}>
            <Text style={styles.reportTitle}>Report User</Text>
            
            <TouchableOpacity 
              style={styles.reportOption}
              onPress={() => reportUser('inappropriate_messages')}
            >
              <Text style={styles.reportOptionText}>Inappropriate messages</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.reportOption}
              onPress={() => reportUser('fake_profile')}
            >
              <Text style={styles.reportOptionText}>Fake profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.reportOption}
              onPress={() => reportUser('harassment')}
            >
              <Text style={styles.reportOptionText}>Harassment</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.reportOption}
              onPress={() => reportUser('spam')}
            >
              <Text style={styles.reportOptionText}>Spam</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.reportOption, { borderBottomWidth: 0 }]}
              onPress={() => reportUser('other')}
            >
              <Text style={[styles.reportOptionText, styles.reportOptionDanger]}>Other</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.cancelButton, { marginTop: 20 }]}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Chat Stack Navigator
const ChatStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="MatchesList"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MatchesList" component={MatchesListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

module.exports = ChatStack;