import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { racePrices } from "@/data/registrationConfig";

export async function POST(req: Request) {
  try {
    const { category, email, mobile } = await req.json();

    if (!category || !email || !mobile) {
      return NextResponse.json(
        { message: "Missing required order parameters." },
        { status: 400 }
      );
    }

    const priceObj = racePrices[category];
    if (!priceObj) {
      return NextResponse.json(
        { message: "Invalid race category specified." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.trim();

    // 1. Check duplicate paid registrations
    const { data: duplicate, error: dupError } = await supabaseAdmin
      .from("registrations")
      .select("id, registration_number, order_id, bib_number")
      .eq("email", cleanEmail)
      .eq("mobile", cleanMobile)
      .eq("race_category", priceObj.name)
      .eq("payment_status", "Successful")
      .maybeSingle();

    if (dupError) {
      console.error("[PAYMENT ORDER] Duplicate check error:", dupError);
    }

    if (duplicate) {
      return NextResponse.json(
        { message: `You have already registered for ${priceObj.name} (Order: ${duplicate.order_id || duplicate.registration_number}).` },
        { status: 400 }
      );
    }

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("[PAYMENT ORDER] Razorpay credentials missing in environment.");
      return NextResponse.json(
        { message: "Payment service configuration error." },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");
    const amountInPaise = priceObj.fee * 100;

    console.log(`[PAYMENT ORDER] Creating order | Category: ${category} | Amount: ${amountInPaise} paise (₹${priceObj.fee})`);

    // Call Razorpay API directly with timeout & error handling
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `ftb_${Date.now()}`,
      }),
    });

    if (!rzpRes.ok) {
      const errorBody = await rzpRes.json().catch(() => ({}));
      console.error(`[PAYMENT ORDER] Razorpay order creation failed (${rzpRes.status}):`, errorBody);

      if (rzpRes.status === 429) {
        return NextResponse.json(
          { message: "Payment service is temporarily busy. Please wait a moment and try again." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { message: errorBody?.error?.description || "Failed to create payment order. Please try again." },
        { status: rzpRes.status || 500 }
      );
    }

    const order = await rzpRes.json();
    console.log(`[PAYMENT ORDER] Order created successfully: ${order.id} | Amount: ${order.amount} paise`);

    // Save pending payment record in Supabase
    const { error: payError } = await supabaseAdmin
      .from("payments")
      .insert({
        razorpay_order_id: order.id,
        amount: Number(priceObj.fee),
        status: "PENDING",
      });

    if (payError) {
      console.error("[PAYMENT ORDER] Payment DB insert error:", payError);
    }

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: "INR",
    });
  } catch (err: any) {
    console.error("[PAYMENT ORDER] Exception:", err);
    return NextResponse.json(
      { message: err.message || "Failed to create order." },
      { status: 500 }
    );
  }
}
