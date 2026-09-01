const fs = require('fs');
const path = require('path');

console.log("=== TESTING 2 KM KIDS FUN RUN PRICING (₹1 / 100 PAISE) ===");

// 1. Check registrationConfig.ts
const regConfigContent = fs.readFileSync(path.resolve(__dirname, '../data/registrationConfig.ts'), 'utf8');
const kidsMatch = regConfigContent.match(/"2km-kids":\s*\{[\s\S]*?fee:\s*(\d+)/);
if (!kidsMatch || Number(kidsMatch[1]) !== 1) {
  console.error("FAIL: 2km-kids fee in registrationConfig.ts is not 1! Found:", kidsMatch ? kidsMatch[1] : 'null');
  process.exit(1);
} else {
  console.log("✓ registrationConfig.ts -> 2km-kids fee is 1 (₹1)");
}

// 2. Check events.ts
const eventsContent = fs.readFileSync(path.resolve(__dirname, '../data/events.ts'), 'utf8');
const eventKidsMatch = eventsContent.match(/id:\s*"2km-kids"[\s\S]*?fee:\s*(\d+)/);
if (!eventKidsMatch || Number(eventKidsMatch[1]) !== 1) {
  console.error("FAIL: 2km-kids fee in events.ts is not 1! Found:", eventKidsMatch ? eventKidsMatch[1] : 'null');
  process.exit(1);
} else {
  console.log("✓ events.ts -> 2km-kids fee is 1 (₹1)");
}

// 3. Check RegistrationContext.tsx
const contextContent = fs.readFileSync(path.resolve(__dirname, '../components/layout/RegistrationContext.tsx'), 'utf8');
if (contextContent.includes('2 KM KIDS FUN RUN — ₹199')) {
  console.error("FAIL: RegistrationContext.tsx still contains ₹199 for 2 KM KIDS FUN RUN!");
  process.exit(1);
} else if (contextContent.includes('2 KM KIDS FUN RUN — ₹1')) {
  console.log("✓ RegistrationContext.tsx -> 2 KM KIDS FUN RUN displays ₹1");
}

// 4. Verify other race prices are unchanged
const adultMatch = regConfigContent.match(/"2km":\s*\{[\s\S]*?fee:\s*(\d+)/);
const fiveMatch = regConfigContent.match(/"5km":\s*\{[\s\S]*?fee:\s*(\d+)/);
const tenMatch = regConfigContent.match(/"10km":\s*\{[\s\S]*?fee:\s*(\d+)/);

console.log("✓ 2 KM Adults Fun Run fee:", adultMatch[1], "(= ₹199)");
console.log("✓ 5 KM Run fee:", fiveMatch[1], "(= ₹299)");
console.log("✓ 10 KM Run fee:", tenMatch[1], "(= ₹399)");

if (Number(adultMatch[1]) !== 199 || Number(fiveMatch[1]) !== 299 || Number(tenMatch[1]) !== 399) {
  console.error("FAIL: One of the other race prices was unintentionally changed!");
  process.exit(1);
}

console.log("\n✓ ALL PRICING INTEGRITY TESTS PASSED!");
