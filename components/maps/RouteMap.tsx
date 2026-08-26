"use client";

import dynamic from "next/dynamic";

const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex flex-col items-center justify-center bg-[#111111] rounded-[20px] border border-white/8 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
      <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      <span className="mt-3 font-mono text-[10px] text-muted-white uppercase tracking-widest">
        LOADING MAP MODULE...
      </span>
    </div>
  ),
});

export default function RouteMap({ routeType }: { routeType: "2km" | "5km" | "10km" }) {
  return <LeafletMapInner routeType={routeType} />;
}
