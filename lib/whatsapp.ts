/**
 * WhatsApp Notification Service for Feel The Beat Marathon 2026 / SJS Marathon
 * Provides server-side template message dispatch for:
 * 1. Post-Registration Confirmation Template ({{1}} = full_name, {{2}} = race_category, {{3}} = order_id)
 * 2. Pre-Event Broadcast Template ({{1}} = full_name, {{2}} = bib_number, {{3}} = race_category)
 */

import { normalizeMobileNumber, maskPhoneNumber, getEnvVar, RunnerRegistrationDetails } from "@/lib/sms";
import https from "https";
import http from "http";

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  status: "SENT" | "FAILED" | "NOT_SENT";
  error?: string;
  isMock?: boolean;
}

/**
 * Builds the exact text for Registration Confirmation WhatsApp Template
 * Matching Approved Template 1792728
 */
export function buildRegistrationWhatsAppMessage(registration: RunnerRegistrationDetails): string {
  const runnerName = (registration.full_name || "Runner").trim();
  const category = (registration.race_category || "Race").trim();
  const orderId = (registration.order_id || registration.registration_number || "FTB26-000000").trim();

  return `🏃‍♂️ Feel The Beat 10K Marathon 2026 🏃‍♀️

Dear ${runnerName},

🎉 Your registration is confirmed!

You have successfully registered for the ${category} category.

Order ID: ${orderId}

Thank you for registering with SJS Marathon. Get ready to Feel The Beat! 🏅🔥`;
}

/**
 * Builds the exact text for Bib & T-Shirt Collection Broadcast WhatsApp Template
 * Matching Approved Template 1792730
 */
export function buildBroadcastWhatsAppMessage(registration: {
  full_name: string;
  bib_number?: number | string | null;
  race_category: string;
}): string {
  const runnerName = (registration.full_name || "Runner").trim();
  const bibNo = registration.bib_number !== undefined && registration.bib_number !== null
    ? String(registration.bib_number)
    : "To be assigned";
  const category = (registration.race_category || "Race").trim();

  return `Dear ${runnerName},

Greetings from Feel The Beat 10K Marathon 2026! 🎉

🎽 Your Bib Number: ${bibNo}
🏃 Category: ${category}

📍 Bib & T-Shirt Collection Venue:
Sree Jayam School
Ezhil Nagar Main Road, Allapuram, Vellore - 632002
📌 Landmark: Near Mangalaraman Kalyana Mandapam

🗺️ Location:
https://maps.app.goo.gl/6p1x9f4yeCrU26saA

📅 Date: Saturday, 26th September 2026
⏰ Time: 10:00 AM - 08:00 PM

⚠️ Important:
Please collect your Bib & T-Shirt on 26th September 2026.
Bib & T-Shirt collection will NOT be available on the event day.`;
}

/**
 * Helper to make secure HTTP/HTTPS POST request with agent options.
 */
async function postJsonWithAgent(
  url: string,
  body: any,
  headers: Record<string, string>
): Promise<{ status: number; text: string; data: any }> {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === "https:";
      const client = isHttps ? https : http;

      const bodyStr = JSON.stringify(body);

      const req = client.request(
        {
          protocol: urlObj.protocol,
          hostname: urlObj.hostname,
          port: urlObj.port || (isHttps ? 443 : 80),
          path: urlObj.pathname + urlObj.search,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyStr),
            ...headers,
          },
          rejectUnauthorized: false, // Supports self-signed certificates on dedicated gateway IPs
          timeout: 12000,
        },
        (res: any) => {
          let chunks = "";
          res.on("data", (chunk: any) => {
            chunks += chunk;
          });
          res.on("end", () => {
            let data: any = null;
            try {
              data = JSON.parse(chunks);
            } catch {
              data = null;
            }
            resolve({
              status: res.statusCode || 200,
              text: chunks,
              data,
            });
          });
        }
      );

      req.on("error", (err: any) => reject(err));
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("WhatsApp API request timed out"));
      });

      req.write(bodyStr);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Sends a Registration Confirmation WhatsApp message.
 * Template Variables:
 * {{1}} = full_name
 * {{2}} = race_category
 * {{3}} = order_id
 */
export async function sendRegistrationWhatsApp(
  registration: RunnerRegistrationDetails
): Promise<WhatsAppResponse> {
  const normalized = normalizeMobileNumber(registration.mobile);
  const maskedPhone = maskPhoneNumber(registration.mobile);

  console.log(`[WHATSAPP] Registration confirmation started`);
  console.log(`[WHATSAPP] Registration ID: ${registration.id || "NEW"}`);
  console.log(`[WHATSAPP] Recipient: ${maskedPhone}`);

  if (!normalized.isValid) {
    console.error(`[WHATSAPP] Invalid mobile number: ${maskedPhone}`);
    return {
      success: false,
      status: "FAILED",
      error: `Invalid mobile number format: ${registration.mobile}`,
    };
  }

  const runnerName = (registration.full_name || "Runner").trim();
  const category = (registration.race_category || "Race").trim();
  const orderId = (registration.order_id || registration.registration_number || "FTB26-000000").trim();
  const messageText = buildRegistrationWhatsAppMessage(registration);

  const templateId =
    getEnvVar("WHATSAPP_REGISTRATION_TEMPLATE_ID") ||
    getEnvVar("REGISTRATION_WHATSAPP_TEMPLATE_ID") ||
    "1792728";

  const variables = [runnerName, category, orderId];
  console.log(`[WHATSAPP] Template ID: ${templateId}`);
  console.log(`[WHATSAPP] Sending template with parameters: [${variables.join(", ")}]`);

  return dispatchWhatsAppMessage({
    recipientPhone: normalized.withCountryCode,
    maskedPhone,
    templateId,
    variables,
    messageText,
    type: "REGISTRATION",
  });
}

/**
 * Sends a Bib & T-Shirt Collection Broadcast WhatsApp message.
 * Template Variables:
 * {{1}} = full_name
 * {{2}} = bib_number
 * {{3}} = race_category
 */
export async function sendBroadcastWhatsApp(registration: {
  mobile: string;
  full_name: string;
  bib_number?: number | string | null;
  race_category: string;
}): Promise<WhatsAppResponse> {
  const normalized = normalizeMobileNumber(registration.mobile);
  const maskedPhone = maskPhoneNumber(registration.mobile);

  if (!normalized.isValid) {
    return {
      success: false,
      status: "FAILED",
      error: `Invalid mobile number: ${registration.mobile}`,
    };
  }

  const runnerName = (registration.full_name || "Runner").trim();
  const bibNo = registration.bib_number !== undefined && registration.bib_number !== null
    ? String(registration.bib_number)
    : "To be assigned";
  const category = (registration.race_category || "Race").trim();
  const messageText = buildBroadcastWhatsAppMessage(registration);

  const templateId =
    getEnvVar("WHATSAPP_BROADCAST_TEMPLATE_ID") ||
    getEnvVar("BROADCAST_WHATSAPP_TEMPLATE_ID") ||
    "1792730";

  const variables = [runnerName, bibNo, category];

  return dispatchWhatsAppMessage({
    recipientPhone: normalized.withCountryCode,
    maskedPhone,
    templateId,
    variables,
    messageText,
    type: "BROADCAST",
  });
}

/**
 * Unified dispatch engine supporting Unified v2, Meta Cloud API, and Mock Fallback
 */
async function dispatchWhatsAppMessage(params: {
  recipientPhone: string;
  maskedPhone: string;
  templateId: string;
  variables: string[];
  messageText: string;
  type: "REGISTRATION" | "BROADCAST";
}): Promise<WhatsAppResponse> {
  const { recipientPhone, maskedPhone, templateId, variables, messageText, type } = params;

  // 1. Unified v2 WhatsApp Gateway (Configured in .env)
  const unifiedUrl = getEnvVar("WHATSAPP_API_URL");
  const unifiedClientId = getEnvVar("WHATSAPP_CLIENT_ID");
  const unifiedClientPassword = getEnvVar("WHATSAPP_CLIENT_PASSWORD");
  const unifiedSender = getEnvVar("WHATSAPP_SENDER");
  const unifiedTag = getEnvVar("WHATSAPP_TAG") || "user_id:3";

  if (unifiedUrl && unifiedClientId && unifiedClientPassword) {
    try {
      const basicAuth = Buffer.from(`${unifiedClientId}:${unifiedClientPassword}`).toString("base64");

      const payload = {
        client_id: unifiedClientId,
        client_password: unifiedClientPassword,
        sender: unifiedSender,
        to: recipientPhone,
        number: recipientPhone,
        mobile: recipientPhone,
        template_id: templateId,
        tag: unifiedTag,
        variables: variables,
        params: variables,
        message: messageText,
      };

      const res = await postJsonWithAgent(
        unifiedUrl,
        payload,
        {
          "Authorization": `Basic ${basicAuth}`,
          "client_id": unifiedClientId,
          "client_password": unifiedClientPassword,
        }
      );

      console.log(`[WHATSAPP] Provider response status: ${res.status}`);

      const isExplicitError =
        res.status >= 400 ||
        (res.data && (res.data.status === "Error" || res.data.status === "error" || res.data.status === false)) ||
        res.text.toLowerCase().includes("invalid payload");

      const isSuccess =
        res.status >= 200 &&
        res.status < 300 &&
        !isExplicitError &&
        (res.data?.status === "success" || res.data?.status === true || res.data?.status === 200 || res.data?.message_id || res.data?.id);

      if (isSuccess) {
        const messageId = res.data?.message_id || res.data?.id || res.data?.msgId || `UNIFIED_WA_${Date.now()}`;
        console.log(`[WHATSAPP] Provider message ID: ${messageId}`);
        return {
          success: true,
          status: "SENT",
          messageId,
        };
      }

      const sanitizedError =
        res.data?.statustext ||
        res.data?.message ||
        res.data?.error ||
        res.text.slice(0, 150) ||
        `HTTP ${res.status}`;

      console.error(`[WHATSAPP] Provider response/error: ${sanitizedError}`);

      return {
        success: false,
        status: "FAILED",
        error: sanitizedError,
      };
    } catch (err: any) {
      console.error(`[WHATSAPP Exception] To: ${maskedPhone} | Error: ${err.message || err}`);
      return {
        success: false,
        status: "FAILED",
        error: err.message || "Failed to communicate with WhatsApp gateway",
      };
    }
  }

  // 2. Meta WhatsApp Cloud API (Graph API) fallback if configured
  const metaToken =
    getEnvVar("WHATSAPP_ACCESS_TOKEN") ||
    getEnvVar("WHATSAPP_TOKEN") ||
    getEnvVar("META_WHATSAPP_TOKEN");
  const metaPhoneId =
    getEnvVar("WHATSAPP_PHONE_NUMBER_ID") ||
    getEnvVar("META_PHONE_NUMBER_ID");
  const languageCode = getEnvVar("WHATSAPP_TEMPLATE_LANGUAGE") || getEnvVar("WHATSAPP_LANGUAGE_CODE") || "en";

  if (metaToken && metaPhoneId) {
    try {
      const url = `https://graph.facebook.com/v20.0/${metaPhoneId}/messages`;

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: templateId,
          language: {
            code: languageCode,
          },
          components: [
            {
              type: "body",
              parameters: variables.map((val) => ({ type: "text", text: val })),
            },
          ],
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok && resData.messages?.[0]?.id) {
        const messageId = resData.messages[0].id;
        console.log(`[WHATSAPP] Provider message ID: ${messageId}`);
        return {
          success: true,
          status: "SENT",
          messageId,
        };
      }

      const errDetail = resData?.error?.message || `HTTP ${response.status}`;
      console.error(`[WHATSAPP] Provider response/error: ${errDetail}`);
      return {
        success: false,
        status: "FAILED",
        error: errDetail,
      };
    } catch (err: any) {
      return {
        success: false,
        status: "FAILED",
        error: err.message || "Failed to reach Meta WhatsApp API",
      };
    }
  }

  // 3. Fallback Mock Mode (For Local Dev / Test Environments)
  console.log(`[WHATSAPP MOCK (${type})] To: ${maskedPhone} | Template: ${templateId} | Vars: ${JSON.stringify(variables)}`);

  return {
    success: true,
    status: "SENT",
    messageId: `MOCK_WA_${Date.now()}`,
    isMock: true,
  };
}
