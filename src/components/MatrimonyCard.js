const React = require('react');
const {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} = require('react-native');
const { matrimonyStyles } = require('../styles/matrimonyStyles');
const { useMode } = require('../../../context/ModeContext');

// Icons (using text as placeholders - in a real app, use actual icon components)
const Icon = ({ name }) => {
  const icons = {
    age: '🎂',
    height: '📏',
    location: '📍',
    profession: '💼',
    education: '🎓',
  };
  return <Text style={{ fontSize: 16 }}>{icons[name] || '📌'}</Text>;
};

const MatrimonyCard = ({ profile, onViewProfile, onSendInterest }) => {
  const { userMode } = useMode();
  const isMatrimony = userMode === 'matrimony';
  
  // Calculate age from date_of_birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format height
  const formatHeight = (cm) => {
    if (!cm) return 'N/A';
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
  };

  const age = calculateAge(profile.date_of_birth);
  const height = formatHeight(profile.height_cm);
  
  // Handle press with ripple effect simulation
  const handlePressIn = (event) => {
    // In a real implementation, we might use Animated or other libraries
    // For now, we'll just call the provided functions
  };

  return (
    <TouchableWithoutFeedback onPress={() => onViewProfile && onViewProfile(profile)}>
      <View style={matrimonyStyles.cardContainer}>
        {/* Photo with gradient overlay */}
        <View style={matrimonyStyles.photoContainer}>
          <Image
            source={{ uri: profile.profile_photo_url || 'https://via.placeholder.com/150' }}
            style={matrimonyStyles.photo}
            resizeMode="cover"
          />
          <View style={matrimonyStyles.gradientOverlay} />
        </View>
        
        {/* Info section */}
        <View style={matrimonyStyles.infoContainer}>
          <View>
            <View style={matrimonyStyles.headerRow}>
              <Text style={matrimonyStyles.nameText}>
                {profile.full_name || 'Anonymous'}
              </Text>
              {profile.trust_level && profile.trust_level >= 4 && (
                <View style={matrimonyStyles.trustBadge}>
                  <Text style={matrimonyStyles.trustText}>Trusted</Text>
                </View>
              )}
            </View>
            
            {/* Age and Height */}
            <View style={matrimonyStyles.detailRow}>
              <Icon name="age" />
              <Text style={matrimonyStyles.detailText}>
                {age} • {height}
              </Text>
            </View>
            
            {/* Location */}
            {profile.city && (
              <View style={matrimonyStyles.detailRow}>
                <Icon name="location" />
                <Text style={matrimonyStyles.detailText}>
                  {profile.city}
                  {profile.state ? `, ${profile.state}` : ''}
                  {profile.country ? `, ${profile.country}` : ''}
                </Text>
              </View>
            )}
            
            {/* Profession */}
            {profile.profession && (
              <View style={matrimonyStyles.detailRow}>
                <Icon name="profession" />
                <Text style={matrimonyStyles.detailText}>
                  {profile.profession}
                </Text>
              </View>
            )}
            
            {/* Education */}
            {profile.education && (
              <View style={matrimonyStyles.detailRow}>
                <Icon name="education" />
                <Text style={matrimonyStyles.detailText}>
                  {profile.education}
                </Text>
              </View>
            )}
          </View>
          
          {/* Action Buttons */}
          <View style={matrimonyStyles.actionsContainer}>
            <TouchableOpacity
              style={[matrimonyStyles.button, matrimonyStyles.outlineButton]}
              onPress={() => onViewProfile && onViewProfile(profile)}
              activeOpacity={0.7}
            >
              <Text style={[matrimonyStyles.buttonText, matrimonyStyles.outlineButtonText]}>
                View Profile
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[matrimonyStyles.button, matrimonyStyles.filledButton]}
              onPress={() => onSendInterest && onSendInterest(profile)}
              activeOpacity={0.8}
            >
              <Text style={[matrimonyStyles.buttonText, matrimonyStyles.filledButtonText]}>
                Send Interest
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

module.exports = MatrimonyCard;
