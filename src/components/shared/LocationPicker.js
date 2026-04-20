// src/components/shared/LocationPicker.js
const React = require('react');
const { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } = require('react-native');
const { useState, useEffect } = React;
const { Country, State } = require('country-state-city');
const Colors = require('../../theme/Colors');
const { Ionicons } = require('@expo/vector-icons');

const LocationPicker = ({ onLocationSelect, initialCity }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [cityQuery, setCityQuery] = useState(initialCity || '');
  
  const [cityResults, setCityResults] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showDropdown, setShowDropdown] = useState(''); // 'country', 'state', 'city'

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
    const india = allCountries.find(c => c.isoCode === 'IN');
    if (india) {
      setSelectedCountry(india);
      setStates(State.getStatesOfCountry(india.isoCode));
    }
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry.isoCode));
      // Only reset state/city if we explicitly change country
    }
  }, [selectedCountry]);

  // Debounced OSM Nominatim search for Indian villages/cities
  useEffect(() => {
    if (cityQuery.length < 3 || showDropdown !== 'city') {
      setCityResults([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setLoadingCities(true);
      try {
        const stateQ = selectedState ? selectedState.name : '';
        const countryQ = selectedCountry ? selectedCountry.name : '';
        const q = `${cityQuery}, ${stateQ}, ${countryQ}`.replace(/,\s*,/g, ',');
        
        // OpenStreetMap Nominatim API
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`);
        const data = await res.json();
        
        const uniquePlaces = [];
        const seen = new Set();
        data.forEach(item => {
          const name = item.address?.village || item.address?.town || item.address?.city || item.name;
          if (name && !seen.has(name)) {
            seen.add(name);
            uniquePlaces.push({ name, display_name: item.display_name });
          }
        });
        
        setCityResults(uniquePlaces);
      } catch (err) {
        console.error('OSM Search Error', err);
      } finally {
        setLoadingCities(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [cityQuery, selectedState, selectedCountry, showDropdown]);

  const handleComplete = (cityName) => {
    setCityQuery(cityName);
    setShowDropdown('');
    if (onLocationSelect) {
      onLocationSelect(`${cityName}, ${selectedState?.name || ''}, ${selectedCountry?.name || ''}`.replace(/,\s*$/, '').replace(/^[,\s]+/, ''));
    }
  };

  const renderDropdownItem = (item, type) => (
    <TouchableOpacity 
      style={styles.dropdownItem} 
      onPress={() => {
        if (type === 'country') {
          setSelectedCountry(item);
          setSelectedState(null);
          setCityQuery('');
          setShowDropdown('');
        } else if (type === 'state') {
          setSelectedState(item);
          setCityQuery('');
          setShowDropdown('');
        } else {
          handleComplete(item.name);
        }
      }}
    >
      <Text style={styles.dropdownText}>
        {type === 'city' ? item.display_name : item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Country Selection */}
      <Text style={styles.label}>Country</Text>
      <TouchableOpacity 
        style={styles.inputBox} 
        onPress={() => setShowDropdown(showDropdown === 'country' ? '' : 'country')}
      >
        <Text style={{ color: selectedCountry ? Colors.text : Colors.textSecondary }}>
          {selectedCountry ? selectedCountry.name : 'Select Country'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
      {showDropdown === 'country' && (
        <View style={styles.dropdownList}>
          <FlatList 
            data={countries} 
            keyExtractor={item => item.isoCode}
            renderItem={({item}) => renderDropdownItem(item, 'country')}
            nestedScrollEnabled
            style={{ maxHeight: 200 }}
          />
        </View>
      )}

      {/* State Selection */}
      <Text style={[styles.label, { marginTop: 12 }]}>State / Province</Text>
      <TouchableOpacity 
        style={[styles.inputBox, !selectedCountry && styles.disabled]} 
        disabled={!selectedCountry}
        onPress={() => setShowDropdown(showDropdown === 'state' ? '' : 'state')}
      >
        <Text style={{ color: selectedState ? Colors.text : Colors.textSecondary }}>
          {selectedState ? selectedState.name : 'Select State'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
      {showDropdown === 'state' && (
        <View style={styles.dropdownList}>
          <FlatList 
            data={states} 
            keyExtractor={item => item.isoCode}
            renderItem={({item}) => renderDropdownItem(item, 'state')}
            nestedScrollEnabled
            style={{ maxHeight: 200 }}
          />
        </View>
      )}

      {/* City/Village Selection */}
      <Text style={[styles.label, { marginTop: 12 }]}>City / Village</Text>
      <View style={{ position: 'relative', zIndex: showDropdown === 'city' ? 99 : 1 }}>
        <TextInput
          style={styles.textInput}
          placeholder="Type to search village or city..."
          placeholderTextColor={Colors.textSecondary}
          value={cityQuery}
          onChangeText={(txt) => {
            setCityQuery(txt);
            setShowDropdown('city');
          }}
          onFocus={() => setShowDropdown('city')}
          editable={!!selectedState}
        />
        {loadingCities && (
          <ActivityIndicator style={{ position: 'absolute', right: 12, top: 14 }} color={Colors.primary} />
        )}
      </View>
      
      {showDropdown === 'city' && cityResults.length > 0 && (
        <View style={[styles.dropdownList, { position: 'relative', marginTop: 4 }]}>
          {cityResults.map((item, idx) => (
            <React.Fragment key={idx}>{renderDropdownItem(item, 'city')}</React.Fragment>
          ))}
        </View>
      )}
      
      {/* Manual override button */}
      {showDropdown === 'city' && cityQuery.length > 2 && !loadingCities && (
        <TouchableOpacity 
          style={{ padding: 12, backgroundColor: Colors.surface, borderRadius: 8, marginTop: 4 }}
          onPress={() => handleComplete(cityQuery)}
        >
          <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Use "{cityQuery}"</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: Colors.text, marginBottom: 8, marginLeft: 4 },
  inputBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    color: Colors.text,
  },
  disabled: { opacity: 0.5 },
  dropdownList: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 100,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '50',
  },
  dropdownText: { color: Colors.text, fontSize: 14 },
});

module.exports = LocationPicker;
