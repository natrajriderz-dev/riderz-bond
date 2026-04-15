const React = require('react');
const {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} = require('react-native');
const { useEffect, useState } = React;
const { Ionicons } = require('@expo/vector-icons');
const { supabase } = require('../../../supabase');
const Colors = require('../../theme/Colors');

const MemberProfileScreen = ({ route, navigation }) => {
  const { userId, fallbackMember } = route.params || {};
  const [member, setMember] = useState(fallbackMember || null);
  const [loading, setLoading] = useState(!fallbackMember && !!userId);

  useEffect(() => {
    if (!userId || fallbackMember) return;

    const loadMember = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, city, bio, trust_score, user_profiles(primary_photo_url)')
          .eq('id', userId)
          .single();

        if (error) throw error;

        setMember({
          id: data.id,
          name: data.full_name,
          city: data.city,
          bio: data.bio,
          trust_score: data.trust_score,
          photo: data.user_profiles?.[0]?.primary_photo_url || null,
        });
      } catch (error) {
        console.error('Load member profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [fallbackMember, userId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Image
            source={{ uri: member?.photo || 'https://via.placeholder.com/160' }}
            style={styles.photo}
          />
          <Text style={styles.name}>{member?.name || 'Community Member'}</Text>
          <Text style={styles.city}>{member?.city || 'Location not available'}</Text>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
            <Text style={styles.badgeText}>
              Trust Score {member?.trust_score ?? 'N/A'}
            </Text>
          </View>
          <Text style={styles.bio}>
            {member?.bio || 'This member has not added a bio yet.'}
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', padding: 24, paddingBottom: 40 },
  photo: { width: 160, height: 160, borderRadius: 80, marginBottom: 20, backgroundColor: Colors.surface },
  name: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 6, textAlign: 'center' },
  city: { fontSize: 15, color: Colors.textSecondary, marginBottom: 16 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
  },
  badgeText: { color: Colors.primary, fontWeight: '700', marginLeft: 8 },
  bio: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center' },
});

module.exports = MemberProfileScreen;
