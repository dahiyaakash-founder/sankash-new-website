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

const EXTRACTION_PROMPT = `You are a travel itinerary/quote parser for SanKash, a travel fintech company. Extract structured data from the provided document text.

Return a JSON object with EXACTLY these fields (use null for unknown):

{
  "domestic_or_international": "domestic" or "international" or null,
  "destination_country": string or null,
  "destination_city": string or null,
  "additional_destinations": [] array of other cities/places mentioned,
  "travel_start_date": "YYYY-MM-DD" or null,
  "travel_end_date": "YYYY-MM-DD" or null,
  "duration_nights": number or null,
  "duration_days": number or null,
  "total_price": number (in original currency, no commas) or null,
  "price_per_person": number or null,
  "currency": "INR" or "USD" etc,
  "traveller_count_total": number or null,
  "adults_count": number or null,
  "children_count": number or null,
  "infants_count": number or null,
  "travel_agent_name": string or null,
  "customer_name": string or null,
  "hotel_names": [] array of hotel names,
  "airline_names": [] array of airlines,
  "sectors": [] array of flight sectors like "DEL-DXB",
  "inclusions_text": string summary or null,
  "exclusions_text": string summary or null,
  "visa_mentioned": boolean,
  "insurance_mentioned": boolean,
  "parsing_confidence": "high" or "medium" or "low",
  "missing_fields": [] array of field names that could not be found,
  "extracted_snippets": [] array of key text snippets that informed the extraction (max 5, keep short)
}

Rules:
- If India-only destinations, mark domestic. If any foreign country, mark international.
- For prices, strip currency symbols and commas. Keep the number only.
- If multiple prices exist, pick the most likely total package price.
- Do not invent data. Use null for genuinely missing fields.
- parsing_confidence: high if 4+ Ring 1 fields found, medium if 2-3, low if fewer.
- Return ONLY valid JSON, no markdown, no explanation.`;

async function extractTextFromUrl(fileUrl: string, fileName: string): Promise<string> {
  // For PDFs and documents, we fetch the file and send to AI as-is
  // For images, we'll use the AI model's vision capability
  const lower = fileName.toLowerCase();
  const isImage = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
  
  if (isImage) {
    return `[IMAGE FILE: ${fileName}]`;
  }
  
  // For text-parseable files, try to fetch raw content
  try {
    const resp = await fetch(fileUrl);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    const blob = await resp.arrayBuffer();
    // For PDFs/docs, we'll pass the URL to the AI model
    return `[DOCUMENT FILE: ${fileName}, size: ${blob.byteLength} bytes]`;
  } catch {
    return `[COULD NOT FETCH: ${fileName}]`;
  }
}

async function analyzeWithAI(fileUrl: string, fileName: string, rawHint: string): Promise<Record<string, unknown>> {
  const lower = fileName.toLowerCase();
  const isImage = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");

  // Build message content - use image_url for images, text+URL hint for documents
  const userContent: Array<Record<string, unknown>> = [];
  
  if (isImage) {
    userContent.push({
      type: "image_url",
      image_url: { url: fileUrl },
    });
    userContent.push({
      type: "text",
      text: `This is an image of a travel itinerary or quote. File name: ${fileName}. Extract all structured travel data from it.`,
    });
  } else {
    userContent.push({
      type: "text",
      text: `Analyze this travel document. File name: ${fileName}. The document is accessible at: ${fileUrl}\n\nExtract all structured travel data. If you cannot read the document content directly, infer what you can from the filename and any available context, and set parsing_confidence to "low".`,
    });
  }

  const response = await fetch("https://lovable.dev/api/v2/chat/completions", {
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
      max_tokens: 2000,
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
  
  return {
    emi_candidate: totalPrice != null && totalPrice >= 20000 && totalPrice <= 2000000,
    insurance_candidate: isInternational || insuranceMentioned,
    pg_candidate: totalPrice != null && totalPrice > 0,
  };
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

    // Step 4: Build record
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
      duration_nights: (parsed.duration_nights as number) || null,
      duration_days: (parsed.duration_days as number) || null,
      total_price: (parsed.total_price as number) || null,
      price_per_person: (parsed.price_per_person as number) || null,
      currency: (parsed.currency as string) || "INR",
      traveller_count_total: (parsed.traveller_count_total as number) || null,
      adults_count: (parsed.adults_count as number) || null,
      children_count: (parsed.children_count as number) || null,
      infants_count: (parsed.infants_count as number) || null,
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
      extracted_fields_json: parsed,
    };

    // Step 5: Upsert — check if analysis already exists for this lead
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

    // Step 6: Update lead with extracted commercial flags
    await supabaseAdmin
      .from("leads")
      .update({
        emi_flag: flags.emi_candidate,
        insurance_flag: flags.insurance_candidate,
        pg_flag: flags.pg_candidate,
        destination_type: (parsed.domestic_or_international as string) || undefined,
        quote_amount: (parsed.total_price as number) || undefined,
      })
      .eq("id", lead_id);

    // Step 7: Log activity
    await supabaseAdmin.from("lead_activity").insert({
      lead_id,
      activity_type: "itinerary_analyzed",
      description: `Itinerary analyzed: ${parsed.destination_city || "Unknown destination"}, confidence: ${parsed.parsing_confidence || "low"}`,
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
