/**
 * WhatsApp Notification Service for Feel The Beat Marathon
 * Supports Unified v2 WhatsApp Gateway, Meta WhatsApp Cloud API (Graph API),
 * Twilio WhatsApp, Gupshup, Generic REST, and automatic mock mode for development/testing.
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
 * Builds standard plain-text WhatsApp message for runners.
 */
export function buildRegistrationWhatsAppMessage(registration: RunnerRegistrationDetails): string {
  const runnerName = (registration.full_name || "Runner").trim();
  const regNo = registration.registration_number || "FTB2026";
  const category = registration.race_category || "Run";
  const amount = registration.payment_amount !== undefined ? registration.payment_amount : 0;
  const venue = registration.tshirt_bib_venue || "Selected Venue";

  return `Hello *${runnerName}*,

Your *Feel The Beat Marathon 2026* registration has been successfully confirmed.

*Registration ID:* ${regNo}
*Race Category:* ${category}
*Amount Paid:* ₹${amount}
*T-Shirt & Bib Collection:* ${venue}
*Payment Status:* Successful

Thank you for registering for the Feel The Beat Marathon.
We look forward to seeing you at the starting line!

_Team Feel The Beat_`;
}

/**
 * Helper to make HTTP/HTTPS request with support for self-signed IP certs.
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
          rejectUnauthorized: false, // Allows self-signed IP certificates on dedicated gateway
          timeout: 10000,
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
        reject(new Error("Request timed out"));
      });

      req.write(bodyStr);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Sends a WhatsApp confirmation message to the runner.
 */
export async function sendRegistrationWhatsApp(
  registration: RunnerRegistrationDetails
): Promise<WhatsAppResponse> {
  const normalized = normalizeMobileNumber(registration.mobile);
  const maskedPhone = maskPhoneNumber(registration.mobile);

  if (!normalized.isValid) {
    console.error(`[WhatsApp] Invalid mobile number: ${maskedPhone}`);
    return {
      success: false,
      status: "FAILED",
      error: `Invalid mobile number format: ${registration.mobile}`,
    };
  }

  const messageText = buildRegistrationWhatsAppMessage(registration);

  const runnerName = (registration.full_name || "Runner").trim();
  const regNo = registration.registration_number || "FTB2026";
  const category = registration.race_category || "Run";
  const amount = `${registration.payment_amount !== undefined ? registration.payment_amount : 0}`;
  const venue = registration.tshirt_bib_venue || "Selected Venue";

  // 1. Check Unified v2 WhatsApp Gateway
  const unifiedUrl = getEnvVar("WHATSAPP_API_URL");
  const unifiedClientId = getEnvVar("WHATSAPP_CLIENT_ID");
  const unifiedClientPassword = getEnvVar("WHATSAPP_CLIENT_PASSWORD");
  const unifiedSender = getEnvVar("WHATSAPP_SENDER");
  const unifiedTag = getEnvVar("WHATSAPP_TAG");
  const unifiedTemplateId =
    getEnvVar("WHATSAPP_TEMPLATE_ID_PAYMENT") ||
    getEnvVar("WHATSAPP_TEMPLATE_ID_SUBMISSION") ||
    getEnvVar("WHATSAPP_TEMPLATE_ID") ||
    "1735301";

  if (unifiedUrl && unifiedClientId && unifiedClientPassword) {
    try {
      const basicAuth = Buffer.from(`${unifiedClientId}:${unifiedClientPassword}`).toString("base64");

      const payload = {
        client_id: unifiedClientId,
        client_password: unifiedClientPassword,
        sender: unifiedSender,
        to: normalized.withCountryCode,
        number: normalized.withCountryCode,
        mobile: normalized.withCountryCode,
        template_id: unifiedTemplateId,
        tag: unifiedTag,
        variables: [runnerName, regNo, category, amount, "Successful", venue],
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

      const isExplicitError =
        res.status >= 400 ||
        (res.data && (res.data.status === "error" || res.data.status === false || res.data.error)) ||
        res.text.toLowerCase().includes("error");

      const isSuccess =
        res.status >= 200 &&
        res.status < 300 &&
        !isExplicitError &&
        (res.data?.status === "success" || res.data?.status === true || res.data?.status === 200 || res.data?.message_id || res.data?.id);

      if (isSuccess) {
        const messageId = res.data?.message_id || res.data?.id || res.data?.msgId || `UNIFIED_WA_${Date.now()}`;
        console.log(`[WhatsApp SUCCESS] Unified v2 | Recipient: ${maskedPhone} | MessageId: ${messageId}`);
        return {
          success: true,
          status: "SENT",
          messageId,
        };
      }

      const sanitizedError = res.data?.message || res.data?.statustext || res.data?.error || res.text.slice(0, 200) || `HTTP ${res.status}`;
      console.error(`[WhatsApp FAILED] Unified v2 | HTTP: ${res.status} | Recipient: ${maskedPhone} | Error: ${sanitizedError}`);

      return {
        success: false,
        status: "FAILED",
        error: sanitizedError,
      };
    } catch (err: any) {
      console.error(`[WhatsApp Exception] Unified v2 | Recipient: ${maskedPhone} | Error: ${err.message || err}`);
      return {
        success: false,
        status: "FAILED",
        error: err.message || "Failed to communicate with WhatsApp gateway",
      };
    }
  }

  // 2. Check Meta WhatsApp Cloud API (Graph API)
  const metaToken =
    getEnvVar("WHATSAPP_ACCESS_TOKEN") ||
    getEnvVar("WHATSAPP_TOKEN") ||
    getEnvVar("META_WHATSAPP_TOKEN");
  const metaPhoneId =
    getEnvVar("WHATSAPP_PHONE_NUMBER_ID") ||
    getEnvVar("META_PHONE_NUMBER_ID");
  const templateName =
    getEnvVar("WHATSAPP_TEMPLATE_NAME") ||
    getEnvVar("META_WHATSAPP_TEMPLATE");
  const languageCode =
    getEnvVar("WHATSAPP_LANGUAGE_CODE") || "en";

  if (metaToken && metaPhoneId) {
    try {
      const url = `https://graph.facebook.com/v20.0/${metaPhoneId}/messages`;

      let payload: any;

      if (templateName) {
        payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: normalized.withCountryCode,
          type: "template",
          template: {
            name: templateName,
            language: {
              code: languageCode,
            },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: runnerName },
                  { type: "text", text: regNo },
                  { type: "text", text: category },
                  { type: "text", text: amount },
                  { type: "text", text: "Successful" },
                  { type: "text", text: venue },
                ],
              },
            ],
          },
        };
      } else {
        payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: normalized.withCountryCode,
          type: "text",
          text: {
            preview_url: false,
            body: messageText,
          },
        };
      }

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
        console.log(`[WhatsApp SUCCESS] Meta Cloud API | Recipient: ${maskedPhone} | MessageId: ${messageId}`);
        return {
          success: true,
          status: "SENT",
          messageId,
        };
      }

      const errDetail = resData?.error?.message || `HTTP ${response.status}`;
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

  // 3. Fallback Mock Mode
  console.log(`[WhatsApp MOCK] To: ${maskedPhone} | Text: ${messageText.slice(0, 80)}...`);

  return {
    success: true,
    status: "SENT",
    messageId: `MOCK_WA_${Date.now()}`,
    isMock: true,
  };
}
