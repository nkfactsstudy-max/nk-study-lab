// NK Study Lab AI — Cloudflare Worker (proxy to Gemini).
// The API key is stored as a Worker secret named GEMINI_API_KEY (never in this file).

const MODEL = "gemini-2.5-flash";   // change here if Google renames/retires the model
const ALLOWED_ORIGINS = [
  "https://nkfactsstudy-max.github.io"
  // add your own domain here later, e.g. "https://nkstudylab.in"
];
const MAX_MESSAGES = 8;        // last N chat messages sent to the model
const MAX_CHARS = 600;         // max length of one user message
const PER_IP_PER_MIN = 6;      // best-effort limit (resets when the worker restarts)

const PAGES = [["Basic.html", "Daily Use Sentences (Basics)"], ["Grammar.html", "English Grammar"], ["Intro p.html", "परिचय - पार्ट्स ऑफ़ स्पीच"], ["Spoken english.html", "Spoken English Course"], ["advanced-spoken-1.html", "Advanced Spoken English"], ["articles-a-an.html", "Indefinite Article (A / An)"], ["articles-the.html", "Definite Article (The)"], ["articles-zero.html", "Zero Article (Omission)"], ["articles.html", "Articles (A, An, The)"], ["coding.html", "Coding क्या है?"], ["computer-science.html", "Computer Science"], ["english.html", "Spoken English"], ["gyan.html", "Gyan"], ["math.html", "Math All Formulas"], ["narration-direct.html", "Direct Speech"], ["narration-indirect.html", "Indirect Speech"], ["narration.html", "Direct & Indirect Speech (Narration)"], ["p of s.html", "Parts of Speech"], ["pos-adjective.html", "एडजेक्टिव (Adjective) - विशेषण"], ["pos-adverb.html", "एडवर्ब (Adverb) - क्रिया विशेषण"], ["pos-conjunction.html", "कंजंक्शन (Conjunction) - समुच्चयबोधक"], ["pos-interjection.html", "इंटेरजेक्शन (Interjection) - विस्मयादिबोधक"], ["pos-noun.html", "नाउन (Noun) - संज्ञा"], ["pos-preposition.html", "प्रीपोजिशन (Preposition) - संबंध सूचक"], ["pos-pronoun.html", "प्रोनाउन (Pronoun) - सर्वनाम"], ["pos-verb.html", "वर्ब (Verb) - क्रिया"], ["python.html", "Python"], ["science.html", "Science"], ["tense-future-continuous.html", "Future Continuous Tense"], ["tense-future-indefinite.html", "Future Indefinite Tense"], ["tense-future-perfect-continuous.html", "Future Perfect Continuous Tense"], ["tense-future-perfect.html", "Future Perfect Tense"], ["tense-introduction.html", "टेंस का परिचय (Tense Introduction)"], ["tense-past-continuous.html", "Past Continuous Tense"], ["tense-past-indefinite.html", "Past Indefinite Tense"], ["tense-past-perfect-continuous.html", "Past Perfect Continuous Tense"], ["tense-past-perfect.html", "Past Perfect Tense"], ["tense-present-continuous.html", "Present Continuous Tense"], ["tense-present-indefinite.html", "Present Indefinite Tense"], ["tense-present-perfect-continuous.html", "Present Perfect Continuous Tense"], ["tense-present-perfect.html", "Present Perfect Tense"], ["tense.html", "Tense & Translation"], ["voc1.html", "English Vocabulary"], ["voice-active.html", "Active Voice"], ["voice-passive.html", "Passive Voice"], ["voice.html", "Active & Passive Voice"]];

const SYSTEM = `You are "NK Study Lab AI", a friendly 24x7 student assistant on the website NK Study Lab (Hindi-medium learning site: Spoken English, Grammar, Tense, Vocabulary, Math formulas, Computer Science, Python, Coding).
Rules:
- Reply in simple Hindi (Hinglish is fine) like a patient teacher. Keep it short and clear, give 1-2 easy examples.
- Answer study-related questions (school/college subjects, English, maths, science, computer, coding, exam preparation, general knowledge).
- If a question is not about studying, politely say you can only help with studies.
- Never claim to be sure when you are not. If unsure, say so. For maths, show steps.
- No adult, hateful, violent or harmful content. Do not give medical, legal or financial advice beyond a general pointer to ask an expert.
- If one of the site pages below matches the topic, end your answer with a line: Padho: [[file|Title]] (copy file and title exactly from the list). Use at most 2 such links. Never invent pages.
Site pages:
` + PAGES.map(p => p[0] + " | " + p[1]).join("\n");

const hits = new Map();

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...cors(origin) } });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, origin);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: "not allowed" }, 403, origin);

    const ip = request.headers.get("CF-Connecting-IP") || "x";
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter(t => now - t < 60000);
    if (recent.length >= PER_IP_PER_MIN) return json({ error: "busy", reply: "थोड़ा रुको, बहुत जल्दी-जल्दी सवाल आ रहे हैं। 1 मिनट बाद फिर पूछो।" }, 429, origin);
    recent.push(now); hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "bad json" }, 400, origin); }
    const msgs = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
    const contents = msgs
      .filter(m => m && (m.role === "user" || m.role === "model") && typeof m.text === "string")
      .map(m => ({ role: m.role, parts: [{ text: m.text.slice(0, MAX_CHARS) }] }));
    if (!contents.length || contents[contents.length - 1].role !== "user") return json({ error: "no question" }, 400, origin);

    try {
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 700 }
        })
      });
      if (r.status === 429) return json({ error: "limit", reply: "आज का मुफ़्त कोटा अभी पूरा हो गया है। थोड़ी देर बाद या कल फिर कोशिश करो।" }, 429, origin);
      if (!r.ok) return json({ error: "upstream", reply: "अभी जवाब नहीं मिल पाया। थोड़ी देर बाद फिर कोशिश करो।" }, 502, origin);
      const data = await r.json();
      const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
      const text = parts.map(p => p.text || "").join("").trim();
      return json({ reply: text || "इस सवाल का जवाब मैं नहीं दे पाया। इसे दूसरे तरीके से पूछो।" }, 200, origin);
    } catch (e) {
      return json({ error: "fail", reply: "कुछ गड़बड़ हो गई। थोड़ी देर बाद फिर कोशिश करो।" }, 502, origin);
    }
  }
};
