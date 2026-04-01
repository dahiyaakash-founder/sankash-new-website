import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

interface AnalysisRequest {
  lead_id: string;
  attachment_id?: string;
  file_url: string;
  file_name: string;
  audience_type?: string;
}

const EXTRACTION_PROMPT = `You are a travel itinerary/quote parser for SanKash, an Indian travel fintech company. Extract structured data from the provided document.

Return a JSON object with EXACTLY these fields (use null for genuinely unknown values — never invent data):

{
  "domestic_or_international": "domestic" | "international" | null,
  "destination_country": string | null,
  "destination_city": string | null,
  "additional_destinations": [] array of other cities/places mentioned,
  "travel_start_date": "YYYY-MM-DD" | null,
  "travel_end_date": "YYYY-MM-DD" | null,
  "duration_nights": number | null,
  "duration_days": number | null,
  "total_price": number | null,
  "price_per_person": number | null,
  "alternate_prices": [] array of other price candidates found (as numbers),
  "price_notes": string | null (e.g. "multiple prices found, chose package total"),
  "currency": "INR" | "USD" | etc,
  "traveller_count_total": number | null,
  "adults_count": number | null,
  "children_count": number | null,
  "infants_count": number | null,
  "travel_agent_name": string | null,
  "customer_name": string | null,
  "hotel_names": [] array of hotel names,
  "airline_names": [] array of airlines,
  "sectors": [] array of flight sectors like "DEL-DXB",
  "inclusions_text": string summary | null,
  "exclusions_text": string summary | null,
  "visa_mentioned": boolean,
  "insurance_mentioned": boolean,
  "parsing_confidence": "high" | "medium" | "low",
  "missing_fields": [] array of field names that could not be found,
  "extracted_snippets": [] array of key text snippets that informed the extraction (max 5, keep short),
  "confidence_notes": string | null (explain why confidence is not high, if applicable)
}

CRITICAL RULES:

Domestic vs International:
- If ALL destinations are within India, mark "domestic".
- If ANY destination is outside India, mark "international".
- Do NOT guess from weak clues like currency alone. If only a city name is visible and it could be in India or abroad, use null.

Destination handling:
- destination_city = the PRIMARY destination (where most nights are spent, or the main package focus).
- destination_country = the country of the primary destination.
- additional_destinations = all OTHER cities/places mentioned.
- Do NOT put the departure city (e.g. Delhi, Mumbai) as the primary destination unless the trip is TO that city.

Price extraction:
- total_price = the final package/total price. Look for labels like "Total", "Grand Total", "Package Cost", "Net Payable".
- price_per_person = per-person cost ONLY if explicitly stated. Do NOT compute it by dividing.
- If multiple prices exist, pick the one most likely to be the overall package total. Put others in alternate_prices.
- Strip currency symbols, commas, spaces. Keep as a plain number.
- If you cannot confidently identify which price is the total, set total_price to null and put all candidates in alternate_prices.

People count:
- Only set counts you can actually see. Do NOT assume 2 adults if not stated.
- traveller_count_total should match adults + children + infants if all are visible.
- If only "2 Pax" is visible, set traveller_count_total=2 and leave adults/children/infants as null.

Name separation:
- travel_agent_name = the company or agency that created this quote (look for letterhead, footer, "prepared by", agency branding).
- customer_name = the person the quote is addressed TO (look for "Dear", "Mr/Mrs", "Guest Name", "Traveller").
- Do NOT swap them. If you see only one name and cannot tell which role it is, put it in customer_name and note the ambiguity.

Confidence:
- "high": 4+ Ring 1 fields (destination, dates, price, traveller count) are clearly found.
- "medium": 2-3 Ring 1 fields found, or some fields are weakly inferred.
- "low": fewer than 2 Ring 1 fields, or document is unclear / partially readable.
- Always fill confidence_notes explaining what's uncertain.

Return ONLY valid JSON, no markdown fences, no explanation outside the JSON.`;

async function extractTextFromUrl(fileUrl: string, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  const isImage = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");

  if (isImage) {
    return `[IMAGE FILE: ${fileName}]`;
  }

  try {
    const resp = await fetch(fileUrl);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    const blob = await resp.arrayBuffer();
    return `[DOCUMENT FILE: ${fileName}, size: ${blob.byteLength} bytes]`;
  } catch {
    return `[COULD NOT FETCH: ${fileName}]`;
  }
}

async function analyzeWithAI(fileUrl: string, fileName: string, _rawHint: string): Promise<Record<string, unknown>> {
  const lower = fileName.toLowerCase();
  const isImage = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");

  const userContent: Array<Record<string, unknown>> = [];

  if (isImage) {
    userContent.push({
      type: "image_url",
      image_url: { url: fileUrl },
    });
    userContent.push({
      type: "text",
      text: `This is an image of a travel itinerary or quote. File name: ${fileName}. Extract all structured travel data from it following the schema exactly.`,
    });
  } else {
    userContent.push({
      type: "text",
      text: `Analyze this travel document. File name: ${fileName}. The document is accessible at: ${fileUrl}\n\nExtract all structured travel data following the schema exactly. If you cannot read the document content directly, set parsing_confidence to "low" and explain in confidence_notes.`,
    });
  }

  const response = await fetch("https://api.lovable.dev/api/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.1,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content ?? "";

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");

  return JSON.parse(jsonMatch[0]);
}

function computeCommercialFlags(parsed: Record<string, unknown>) {
  const totalPrice = parsed.total_price as number | null;
  const isInternational = parsed.domestic_or_international === "international";
  const insuranceMentioned = parsed.insurance_mentioned === true;
  const visaMentioned = parsed.visa_mentioned === true;

  // EMI: practical range ₹20k–₹20L
  const emi_candidate = totalPrice != null && totalPrice >= 20000 && totalPrice <= 2000000;

  // Insurance: international OR travel insurance/visa mentioned
  const insurance_candidate = isInternational || insuranceMentioned || (visaMentioned && isInternational);

  // PG: any meaningful price exists
  const pg_candidate = totalPrice != null && totalPrice > 0;

  return { emi_candidate, insurance_candidate, pg_candidate };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: AnalysisRequest = await req.json();
    const { lead_id, attachment_id, file_url, file_name, audience_type } = body;

    if (!lead_id || !file_url) {
      return new Response(JSON.stringify({ error: "lead_id and file_url required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Extract text hint
    const rawHint = await extractTextFromUrl(file_url, file_name);

    // Step 2: AI analysis
    const parsed = await analyzeWithAI(file_url, file_name, rawHint);

    // Step 3: Compute commercial flags
    const flags = computeCommercialFlags(parsed);

    // Step 4: Merge alternate prices and confidence notes into extracted_fields_json
    const extractedFields: Record<string, unknown> = { ...parsed };
    if (parsed.alternate_prices) {
      extractedFields.alternate_prices = parsed.alternate_prices;
    }
    if (parsed.price_notes) {
      extractedFields.price_notes = parsed.price_notes;
    }
    if (parsed.confidence_notes) {
      extractedFields.confidence_notes = parsed.confidence_notes;
    }

    // Step 5: Build record
    const record = {
      lead_id,
      attachment_id: attachment_id || null,
      uploaded_by_audience: audience_type || null,
      raw_text: rawHint.length > 50000 ? rawHint.slice(0, 50000) : rawHint,
      parsing_confidence: (parsed.parsing_confidence as string) || "low",
      domestic_or_international: (parsed.domestic_or_international as string) || null,
      destination_country: (parsed.destination_country as string) || null,
      destination_city: (parsed.destination_city as string) || null,
      travel_start_date: (parsed.travel_start_date as string) || null,
      travel_end_date: (parsed.travel_end_date as string) || null,
      duration_nights: typeof parsed.duration_nights === "number" ? parsed.duration_nights : null,
      duration_days: typeof parsed.duration_days === "number" ? parsed.duration_days : null,
      total_price: typeof parsed.total_price === "number" ? parsed.total_price : null,
      price_per_person: typeof parsed.price_per_person === "number" ? parsed.price_per_person : null,
      currency: (parsed.currency as string) || "INR",
      traveller_count_total: typeof parsed.traveller_count_total === "number" ? parsed.traveller_count_total : null,
      adults_count: typeof parsed.adults_count === "number" ? parsed.adults_count : null,
      children_count: typeof parsed.children_count === "number" ? parsed.children_count : null,
      infants_count: typeof parsed.infants_count === "number" ? parsed.infants_count : null,
      travel_agent_name: (parsed.travel_agent_name as string) || null,
      customer_name: (parsed.customer_name as string) || null,
      hotel_names_json: parsed.hotel_names || [],
      airline_names_json: parsed.airline_names || [],
      sectors_json: parsed.sectors || [],
      additional_destinations_json: parsed.additional_destinations || [],
      inclusions_text: (parsed.inclusions_text as string) || null,
      exclusions_text: (parsed.exclusions_text as string) || null,
      visa_mentioned: parsed.visa_mentioned ?? null,
      insurance_mentioned: parsed.insurance_mentioned ?? null,
      emi_candidate: flags.emi_candidate,
      insurance_candidate: flags.insurance_candidate,
      pg_candidate: flags.pg_candidate,
      missing_fields_json: parsed.missing_fields || [],
      extracted_snippets_json: parsed.extracted_snippets || [],
      extracted_fields_json: extractedFields,
    };

    // Step 6: Upsert
    const { data: existing } = await supabaseAdmin
      .from("itinerary_analysis")
      .select("id")
      .eq("lead_id", lead_id)
      .limit(1)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("itinerary_analysis")
        .update(record)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("itinerary_analysis")
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    // Step 7: Update lead with extracted commercial flags (only set, never clear)
    const leadUpdate: Record<string, unknown> = {
      emi_flag: flags.emi_candidate,
      insurance_flag: flags.insurance_candidate,
      pg_flag: flags.pg_candidate,
    };
    if (parsed.domestic_or_international) {
      leadUpdate.destination_type = parsed.domestic_or_international;
    }
    if (typeof parsed.total_price === "number" && parsed.total_price > 0) {
      leadUpdate.quote_amount = parsed.total_price;
    }

    await supabaseAdmin
      .from("leads")
      .update(leadUpdate)
      .eq("id", lead_id);

    // Step 8: Log activity
    const destLabel = parsed.destination_city || parsed.destination_country || "Unknown destination";
    const confLabel = parsed.parsing_confidence || "low";
    await supabaseAdmin.from("lead_activity").insert({
      lead_id,
      activity_type: "itinerary_analyzed",
      description: `Itinerary analyzed: ${destLabel}, confidence: ${confLabel}`,
    });

    return new Response(JSON.stringify({ success: true, analysis: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-itinerary error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
