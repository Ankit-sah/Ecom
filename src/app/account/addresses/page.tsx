import { redirect } from "next/navigation";
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { getCurrentSession } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { saveAddress, deleteAddress } from "@/lib/customer-actions";

const fields = [
  ["fullName", "Full name"],
  ["phone", "Phone"],
  ["addressLine1", "Street address"],
  ["addressLine2", "Apartment / suite"],
  ["city", "City"],
  ["state", "Province / state"],
  ["postalCode", "Postal code"],
  ["country", "Country code"],
] as const;

export default async function AddressesPage() {
  const session = await getCurrentSession();
  if (!session?.user?.id) redirect("/auth/sign-in?callbackUrl=/account/addresses");
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id, saved: true },
    orderBy: { createdAt: "desc" },
  });

  function addressForm(address?: (typeof addresses)[number]) {
    return (
      <ActionForm
        action={saveAddress}
        resetOnSuccess={!address}
        className="grid gap-3 sm:grid-cols-2"
      >
        <input type="hidden" name="id" value={address?.id ?? ""} />
        <label>
          Label
          <input
            className="block w-full rounded border p-2"
            name="label"
            maxLength={80}
            defaultValue={address?.label ?? ""}
          />
        </label>
        {fields.map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              className="block w-full rounded border p-2"
              name={key}
              type={key === "phone" ? "tel" : "text"}
              required={!["addressLine2", "state"].includes(key)}
              maxLength={key === "country" ? 2 : key === "phone" ? 24 : 200}
              defaultValue={address ? address[key] ?? "" : key === "country" ? "NP" : ""}
            />
          </label>
        ))}
        <button className="rounded bg-[#31554d] p-3 text-white disabled:opacity-60">
          Save address
        </button>
      </ActionForm>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-16">
      <Link href="/account">← Account</Link>
      <h1 className="text-3xl font-semibold">Saved addresses</h1>
      <p>Choose an address at checkout. Your order keeps a separate delivery snapshot.</p>
      {addresses.map((address) => (
        <section key={address.id} className="rounded-2xl border bg-white p-6">
          {addressForm(address)}
          <ActionForm action={deleteAddress.bind(null, address.id)}>
            <button className="mt-4 text-red-700 disabled:opacity-60">Delete address</button>
          </ActionForm>
        </section>
      ))}
      <section className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-xl">Add an address</h2>
        {addressForm()}
      </section>
    </div>
  );
}
