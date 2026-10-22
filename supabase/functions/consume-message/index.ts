import {
  createClient
} from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
  "Cache-Control":
    "no-store, max-age=0",
  "Pragma":
    "no-cache"
};

function jsonResponse(
  body: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
        "Cache-Control":
          "no-store, max-age=0"
      }
    }
  );
}

function isValidUUID(
  value: unknown
): value is string {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

Deno.serve(async (request) => {
  /*
   * Handle browser CORS preflight.
   */
  if (request.method === "OPTIONS") {
    return new Response(
      "ok",
      {
        status: 200,
        headers: corsHeaders
      }
    );
  }

  /*
   * Only POST is accepted.
   */
  if (request.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed."
      },
      405
    );
  }

  try {
    const body =
      await request.json();

    const messageId =
      body?.id;

    if (!isValidUUID(messageId)) {
      return jsonResponse(
        {
          error:
            "Invalid message ID."
        },
        400
      );
    }

    const supabaseUrl =
      Deno.env.get(
        "SUPABASE_URL"
      );

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      console.error(
        "Supabase server configuration is incomplete."
      );

      return jsonResponse(
        {
          error:
            "Server configuration error."
        },
        500
      );
    }

    /*
     * SERVICE ROLE KEY NEVER REACHES THE BROWSER.
     */
    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );

    /*
     * Atomic DELETE + RETURN.
     */
    const { data, error } =
      await supabase.rpc(
        "consume_message",
        {
          p_id: messageId
        }
      );

    if (error) {
      console.error(
        "Consume operation failed:",
        error.message
      );

      return jsonResponse(
        {
          error:
            "Unable to consume message."
        },
        500
      );
    }

    /*
     * No returned row means:
     *
     * - invalid/nonexistent ID
     * - expired message
     * - already consumed
     */
    if (
      !data ||
      data.length === 0
    ) {
      return jsonResponse(
        {
          error:
            "Message unavailable."
        },
        404
      );
    }

    const message =
      data[0];

    /*
     * Do NOT log message contents.
     */
    return jsonResponse(
      {
        ciphertext:
          message.ciphertext,

        iv:
          message.iv,

        expiresAt:
          message.expires_at
      },
      200
    );

  } catch (error) {
    /*
     * Never print request body or ciphertext.
     */
    console.error(
      "Unexpected consume error:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return jsonResponse(
      {
        error:
          "Unable to process request."
      },
      500
    );
  }
});