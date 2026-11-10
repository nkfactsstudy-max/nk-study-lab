# NK Study Lab AI — सेटअप (सिर्फ़ एक बार)

1. dash.cloudflare.com → बाईं तरफ़ **Workers & Pages** → **Create** → **Create Worker** → नाम: `nk-study-ai` → **Deploy**।
2. **Edit code** दबाओ, पुराना कोड मिटाकर `worker.js` का पूरा कोड चिपकाओ → **Deploy**।
3. Worker की **Settings → Variables and Secrets → Add** → Type: **Secret**, Name: `GEMINI_API_KEY`, Value: AI Studio वाली key → **Deploy**।
4. Worker का URL (जैसे `https://nk-study-ai.xxxx.workers.dev`) कॉपी करो और `chat.js` में `AI_URL` की जगह डालो (यह मैं कर दूँगा)।
5. अपना डोमेन लेने पर `worker.js` की `ALLOWED_ORIGINS` में उसे जोड़ना।

`MODEL` का नाम Google बदले/हटाए तो `worker.js` की ऊपरी लाइन में बदलो।
