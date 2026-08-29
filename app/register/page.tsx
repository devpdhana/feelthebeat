"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { racePrices } from "@/data/registrationConfig";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { registrationConfig } from "@/data/navigation";

// Extend window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const DAV_FAMILY_TYPES = [
  "Student",
  "Parent",
  "Staff / Teacher",
  "Alumni",
  "Family Member",
];

export const HEAR_ABOUT_OPTIONS = [
  "Social Media",
  "Ambassadors",
  "Through friends of friends",
  "Offline platforms (Banners/posters)",
  "None of the above",
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected category from query string parameter
  const initialCategory = searchParams.get("category") || "10km";

  // Form State
  const [formData, setFormData] = useState({
    raceCategory: initialCategory,
    schoolName: "",
    fullName: "",
    mobile: "",
    email: "",
    dob: "",
    gender: "",
    tshirtSize: "",
    davFamilyMember: "",
    davFamilyType: "",
    davHearAbout: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    bloodGroup: "",
    medicalCondition: "None",
    nationality: "Indian",
    firstTimeRunner: "No",
    runningClub: "",
    disabilityStatus: "No",
    timingCertificate: "No",
    fitConfirm: false,
    termsConfirm: false,
    privacyConfirm: false,
    correctConfirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Sync category from URL queries
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && racePrices[cat]) {
      setFormData((prev) => ({ ...prev, raceCategory: cat }));
    }
  }, [searchParams]);

  // Load Razorpay Checkout SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const selectedCategory = racePrices[formData.raceCategory] || racePrices["10km"];

  // Client side validation
  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!formData.dob) {
      errs.dob = "Date of Birth is required";
    } else {
      const birthDate = new Date(formData.dob);
      const eventDate = new Date("2026-09-27");
      let age = eventDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = eventDate.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())) {
        age--;
      }

      if (formData.raceCategory === "2km-kids" && (age < 8 || age > 16)) {
        errs.dob = "Participants must be between 8 and 16 years for the 2 KM Kids Fun Run.";
      } else if (formData.raceCategory === "2km" && age < 18) {
        errs.dob = "Participants must be 18 years or above for the 2 KM Adults Fun Run.";
      } else if (formData.raceCategory === "5km" && age < 12) {
        errs.dob = "Participants must be 12 years or above for the 5 KM.";
      } else if (formData.raceCategory === "10km" && age < 14) {
        errs.dob = "Participants must be 14 years or above for the 10 KM.";
      }
    }


    if (!formData.gender) errs.gender = "Gender selection is required";
    if (!formData.tshirtSize) errs.tshirtSize = "T-Shirt Size is required";

    // D.A.V Family & Referral conditional validation
    if (!formData.davFamilyMember) {
      errs.davFamilyMember = "Please select whether you are part of the D.A.V Family";
    } else if (formData.davFamilyMember === "Yes") {
      if (!formData.davFamilyType) {
        errs.davFamilyType = "Please select your D.A.V Family role";
      }
    } else if (formData.davFamilyMember === "No") {
      if (!formData.davHearAbout) {
        errs.davHearAbout = "Please select how you heard about the D.A.V. Marathon";
      }
    }

    if (!formData.emergencyContactName.trim()) errs.emergencyContactName = "Emergency Contact Name is required";
    if (!/^\d{10}$/.test(formData.emergencyContactNumber)) errs.emergencyContactNumber = "Emergency Mobile must be 10 digits";
    if (formData.mobile === formData.emergencyContactNumber) errs.emergencyContactNumber = "Emergency contact cannot be same as main mobile";
    if (!formData.bloodGroup) errs.bloodGroup = "Blood Group is required";
    if (!formData.nationality.trim()) errs.nationality = "Nationality is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };


  // Payment Handler
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const banner = document.getElementById("error-banner");
      if (banner) banner.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);

    try {
      // 1. Create order at backend
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.raceCategory,
          email: formData.email,
          mobile: formData.mobile,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.message || "Failed to create payment order.");
      }

      // 2. Open Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mockkey",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Feel The Beat Run 2026",
        description: `Registration fee for ${selectedCategory.name}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          setLoading(true);
          try {
            // 3. Verify payment signature and submit registration
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...formData,
                dav_family_member: formData.davFamilyMember,
                dav_family_type: formData.davFamilyMember === "Yes" ? formData.davFamilyType : null,
                dav_hear_about: formData.davFamilyMember === "No" ? formData.davHearAbout : null,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              // Redirect to success route
              router.push(
                `/register/success?regNo=${verifyData.registrationNumber}&name=${encodeURIComponent(
                  formData.fullName
                )}&category=${formData.raceCategory}${formData.raceCategory === "2km-kids" && formData.schoolName
                  ? `&schoolName=${encodeURIComponent(formData.schoolName)}`
                  : ""
                }`
              );
            } else {
              alert(verifyData.message || "Payment verification failed.");
            }
          } catch (err: any) {
            alert(err.message || "An error occurred during verification.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.mobile,
        },
        theme: {
          color: "#0698F3",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "An error occurred during order generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-32 pb-24 text-default bg-[#F5FAFF]">
      <div className="absolute inset-0 telemetry-grid opacity-[0.03] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Headline banner */}
        <div className="mb-12 border-b border-brand-primary/12 pb-8 flex flex-col gap-2">

          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
            EVENT REGISTRATION
          </h1>
        </div>

        {Object.keys(errors).length > 0 && (
          <div
            id="error-banner"
            className="mb-8 border border-red-500/25 bg-red-50/50 p-4 font-mono text-xs text-red-600 flex flex-col gap-1 rounded-lg shadow-sm"
          >
            <span className="font-bold uppercase"> VALIDATION ERROR DETECTED:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              {Object.values(errors).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column Form Slots */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Event Details Category */}
            <Card className="flex flex-col gap-6 p-6 md:p-8">
              <div className="border-b border-brand-primary/12 pb-4">
                <span className="font-mono text-[9px] text-brand-primary tracking-widest block uppercase mb-1 font-semibold">
                  [01] RACE PARAMETERS
                </span>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-default">
                  SELECT CATEGORY
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(racePrices).map((priceObj) => {
                  const isSelected = formData.raceCategory === priceObj.id;
                  return (
                    <div
                      key={priceObj.id}
                      onClick={() => setFormData({ ...formData, raceCategory: priceObj.id })}
                      className={`border p-4 cursor-pointer flex flex-col justify-between gap-3 transition-all duration-300 relative rounded-lg ${isSelected
                        ? "bg-brand-primary/10 border-brand-primary text-brand-primary font-bold shadow-sm"
                        : "bg-white border-brand-primary/12 text-muted-default hover:border-brand-primary/30 hover:text-default shadow-sm"
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-2 h-2 bg-brand-primary" />
                      )}
                      <div>
                        <span className={`font-mono text-[9px] uppercase tracking-wider block font-semibold ${priceObj.isTimed ? "text-muted-default" : "text-brand-primary"}`}>
                          {priceObj.timingType || (priceObj.isTimed ? "TIMED" : "NON-TIMED")}
                        </span>
                        <span className="font-display text-base font-black text-default block mt-1">{priceObj.name}</span>
                        <span className="font-mono text-lg font-extrabold text-brand-primary block mt-0.5">₹{priceObj.fee}</span>
                      </div>
                      <div className="border-t border-brand-primary/8 pt-2 font-mono text-[9px] text-muted-default flex flex-col gap-0.5">
                        <div className="flex justify-between">
                          <span>START:</span>
                          <span className="text-default font-semibold">{priceObj.startTime}</span>
                        </div>
                        {priceObj.isTimed && priceObj.cutoffTime && (
                          <div className="flex justify-between">
                            <span>CUT-OFF:</span>
                            <span className="text-brand-primary font-semibold">{priceObj.cutoffTime}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>AGE:</span>
                          <span className="text-default font-semibold">{priceObj.ageEligibility}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>


            {/* Personal Information */}
            <Card className="flex flex-col gap-6 p-6 md:p-8">
              <div className="border-b border-brand-primary/12 pb-4">
                <span className="font-mono text-[9px] text-brand-primary tracking-widest block uppercase mb-1 font-semibold">
                  [02] IDENTITY METRICS
                </span>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-default">
                  PERSONAL INFORMATION
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.raceCategory === "2km-kids" && (
                  <div className="flex flex-col gap-1 font-mono md:col-span-2">
                    <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">
                      SCHOOL NAME (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      placeholder="Enter your school name"
                      className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default placeholder-muted-default/40 focus:border-brand-primary focus:outline-none transition-colors rounded uppercase"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="ENTER FULL NAME"
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default placeholder-muted-default/40 focus:border-brand-primary focus:outline-none transition-colors rounded uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">MOBILE NUMBER *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="ENTER 10-DIGIT MOBILE"
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default placeholder-muted-default/40 focus:border-brand-primary focus:outline-none transition-colors rounded"
                  />
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ENTER EMAIL ADDRESS"
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default placeholder-muted-default/40 focus:border-brand-primary focus:outline-none transition-colors rounded uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">DATE OF BIRTH *</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default focus:border-brand-primary focus:outline-none transition-colors rounded"
                  />
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">GENDER *</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default focus:border-brand-primary focus:outline-none transition-colors rounded appearance-none cursor-pointer"
                  >
                    <option value="">SELECT GENDER</option>
                    <option value="Male">MALE</option>
                    <option value="Female">FEMALE</option>
                    <option value="Other">OTHER</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">T-SHIRT SIZE *</label>
                  <select
                    required
                    value={formData.tshirtSize}
                    onChange={(e) => setFormData({ ...formData, tshirtSize: e.target.value })}
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default focus:border-brand-primary focus:outline-none transition-colors rounded appearance-none cursor-pointer"
                  >
                    <option value="">SELECT SIZE</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* D.A.V. Family & Referral */}
            <Card className="flex flex-col gap-6 p-6 md:p-8">
              <div className="border-b border-brand-primary/12 pb-4">
                <span className="font-mono text-[9px] text-brand-primary tracking-widest block uppercase mb-1 font-semibold">
                  [03] COMMUNITY AFFILIATION
                </span>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-default">
                  Sree Jayam COMMUNITY &amp; REFERRAL
                </h3>
              </div>

              <div className="flex flex-col gap-6 font-mono">
                {/* Question 1: I'm part of D.A.V Family? */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-default">
                    I&apos;m part of Sree Jayam Family? *
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {["Yes", "No"].map((option) => {
                      const isSelected = formData.davFamilyMember === option;
                      return (
                        <label
                          key={option}
                          className={`flex items-center gap-2.5 px-4 py-2.5 border rounded-lg cursor-pointer transition-all ${isSelected
                            ? "bg-brand-primary/5 border-brand-primary text-brand-primary font-bold shadow-sm"
                            : "bg-white border-[#DCE8F8] text-default hover:border-brand-primary/40"
                            }`}
                        >
                          <input
                            type="radio"
                            name="davFamilyMember"
                            value={option}
                            checked={isSelected}
                            onChange={() => {
                              if (option === "Yes") {
                                setFormData({
                                  ...formData,
                                  davFamilyMember: "Yes",
                                  davHearAbout: "", // clear other option
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  davFamilyMember: "No",
                                  davFamilyType: "", // clear DAV family role
                                });
                              }
                            }}
                            className="accent-brand-primary cursor-pointer"
                            required
                          />
                          <span className="text-xs font-bold">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Question for YES: D.A.V Family Type */}
                {formData.davFamilyMember === "Yes" && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-brand-primary/10 animate-fadeIn">
                    <label className="text-xs font-bold text-default">
                      Sree jayam Family *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {DAV_FAMILY_TYPES.map((type) => {
                        const isSelected = formData.davFamilyType === type;
                        return (
                          <label
                            key={type}
                            className={`flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                              ? "bg-brand-primary/5 border-brand-primary text-brand-primary font-bold shadow-sm"
                              : "bg-white border-[#DCE8F8] text-default hover:border-brand-primary/40"
                              }`}
                          >
                            <input
                              type="radio"
                              name="davFamilyType"
                              value={type}
                              checked={isSelected}
                              onChange={() =>
                                setFormData({ ...formData, davFamilyType: type })
                              }
                              className="accent-brand-primary cursor-pointer"
                              required
                            />
                            <span className="text-xs">{type}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conditional Question for NO: How did you hear about our D.A.V. Marathon? */}
                {formData.davFamilyMember === "No" && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-brand-primary/10 animate-fadeIn">
                    <label className="text-xs font-bold text-default">
                      How did you hear about our Sree Jayam Marathon? *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {HEAR_ABOUT_OPTIONS.map((item) => {
                        const isSelected = formData.davHearAbout === item;
                        return (
                          <label
                            key={item}
                            className={`flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                              ? "bg-brand-primary/5 border-brand-primary text-brand-primary font-bold shadow-sm"
                              : "bg-white border-[#DCE8F8] text-default hover:border-brand-primary/40"
                              }`}
                          >
                            <input
                              type="radio"
                              name="davHearAbout"
                              value={item}
                              checked={isSelected}
                              onChange={() =>
                                setFormData({ ...formData, davHearAbout: item })
                              }
                              className="accent-brand-primary cursor-pointer"
                              required
                            />
                            <span className="text-xs">{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Emergency & Medical details */}
            <Card className="flex flex-col gap-6 p-6 md:p-8">
              <div className="border-b border-brand-primary/12 pb-4">
                <span className="font-mono text-[9px] text-brand-primary tracking-widest block uppercase mb-1 font-semibold">
                  [04] SUPPORT &amp; HEALTH PROFILE
                </span>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-default">
                  EMERGENCY &amp; MEDICAL LOGS
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">EMERGENCY CONTACT NAME *</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="ENTER CONTACT PERSON NAME"
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default placeholder-muted-default/40 focus:border-brand-primary focus:outline-none transition-colors rounded uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">EMERGENCY MOBILE NUMBER *</label>
                  <input
                    type="tel"
                    required
                    value={formData.emergencyContactNumber}
                    onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                    placeholder="ENTER 10-DIGIT MOBILE"
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default placeholder-muted-default/40 focus:border-brand-primary focus:outline-none transition-colors rounded"
                  />
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">BLOOD GROUP *</label>
                  <select
                    required
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default focus:border-brand-primary focus:outline-none transition-colors rounded appearance-none cursor-pointer"
                  >
                    <option value="">SELECT BLOOD GROUP</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">MEDICAL CONDITIONS *</label>
                  <select
                    required
                    value={formData.medicalCondition}
                    onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default focus:border-brand-primary focus:outline-none transition-colors rounded appearance-none cursor-pointer"
                  >
                    <option value="None">NONE</option>
                    <option value="Asthma">ASTHMA</option>
                    <option value="Diabetes">DIABETES</option>
                    <option value="Heart Condition">HEART CONDITION</option>
                    <option value="Other">OTHER</option>
                  </select>
                </div>
              </div>
            </Card>





            {/* Runner details */}
            <Card className="flex flex-col gap-6 p-6 md:p-8">
              <div className="border-b border-brand-primary/12 pb-4">
                <span className="font-mono text-[9px] text-brand-primary tracking-widest block uppercase mb-1 font-semibold">
                  [05] ATHLETIC SPECIFICATIONS
                </span>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-default">
                  RUNNER SPECIFICATIONS
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">NATIONALITY *</label>
                  <input
                    type="text"
                    required
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="ENTER NATIONALITY"
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default placeholder-muted-default/40 focus:border-brand-primary focus:outline-none transition-colors rounded uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">FIRST TIME RUNNER *</label>
                  <select
                    value={formData.firstTimeRunner}
                    onChange={(e) => setFormData({ ...formData, firstTimeRunner: e.target.value })}
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default focus:border-brand-primary focus:outline-none transition-colors rounded appearance-none cursor-pointer"
                  >
                    <option value="No">NO</option>
                    <option value="Yes">YES</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">RUNNING CLUB / GROUP (OPTIONAL)</label>
                  <input
                    type="text"
                    value={formData.runningClub}
                    onChange={(e) => setFormData({ ...formData, runningClub: e.target.value })}
                    placeholder="ENTER CLUB NAME"
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default placeholder-muted-default/40 focus:border-brand-primary focus:outline-none transition-colors rounded uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1 font-mono">
                  <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">DISABILITY STATUS *</label>
                  <select
                    value={formData.disabilityStatus}
                    onChange={(e) => setFormData({ ...formData, disabilityStatus: e.target.value })}
                    className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default focus:border-brand-primary focus:outline-none transition-colors rounded appearance-none cursor-pointer"
                  >
                    <option value="No">NO</option>
                    <option value="Yes">YES</option>
                  </select>
                </div>

                {selectedCategory.isTimed && (
                  <div className="flex flex-col gap-1 font-mono">
                    <label className="text-[9px] text-muted-default uppercase tracking-wider font-semibold">OFFICIAL TIMING CERTIFICATE REQUIRED *</label>
                    <select
                      value={formData.timingCertificate}
                      onChange={(e) => setFormData({ ...formData, timingCertificate: e.target.value })}
                      className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-default focus:border-brand-primary focus:outline-none transition-colors rounded appearance-none cursor-pointer"
                    >
                      <option value="No">NO</option>
                      <option value="Yes">YES</option>
                    </select>
                  </div>
                )}
              </div>
            </Card>

            {/* Declarations */}
            <Card className="flex flex-col gap-6 p-6 md:p-8">
              <div className="border-b border-brand-primary/12 pb-4">
                <span className="font-mono text-[9px] text-brand-primary tracking-widest block uppercase mb-1 font-semibold">
                  [06] VERIFICATION STATEMENTS
                </span>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-default">
                  DECLARATION & CONSENT
                </h3>
              </div>

              <div className="flex flex-col gap-4 font-mono text-xs text-default">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formData.fitConfirm}
                    onChange={(e) => setFormData({ ...formData, fitConfirm: e.target.checked })}
                    className="mt-1 accent-brand-primary"
                  />
                  <span>I confirm I am medically fit to participate.</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formData.termsConfirm}
                    onChange={(e) => setFormData({ ...formData, termsConfirm: e.target.checked })}
                    className="mt-1 accent-brand-primary"
                  />
                  <span>I agree to the Terms & Conditions.</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formData.privacyConfirm}
                    onChange={(e) => setFormData({ ...formData, privacyConfirm: e.target.checked })}
                    className="mt-1 accent-brand-primary"
                  />
                  <span>I agree to the Privacy Policy.</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formData.correctConfirm}
                    onChange={(e) => setFormData({ ...formData, correctConfirm: e.target.checked })}
                    className="mt-1 accent-brand-primary"
                  />
                  <span>I confirm that the information provided is correct.</span>
                </label>
              </div>
            </Card>
          </div>

          {/* Right Column Sticky summary card */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <Card className="flex flex-col gap-6 p-6">
              <div className="border-b border-brand-primary/12 pb-4">
                <span className="font-mono text-[9px] text-brand-muted/40 tracking-widest block uppercase">
                  PRICE_CALCULATION
                </span>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-default">
                  ORDER SUMMARY
                </h3>
              </div>

              <div className="flex flex-col gap-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-default/55">CATEGORY:</span>
                  <span className="text-default font-bold">{selectedCategory.name.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-default/55">REPORTING TIME:</span>
                  <span className="text-default font-semibold">{selectedCategory.reportingTime || "5:00 AM"}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-default/55">START TIME:</span>
                  <span className="text-default font-semibold">{selectedCategory.startTime}</span>
                </div>
                {selectedCategory.isTimed && selectedCategory.cutoffTime && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-default/55">CUT-OFF TIME:</span>
                    <span className="text-brand-primary font-semibold">{selectedCategory.cutoffTime}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-default/55">AGE ELIGIBILITY:</span>
                  <span className="text-default font-semibold">{selectedCategory.ageEligibility}</span>
                </div>
                <div className="h-[1px] bg-brand-primary/8 my-1" />
                <div className="flex justify-between">
                  <span className="text-muted-default/55">TICKET FEE:</span>
                  <span className="text-default font-bold">₹{selectedCategory.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-default/55">PLATFORM CHARGE:</span>
                  <span className="text-brand-primary font-bold">₹0 (FREE)</span>
                </div>
                <div className="h-[1px] bg-brand-primary/8 my-1" />
                <div className="flex justify-between text-base">
                  <span className="text-default font-bold">TOTAL AMOUNT:</span>
                  <span className="text-brand-primary font-black">₹{selectedCategory.fee}</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-4 text-xs font-black tracking-widest shadow-md"
                disabled={loading}
              >
                {loading ? "PROCESSING PAYMENT..." : "PROCEED TO PAYMENT"}
              </Button>

              <div className="text-center font-mono text-[9px] text-muted-default/30">
                SECURE SECURE TRANSACTION PROTOCOL  POWERED BY RAZORPAY
              </div>
            </Card>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5FAFF] flex items-center justify-center p-4 text-default font-mono text-xs"> INITIALIZING SECURE REGISTRY PORTAL...</div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
