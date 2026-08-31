/**
 * SMS Notification Service for Feel The Beat Marathon
 * Supports Pay4SMS, Indian DLT SMS Gateways (Fast2SMS, MSG91, Textlocal, Generic REST API)
 * and Twilio, with dynamic env-file loading and strict delivery verification.
 */

import fs from "fs";
import path from "path";

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  status: "SENT" | "FAILED" | "NOT_SENT";
  error?: string;
  isMock?: boolean;
}

export interface RunnerRegistrationDetails {
  id?: string;
  full_name: string;
  mobile: string;
  registration_number: string;
  order_id?: string;
  bib_number?: number | string;
  bib_name?: string;
  race_category: string;
  payment_amount?: number | string;
  tshirt_bib_venue?: string;
  tshirt_bib_venue_address?: string;
}

/**
 * Loads dynamic environment variable with fallback to reading .env.local from disk.
 */
export function getEnvVar(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(new RegExp(`^${name}=(.*)$`, "m"));
      if (match && match[1]) {
        let val = match[1].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[name] = val; // cache in memory
        return val;
      }
    }
  } catch {}
  return undefined;
}

/**
 * Safely masks mobile number for logs (e.g. 9876543210 -> ******3210)
 */
export function maskPhoneNumber(mobile: string): string {
  const digits = (mobile || "").replace(/\D/g, "");
  if (digits.length <= 4) return "****";
  return `******${digits.slice(-4)}`;
}

/**
 * Normalizes an Indian or international mobile number.
 */
export function normalizeMobileNumber(rawNumber: string): {
  isValid: boolean;
  national10: string;
  e164: string;
  withCountryCode: string;
  cleanDigits: string;
} {
  const digits = (rawNumber || "").replace(/\D/g, "");

  // 10-digit Indian mobile number
  if (digits.length === 10) {
    return {
      isValid: true,
      national10: digits,
      e164: `+91${digits}`,
      withCountryCode: `91${digits}`,
      cleanDigits: digits,
    };
  }

  // 11-digit starting with 0 (e.g. 09876543210)
  if (digits.length === 11 && digits.startsWith("0")) {
    const national10 = digits.slice(1);
    return {
      isValid: true,
      national10,
      e164: `+91${national10}`,
      withCountryCode: `91${national10}`,
      cleanDigits: national10,
    };
  }

  // 12-digit starting with 91 (e.g. 919876543210)
  if (digits.length === 12 && digits.startsWith("91")) {
    const national10 = digits.slice(2);
    return {
      isValid: true,
      national10,
      e164: `+${digits}`,
      withCountryCode: digits,
      cleanDigits: national10,
    };
  }

  // International format with other country code
  if (digits.length >= 10 && digits.length <= 15) {
    return {
      isValid: true,
      national10: digits.slice(-10),
      e164: `+${digits}`,
      withCountryCode: digits,
      cleanDigits: digits,
    };
  }

  return {
    isValid: false,
    national10: digits,
    e164: `+${digits}`,
    withCountryCode: digits,
    cleanDigits: digits,
  };
}

/**
 * Generates the standardized marathon confirmation SMS text matching DLT template 1707177642638682015.
 */
export function buildRegistrationSMSMessage(registration: RunnerRegistrationDetails): string {
  const runnerName = (registration.full_name || "Runner").trim();
  const regNo = registration.registration_number || "FTB2026";
  const category = registration.race_category || "Run";
  const amount = registration.payment_amount !== undefined ? registration.payment_amount : 0;
  const venue = registration.tshirt_bib_venue || "Selected Venue";

  return `Dear ${runnerName}, your Feel The Beat Marathon 2026 registration is confirmed successfully. Registration No: ${regNo}. Race: ${category}. Amount Paid: Rs.${amount}. T-Shirt & Bib Collection: ${venue}. Thank you for registering. - Sree Jayam School`;
}

/**
 * Sends SMS notification to runner.
 */
export async function sendRegistrationSMS(
  registration: RunnerRegistrationDetails
): Promise<SMSResponse> {
  const normalized = normalizeMobileNumber(registration.mobile);
  const maskedPhone = maskPhoneNumber(registration.mobile);

  if (!normalized.isValid) {
    console.error(`[SMS] Invalid mobile number: ${maskedPhone}`);
    return {
      success: false,
      status: "FAILED",
      error: `Invalid mobile number format: ${registration.mobile}`,
    };
  }

  const messageText = buildRegistrationSMSMessage(registration);

  // 1. Check Pay4SMS Gateway Configuration
  const pay4smsUrl = getEnvVar("PAY4SMS_API_URL");
  const pay4smsMethod = (getEnvVar("PAY4SMS_METHOD") || "GET").toUpperCase();
  const pay4smsParamsRaw = getEnvVar("PAY4SMS_STATIC_PARAMS");

  if (pay4smsUrl) {
    try {
      let paramsObj: Record<string, string> = {};
      if (pay4smsParamsRaw) {
        try {
          paramsObj = JSON.parse(pay4smsParamsRaw);
        } catch {
          const parsed = new URLSearchParams(pay4smsParamsRaw);
          parsed.forEach((val, key) => {
            paramsObj[key] = val;
          });
        }
      }

      // Construct query parameters
      const queryParams = new URLSearchParams();
      for (const [key, rawVal] of Object.entries(paramsObj)) {
        let val = String(rawVal);
        if (val.includes("{message}")) {
          val = val.replace("{message}", messageText);
        }
        if (val.includes("{mobile}") || val.includes("{number}")) {
          val = val.replace("{mobile}", normalized.national10).replace("{number}", normalized.national10);
        }
        queryParams.set(key, val);
      }

      // Guarantee number and message exist
      if (!queryParams.has("number") && !queryParams.has("mobile")) {
        queryParams.set("number", normalized.national10);
      }
      if (!queryParams.has("message")) {
        queryParams.set("message", messageText);
      }

      let response: Response;
      if (pay4smsMethod === "POST") {
        response = await fetch(pay4smsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: queryParams.toString(),
        });
      } else {
        const fullUrl = `${pay4smsUrl.replace(/\?$/, "")}${pay4smsUrl.includes("?") ? "&" : "?"}${queryParams.toString()}`;
        response = await fetch(fullUrl, {
          method: "GET",
        });
      }

      const resText = await response.text();
      let resJson: any = null;
      try {
        resJson = JSON.parse(resText);
      } catch {
        resJson = null;
      }

      // Handle Pay4SMS array response: [["8838771347", "306600855_0", "Sent", 2]]
      if (Array.isArray(resJson) && resJson.length > 0 && Array.isArray(resJson[0])) {
        const row = resJson[0];
        const msgId = String(row[1] || "");
        const statusText = String(row[2] || "").toLowerCase();

        if (statusText === "sent" || msgId) {
          console.log(`[SMS SUCCESS] Pay4SMS | Recipient: ${maskedPhone} | MessageId: ${msgId}`);
          return {
            success: true,
            status: "SENT",
            messageId: msgId || `PAY4SMS_${Date.now()}`,
          };
        } else {
          console.error(`[SMS REJECTED] Pay4SMS | Status: ${row[2]} | Recipient: ${maskedPhone}`);
          return {
            success: false,
            status: "FAILED",
            error: `Pay4SMS status: ${row[2] || "Unknown"}`,
          };
        }
      }

      const lowerText = resText.toLowerCase();
      const isExplicitError =
        !response.ok ||
        lowerText.includes("error") ||
        lowerText.includes("invalid") ||
        lowerText.includes("failed") ||
        lowerText.includes("template mismatch") ||
        lowerText.includes("unauthorized") ||
        (resJson && resJson.status === "error");

      const isExplicitSuccess =
        response.ok &&
        !isExplicitError &&
        (resJson?.status === "success" ||
          resJson?.status === 200 ||
          lowerText.includes("success") ||
          lowerText.includes("sent"));

      if (isExplicitSuccess) {
        const messageId = resJson?.message_id || resJson?.msgid || `PAY4SMS_${Date.now()}`;
        console.log(`[SMS SUCCESS] Pay4SMS | Recipient: ${maskedPhone} | MessageId: ${messageId}`);
        return {
          success: true,
          status: "SENT",
          messageId,
        };
      }

      const sanitizedError = resJson?.message || resJson?.error || resText.slice(0, 200) || `HTTP ${response.status}`;
      console.error(`[SMS FAILED] Pay4SMS | HTTP: ${response.status} | Recipient: ${maskedPhone} | Error: ${sanitizedError}`);

      return {
        success: false,
        status: "FAILED",
        error: sanitizedError,
      };
    } catch (err: any) {
      console.error(`[SMS Exception] Pay4SMS | Recipient: ${maskedPhone} | Error: ${err.message || err}`);
      return {
        success: false,
        status: "FAILED",
        error: err.message || "Failed to reach Pay4SMS gateway",
      };
    }
  }

  // 2. Check Generic Indian DLT / REST Gateway (Fast2SMS / MSG91)
  const smsApiUrl = getEnvVar("SMS_API_URL");
  const smsApiKey = getEnvVar("SMS_API_KEY") || getEnvVar("SMS_AUTH_KEY");
  const smsSenderId = getEnvVar("SMS_SENDER_ID") || "FTBRUN";
  const smsTemplateId = getEnvVar("SMS_TEMPLATE_ID") || getEnvVar("SMS_DLT_TE_ID");

  if (smsApiUrl && smsApiKey) {
    try {
      const response = await fetch(smsApiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${smsApiKey}`,
          "x-api-key": smsApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: smsSenderId,
          to: normalized.e164,
          mobile: normalized.national10,
          message: messageText,
          template_id: smsTemplateId,
        }),
      });

      const resText = await response.text();
      let resJson: any = null;
      try {
        resJson = JSON.parse(resText);
      } catch {
        resJson = null;
      }

      if (response.ok && (!resJson || resJson.status === "success" || resJson.return === true)) {
        return {
          success: true,
          status: "SENT",
          messageId: resJson?.message_id || resJson?.id || `GATEWAY_${Date.now()}`,
        };
      }

      const sanitizedError = resJson?.message || resText.slice(0, 200) || `HTTP ${response.status}`;
      return {
        success: false,
        status: "FAILED",
        error: sanitizedError,
      };
    } catch (err: any) {
      return {
        success: false,
        status: "FAILED",
        error: err.message || "Failed to reach SMS provider",
      };
    }
  }

  // 3. Check Twilio integration
  const twilioSid = getEnvVar("TWILIO_ACCOUNT_SID");
  const twilioAuth = getEnvVar("TWILIO_AUTH_TOKEN");
  if (twilioSid && twilioAuth) {
    try {
      const twilio = require("twilio")(twilioSid, twilioAuth);

      const res = await twilio.messages.create({
        body: messageText,
        to: normalized.e164,
        from: getEnvVar("TWILIO_PHONE_NUMBER") || getEnvVar("TWILIO_MESSAGING_SERVICE_SID"),
      });

      return {
        success: true,
        status: "SENT",
        messageId: res.sid,
      };
    } catch (err: any) {
      return {
        success: false,
        status: "FAILED",
        error: err.message || "Twilio delivery failure",
      };
    }
  }

  // 4. Mock Mode Fallback
  console.log(`[SMS MOCK] To: ${maskedPhone} | Text: ${messageText.slice(0, 80)}...`);

  return {
    success: true,
    status: "SENT",
    messageId: `MOCK_SMS_${Date.now()}`,
    isMock: true,
  };
}
