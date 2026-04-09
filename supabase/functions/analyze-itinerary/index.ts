import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";
import {
  deriveItineraryIntelligence,
} from "../../../src/lib/itinerary-intelligence.ts";
import { normalizeItineraryExtraction } from "../../../src/lib/itinerary-postprocess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// ── Types ────────────────────────────────────────────────────────

interface FileInput {
  file_url: string;
  file_name: string;
}

interface AnalysisRequest {
  lead_id: string;
  attachment_id?: string;
  file_url?: string;
  file_name?: string;
  files?: FileInput[];
  audience_type?: string;
}

// ── Unified extraction + advisory prompt (single pass) ───────────

const EXTRACTION_PROMPT = `You are a travel itinerary/quote parser AND travel advisor for SanKash, an Indian travel fintech company. You receive one or more images/documents from a single trip. They may be screenshots from WhatsApp, OTA apps, travel agent PDFs, or mixed formats. Treat ALL inputs together as one itinerary session.

Your job is TWO-FOLD in ONE response:
1. Extract structured trip data from the documents.
2. Generate advisory intelligence that helps the traveler make a smarter booking decision.

Return a SINGLE JSON object with ALL of these fields (use null for genuinely unknown values — never invent data):

{
  "domestic_or_international": "domestic" | "international" | null,
  "destination_country": string | null,
  "destination_city": string | null,
  "additional_destinations": [],
  "travel_start_date": "YYYY-MM-DD" | null,
  "travel_end_date": "YYYY-MM-DD" | null,
  "duration_nights": number | null,
  "duration_days": number | null,
  "total_price": number | null,
  "price_per_person": number | null,
  "alternate_prices": [],
  "price_notes": string | null,
  "currency": "INR" | "USD" | etc,
  "traveller_count_total": number | null,
  "adults_count": number | null,
  "children_count": number | null,
  "infants_count": number | null,
  "travel_agent_name": string | null,
  "customer_name": string | null,
  "hotel_names": [],
  "airline_names": [],
  "sectors": [],
  "flight_departure_time": string | null,
  "flight_arrival_time": string | null,
  "hotel_check_in": "YYYY-MM-DD" | null,
  "hotel_check_out": "YYYY-MM-DD" | null,
  "inclusions_text": string summary | null,
  "exclusions_text": string summary | null,
  "visa_mentioned": boolean,
  "insurance_mentioned": boolean,
  "package_mode": "flights_and_hotels" | "land_only" | "flights_only" | "hotels_only" | "custom" | null,
  "parsing_confidence": "high" | "medium" | "low",
  "missing_fields": [],
  "extracted_snippets": [],
  "confidence_notes": string | null,
  "extraction_warnings": [],

  "advisory_summary": string — A 2-3 sentence plain-English summary of what this package is. Be specific. Example: "This looks like a 5-night land-only Manali package for 2 adults. Your travel to Chandigarh (the likely start point) may not be included in the quoted cost. The price covers hotels and sightseeing but meals appear to be partial.",

  "advisory_insights": [
    {
      "title": string (5-8 words),
      "description": string (1-2 sentences),
      "severity": "info" | "warning" | "critical",
      "category": "pricing" | "logistics" | "coverage" | "inclusions" | "timing" | "quality"
    }
  ] — 2-5 actionable insights about gaps, risks, unclear items. Examples:
    - Transport to start point may not be included
    - Meal plan looks incomplete
    - No travel insurance for international trip
    - Per-person price unclear
    - Airport transfers not mentioned

  "traveler_questions": [] — 3-6 specific questions the traveler should ask the seller before booking. Make them practical. Example:
    - "Does the ₹45,000 include travel from your city to Chandigarh?"
    - "Are all meals included or only breakfast?"
    - "Is travel insurance included? If not, what's the cost?"

  "seller_questions": [] — 2-4 questions that reveal seller quality. Example:
    - "Can you share exact hotel names and star ratings?"
    - "What is the cancellation policy?"

  "next_inputs_needed": [
    { "label": string, "reason": string, "priority": "high" | "medium" | "low" }
  ] — What additional files/info would improve the analysis. Only if genuinely needed.

  "unlockable_modules": [
    { "module_id": string, "label": string, "description": string, "available": boolean }
  ] — Relevant future value modules. module_id must be one of: "emi_estimate", "trip_budgeting", "hotel_quality", "compare_alternatives", "insurance_check", "visa_check". Max 4, only relevant ones.

  "extracted_completeness_score": number 0-100 — 90+ = strong, 60-89 = good but gaps, 30-59 = partial, <30 = very limited,

  "decision_flags": {
    "transport_missing": boolean,
    "meals_incomplete": boolean,
    "insurance_missing": boolean,
    "visa_unclear": boolean,
    "per_person_unclear": boolean,
    "dates_incomplete": boolean,
    "price_unclear": boolean
  }
}

CRITICAL RULES:

Multi-file handling:
- You may receive multiple images/documents. They ALL belong to the same trip.
- Cross-reference information across files. E.g., file 1 may show flights, file 2 may show hotels and price.
- Merge data from all files into ONE unified response. Do not return per-file results.
- If the same field appears in multiple files with different values, pick the most reliable one and note the conflict in extraction_warnings.
- If one file looks like a revised quote, final quote, or booking confirmation, prefer that value over earlier brochure or teaser details.

Domestic vs International:
- ALL destinations within India = "domestic". ANY outside = "international".

Hotels:
- hotel_names should include the exact hotel names whenever they are visible.
- Read accommodation tables, hotel sections, and named stay lines carefully before leaving hotel_names empty.
- If the document says "or similar", keep the named hotel if it is visible and mention the uncertainty in extraction_warnings.

Price extraction:
- total_price = final package/total price as a plain number.
- price_per_person = per-person cost ONLY if explicitly stated.

Date extraction:
- travel_start_date and travel_end_date should only be the actual trip dates or explicit booked departure and return dates.
- Do NOT use offer validity windows, seasonal travel ranges, or "available from / valid till / travel period" text as actual trip dates.
- If the document only shows a broad travel window and not a specific booked date, leave travel_start_date and travel_end_date as null.

People count:
- Only set counts you can actually see.

Confidence:
- "high": 4+ Ring 1 fields (destination, dates, price, traveller count) clearly found.
- "medium": 2-3 Ring 1 fields found.
- "low": fewer than 2 Ring 1 fields.

Advisory tone:
- Be helpful, not alarming. Like a knowledgeable friend.
- If the package looks good and complete, say so. Don't invent problems.
- Keep language simple, no jargon.
- Amounts should use ₹ symbol for INR.

Screenshots are NORMAL input. Extract whatever is visible. NEVER fail because input is a screenshot.

Return ONLY valid JSON, no markdown fences, no explanation outside the JSON.`;

// ── File content extraction ──────────────────────────────────────

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function extractTextFromDocx(bytes: Uint8Array): Promise<string> {
  try {
    const unzipped = unzipSync(bytes);
    const docXml = unzipped["word/document.xml"];
    if (!docXml) return "[DOCX: could not find word/document.xml]";
    const xmlText = new TextDecoder().decode(docXml);
    const paragraphs: string[] = [];
    const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
    let pMatch;
    while ((pMatch = pRegex.exec(xmlText)) !== null) {
      const pBlock = pMatch[0];
      const pTexts: string[] = [];
      const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
      let tMatch;
      while ((tMatch = tRegex.exec(pBlock)) !== null) {
        pTexts.push(tMatch[1]);
      }
      if (pTexts.length > 0) paragraphs.push(pTexts.join(""));
    }
    const extracted = paragraphs.join("\n");
    if (!extracted.trim()) return "[DOCX: no readable text found]";
    return extracted.length > 40000 ? extracted.slice(0, 40000) + "\n[...truncated]" : extracted;
  } catch (err) {
    return `[DOCX extraction failed: ${(err as Error).message}]`;
  }
}

interface FileContent {
  rawText: string;
  fileBytes: Uint8Array | null;
  mimeType: string | null;
  fileName: string;
}

function getFileType(fileName: string): "image" | "pdf" | "docx" | "text" {
  const lower = fileName.toLowerCase();
  if (/\.(jpg|jpeg|png|webp)$/.test(lower)) return "image";
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  return "text";
}

async function fetchFileContent(fileUrl: string, fileName: string): Promise<FileContent> {
  const fileType = getFileType(fileName);
  try {
    const resp = await fetch(fileUrl);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    const arrayBuf = await resp.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuf);

    if (fileType === "image") {
      return { rawText: `[IMAGE: ${fileName}]`, fileBytes, mimeType: "image", fileName };
    }
    if (fileType === "pdf") {
      return { rawText: `[PDF: ${fileName}, ${fileBytes.length} bytes]`, fileBytes, mimeType: "application/pdf", fileName };
    }
    if (fileType === "docx") {
      const text = await extractTextFromDocx(fileBytes);
      return { rawText: text, fileBytes: null, mimeType: "text", fileName };
    }
    const textContent = new TextDecoder().decode(fileBytes);
    return { rawText: textContent.slice(0, 40000), fileBytes: null, mimeType: "text", fileName };
  } catch (err) {
    return { rawText: `[COULD NOT FETCH: ${fileName}: ${(err as Error).message}]`, fileBytes: null, mimeType: null, fileName };
  }
}

// ── AI analysis (single unified pass: extraction + advisory) ─────

function buildImageUrlContent(fileUrl: string, fileBytes: Uint8Array, mimeType: string): Record<string, unknown> {
  if (mimeType === "image") {
    return { type: "image_url", image_url: { url: fileUrl } };
  }
  const base64 = uint8ToBase64(fileBytes);
  return { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } };
}

async function analyzeWithAI(files: { content: FileContent; fileUrl: string }[]): Promise<Record<string, unknown>> {
  const userContent: Array<Record<string, unknown>> = [];

  for (let i = 0; i < files.length; i++) {
    const { content, fileUrl } = files[i];
    const label = `File ${i + 1}: ${content.fileName}`;

    if (content.mimeType === "image" && content.fileBytes) {
      userContent.push(buildImageUrlContent(fileUrl, content.fileBytes, "image"));
      userContent.push({ type: "text", text: `${label} — screenshot/image of travel document. Extract all visible travel data.` });
    } else if (content.mimeType === "application/pdf" && content.fileBytes) {
      userContent.push(buildImageUrlContent(fileUrl, content.fileBytes, "application/pdf"));
      userContent.push({ type: "text", text: `${label} — PDF travel document. Extract all structured travel data including tables, pricing, and flight details.` });
    } else {
      const preview = content.rawText.length > 30000 ? content.rawText.slice(0, 30000) + "\n[...truncated]" : content.rawText;
      userContent.push({ type: "text", text: `${label}:\n--- CONTENT START ---\n${preview}\n--- CONTENT END ---` });
    }
  }

  userContent.push({
    type: "text",
    text: `You have received ${files.length} file(s) for ONE trip. Extract all data AND generate advisory intelligence in a single JSON response. Return ONLY valid JSON.`,
  });

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
      temperature: 0.15,
      max_tokens: 6000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");
  return JSON.parse(jsonMatch[0]);
}

// ── Currency conversion ──────────────────────────────────────────

const INR_RATES: Record<string, number> = {
  INR: 1, USD: 83, EUR: 90, GBP: 105, AED: 23, SGD: 62, AUD: 55,
  NZD: 50, THB: 2.4, MYR: 18, LKR: 0.26, JPY: 0.56, CAD: 62, CHF: 93,
};

function convertToINR(amount: number, currency: string): { inrAmount: number; rate: number } | null {
  const rate = INR_RATES[currency.toUpperCase()];
  if (!rate) return null;
  return { inrAmount: Math.round(amount * rate), rate };
}

// ── Commercial flags ─────────────────────────────────────────────

function computeCommercialFlags(parsed: Record<string, unknown>) {
  let totalPrice = typeof parsed.total_price === "number" ? parsed.total_price : null;
  const pricePerPerson = typeof parsed.price_per_person === "number" ? parsed.price_per_person : null;
  const paxCount = typeof parsed.traveller_count_total === "number" ? parsed.traveller_count_total : null;

  if (totalPrice == null && pricePerPerson != null && paxCount != null && paxCount > 0) {
    totalPrice = pricePerPerson * paxCount;
    parsed.total_price = totalPrice;
    parsed.price_notes = ((parsed.price_notes as string) || "") +
      ` [Auto-computed: ${pricePerPerson} × ${paxCount} pax = ${totalPrice}]`;
  }

  const currency = ((parsed.currency as string) || "INR").toUpperCase();
  const isInternational = parsed.domestic_or_international === "international";
  const insuranceMentioned = parsed.insurance_mentioned === true;
  const visaMentioned = parsed.visa_mentioned === true;

  let emiCheckAmount = totalPrice;
  if (totalPrice != null && currency !== "INR") {
    const conversion = convertToINR(totalPrice, currency);
    if (conversion) {
      emiCheckAmount = conversion.inrAmount;
    } else {
      emiCheckAmount = null;
    }
  }

  return {
    emi_candidate: emiCheckAmount != null && emiCheckAmount >= 20000 && emiCheckAmount <= 2000000,
    insurance_candidate: isInternational || insuranceMentioned || (visaMentioned && isInternational),
    pg_candidate: totalPrice != null && totalPrice > 0,
  };
}

// ── Main handler ─────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: AnalysisRequest = await req.json();
    const { lead_id, attachment_id, audience_type } = body;

    let fileInputs: FileInput[] = [];
    if (body.files && body.files.length > 0) {
      fileInputs = body.files.slice(0, 5);
    } else if (body.file_url && body.file_name) {
      fileInputs = [{ file_url: body.file_url, file_name: body.file_name }];
    }

    if (!lead_id || fileInputs.length === 0) {
      return new Response(JSON.stringify({ error: "lead_id and at least one file required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Fetch all files
    console.log(`Processing ${fileInputs.length} file(s) for lead: ${lead_id}`);
    const fileContents = await Promise.all(
      fileInputs.map(f => fetchFileContent(f.file_url, f.file_name).then(content => ({ content, fileUrl: f.file_url })))
    );

    // Step 2: Single unified AI analysis
    const rawParsed = await analyzeWithAI(fileContents);
    console.log(`AI extraction complete. Confidence: ${rawParsed.parsing_confidence}`);

    // Step 3: Combine raw text from all files
    const combinedRawText = fileContents.map((f, i) =>
      `--- File ${i + 1}: ${f.content.fileName} ---\n${f.content.rawText}`
    ).join("\n\n");

    const parsed = normalizeItineraryExtraction(rawParsed, combinedRawText, new Date());

    // Step 4: Commercial flags
    const flags = computeCommercialFlags(parsed as Record<string, unknown>);

    // Step 5: Build record
    const record = {
      lead_id,
      attachment_id: attachment_id || null,
      uploaded_by_audience: audience_type || null,
      raw_text: combinedRawText.length > 50000 ? combinedRawText.slice(0, 50000) : combinedRawText,
      file_count: fileInputs.length,
      file_names_json: fileInputs.map(f => f.file_name),
      // Extraction fields
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
      flight_departure_time: (parsed.flight_departure_time as string) || null,
      flight_arrival_time: (parsed.flight_arrival_time as string) || null,
      hotel_check_in: (parsed.hotel_check_in as string) || null,
      hotel_check_out: (parsed.hotel_check_out as string) || null,
      confidence_notes: (parsed.confidence_notes as string) || null,
      package_mode: (parsed.package_mode as string) || null,
      // Commercial flags
      emi_candidate: flags.emi_candidate,
      insurance_candidate: flags.insurance_candidate,
      pg_candidate: flags.pg_candidate,
      // Raw extraction archive
      missing_fields_json: parsed.missing_fields || [],
      extracted_snippets_json: parsed.extracted_snippets || [],
      extraction_warnings_json: parsed.extraction_warnings || [],
      extracted_fields_json: { ...parsed },
      // Advisory intelligence (from same single AI pass — stored durably)
      advisory_summary: (parsed.advisory_summary as string) || null,
      advisory_insights_json: parsed.advisory_insights || [],
      traveler_questions_json: parsed.traveler_questions || [],
      seller_questions_json: parsed.seller_questions || [],
      next_inputs_needed_json: parsed.next_inputs_needed || [],
      unlockable_modules_json: parsed.unlockable_modules || [],
      extracted_completeness_score: typeof parsed.extracted_completeness_score === "number" ? parsed.extracted_completeness_score : 0,
      decision_flags_json: parsed.decision_flags || {},
      enrichment_status_json: { extraction: "complete", advisory: parsed.advisory_summary ? "complete" : "partial" },
    };

    const intelligence = deriveItineraryIntelligence({
      domestic_or_international: record.domestic_or_international,
      destination_country: record.destination_country,
      destination_city: record.destination_city,
      additional_destinations_json: record.additional_destinations_json,
      travel_start_date: record.travel_start_date,
      travel_end_date: record.travel_end_date,
      duration_nights: record.duration_nights,
      duration_days: record.duration_days,
      total_price: record.total_price,
      price_per_person: record.price_per_person,
      currency: record.currency,
      traveller_count_total: record.traveller_count_total,
      adults_count: record.adults_count,
      children_count: record.children_count,
      infants_count: record.infants_count,
      hotel_names_json: record.hotel_names_json,
      airline_names_json: record.airline_names_json,
      sectors_json: record.sectors_json,
      inclusions_text: record.inclusions_text,
      exclusions_text: record.exclusions_text,
      visa_mentioned: record.visa_mentioned,
      insurance_mentioned: record.insurance_mentioned,
      flight_departure_time: record.flight_departure_time,
      flight_arrival_time: record.flight_arrival_time,
      hotel_check_in: record.hotel_check_in,
      hotel_check_out: record.hotel_check_out,
      parsing_confidence: record.parsing_confidence,
      missing_fields_json: record.missing_fields_json,
      extraction_warnings_json: record.extraction_warnings_json,
    });

    Object.assign(record, intelligence);

    // Step 6: Upsert
    const { data: existing } = await supabaseAdmin
      .from("itinerary_analysis")
      .select("id")
      .eq("lead_id", lead_id)
      .limit(1)
      .maybeSingle();

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

    // Step 7: Update lead with extracted commercial flags
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
    await supabaseAdmin.from("leads").update(leadUpdate).eq("id", lead_id);

    // Step 8: Log activity
    const destLabel = parsed.destination_city || parsed.destination_country || "Unknown destination";
    const confLabel = parsed.parsing_confidence || "low";
    const fileCount = fileInputs.length;
    await supabaseAdmin.from("lead_activity").insert({
      lead_id,
      activity_type: "itinerary_analyzed",
      description: `Itinerary analyzed (${fileCount} file${fileCount > 1 ? "s" : ""}): ${destLabel}, confidence: ${confLabel}, completeness: ${record.extracted_completeness_score}%`,
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
