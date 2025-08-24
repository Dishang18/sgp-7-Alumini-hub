// Avatar generation utilities using DiceBear API

// Generate random avatar URL using DiceBear API
export const generateRandomAvatar = () => {
  const avatarStyles = [
    'adventurer', 'adventurer-neutral', 'avataaars', 'big-ears', 
    'big-ears-neutral', 'big-smile', 'bottts', 'croodles', 
    'croodles-neutral', 'identicon', 'initials', 'micah', 
    'miniavs', 'personas'
  ];
  const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
  const randomSeed = Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}`;
};

// Generate avatar based on user's name
export const generateAvatarFromName = (firstName, lastName) => {
  const name = `${firstName || 'User'} ${lastName || ''}`.trim();
  const randomStyle = 'initials';
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(name)}`;
};

// Get avatar URL - returns user's profile picture or generates one based on name
export const getAvatarUrl = (profilePicture, firstName, lastName) => {
  if (profilePicture && profilePicture !== '/images/defppic.jpg') {
    return profilePicture;
  }
  return generateAvatarFromName(firstName, lastName);
};

// Generate avatar for new users during signup
export const generateSignupAvatar = (name) => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
};
