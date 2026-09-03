export const FB_PIXEL_ID = "2073402470047770";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

// Helper to track standard or custom Meta Pixel events
export const event = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", name, options);
  }
};
