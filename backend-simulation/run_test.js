const { findSkills, getEmptyProfile, updateUserProfile, taxonomy } = require('./inference');

// --- SIMULATED DATA ---
// Imagine these came from your Chrome Extension over a week
const incomingSignals = [
  { title: "Introduction to HTML5 and CSS3", url: "medium.com/..." },
  { title: "Understanding React Components and Props", url: "dev.to/..." },
  { title: "Advanced React Hooks: useEffect", url: "reactjs.org/..." },
  { title: "How to build a Node.js API server", url: "medium.com/..." },
  { title: "Redux vs Context API in React", url: "youtube.com/..." },
  { title: "React Router for beginners", url: "dev.to/..." }
];

console.log("🤖 --- STARTING INFERENCE ENGINE --- \n");

// 1. Load User Profile
let userProfile = getEmptyProfile();

// 2. Process each signal
incomingSignals.forEach((signal, index) => {
  console.log(`\n📥 Processing Signal ${index + 1}: "${signal.title}"`);

  // A. Detect Skills
  const detectedSkills = findSkills(signal.title, taxonomy);
  
  if (detectedSkills.length > 0) {
    const skillNames = detectedSkills.map(s => s.name).join(", ");
    console.log(`   ✅ Tagged Skills: [ ${skillNames} ]`);
    
    // B. Update Profile
    userProfile = updateUserProfile(userProfile, signal, detectedSkills);
  } else {
    console.log(`   ⚠️ No skills detected.`);
  }
});

// 3. Final Report
console.log("\n\n📊 --- USER LEARNING REPORT ---");
console.log("Total Activity Processed:", userProfile.totalSignals);
console.log("Skill Frequency Map:", userProfile.skillCounts);

console.log("\n💪 DETECTED STRENGTHS (Confidence > 3):");
if (userProfile.strengths.length > 0) {
  userProfile.strengths.forEach(s => console.log(`   🌟 ${s}`));
} else {
  console.log("   (No deep strengths detected yet)");
}