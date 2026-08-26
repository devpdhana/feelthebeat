import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { racePrices } from "@/data/registrationConfig";
const Razorpay = require("razorpay");

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

    // Check duplicate registrations using Supabase
    const { data: duplicate, error: dupError } = await supabaseAdmin
      .from("registrations")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .eq("mobile", mobile.trim())
      .eq("race_category", priceObj.name)
      .eq("payment_status", "Successful")
      .maybeSingle();

    if (dupError) {
      console.error("Duplicate check error:", dupError);
    }

    if (duplicate) {
      return NextResponse.json(
        { message: "You have already registered for this category." },
        { status: 400 }
      );
    }

    // Configure Razorpay client
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_mockkey",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "mocksecret",
    });
    console.log("key-id", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    console.log("key-secret", process.env.RAZORPAY_KEY_SECRET);
    // Create payment order
    const order = await instance.orders.create({
      amount: priceObj.fee * 100,
      currency: "INR",
      receipt: `ftb_${Date.now()}`,
    });

    // Save pending payment log in Supabase
    const { error: payError } = await supabaseAdmin
      .from("payments")
      .insert({
        razorpay_order_id: order.id,
        amount: Number(priceObj.fee),
        status: "PENDING",
      });

    if (payError) {
      console.error("Payment insert error:", payError);
      throw new Error("Failed to log payment order.");
    }

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: "INR",
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to create order." },
      { status: 500 }
    );
  }
}
