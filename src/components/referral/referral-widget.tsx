"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function ReferralWidget() {
  const { data: session } = useSession();
  const [code, setCode] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchReferralCode();
    }
  }, [session]);

  const fetchReferralCode = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/referrals/generate", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setCode(data.code);
        setUrl(data.url);
      }
    } catch (error) {
      console.error("Failed to fetch referral code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <h3 className="mb-2 text-lg font-semibold text-gray-800">Refer Friends, Earn Rewards</h3>
      <p className="mb-4 text-sm text-neutral-600">
        Share your referral code and earn loyalty points when friends make their first purchase!
      </p>
      
      {loading ? (
        <div className="animate-pulse text-sm text-neutral-600">Loading...</div>
      ) : code ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-orange-200 bg-white p-3">
            <p className="mb-1 text-xs font-medium text-neutral-500">Your Referral Code</p>
            <p className="font-mono text-lg font-bold text-orange-600">{code}</p>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={url || ""}
              readOnly
              className="flex-1 rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm"
            />
            <button
              onClick={handleCopy}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={fetchReferralCode}
          className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Generate Referral Code
        </button>
      )}
    </div>
  );
}


