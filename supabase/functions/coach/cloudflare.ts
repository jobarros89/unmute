type Credentials = { accountId: string; token: string };
export async function runCloudflare(
  credentials: Credentials,
  model: string,
  body: unknown,
  request: typeof fetch = fetch,
): Promise<Record<string, unknown>> {
  if (!/^[a-f0-9]{32}$/i.test(credentials.accountId) || !credentials.token)
    throw new Error("configuration");
  const response = await request(
    `https://api.cloudflare.com/client/v4/accounts/${credentials.accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(55000),
    },
  );
  if (!response.ok) throw new Error(`provider_${response.status}`);
  const envelope = await response.json();
  if (
    envelope.success !== true ||
    !envelope.result ||
    typeof envelope.result !== "object"
  )
    throw new Error("provider_invalid_response");
  return envelope.result;
}
export function encodeAudio(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
export function readFeedback(value: unknown): Record<string, unknown> {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("provider_invalid_feedback");
  return parsed;
}
