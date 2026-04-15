const React = require('react');
const {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} = require('react-native');
const { useEffect, useMemo, useState } = React;
const { Ionicons } = require('@expo/vector-icons');
const { useMode } = require('../../../context/ModeContext');
const { supabase } = require('../../../supabase');
const Colors = require('../../theme/Colors');
const { tribesData } = require('../../utils/constants');

const TribeSearchScreen = ({ navigation }) => {
  const { userMode } = useMode();
  const [query, setQuery] = useState('');
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    navigation.setOptions?.({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const { data, error } = await supabase
          .from('tribes')
          .select('id, slug, name, description, icon, category')
          .eq('category', userMode)
          .order('name', { ascending: true });

        if (error) throw error;

        if (data?.length) {
          setAllItems(data);
          return;
        }
      } catch (error) {
        console.error('Load tribe search items error:', error);
      }

      setAllItems(
        tribesData.map((tribe) => {
          const modeData = userMode === 'dating' ? tribe.dating : tribe.matrimony;
          return {
            id: tribe.id,
            slug: tribe.id,
            icon: tribe.icon,
            category: userMode,
            ...modeData,
          };
        })
      );
    };

    loadItems();
  }, [userMode]);

  const items = useMemo(() => {
    return allItems
      .filter((item) => {
        if (!query.trim()) return true;
        const needle = query.trim().toLowerCase();
        return (
          item.name.toLowerCase().includes(needle) ||
          item.description.toLowerCase().includes(needle)
        );
      });
  }, [allItems, query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search {userMode === 'dating' ? 'Tribes' : 'Zones'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Find ${userMode === 'dating' ? 'tribes' : 'zones'}`}
          placeholderTextColor={Colors.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('TribeInner', { tribe: item, userMode })}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.content}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No matches found.</Text>}
      />
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
  searchBox: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, marginLeft: 10, color: Colors.text, fontSize: 15 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { fontSize: 28, marginRight: 14 },
  content: { flex: 1 },
  name: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  description: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
});

module.exports = TribeSearchScreen;
