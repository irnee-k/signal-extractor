const fs = require('fs');

// 1. LOAD THE MAP (Simulating Database Load)
const taxonomy = JSON.parse(fs.readFileSync('taxonomy.json', 'utf8'));

// --- ENGINE 1: TAGGING LOGIC ---

// Recursive function to find skills in text
function findSkills(text, categoryList, foundSkills = []) {
  const lowerText = text.toLowerCase();

  categoryList.forEach(category => {
    // Check if any keyword matches
    const match = category.keywords.some(keyword => lowerText.includes(keyword));

    if (match) {
      foundSkills.push({ id: category.id, name: category.name });
    }

    // Recursively check children if they exist
    if (category.children && category.children.length > 0) {
      findSkills(text, category.children, foundSkills);
    }
  });

  return foundSkills;
}

// --- ENGINE 2: PATTERN DETECTION ---

// Start with an empty user profile if none exists
function getEmptyProfile() {
  return {
    totalSignals: 0,
    skillCounts: {}, // e.g., { "React.js": 5 }
    strengths: [],
    gaps: []
  };
}

function updateUserProfile(profile, signal, detectedSkills) {
  profile.totalSignals += 1;

  detectedSkills.forEach(skill => {
    // Increment the count for this skill
    if (!profile.skillCounts[skill.name]) {
      profile.skillCounts[skill.name] = 0;
    }
    profile.skillCounts[skill.name] += 1;
  });

  // ANALYZE: Rule-Based Inference for Strengths
  // Rule: If you have > 3 signals in a skill, it's a "Strength"
  const STRENGTH_THRESHOLD = 3;
  
  profile.strengths = Object.keys(profile.skillCounts).filter(skillName => {
    return profile.skillCounts[skillName] >= STRENGTH_THRESHOLD;
  });

  return profile;
}

module.exports = { findSkills, getEmptyProfile, updateUserProfile, taxonomy };