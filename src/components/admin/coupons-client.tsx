"use client";

import { useState } from "react";
import { format } from "date-fns";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  userLimit: number | null;
  validFrom: Date | string;
  validUntil: Date | string;
  active: boolean;
  createdAt: Date | string;
  _count: {
    redemptions: number;
  };
};

type CouponsClientProps = {
  initialCoupons: Coupon[];
};

export function CouponsClient({ initialCoupons }: CouponsClientProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED" | "FREE_SHIPPING",
    value: 10,
    minPurchase: 0,
    maxDiscount: null as number | null,
    usageLimit: null as number | null,
    userLimit: 1,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCoupon = await response.json();
        setCoupons([newCoupon, ...coupons]);
        setShowForm(false);
        setFormData({
          code: "",
          description: "",
          type: "PERCENTAGE",
          value: 10,
          minPurchase: 0,
          maxDiscount: null,
          usageLimit: null,
          userLimit: 1,
          validFrom: new Date().toISOString().split("T")[0],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          active: true,
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create coupon");
      }
    } catch (error) {
      console.error("Failed to create coupon:", error);
      alert("Failed to create coupon");
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowForm(!showForm)}
        className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        {showForm ? "Cancel" : "Create Coupon"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-orange-200 bg-white/85 p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Create New Coupon</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2"
                placeholder="SAVE20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {formData.type === "PERCENTAGE" ? "Percentage (0-100)" : "Amount (cents)"} *
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                required
                min={0}
                max={formData.type === "PERCENTAGE" ? 100 : undefined}
                className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Purchase (cents)</label>
              <input
                type="number"
                value={formData.minPurchase || 0}
                onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) || 0 })}
                min={0}
                className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valid From *</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valid Until *</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Create Coupon
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-orange-200 px-6 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-orange-200 bg-white/85">
        <table className="w-full">
          <thead className="border-b border-orange-200 bg-orange-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Value</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Used</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Valid Until</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-orange-200/50">
                <td className="px-4 py-3 font-mono text-sm font-semibold">{coupon.code}</td>
                <td className="px-4 py-3 text-sm text-neutral-600">{coupon.type}</td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {coupon.type === "PERCENTAGE"
                    ? `${coupon.value}%`
                    : coupon.type === "FIXED"
                      ? `$${(coupon.value / 100).toFixed(2)}`
                      : "Free Shipping"}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {coupon.usedCount} / {coupon.usageLimit || "∞"}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {format(new Date(coupon.validUntil), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      coupon.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


