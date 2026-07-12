"use client";

import { useState, useEffect } from "react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-200 bg-white p-4 shadow-lg sm:left-auto sm:right-4 sm:bottom-4 sm:w-96 sm:rounded-2xl sm:border">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-800">Cookie Consent</h3>
          <p className="mt-1 text-sm text-neutral-600">
            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Accept", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="flex-1 rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
          >
            Reject
          </button>
        </div>
        <a
          href="/privacy"
          className="block text-center text-xs text-neutral-500 hover:text-orange-500"
        >
          Learn more about our cookie policy
        </a>
      </div>
    </div>
  );
}


