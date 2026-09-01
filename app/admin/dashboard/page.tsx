"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import {
  HiOutlineDownload,
  HiOutlinePrinter,
  HiOutlineEye,
  HiOutlineTrash,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface RegistrationItem {
  id: string;
  registrationNumber: string;
  fullName: string;
  raceCategory: string;
  schoolName?: string | null;
  mobile: string;
  email: string;
  gender: string;
  age: number;
  dob: string;
  tshirtSize: string;
  tshirtBibVenue?: string;
  tshirtBibVenueAddress?: string;
  davFamilyMember?: string;
  davFamilyType?: string;
  davHearAbout?: string;
  bloodGroup: string;
  medicalCondition: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  nationality: string;
  firstTimeRunner: string;
  runningClub: string;
  disabilityStatus?: string;
  bibName?: string;
  orderId?: string;
  bibNumber?: number | string;
  paymentStatus: string;
  paymentAmount?: number;
  whatsappSent?: boolean;
  whatsappSentAt?: string | null;
  whatsappStatus?: string;
  whatsappMessageId?: string | null;
  whatsappError?: string | null;
  razorpayPaymentId?: string;
  signature: string;
  createdAt: string;
}

interface StatsSummary {
  totalRegistrations: number;
  totalRevenue: number;
  todayRegistrations: number;
  pendingPayments: number;
  successfulPayments: number;
}

interface DashboardStats {
  summary: StatsSummary;
  charts: {
    daily: { date: string; count: number }[];
    categories: { category: string; count: number }[];
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, page: 1, limit: 10 });
  const [activeReg, setActiveReg] = useState<RegistrationItem | null>(null);

  // WhatsApp Broadcast state
  const [broadcastStats, setBroadcastStats] = useState<{
    totalRegistered: number;
    validWhatsAppNumbers: number;
    invalidOrMissingNumbers: number;
    campaign: {
      id: string;
      campaign_name: string;
      template_id: string;
      status: "IDLE" | "PROCESSING" | "COMPLETED" | "FAILED";
      total_recipients: number;
      sent_count: number;
      failed_count: number;
      pending_count: number;
      created_at: string;
      updated_at: string;
      failed_recipients: any[];
    };
  } | null>(null);
  const [isBroadcastConfirmOpen, setIsBroadcastConfirmOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  const getAuthToken = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return data.session.access_token;
      }
    } catch (e) {
      // fallback
    }
    const match = document.cookie.match(/(^| )sb-access-token=([^;]+)/);
    return match ? match[2] : "";
  };

  const fetchBroadcastStats = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch("/api/admin/whatsapp/broadcast", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBroadcastStats(data);
        if (data.campaign?.status === "PROCESSING") {
          setIsBroadcasting(true);
        } else {
          setIsBroadcasting(false);
        }
      }
    } catch (err) {
      console.error("Fetch broadcast stats error:", err);
    }
  };

  const startBroadcast = async () => {
    setIsBroadcastConfirmOpen(false);
    setIsBroadcasting(true);
    setBroadcastNotice("Initiating broadcast to all registered participants...");
    try {
      const token = await getAuthToken();
      const res = await fetch("/api/admin/whatsapp/broadcast", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcastNotice(`Broadcast started for ${data.campaign?.total_recipients || 0} participants.`);
        pollBroadcastStatus();
      } else {
        setBroadcastNotice(data.message || "Failed to start broadcast.");
        setIsBroadcasting(false);
      }
    } catch (err: any) {
      setBroadcastNotice(err.message || "Broadcast request failed.");
      setIsBroadcasting(false);
    }
  };

  const pollBroadcastStatus = () => {
    const interval = setInterval(async () => {
      try {
        const token = await getAuthToken();
        const res = await fetch("/api/admin/whatsapp/broadcast", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setBroadcastStats(data);
          if (data.campaign?.status !== "PROCESSING") {
            clearInterval(interval);
            setIsBroadcasting(false);
            setBroadcastNotice(
              `Broadcast Completed: Total ${data.campaign?.total_recipients}, Sent: ${data.campaign?.sent_count}, Failed: ${data.campaign?.failed_count}`
            );
          }
        }
      } catch {
        clearInterval(interval);
        setIsBroadcasting(false);
      }
    }, 1500);
  };

  const retryFailedBroadcast = async () => {
    setIsRetrying(true);
    setBroadcastNotice("Retrying failed recipients...");
    try {
      const token = await getAuthToken();
      const res = await fetch("/api/admin/whatsapp/broadcast/retry-failed", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: broadcastStats?.campaign?.failed_recipients || [],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcastNotice(data.message);
        fetchBroadcastStats();
      } else {
        setBroadcastNotice(data.message || "Failed to retry.");
      }
    } catch (err: any) {
      setBroadcastNotice(err.message || "Retry exception.");
    } finally {
      setIsRetrying(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        console.error("Dashboard stats query error:", res.statusText);
        return;
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Dashboard stats query error:", err);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        category,
        paymentStatus,
      });

      const res = await fetch(`/api/admin/registrations?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Failed to load registrations. Please try again.");
        setRegistrations([]);
        return;
      }

      const data = await res.json();
      const items = data.registrations || data.items || data.data || [];
      setRegistrations(items);
      setPagination(data.pagination || { totalPages: 1, page: 1, limit: 10 });
    } catch (err: any) {
      console.error("Registrations fetch error:", err);
      setError(err?.message || "Unable to load registrations. Please try again.");
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  // Authenticated redirect checking
  useEffect(() => {
    fetchDashboardStats();
    fetchRegistrations();
    fetchBroadcastStats();
  }, [category, paymentStatus, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRegistrations();
  };

  const fetchIndividual = async (id: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/admin/registration/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setActiveReg(data);
    } catch (err) {
      alert("Failed to query node specifications.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration entry?")) return;
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/admin/registration/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Registration node successfully purged.");
        fetchDashboardStats();
        fetchRegistrations();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete registration.");
      }
    } catch (err) {
      alert("An error occurred while deleting.");
    }
  };

  const [resendingWa, setResendingWa] = useState(false);
  const [resendWaMessage, setResendWaMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin/login");
  };

  const handleResendWhatsApp = async (id: string) => {
    try {
      setResendingWa(true);
      setResendWaMessage(null);
      const token = await getAuthToken();
      const res = await fetch(`/api/admin/registration/${id}/resend-whatsapp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendWaMessage(data.message || `WhatsApp message accepted by provider (GUID: ${data.messageId}). Delivery pending.`);
        if (activeReg) {
          setActiveReg({
            ...activeReg,
            whatsappSent: true,
            whatsappStatus: data.whatsappStatus || "ACCEPTED",
            whatsappSentAt: data.whatsappSentAt || new Date().toISOString(),
            whatsappMessageId: data.messageId || activeReg.whatsappMessageId,
            whatsappError: null,
          });
        }
        fetchRegistrations();
      } else {
        const errorReason = data.providerErrorMessage || data.message || "WhatsApp could not be sent.";
        setResendWaMessage(`WhatsApp failed: ${errorReason}`);
        if (activeReg) {
          setActiveReg({
            ...activeReg,
            whatsappSent: false,
            whatsappStatus: "FAILED",
            whatsappError: errorReason,
          });
        }
        fetchRegistrations();
      }
    } catch (err: any) {
      setResendWaMessage(`Error: ${err.message || "Failed to resend WhatsApp"}`);
    } finally {
      setResendingWa(false);
    }
  };

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Bib Number,Registration Number,Full Name,Bib Name,Email,Mobile,Category,School Name,T-Shirt Size,T-Shirt/Bib Venue,T-Shirt/Bib Address,D.A.V Member,D.A.V Role,How Heard About,Payment Status,WhatsApp Status,Blood Group\n";

    registrations.forEach((reg) => {
      csvContent += `"${reg.orderId || ""}","${reg.bibNumber || ""}","${reg.registrationNumber}","${reg.fullName}","${reg.bibName || ""}","${reg.email}","${reg.mobile}","${reg.raceCategory}","${reg.schoolName || ""}","${reg.tshirtSize}","${reg.tshirtBibVenue || ""}","${(reg.tshirtBibVenueAddress || "").replace(/\n/g, " ")}","${reg.davFamilyMember || ""}","${reg.davFamilyType || ""}","${reg.davHearAbout || ""}","${reg.paymentStatus}","${reg.whatsappStatus || (reg.whatsappSent ? "SENT" : "NOT_SENT")}","${reg.bloodGroup}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "FTB2026-Registrations-Log.csv");
    link.click();
  };

  const exportToCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Order ID,Bib Number,Registration Number,Full Name,Bib Name,Email,Mobile,Category,School Name,T-Shirt Size,T-Shirt/Bib Venue,T-Shirt/Bib Address,D.A.V Member,D.A.V Role,How Heard About,Payment Status,WhatsApp Status,Blood Group\n";

      registrations.forEach((reg) => {
        csvContent += `"${reg.orderId || ""}","${reg.bibNumber || ""}","${reg.registrationNumber}","${reg.fullName}","${reg.bibName || ""}","${reg.email}","${reg.mobile}","${reg.raceCategory}","${reg.schoolName || ""}","${reg.tshirtSize}","${reg.tshirtBibVenue || ""}","${(reg.tshirtBibVenueAddress || "").replace(/\n/g, " ")}","${reg.davFamilyMember || ""}","${reg.davFamilyType || ""}","${reg.davHearAbout || ""}","${reg.paymentStatus}","${reg.whatsappStatus || (reg.whatsappSent ? "SENT" : "NOT_SENT")}","${reg.bloodGroup}"\n`;
      });

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "FTB2026-Registrations-Log.csv");
      link.click();
    } catch (err) {
      alert("Failed to export CSV file.");
    }
  };

  const printDetails = () => {
    window.print();
  };

  const COLORS = ["#0698F3", "#F8FC06", "#00D2FF", "#FF5A00"];

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#F5FAFF] flex items-center justify-center p-4 text-default font-mono text-xs">
        LOADING SECURE ADMIN SHELL...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-default p-6 relative">
      <div className="absolute inset-0 telemetry-grid opacity-[0.02] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10 flex flex-col gap-8 print:hidden">

        {/* Navigation header banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-primary/12 pb-6 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-brand-primary tracking-[0.25em] uppercase font-semibold">
              TELEMETRY_DASHBOARD_SHELL
            </span>
            <h1 className="font-display text-3xl font-black uppercase tracking-tight text-default">
              ADMIN CONTROL CENTER
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 border border-brand-primary/12 bg-white hover:border-brand-primary hover:text-brand-primary px-4 py-2 font-mono text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-sm rounded"
            >
              <HiOutlineDownload /> EXPORT EXCEL
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 border border-brand-primary/12 bg-white hover:border-brand-primary hover:text-brand-primary px-4 py-2 font-mono text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-sm rounded"
            >
              <HiOutlineDownload /> EXPORT CSV
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-red-500/25 bg-white hover:border-red-500 hover:text-red-500 px-4 py-2 font-mono text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer text-red-600 shadow-sm rounded"
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Analytics stats counters */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-5 flex flex-col gap-1 rounded-2xl shadow-sm">
            <span className="font-mono text-[9px] text-muted-default/40 uppercase tracking-wider font-semibold">TOTAL REGISTRATIONS</span>
            <div className="font-display text-3xl font-black text-default">{stats.summary.totalRegistrations}</div>
          </Card>
          <Card className="p-5 flex flex-col gap-1 rounded-2xl shadow-sm">
            <span className="font-mono text-[9px] text-muted-default/40 uppercase tracking-wider font-semibold">TOTAL REVENUE</span>
            <div className="font-display text-3xl font-black text-brand-primary">₹{stats.summary.totalRevenue}</div>
          </Card>
          <Card className="p-5 flex flex-col gap-1 rounded-2xl shadow-sm">
            <span className="font-mono text-[9px] text-muted-default/40 uppercase tracking-wider font-semibold">TODAY&apos;S REGISTRATIONS</span>
            <div className="font-display text-3xl font-black text-default">{stats.summary.todayRegistrations}</div>
          </Card>
          <Card className="p-5 flex flex-col gap-1 rounded-2xl shadow-sm">
            <span className="font-mono text-[9px] text-muted-default/40 uppercase tracking-wider font-semibold">PENDING INVOICES</span>
            <div className="font-display text-3xl font-black text-yellow-600">{stats.summary.pendingPayments}</div>
          </Card>
          <Card className="p-5 flex flex-col gap-1 col-span-2 lg:col-span-1 rounded-2xl shadow-sm">
            <span className="font-mono text-[9px] text-muted-default/40 uppercase tracking-wider font-semibold">SUCCESSFUL PAYMENTS</span>
            <div className="font-display text-3xl font-black text-green-600">{stats.summary.successfulPayments}</div>
          </Card>
        </div>

        {/* Charts Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Daily Registers Area chart */}
          <Card className="lg:col-span-8 p-6 flex flex-col gap-4 rounded-2xl shadow-sm">
            <span className="font-mono text-[9px] text-muted-default/40 uppercase tracking-widest font-semibold"> DAILY REGISTRATION TIMELINE</span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.charts.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="rgba(9, 14, 19, 0.2)" fontSize={9} fontFamily="monospace" />
                  <YAxis stroke="rgba(9, 14, 19, 0.2)" fontSize={9} fontFamily="monospace" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", borderColor: "rgba(9, 14, 19, 0.1)", fontSize: 10, fontFamily: "monospace", color: "#090E13" }} />
                  <Area type="monotone" dataKey="count" stroke="#0698F3" fillOpacity={0.12} fill="url(#colorUv)" />
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0698F3" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0698F3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Pie chart */}
          <Card className="lg:col-span-4 p-6 flex flex-col justify-between gap-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-muted-default/40 uppercase tracking-widest font-semibold">
                CATEGORIES RATIOS
              </span>
              <span className="font-mono text-[10px] text-brand-primary font-bold">
                TOTAL: {stats.charts.categories.reduce((sum: number, c: any) => sum + (c.count || 0), 0)}
              </span>
            </div>

            {stats.charts.categories.length === 0 || stats.charts.categories.reduce((sum: number, c: any) => sum + (c.count || 0), 0) === 0 ? (
              <div className="h-64 w-full flex flex-col items-center justify-center text-muted-default/60 font-mono text-xs">
                <span className="text-sm font-semibold">No registrations yet</span>
                <span className="text-[10px] text-muted-default/40 mt-1">Categories will appear as runners sign up</span>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="h-52 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const total = stats.charts.categories.reduce((sum: number, c: any) => sum + (c.count || 0), 0);
                            const percent = total > 0 ? Math.round((Number(data.value) / total) * 100) : 0;
                            return (
                              <div className="bg-white border border-[#DCE8F8] p-3 rounded-xl shadow-lg font-mono text-xs text-default z-50">
                                <div className="font-bold text-default text-xs">{data.name}</div>
                                <div className="text-muted-default text-[11px] mt-1">
                                  Registered: <span className="font-bold text-brand-primary">{data.value}</span>
                                </div>
                                <div className="text-muted-default text-[11px]">
                                  Share: <span className="font-bold text-green-600">{percent}%</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Pie
                        data={stats.charts.categories}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {stats.charts.categories.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Clean Category Legend */}
                <div className="w-full mt-2 flex flex-wrap justify-center gap-2 text-[10px] font-mono">
                  {stats.charts.categories.map((c: any, idx: number) => {
                    const total = stats.charts.categories.reduce((sum: number, item: any) => sum + (item.count || 0), 0);
                    const percent = total > 0 ? Math.round((c.count / total) * 100) : 0;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-[#F8FAFD] border border-brand-primary/10 px-2.5 py-1 rounded-lg"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-semibold text-default">{c.category}</span>
                        <span className="text-muted-default font-bold">— {c.count} ({percent}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* WhatsApp Broadcast Control Engine */}
        <Card className="p-6 flex flex-col gap-5 rounded-2xl shadow-sm border border-brand-primary/15 bg-white relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-primary/10 pb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </div>
              <div>
                <span className="font-mono text-[9px] text-brand-primary tracking-[0.2em] uppercase font-bold block">
                  COMMUNICATION_DISPATCH_ENGINE
                </span>
                <h3 className="font-display text-base font-black uppercase text-default tracking-tight">
                  WHATSAPP BROADCAST
                </h3>
              </div>
            </div>

            {/* Top Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {broadcastStats?.campaign?.failed_count && broadcastStats.campaign.failed_count > 0 ? (
                <button
                  type="button"
                  onClick={retryFailedBroadcast}
                  disabled={isRetrying || isBroadcasting}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isRetrying ? "RETRYING..." : `RETRY FAILED (${broadcastStats.campaign.failed_count})`}
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setIsBroadcastConfirmOpen(true)}
                disabled={isBroadcasting || (broadcastStats ? broadcastStats.totalRegistered === 0 : false)}
                className="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2 font-mono text-[11px] font-black uppercase tracking-wider rounded transition-colors shadow cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isBroadcasting ? (
                  <>
                    <span className="animate-spin text-sm">↻</span>
                    SENDING BROADCAST...
                  </>
                ) : (
                  <>
                    <span>SEND TO ALL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Broadcast Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#F8FAFD] border border-brand-primary/10 rounded-xl flex flex-col justify-between">
              <span className="text-[9px] text-muted-default/60 uppercase font-semibold">TOTAL REGISTERED (PAID)</span>
              <span className="text-xl font-black text-default mt-1">
                {broadcastStats ? broadcastStats.totalRegistered : stats?.summary?.totalRegistrations || 0}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFD] border border-brand-primary/10 rounded-xl flex flex-col justify-between">
              <span className="text-[9px] text-muted-default/60 uppercase font-semibold">VALID WHATSAPP NUMBERS</span>
              <span className="text-xl font-black text-green-600 mt-1">
                {broadcastStats ? broadcastStats.validWhatsAppNumbers : 0}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFD] border border-brand-primary/10 rounded-xl flex flex-col justify-between">
              <span className="text-[9px] text-muted-default/60 uppercase font-semibold">INVALID / MISSING</span>
              <span className="text-xl font-black text-yellow-600 mt-1">
                {broadcastStats ? broadcastStats.invalidOrMissingNumbers : 0}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFD] border border-brand-primary/10 rounded-xl flex flex-col justify-between">
              <span className="text-[9px] text-muted-default/60 uppercase font-semibold">LAST BROADCAST STATUS</span>
              <span className="text-xs font-bold text-brand-primary mt-1 uppercase">
                {broadcastStats?.campaign?.status === "PROCESSING"
                  ? "PROCESSING..."
                  : broadcastStats?.campaign?.status === "COMPLETED"
                    ? "COMPLETED"
                    : "IDLE"}
              </span>
            </div>
          </div>

          {/* Active Live Progress Bar Panel (Only shown while actively broadcasting) */}
          {isBroadcasting && (
            <div className="p-4 bg-[#F8FAFD] border border-brand-primary/15 rounded-xl flex flex-col gap-3 font-mono animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between text-xs font-bold">
                <span className="text-default uppercase">SENDING WHATSAPP MESSAGES...</span>
                <span className="text-brand-primary">
                  {(broadcastStats?.campaign?.sent_count || 0) + (broadcastStats?.campaign?.failed_count || 0)} / {broadcastStats?.campaign?.total_recipients || 0}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#25D366] transition-all duration-300 rounded-full"
                  style={{
                    width: `${
                      broadcastStats?.campaign?.total_recipients
                        ? Math.round(
                            (((broadcastStats.campaign.sent_count + broadcastStats.campaign.failed_count) /
                              broadcastStats.campaign.total_recipients) *
                              100)
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-[10px] text-muted-default gap-2">
                <span className="text-green-600 font-bold">SENT: {broadcastStats?.campaign?.sent_count || 0}</span>
                <span className="text-red-600 font-bold">FAILED: {broadcastStats?.campaign?.failed_count || 0}</span>
                <span className="text-yellow-600 font-bold">PENDING: {broadcastStats?.campaign?.pending_count || 0}</span>
              </div>
            </div>
          )}

          {/* Compact Notification notice */}
          {broadcastNotice && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 font-mono text-[11px] rounded-lg flex items-center justify-between shadow-sm">
              <span className="font-semibold">{broadcastNotice}</span>
              <button
                type="button"
                onClick={() => setBroadcastNotice(null)}
                className="text-xs font-bold px-2 py-0.5 hover:bg-green-100 text-green-700 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </Card>

        {/* Data Search and Table controls */}
        <Card className="p-6 flex flex-col gap-6 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-primary/12 pb-4 gap-4">
            <span className="font-mono text-[9px] text-muted-default/40 uppercase tracking-widest font-semibold"> RUNNERS_TELEMETRY_LOG</span>

            {/* Search form bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH NAME/EMAIL/PHONE/REG#"
                className="bg-white border border-[#DCE8F8] px-4 py-2 text-xs text-default placeholder-muted-default/40 focus:border-brand-primary focus:outline-none transition-colors rounded uppercase w-full font-mono"
              />
              <button type="submit" className="bg-brand-primary text-white px-4 py-2 font-mono text-xs font-black uppercase tracking-wider cursor-pointer rounded shadow">
                QUERY
              </button>
            </form>
          </div>

          {/* Filtering panels */}
          <div className="flex flex-wrap gap-4 font-mono text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-muted-default/50">CATEGORY:</span>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="bg-white border border-[#DCE8F8] px-3 py-1.5 text-default focus:border-brand-primary focus:outline-none rounded cursor-pointer uppercase"
              >
                <option value="">ALL CATEGORIES</option>
                <option value="2 KM Kids Fun Run">2 KM Kids Fun Run</option>
                <option value="2 KM Adults Fun Run">2 KM Adults Fun Run</option>
                <option value="2 KM Adult Run">2 KM Adult Run (Legacy)</option>
                <option value="2 KM Kids Run">2 KM Kids Run (Legacy)</option>
                <option value="5 KM Run">5 KM Run</option>
                <option value="10 KM Run">10 KM Run</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-default/50">PAYMENT:</span>
              <select
                value={paymentStatus}
                onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
                className="bg-white border border-[#DCE8F8] px-3 py-1.5 text-default focus:border-brand-primary focus:outline-none rounded cursor-pointer uppercase"
              >
                <option value="">ALL STATUSES</option>
                <option value="SUCCESSFUL">PAID / SUCCESSFUL</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          {/* Registrations List Grid */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left font-mono text-[11px] border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-brand-primary/12 text-muted-default/50 uppercase">
                  <th className="py-3 px-2">ORDER / REG ID</th>
                  <th className="py-3 px-2">BIB NO</th>
                  <th className="py-3 px-2">RUNNER / BIB NAME</th>
                  <th className="py-3 px-2">CATEGORY</th>
                  <th className="py-3 px-2">MOBILE</th>
                  <th className="py-3 px-2">GENDER/AGE</th>
                  <th className="py-3 px-2">PAYMENT</th>
                  <th className="py-3 px-2">WHATSAPP STATUS</th>
                  <th className="py-3 px-2 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-default/40 uppercase"> RUNNING QUERY FOR TELEMETRY...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-red-500 font-semibold uppercase"> ERROR: {error}</td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-default/40 uppercase"> NO REGISTRATIONS FOUND</td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-brand-primary/8 hover:bg-[#F8FAFD] transition-colors">
                      <td className="py-3 px-2">
                        <span className="text-brand-primary font-bold block">{reg.orderId && reg.orderId !== "N/A" ? reg.orderId : reg.registrationNumber}</span>
                        {reg.orderId && reg.orderId !== "N/A" && reg.registrationNumber && (
                          <span className="text-[9px] text-muted-default/60 block">{reg.registrationNumber}</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {reg.bibNumber ? (
                          <span className="px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded font-bold text-xs">
                            {reg.bibNumber}
                          </span>
                        ) : (
                          <span className="text-muted-default/40">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-default font-bold block">{reg.fullName.toUpperCase()}</span>
                        {reg.bibName && reg.bibName !== "N/A" && (
                          <span className="text-[9px] text-brand-primary font-semibold block">BIB: {reg.bibName.toUpperCase()}</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-default font-medium">{reg.raceCategory.toUpperCase()}</td>
                      <td className="py-3 px-2 text-muted-default">{reg.mobile}</td>
                      <td className="py-3 px-2 text-muted-default">{reg.gender.toUpperCase()} / {reg.age} YRS</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 border text-[9px] rounded font-bold ${reg.paymentStatus === "SUCCESSFUL"
                          ? "border-green-500/30 text-green-600 bg-green-50"
                          : "border-yellow-500/30 text-yellow-600 bg-yellow-50"
                          }`}>
                          {reg.paymentStatus === "SUCCESSFUL" ? "PAID" : reg.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 border text-[9px] rounded font-bold uppercase ${reg.whatsappStatus === "SENT" || reg.whatsappStatus === "ACCEPTED" || reg.whatsappSent
                          ? "border-green-500/30 text-green-600 bg-green-50"
                          : reg.whatsappStatus === "FAILED"
                            ? "border-red-500/30 text-red-600 bg-red-50"
                            : "border-gray-400/30 text-gray-600 bg-gray-50"
                          }`}>
                          {reg.whatsappStatus === "SENT" || reg.whatsappStatus === "ACCEPTED" || reg.whatsappSent ? "SENT" : reg.whatsappStatus === "FAILED" ? "FAILED" : "NOT SENT"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex justify-end gap-2 text-sm">
                          <button
                            onClick={() => fetchIndividual(reg.id)}
                            className="p-1 border border-brand-primary/12 hover:border-brand-primary hover:text-brand-primary text-muted-default hover:bg-brand-primary/5 rounded cursor-pointer"
                            title="View Metrics"
                          >
                            <HiOutlineEye />
                          </button>
                          <button
                            onClick={() => handleDelete(reg.id)}
                            className="p-1 border border-red-500/25 hover:border-red-500 hover:text-red-500 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete Node"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center font-mono text-[10px] border-t border-brand-primary/12 pt-4 mt-2">
              <span className="text-muted-default/50">PAGE {pagination.page} OF {pagination.totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="border border-brand-primary/12 bg-white hover:border-brand-primary px-3 py-1 text-default disabled:opacity-30 cursor-pointer uppercase transition-colors rounded"
                >
                  PREV
                </button>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="border border-brand-primary/12 bg-white hover:border-brand-primary px-3 py-1 text-default disabled:opacity-30 cursor-pointer uppercase transition-colors rounded"
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Details drawer overlay / modal print setup */}
      <AnimatePresence>
        {activeReg && (
          <div className="print-receipt-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="print-receipt-card max-w-2xl w-full bg-white border border-brand-primary/12 p-6 md:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl">

              {/* Dynamic HUD decorators */}
              <span className="absolute top-0 left-0 w-2.5 h-[2px] bg-brand-primary print:hidden" />
              <span className="absolute top-0 left-0 w-[2px] h-2.5 bg-brand-primary print:hidden" />

              {/* Controls bar */}
              <div className="flex justify-end gap-2 mb-6 print:hidden flex-wrap">
                <button
                  onClick={() => handleResendWhatsApp(activeReg.id)}
                  disabled={resendingWa || (activeReg.paymentStatus?.toLowerCase() !== "successful" && activeReg.paymentStatus?.toLowerCase() !== "paid")}
                  className="flex items-center gap-1 border border-green-600 bg-green-50 hover:bg-green-600 hover:text-white px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors text-green-700 shadow-sm rounded disabled:opacity-40"
                  title="Resend confirmation WhatsApp"
                >
                  {resendingWa ? "SENDING WHATSAPP..." : "RESEND WHATSAPP"}
                </button>
                <button
                  onClick={printDetails}
                  className="flex items-center gap-1.5 border border-brand-primary/12 hover:border-brand-primary hover:text-brand-primary px-3 py-1 font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors text-default bg-[#F8FAFD] shadow-sm rounded"
                >
                  <HiOutlinePrinter /> PRINT RECEIPT
                </button>
                <button
                  onClick={() => { setActiveReg(null); setResendWaMessage(null); }}
                  className="border border-brand-primary/12 hover:border-brand-primary hover:text-brand-primary px-3 py-1 font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors text-default bg-[#F8FAFD] shadow-sm rounded"
                >
                  CLOSE
                </button>
              </div>

              {resendWaMessage && (
                <div className="mb-3 p-2.5 rounded text-xs font-mono border border-green-600/20 bg-green-50 text-green-700 print:hidden">
                  {resendWaMessage}
                </div>
              )}

              {/* Printable receipt block */}
              <div className="flex flex-col gap-6 text-default">
                <div className="border-b-2 border-brand-primary/20 pb-4">
                  <span className="font-mono text-[10px] text-brand-primary tracking-[0.2em] uppercase font-bold">
                    FEEL THE BEAT RUN 2026
                  </span>
                  <h3 className="font-display text-xl font-black uppercase text-default tracking-tight mt-1">
                    RUNNER REGISTRATION RECEIPT
                  </h3>
                </div>

                <div className="print-receipt-grid grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 font-mono text-xs">
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">ORDER ID:</span>
                    <span className="text-brand-primary font-bold">{activeReg.orderId || "N/A"}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">BIB NUMBER:</span>
                    <span className="text-brand-primary font-black text-sm">{activeReg.bibNumber || "N/A"}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">REGISTRATION NO:</span>
                    <span className="text-default font-bold">{activeReg.registrationNumber}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">RACE CATEGORY:</span>
                    <span className="text-default font-bold">{activeReg.raceCategory.toUpperCase()}</span>
                  </div>
                  {activeReg.schoolName && (
                    <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                      <span className="text-muted-default/60">SCHOOL NAME:</span>
                      <span className="text-default font-bold">{activeReg.schoolName.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">RUNNER NAME:</span>
                    <span className="text-default font-bold">{activeReg.fullName.toUpperCase()}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">MOBILE NUMBER:</span>
                    <span className="text-default font-bold">{activeReg.mobile}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">EMAIL ADDRESS:</span>
                    <span className="text-default font-bold lowercase">{activeReg.email}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">DATE OF BIRTH / AGE:</span>
                    <span className="text-default font-bold">{activeReg.dob} / {activeReg.age} YRS</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">GENDER / T-SHIRT:</span>
                    <span className="text-default font-bold">{activeReg.gender.toUpperCase()} / {activeReg.tshirtSize}</span>
                  </div>
                  <div className="print-receipt-row print-receipt-col-2 flex justify-between border-b border-brand-primary/8 pb-2 col-span-1 md:col-span-2">
                    <span className="text-muted-default/60">T-SHIRT &amp; BIB VENUE:</span>
                    <span className="text-default font-bold">{activeReg.tshirtBibVenue || "N/A"} ({activeReg.tshirtBibVenueAddress || "N/A"})</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">Sree Jayam FAMILY:</span>
                    <span className="text-default font-bold">{activeReg.davFamilyMember || "N/A"}</span>
                  </div>
                  {activeReg.davFamilyMember === "Yes" ? (
                    <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                      <span className="text-muted-default/60">FAMILY ROLE:</span>
                      <span className="text-default font-bold">{activeReg.davFamilyType || "N/A"}</span>
                    </div>
                  ) : (
                    <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                      <span className="text-muted-default/60">HOW HEARD ABOUT:</span>
                      <span className="text-default font-bold">{activeReg.davHearAbout || "N/A"}</span>
                    </div>
                  )}
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">BLOOD GROUP:</span>
                    <span className="text-default font-bold">{activeReg.bloodGroup}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">MEDICAL CONDITIONS:</span>
                    <span className="text-default font-bold">{activeReg.medicalCondition.toUpperCase()}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">EMERGENCY CONTACT:</span>
                    <span className="text-default font-bold">{activeReg.emergencyContactName.toUpperCase()} ({activeReg.emergencyContactNumber})</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">NATIONALITY:</span>
                    <span className="text-default font-bold">{activeReg.nationality.toUpperCase()}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">FIRST TIME RUNNER:</span>
                    <span className="text-default font-bold">{activeReg.firstTimeRunner.toUpperCase()}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">RUNNING CLUB:</span>
                    <span className="text-default font-bold">{activeReg.runningClub.toUpperCase()}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">DISABILITY STATUS:</span>
                    <span className="text-default font-bold">{(activeReg.disabilityStatus || "NO").toUpperCase()}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">BIB NAME:</span>
                    <span className="text-default font-bold">{(activeReg.bibName || "N/A").toUpperCase()}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">PAYMENT STATUS:</span>
                    <span className="text-green-600 font-bold">{activeReg.paymentStatus}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">WHATSAPP NOTIFICATION:</span>
                    <span className={`font-bold ${activeReg.whatsappStatus === "ACCEPTED" || activeReg.whatsappStatus === "SENT" || activeReg.whatsappSent
                      ? "text-green-600"
                      : activeReg.whatsappStatus === "FAILED"
                        ? "text-red-600"
                        : "text-gray-500"
                      }`}>
                      {activeReg.whatsappStatus === "ACCEPTED"
                        ? `ACCEPTED (Delivery Pending) ${activeReg.whatsappMessageId ? `[GUID: ${activeReg.whatsappMessageId.slice(0, 16)}...]` : ""}`
                        : activeReg.whatsappStatus === "SENT" || activeReg.whatsappSent
                          ? `SENT ${activeReg.whatsappSentAt ? `(${new Date(activeReg.whatsappSentAt).toLocaleString()})` : ""}`
                          : activeReg.whatsappStatus === "FAILED"
                            ? `FAILED ${activeReg.whatsappError ? `(${activeReg.whatsappError})` : ""}`
                            : "NOT SENT"}
                    </span>
                  </div>

                  <div className="print-receipt-row print-receipt-col-2 flex justify-between border-b border-brand-primary/8 pb-2 col-span-2">
                    <span className="text-muted-default/60">RAZORPAY PAYMENT ID:</span>
                    <span className="text-default font-bold">{activeReg.razorpayPaymentId}</span>
                  </div>

                  <div className="print-receipt-row print-receipt-col-2 flex justify-between border-b border-brand-primary/8 pb-2 col-span-2">
                    <span className="text-muted-default/60">REGISTRATION DATE:</span>
                    <span className="text-default font-bold">{activeReg.createdAt}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Broadcast Confirmation Modal */}
      {isBroadcastConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-brand-primary/20 flex flex-col gap-5 relative font-mono"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center font-bold">
                  ✓
                </div>
                <h3 className="font-display text-base font-black uppercase text-default tracking-tight">
                  CONFIRM WHATSAPP BROADCAST
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastConfirmOpen(false)}
                className="text-muted-default/60 hover:text-default p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs text-muted-default leading-relaxed">
              <p className="text-default font-semibold">
                Are you sure you want to send the WhatsApp broadcast message to all registered participants?
              </p>

              <div className="bg-[#F8FAFD] border border-brand-primary/10 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex justify-between border-b border-brand-primary/8 pb-1.5">
                  <span className="text-muted-default/60 uppercase">TOTAL RECIPIENTS:</span>
                  <span className="font-black text-brand-primary">
                    {broadcastStats?.validWhatsAppNumbers || broadcastStats?.totalRegistered || 0} PARTICIPANTS
                  </span>
                </div>
                <div className="flex justify-between border-b border-brand-primary/8 pb-1.5">
                  <span className="text-muted-default/60 uppercase">CATEGORIES INCLUDED:</span>
                  <span className="font-bold text-default">2 KM, 5 KM, 10 KM</span>
                </div>
                <div className="flex justify-between border-b border-brand-primary/8 pb-1.5">
                  <span className="text-muted-default/60 uppercase">TEMPLATE:</span>
                  <span className="font-bold text-default">Bib &amp; T-Shirt Collection Info</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-default/60 uppercase">TEMPLATE ID:</span>
                  <span className="font-bold text-brand-primary">1792730</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-default/70">
                Each participant will receive their personalized Bib Number, Race Category, and Expo logistics without any placeholder tags.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBroadcastConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-default hover:bg-gray-50 rounded-lg text-xs font-bold uppercase cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={startBroadcast}
                className="flex-1 px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg text-xs font-black uppercase tracking-wider shadow cursor-pointer"
              >
                SEND TO ALL
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
