"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        setError(authError.message || "Invalid credentials.");
      } else {
        if (data?.session) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; Secure`;
        }
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFF] flex items-center justify-center p-4 text-brand-text relative">
      <div className="absolute inset-0 telemetry-grid opacity-[0.03] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <Card className="p-8 border border-brand-primary/12 bg-white flex flex-col gap-6 relative shadow-md rounded-2xl">

          {/* Futuristic corners notches */}
          <span className="absolute top-0 left-0 w-2.5 h-[2px] bg-brand-primary" />
          <span className="absolute top-0 left-0 w-[2px] h-2.5 bg-brand-primary" />
          <span className="absolute bottom-0 right-0 w-2.5 h-[2px] bg-brand-primary" />
          <span className="absolute bottom-0 right-0 w-[2px] h-2.5 bg-brand-primary" />

          {/* Heading */}
          <div className="text-center flex flex-col gap-1.5 border-b border-brand-primary/12 pb-5">
            <span className="font-mono text-[9px] text-brand-primary tracking-[0.25em] uppercase font-bold">
              SUPABASE_AUTH_GATE
            </span>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-brand-text">
              ADMINISTRATOR LOGIN
            </h2>
          </div>

          {error && (
            <div className="border border-red-500/25 bg-red-50 p-3 font-mono text-[10px] text-red-600 text-center uppercase tracking-wider rounded">
              ERROR: {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 font-mono">
              <label className="text-[9px] text-brand-muted uppercase tracking-wider font-semibold">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ADMIN@FEELTHEBEATRUN.COM"
                className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-brand-text placeholder-brand-muted/40 focus:border-brand-primary focus:outline-none transition-colors rounded uppercase"
              />
            </div>

            <div className="flex flex-col gap-1 font-mono">
              <label className="text-[9px] text-brand-muted uppercase tracking-wider font-semibold">PASSWORD</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-[#DCE8F8] px-4 py-2.5 text-xs text-brand-text placeholder-brand-muted/40 focus:border-brand-primary focus:outline-none transition-colors rounded"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-4 text-xs font-black tracking-widest mt-2 shadow-sm" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "LOGIN TO DASHBOARD"}
            </Button>
          </form>

          <div className="text-center font-mono text-[9px] text-brand-muted/30">
            SECURE ACCESS  AUDITED VIA SUPABASE AUTH
          </div>
        </Card>
      </div>
    </div>
  );
}
