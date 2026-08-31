/**
 * WhatsApp Notification Service for Feel The Beat Marathon 2026 / SJS Marathon
 * Provides server-side template message dispatch for:
 * 1. Post-Registration Confirmation Template ({{1}} = full_name, {{2}} = race_category, {{3}} = order_id)
 * 2. Pre-Event Broadcast Template ({{1}} = full_name, {{2}} = bib_number, {{3}} = race_category)
 */

import { normalizeMobileNumber, maskPhoneNumber, getEnvVar, RunnerRegistrationDetails } from "@/lib/sms";
import https from "https";
import http from "http";
import { supabaseAdmin } from "@/lib/supabase";

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  status: "ACCEPTED" | "SENT" | "FAILED" | "NOT_SENT";
  providerStatusCode?: number | string;
  providerStatusText?: string;
  error?: string;
  isMock?: boolean;
  recipient?: string;
  templateId?: string;
}

/**
 * Builds the exact text for Registration Confirmation WhatsApp Template
 * Matching Approved Template 1792971
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
 * Helper to make secure HTTP/HTTPS request with agent options.
 */
async function postJsonWithAgent(
  url: string,
  body: any,
  headers: Record<string, string>,
  method: string = "POST"
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
          method: method,
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
 * {{1}} = full_name (Exact column: registrations.full_name)
 * {{2}} = race_category (Exact column: registrations.race_category)
 * {{3}} = order_id (Exact column: registrations.order_id)
 */
export async function sendRegistrationWhatsApp(
  registration: RunnerRegistrationDetails
): Promise<WhatsAppResponse> {
  // 1. Fetch FRESH database record if ID is provided to guarantee 100% database accuracy
  let recordToUse: any = registration;

  if (registration.id) {
    try {
      const { data: freshRecord, error } = await supabaseAdmin
        .from("registrations")
        .select("*")
        .eq("id", registration.id)
        .maybeSingle();

      if (freshRecord && !error) {
        recordToUse = freshRecord;
      }
    } catch (dbErr) {
      console.warn("[WHATSAPP] Failed to fetch fresh DB record, using provided payload:", dbErr);
    }
  }

  const runnerName = (recordToUse.full_name || "Runner").trim();
  const category = (recordToUse.race_category || "Race").trim();
  const orderId = (recordToUse.order_id || recordToUse.registration_number || "FTB26-000000").trim();
  const mobile = recordToUse.mobile || registration.mobile;

  const normalized = normalizeMobileNumber(mobile);
  const maskedPhone = maskPhoneNumber(mobile);

  // Safe Audit Debug Log
  console.log("[WHATSAPP DATA AUDIT - REGISTRATION CONFIRMATION]", {
    registrationId: recordToUse.id || registration.id,
    runnerName: runnerName,
    mobile: maskedPhone,
    raceCategory: category,
    orderId: orderId,
    bibNumber: recordToUse.bib_number,
    tshirtSize: recordToUse.tshirt_size,
    paymentAmount: recordToUse.payment_amount,
    paymentStatus: recordToUse.payment_status,
  });

  if (!normalized.isValid) {
    console.error(`[WHATSAPP] Invalid mobile number: ${maskedPhone}`);
    return {
      success: false,
      status: "FAILED",
      error: `Invalid mobile number format: ${mobile}`,
    };
  }

  const messageText = buildRegistrationWhatsAppMessage(recordToUse);

  const templateId =
    getEnvVar("WHATSAPP_REGISTRATION_TEMPLATE_ID") ||
    getEnvVar("REGISTRATION_WHATSAPP_TEMPLATE_ID") ||
    "1792971";

  // Explicit template variable mapping: {{1}} = Name, {{2}} = Category, {{3}} = Order ID
  const variables = [runnerName, category, orderId];
  console.log(`[WHATSAPP] Sending Template: ${templateId} | Variables: [{{1}}=${runnerName}, {{2}}=${category}, {{3}}=${orderId}]`);

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
 * {{1}} = full_name (Exact column: registrations.full_name)
 * {{2}} = bib_number (Exact column: registrations.bib_number)
 * {{3}} = race_category (Exact column: registrations.race_category)
 */
export async function sendBroadcastWhatsApp(registration: {
  id?: string;
  mobile: string;
  full_name: string;
  bib_number?: number | string | null;
  race_category: string;
}): Promise<WhatsAppResponse> {
  // 1. Fetch FRESH database record if ID is provided
  let recordToUse: any = registration;

  if (registration.id) {
    try {
      const { data: freshRecord, error } = await supabaseAdmin
        .from("registrations")
        .select("*")
        .eq("id", registration.id)
        .maybeSingle();

      if (freshRecord && !error) {
        recordToUse = freshRecord;
      }
    } catch (dbErr) {
      console.warn("[WHATSAPP] Failed to fetch fresh DB record for broadcast:", dbErr);
    }
  }

  const runnerName = (recordToUse.full_name || "Runner").trim();
  const bibNo = recordToUse.bib_number !== undefined && recordToUse.bib_number !== null
    ? String(recordToUse.bib_number)
    : "To be assigned";
  const category = (recordToUse.race_category || "Race").trim();
  const mobile = recordToUse.mobile || registration.mobile;

  const normalized = normalizeMobileNumber(mobile);
  const maskedPhone = maskPhoneNumber(mobile);

  // Safe Audit Debug Log
  console.log("[WHATSAPP DATA AUDIT - BROADCAST]", {
    registrationId: recordToUse.id || registration.id,
    runnerName: runnerName,
    mobile: maskedPhone,
    bibNumber: bibNo,
    raceCategory: category,
  });

  if (!normalized.isValid) {
    return {
      success: false,
      status: "FAILED",
      error: `Invalid mobile number: ${mobile}`,
    };
  }

  const messageText = buildBroadcastWhatsAppMessage(recordToUse);

  const templateId =
    getEnvVar("WHATSAPP_BROADCAST_TEMPLATE_ID") ||
    getEnvVar("BROADCAST_WHATSAPP_TEMPLATE_ID") ||
    "1792730";

  // Explicit template variable mapping: {{1}} = Name, {{2}} = Bib No, {{3}} = Category
  const variables = [runnerName, bibNo, category];
  console.log(`[WHATSAPP] Sending Broadcast Template: ${templateId} | Variables: [{{1}}=${runnerName}, {{2}}=${bibNo}, {{3}}=${category}]`);

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
 * Unified dispatch engine supporting ValueFirst Unified v2, Meta Cloud API, and Mock Fallback
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

  // 1. Unified v2 WhatsApp Gateway (ValueFirst / Infinito)
  const unifiedUrl = getEnvVar("WHATSAPP_API_URL") || "https://103.229.250.150/unified/v2/send";
  const unifiedClientId = getEnvVar("WHATSAPP_CLIENT_ID");
  const unifiedClientPassword = getEnvVar("WHATSAPP_CLIENT_PASSWORD");
  const unifiedSender = getEnvVar("WHATSAPP_SENDER") || "916369099925";
  const unifiedTag = getEnvVar("WHATSAPP_TAG") || "";

  if (unifiedUrl && unifiedClientId && unifiedClientPassword) {
    try {
      const cleanTo = recipientPhone.replace(/^\+/, "");
      const templateInfoStr = `${templateId}~${variables.join("~")}`;
      const messageIdParam = type === "BROADCAST" ? (getEnvVar("WHATSAPP_BROADCAST_MESSAGE_ID") || "1431909") : "";

      const payload = {
        apiver: "1.0",
        whatsapp: {
          ver: "2.0",
          dlr: {
            url: "",
          },
          messages: [
            {
              id: messageIdParam,
              templateinfo: templateInfoStr,
              text: "",
              addresses: [
                {
                  from: unifiedSender,
                  to: cleanTo,
                  seq: "01",
                  tag: "",
                },
              ],
            },
          ],
        },
      };

      const res = await postJsonWithAgent(
        unifiedUrl,
        payload,
        {
          "x-client-id": unifiedClientId,
          "x-client-password": unifiedClientPassword,
        },
        "GET"
      );

      console.log(`[WHATSAPP] Gateway HTTP Status: ${res.status} | Response: ${res.text}`);

      const isSuccess =
        res.status === 200 &&
        res.data &&
        (res.data.status === "Success" || res.data.statuscode === 200 || res.data.status === "success");

      if (isSuccess) {
        const guid = res.data?.messageack?.guids?.[0]?.guid || res.data?.message_id || `VF_${Date.now()}`;
        console.log(`[WHATSAPP ACCEPTED BY GATEWAY] Recipient: ${maskedPhone} | GUID: ${guid}`);
        return {
          success: true,
          status: "ACCEPTED",
          messageId: guid,
          providerStatusCode: res.data?.statuscode || 200,
          providerStatusText: res.data?.statustext || "OK",
          recipient: cleanTo,
          templateId: templateId,
        };
      }

      const sanitizedError =
        res.data?.statustext ||
        res.data?.message ||
        res.data?.error ||
        res.text.slice(0, 200) ||
        `HTTP ${res.status}`;

      console.error(`[WHATSAPP REJECTED BY GATEWAY] Recipient: ${maskedPhone} | Error: ${sanitizedError}`);

      return {
        success: false,
        status: "FAILED",
        providerStatusCode: res.data?.statuscode || res.status,
        providerStatusText: res.data?.statustext || "Error",
        error: sanitizedError,
        recipient: cleanTo,
        templateId: templateId,
      };
    } catch (err: any) {
      console.error(`[WHATSAPP Exception] To: ${maskedPhone} | Error: ${err.message || err}`);
      return {
        success: false,
        status: "FAILED",
        error: err.message || "Failed to communicate with WhatsApp gateway",
        recipient: recipientPhone,
        templateId: templateId,
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
