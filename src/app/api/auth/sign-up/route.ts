import { NextResponse } from "next/server";

const OKTA_ISSUER = process.env.OKTA_ISSUER ?? "";
const OKTA_API_TOKEN = process.env.OKTA_API_TOKEN ?? "";

function getOktaOrgUrl() {
  if (!OKTA_ISSUER) {
    return null;
  }
  try {
    const issuerUrl = new URL(OKTA_ISSUER);
    // If issuer includes /oauth2/..., trim it to the origin
    if (issuerUrl.pathname.includes("/oauth2")) {
      issuerUrl.pathname = "";
    }
    return issuerUrl.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!OKTA_API_TOKEN) {
    return NextResponse.json(
      { error: "Okta API token is not configured. Set OKTA_API_TOKEN in your environment." },
      { status: 500 },
    );
  }

  const oktaOrgUrl = getOktaOrgUrl();
  if (!oktaOrgUrl) {
    return NextResponse.json(
      { error: "Unable to derive Okta domain from OKTA_ISSUER. Check your configuration." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
    };

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const response = await fetch(`${oktaOrgUrl}/api/v1/users?activate=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `SSWS ${OKTA_API_TOKEN}`,
      },
      body: JSON.stringify({
        profile: {
          firstName,
          lastName,
          email,
          login: email,
        },
        credentials: {
          password: {
            value: password,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const errorSummary =
        errorPayload?.errorCauses?.[0]?.errorSummary ?? errorPayload?.errorSummary ?? "Failed to create Okta user.";
      return NextResponse.json({ error: errorSummary }, { status: response.status });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to create Okta user", error);
    return NextResponse.json({ error: "Unexpected error while creating user." }, { status: 500 });
  }
}

