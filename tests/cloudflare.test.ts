import test from "node:test";
import assert from "node:assert/strict";
import {
  runCloudflare,
  encodeAudio,
  readFeedback,
} from "../supabase/functions/coach/cloudflare.ts";
const credentials = { accountId: "a".repeat(32), token: "test-only" };
test("Cloudflare envelope and structured output preserve provider feedback", async () => {
  const request: typeof fetch = async (url, init) => {
    assert.match(String(url), /accounts\/a{32}\/ai\/run\/@cf\/meta\//);
    assert.equal(
      new Headers(init?.headers).get("Authorization"),
      "Bearer test-only",
    );
    return Response.json({
      success: true,
      result: { response: { corrected: "I work here." } },
    });
  };
  const result = await runCloudflare(
    credentials,
    "@cf/meta/test",
    { messages: [] },
    request,
  );
  assert.deepEqual(readFeedback(result.response), {
    corrected: "I work here.",
  });
  assert.deepEqual(readFeedback('{"corrected":"Hello"}'), {
    corrected: "Hello",
  });
  assert.throws(() => readFeedback([]));
});
test("Provider failure never becomes a successful correction", async () => {
  for (const response of [
    new Response("private detail", { status: 429 }),
    Response.json({ success: false, errors: [{ message: "private detail" }] }),
  ]) {
    await assert.rejects(
      runCloudflare(credentials, "@cf/meta/test", {}, async () => response),
      /^Error: provider_(429|invalid_response)$/,
    );
  }
});
test("Audio encoding preserves bytes across chunks", () => {
  const bytes = Uint8Array.from({ length: 20000 }, (_, i) => i % 256);
  assert.deepEqual(
    new Uint8Array(Buffer.from(encodeAudio(bytes), "base64")),
    bytes,
  );
});
