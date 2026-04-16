export default async function handler(req, res) {
  // CORS 처리 (필요시 활성화)
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // if (req.method === 'OPTIONS') { return res.status(200).end(); }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'POST 메서드만 허용됩니다.' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, error: '프롬프트 데이터가 필요합니다.' });
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: '서버 환경 변수(GEMINI_API_KEY)가 설정되지 않았습니다.' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API 연동 중 오류 발생');
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ success: true, text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
