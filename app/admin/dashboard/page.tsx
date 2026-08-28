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
  timingCertificate?: string;
  paymentStatus: string;
  paymentAmount?: number;
  smsSent?: boolean;
  smsSentAt?: string | null;
  smsStatus?: string;
  smsMessageId?: string | null;
  smsError?: string | null;
  whatsappSent?: boolean;
  whatsappSentAt?: string | null;
  whatsappStatus?: string;
  whatsappMessageId?: string | null;
  whatsappError?: string | null;
  razorpayPaymentId: string;
  orderId: string;
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

  const [resendingSms, setResendingSms] = useState(false);
  const [resendSmsMessage, setResendSmsMessage] = useState<string | null>(null);
  const [resendingWa, setResendingWa] = useState(false);
  const [resendWaMessage, setResendWaMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin/login");
  };

  const handleResendSMS = async (id: string) => {
    try {
      setResendingSms(true);
      setResendSmsMessage(null);
      const token = await getAuthToken();
      const res = await fetch(`/api/admin/registration/${id}/resend-sms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setResendSmsMessage("SMS dispatched successfully!");
        if (activeReg) {
          setActiveReg({
            ...activeReg,
            smsSent: true,
            smsStatus: "SENT",
            smsSentAt: data.smsSentAt || new Date().toISOString(),
            smsMessageId: data.messageId || activeReg.smsMessageId,
            smsError: null,
          });
        }
        fetchRegistrations();
      } else {
        setResendSmsMessage(`Failed: ${data.message || "Could not send SMS"}`);
      }
    } catch (err: any) {
      setResendSmsMessage(`Error: ${err.message || "Failed to resend SMS"}`);
    } finally {
      setResendingSms(false);
    }
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
      if (res.ok) {
        setResendWaMessage("WhatsApp message dispatched successfully!");
        if (activeReg) {
          setActiveReg({
            ...activeReg,
            whatsappSent: true,
            whatsappStatus: "SENT",
            whatsappSentAt: data.whatsappSentAt || new Date().toISOString(),
            whatsappMessageId: data.messageId || activeReg.whatsappMessageId,
            whatsappError: null,
          });
        }
        fetchRegistrations();
      } else {
        setResendWaMessage(`Failed: ${data.message || "Could not send WhatsApp"}`);
      }
    } catch (err: any) {
      setResendWaMessage(`Error: ${err.message || "Failed to resend WhatsApp"}`);
    } finally {
      setResendingWa(false);
    }
  };

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Registration Number,Full Name,Email,Mobile,Category,School Name,T-Shirt Size,T-Shirt/Bib Venue,T-Shirt/Bib Address,D.A.V Member,D.A.V Role,How Heard About,Payment Status,SMS Status,WhatsApp Status,Blood Group\n";

    registrations.forEach((reg) => {
      csvContent += `"${reg.registrationNumber}","${reg.fullName}","${reg.email}","${reg.mobile}","${reg.raceCategory}","${reg.schoolName || ""}","${reg.tshirtSize}","${reg.tshirtBibVenue || ""}","${(reg.tshirtBibVenueAddress || "").replace(/\n/g, " ")}","${reg.davFamilyMember || ""}","${reg.davFamilyType || ""}","${reg.davHearAbout || ""}","${reg.paymentStatus}","${reg.smsStatus || (reg.smsSent ? "SENT" : "NOT_SENT")}","${reg.whatsappStatus || (reg.whatsappSent ? "SENT" : "NOT_SENT")}","${reg.bloodGroup}"\n`;
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
      csvContent += "Registration Number,Full Name,Email,Mobile,Category,School Name,T-Shirt Size,T-Shirt/Bib Venue,T-Shirt/Bib Address,D.A.V Member,D.A.V Role,How Heard About,Payment Status,SMS Status,WhatsApp Status,Blood Group\n";

      registrations.forEach((reg) => {
        csvContent += `"${reg.registrationNumber}","${reg.fullName}","${reg.email}","${reg.mobile}","${reg.raceCategory}","${reg.schoolName || ""}","${reg.tshirtSize}","${reg.tshirtBibVenue || ""}","${(reg.tshirtBibVenueAddress || "").replace(/\n/g, " ")}","${reg.davFamilyMember || ""}","${reg.davFamilyType || ""}","${reg.davHearAbout || ""}","${reg.paymentStatus}","${reg.smsStatus || (reg.smsSent ? "SENT" : "NOT_SENT")}","${reg.whatsappStatus || (reg.whatsappSent ? "SENT" : "NOT_SENT")}","${reg.bloodGroup}"\n`;
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
          <Card className="lg:col-span-4 p-6 flex flex-col gap-4 rounded-2xl shadow-sm">
            <span className="font-mono text-[9px] text-muted-default/40 uppercase tracking-widest font-semibold"> CATEGORIES RATIOS</span>
            <div className="h-64 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", borderColor: "rgba(9, 14, 19, 0.1)", fontSize: 10, fontFamily: "monospace", color: "#090E13" }} />
                  <Pie data={stats.charts.categories} dataKey="count" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4}>
                    {stats.charts.categories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Legend overlay overlay */}
              <div className="absolute bottom-2 flex justify-center gap-4 text-[9px] font-mono">
                {stats.charts.categories.map((c: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="w-2 h-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="uppercase text-muted-default">{c.category.split(" ")[0]} ({c.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

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
                  <th className="py-3 px-2">REG NUMBER</th>
                  <th className="py-3 px-2">RUNNER NAME</th>
                  <th className="py-3 px-2">CATEGORY</th>
                  <th className="py-3 px-2">MOBILE</th>
                  <th className="py-3 px-2">GENDER/AGE</th>
                  <th className="py-3 px-2">PAYMENT</th>
                  <th className="py-3 px-2">SMS STATUS</th>
                  <th className="py-3 px-2 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-default/40 uppercase"> RUNNING QUERY FOR TELEMETRY...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-red-500 font-semibold uppercase"> ERROR: {error}</td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-default/40 uppercase"> NO REGISTRATIONS FOUND</td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-brand-primary/8 hover:bg-[#F8FAFD] transition-colors">
                      <td className="py-3 px-2 text-brand-primary font-bold">{reg.registrationNumber}</td>
                      <td className="py-3 px-2 text-default font-bold">{reg.fullName.toUpperCase()}</td>
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
                        <span className={`px-2 py-0.5 border text-[9px] rounded font-bold uppercase ${reg.smsStatus === "SENT" || reg.smsSent
                          ? "border-green-500/30 text-green-600 bg-green-50"
                          : reg.smsStatus === "FAILED"
                            ? "border-red-500/30 text-red-600 bg-red-50"
                            : "border-gray-400/30 text-gray-600 bg-gray-50"
                          }`}>
                          {reg.smsStatus === "SENT" || reg.smsSent ? "SENT" : reg.smsStatus === "FAILED" ? "FAILED" : "NOT SENT"}
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
                  onClick={() => handleResendSMS(activeReg.id)}
                  disabled={resendingSms || activeReg.paymentStatus !== "SUCCESSFUL"}
                  className="flex items-center gap-1 border border-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors text-brand-primary shadow-sm rounded disabled:opacity-40"
                  title="Resend confirmation SMS"
                >
                  {resendingSms ? "SENDING SMS..." : "RESEND SMS"}
                </button>
                <button
                  onClick={() => handleResendWhatsApp(activeReg.id)}
                  disabled={resendingWa || activeReg.paymentStatus !== "SUCCESSFUL"}
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
                  onClick={() => { setActiveReg(null); setResendSmsMessage(null); setResendWaMessage(null); }}
                  className="border border-brand-primary/12 hover:border-brand-primary hover:text-brand-primary px-3 py-1 font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors text-default bg-[#F8FAFD] shadow-sm rounded"
                >
                  CLOSE
                </button>
              </div>

              {resendSmsMessage && (
                <div className="mb-3 p-2.5 rounded text-xs font-mono border border-brand-primary/20 bg-brand-primary/5 text-brand-primary print:hidden">
                  {resendSmsMessage}
                </div>
              )}
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
                    <span className="text-muted-default/60">REGISTRATION NO:</span>
                    <span className="text-brand-primary font-bold">{activeReg.registrationNumber}</span>
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
                    <span className="text-muted-default/60">TIMING CERTIFICATE:</span>
                    <span className="text-default font-bold">{(activeReg.timingCertificate || "NO").toUpperCase()}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">PAYMENT STATUS:</span>
                    <span className="text-green-600 font-bold">{activeReg.paymentStatus}</span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">SMS NOTIFICATION:</span>
                    <span className={`font-bold ${activeReg.smsStatus === "SENT" || activeReg.smsSent
                      ? "text-green-600"
                      : activeReg.smsStatus === "FAILED"
                        ? "text-red-600"
                        : "text-gray-500"
                      }`}>
                      {activeReg.smsStatus === "SENT" || activeReg.smsSent
                        ? `SENT ${activeReg.smsSentAt ? `(${new Date(activeReg.smsSentAt).toLocaleString()})` : ""}`
                        : activeReg.smsStatus === "FAILED"
                          ? `FAILED ${activeReg.smsError ? `(${activeReg.smsError})` : ""}`
                          : "NOT SENT"}
                    </span>
                  </div>
                  <div className="print-receipt-row flex justify-between border-b border-brand-primary/8 pb-2">
                    <span className="text-muted-default/60">WHATSAPP NOTIFICATION:</span>
                    <span className={`font-bold ${activeReg.whatsappStatus === "SENT" || activeReg.whatsappSent
                      ? "text-green-600"
                      : activeReg.whatsappStatus === "FAILED"
                        ? "text-red-600"
                        : "text-gray-500"
                      }`}>
                      {activeReg.whatsappStatus === "SENT" || activeReg.whatsappSent
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

    </div>
  );
}
