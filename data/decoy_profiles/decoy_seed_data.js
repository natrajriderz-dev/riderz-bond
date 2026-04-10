// ============================================
// SUYAVARAA Fish Trap - Decoy Profile Seed Data
// ============================================
// 20 realistic decoy profiles for testing Fish Trap system
// These profiles are designed to:
// - Appear genuine and attractive
// - Have varied demographics
// - Include subtle red flag triggers for testing
// - Represent different personality types

const DECOY_PROFILES_SEED = [
  {
    name: "Priya Sharma",
    age: 26,
    gender: "female",
    city: "Mumbai",
    bio: "Software engineer by day, food blogger by night. Love exploring new restaurants and trying exotic cuisines. Looking for someone who appreciates good conversation and adventure. No time for games, just real connections.",
    profile_photo_url: "/data/decoy_profiles/priya_sharma.jpg",
    personality: "professional",
    red_flag_triggers: ["money_mention", "rush_relationship"]
  },
  {
    name: "Arjun Patel",
    age: 29,
    gender: "male",
    city: "Delhi",
    bio: "Entrepreneur building my dream startup. Love traveling, hiking, and deep conversations about life. Seeking a partner who shares my ambition and values. Let's build something amazing together.",
    profile_photo_url: "/data/decoy_profiles/arjun_patel.jpg",
    personality: "ambitious",
    red_flag_triggers: ["investment_opportunity", "business_venture"]
  },
  {
    name: "Sneha Gupta",
    age: 24,
    gender: "female",
    city: "Bangalore",
    bio: "UX Designer with a passion for creating beautiful digital experiences. Coffee addict, book lover, and weekend hiker. Looking for someone genuine who values kindness and creativity.",
    profile_photo_url: "/data/decoy_profiles/sneha_gupta.jpg",
    personality: "creative",
    red_flag_triggers: ["contact_exchange", "meet_immediately"]
  },
  {
    name: "Rohan Singh",
    age: 31,
    gender: "male",
    city: "Chennai",
    bio: "Doctor working in emergency medicine. Long shifts but love helping people. When I'm not at the hospital, you'll find me playing guitar or exploring local cafes. Seeking someone compassionate and understanding.",
    profile_photo_url: "/data/decoy_profiles/rohan_singh.jpg",
    personality: "caring",
    red_flag_triggers: ["emergency_money", "family_emergency"]
  },
  {
    name: "Ananya Reddy",
    age: 27,
    gender: "female",
    city: "Hyderabad",
    bio: "Marketing manager who loves planning events and bringing people together. Fitness enthusiast, yoga practitioner, and amateur photographer. Looking for a partner in crime for life's adventures.",
    profile_photo_url: "/data/decoy_profiles/ananya_reddy.jpg",
    personality: "social",
    red_flag_triggers: ["gift_sending", "expensive_gifts"]
  },
  {
    name: "Vikram Kumar",
    age: 28,
    gender: "male",
    city: "Pune",
    bio: "Data scientist fascinated by AI and machine learning. Love solving complex problems and teaching others. Weekend warrior - cycling, swimming, and trying new restaurants. Let's geek out together!",
    profile_photo_url: "/data/decoy_profiles/vikram_kumar.jpg",
    personality: "intellectual",
    red_flag_triggers: ["crypto_investment", "tech_startup"]
  },
  {
    name: "Kavya Menon",
    age: 25,
    gender: "female",
    city: "Kochi",
    bio: "Journalist covering social issues and human stories. Passionate about making a difference. Love reading, writing, and meaningful conversations. Seeking someone who cares about the world around us.",
    profile_photo_url: "/data/decoy_profiles/kavya_menon.jpg",
    personality: "activist",
    red_flag_triggers: ["charity_scam", "donation_request"]
  },
  {
    name: "Aditya Joshi",
    age: 30,
    gender: "male",
    city: "Ahmedabad",
    bio: "Architect designing sustainable buildings for the future. Love sustainable living, organic farming, and eco-friendly travel. Looking for someone who shares my vision for a better world.",
    profile_photo_url: "/data/decoy_profiles/aditya_joshi.jpg",
    personality: "environmentalist",
    red_flag_triggers: ["property_investment", "real_estate"]
  },
  {
    name: "Meera Iyer",
    age: 26,
    gender: "female",
    city: "Chennai",
    bio: "Classical dancer and teacher. Expressing emotions through movement and music. Love traditional arts, spirituality, and connecting with like-minded souls. Seeking depth and authenticity.",
    profile_photo_url: "/data/decoy_profiles/meera_iyer.jpg",
    personality: "artistic",
    red_flag_triggers: ["spiritual_scam", "guru_disciple"]
  },
  {
    name: "Rahul Verma",
    age: 32,
    gender: "male",
    city: "Jaipur",
    bio: "Hotel manager overseeing luxury properties. Love fine dining, wine tasting, and cultural experiences. Well-traveled and always planning the next adventure. Let's create memories together.",
    profile_photo_url: "/data/decoy_profiles/rahul_verma.jpg",
    personality: "luxury",
    red_flag_triggers: ["expensive_dates", "luxury_lifestyle"]
  },
  {
    name: "Divya Nair",
    age: 24,
    gender: "female",
    city: "Trivandrum",
    bio: "Recent law graduate passionate about justice and equality. Love debating ideas, watching documentaries, and volunteering. Seeking someone who challenges me intellectually and morally.",
    profile_photo_url: "/data/decoy_profiles/divya_nair.jpg",
    personality: "intellectual",
    red_flag_triggers: ["legal_trouble", "court_case"]
  },
  {
    name: "Karan Malhotra",
    age: 29,
    gender: "male",
    city: "Gurgaon",
    bio: "Investment banker with a work-hard-play-hard mentality. Love fine whiskey, golf, and networking events. Successful and ambitious - looking for someone who matches my energy and drive.",
    profile_photo_url: "/data/decoy_profiles/karan_malhotra.jpg",
    personality: "corporate",
    red_flag_triggers: ["stock_tips", "investment_advice"]
  },
  {
    name: "Pooja Agarwal",
    age: 27,
    gender: "female",
    city: "Kolkata",
    bio: "Chef specializing in Bengali cuisine. Love experimenting in the kitchen and hosting dinner parties. Food is my love language! Seeking someone who appreciates good food and great company.",
    profile_photo_url: "/data/decoy_profiles/pooja_agarwal.jpg",
    personality: "culinary",
    red_flag_triggers: ["food_delivery", "restaurant_investment"]
  },
  {
    name: "Siddharth Rao",
    age: 31,
    gender: "male",
    city: "Mysore",
    bio: "Professor of literature and poetry enthusiast. Love discussing books, writing, and philosophical conversations. Seeking a deep connection with someone who values intellect and emotion.",
    profile_photo_url: "/data/decoy_profiles/siddharth_rao.jpg",
    personality: "academic",
    red_flag_triggers: ["book_scam", "rare_manuscript"]
  },
  {
    name: "Nisha Kapoor",
    age: 25,
    gender: "female",
    city: "Lucknow",
    bio: "Fashion designer creating sustainable clothing. Love ethical fashion, art galleries, and cultural festivals. Looking for someone creative and conscious about our impact on the world.",
    profile_photo_url: "/data/decoy_profiles/nisha_kapoor.jpg",
    personality: "creative",
    red_flag_triggers: ["fashion_business", "clothing_line"]
  },
  {
    name: "Amitabh Saxena",
    age: 33,
    gender: "male",
    city: "Varanasi",
    bio: "Spiritual guide and meditation teacher. Help others find inner peace and purpose. Love yoga, Ayurveda, and connecting with the divine. Seeking someone on a similar spiritual journey.",
    profile_photo_url: "/data/decoy_profiles/amitabh_saxena.jpg",
    personality: "spiritual",
    red_flag_triggers: ["spiritual_retreat", "meditation_center"]
  },
  {
    name: "Riya Choudhury",
    age: 26,
    gender: "female",
    city: "Guwahati",
    bio: "Wildlife photographer and conservationist. Travel the world capturing endangered species and raising awareness. Love nature, adventure, and making a positive impact. Let's explore together!",
    profile_photo_url: "/data/decoy_profiles/riya_choudhury.jpg",
    personality: "adventurous",
    red_flag_triggers: ["conservation_project", "wildlife_fund"]
  },
  {
    name: "Manish Tiwari",
    age: 30,
    gender: "male",
    city: "Indore",
    bio: "Music producer and DJ. Create beats and mix tracks for underground artists. Love electronic music, festivals, and late-night studio sessions. Seeking someone who vibes with good music.",
    profile_photo_url: "/data/decoy_profiles/manish_tiwari.jpg",
    personality: "musical",
    red_flag_triggers: ["music_production", "studio_equipment"]
  },
  {
    name: "Swati Deshmukh",
    age: 28,
    gender: "female",
    city: "Nagpur",
    bio: "Social entrepreneur running a startup for rural education. Passionate about bridging the education gap. Love reading, mentoring, and community work. Let's build something meaningful together.",
    profile_photo_url: "/data/decoy_profiles/swati_deshmukh.jpg",
    personality: "philanthropic",
    red_flag_triggers: ["education_startup", "rural_development"]
  },
  {
    name: "Rajesh Khanna",
    age: 34,
    gender: "male",
    city: "Surat",
    bio: "Real estate developer building smart cities. Love innovation, technology, and creating sustainable communities. Successful businessman seeking a partner who shares my vision and ambition.",
    profile_photo_url: "/data/decoy_profiles/rajesh_khanna.jpg",
    personality: "entrepreneur",
    red_flag_triggers: ["real_estate_investment", "property_development"]
  }
];

// Export function to seed database
const seedDecoyProfiles = async (supabase) => {
  try {
    console.log('Seeding decoy profiles...');

    const profilesToInsert = DECOY_PROFILES_SEED.map(profile => ({
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      city: profile.city,
      bio: profile.bio,
      profile_photo_url: profile.profile_photo_url,
      personality_type: profile.personality,
      red_flag_triggers: profile.red_flag_triggers,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }));

    const { data, error } = await supabase
      .from('decoy_profiles')
      .insert(profilesToInsert)
      .select();

    if (error) throw error;

    console.log(`Successfully seeded ${data.length} decoy profiles`);
    return { success: true, count: data.length };

  } catch (error) {
    console.error('Error seeding decoy profiles:', error);
    return { success: false, error: error.message };
  }
};

// Export all functions
module.exports = {
  DECOY_PROFILES_SEED,
  seedDecoyProfiles
};
