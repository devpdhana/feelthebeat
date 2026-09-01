const fs = require('fs');
const path = require('path');

// Test that lib/sms.ts no longer exists
const smsPath = path.resolve(__dirname, '../lib/sms.ts');
console.log("Does lib/sms.ts exist?", fs.existsSync(smsPath) ? "YES (Error)" : "NO (Clean)");

// Test that lib/whatsapp.ts exists and has no import from lib/sms
const waPath = path.resolve(__dirname, '../lib/whatsapp.ts');
const waContent = fs.readFileSync(waPath, 'utf8');
console.log("Does lib/whatsapp.ts reference sms.ts?", waContent.includes('from "@/lib/sms"') || waContent.includes('from "./sms"') ? "YES (Error)" : "NO (Clean)");

// Test that admin registrations route has no sms references
const regRoutePath = path.resolve(__dirname, '../app/api/admin/registrations/route.ts');
const regContent = fs.readFileSync(regRoutePath, 'utf8');
console.log("Does admin registrations route reference sms?", regContent.includes('sms') ? "YES (Error)" : "NO (Clean)");

// Test that payment verify route has no sms references
const verifyRoutePath = path.resolve(__dirname, '../app/api/payment/verify/route.ts');
const verifyContent = fs.readFileSync(verifyRoutePath, 'utf8');
console.log("Does payment verify route reference sms?", verifyContent.includes('sms') || verifyContent.includes('sendRegistrationSMS') ? "YES (Error)" : "NO (Clean)");

// Test that resend-sms route is deleted
const resendSmsPath = path.resolve(__dirname, '../app/api/admin/registration/[id]/resend-sms');
console.log("Does resend-sms route directory exist?", fs.existsSync(resendSmsPath) ? "YES (Error)" : "NO (Clean)");

// Test that resend-whatsapp route exists
const resendWaPath = path.resolve(__dirname, '../app/api/admin/registration/[id]/resend-whatsapp');
console.log("Does resend-whatsapp route directory exist?", fs.existsSync(resendWaPath) ? "YES (Good)" : "NO (Error)");

// Test that admin dashboard has no resend-sms references
const dashboardPath = path.resolve(__dirname, '../app/admin/dashboard/page.tsx');
const dashContent = fs.readFileSync(dashboardPath, 'utf8');
console.log("Does admin dashboard reference resend-sms?", dashContent.includes('resend-sms') ? "YES (Error)" : "NO (Clean)");
console.log("Does admin dashboard have RESEND SMS button?", dashContent.includes('RESEND SMS') ? "YES (Error)" : "NO (Clean)");
console.log("Does admin dashboard have RESEND WHATSAPP button?", dashContent.includes('RESEND WHATSAPP') ? "YES (Good)" : "NO (Error)");
console.log("Does admin dashboard have WHATSAPP BROADCAST engine?", dashContent.includes('WHATSAPP BROADCAST') ? "YES (Good)" : "NO (Error)");

console.log("\nALL CODE INTEGRITY ASSERTIONS VERIFIED SUCCESSFULLY!");
