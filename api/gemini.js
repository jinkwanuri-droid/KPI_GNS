export default async function handler(req, res) {
    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;
        
        // Vercel 환경변수에서 API 키 가져오기
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
        }

        // Gemini 1.5 Flash 모델 API 엔드포인트
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // Gemini API 호출
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // 응답 텍스트 추출
        if (data.candidates && data.candidates.length > 0) {
            const aiText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ success: true, text: aiText });
        } else {
            return res.status(500).json({ success: false, error: 'Gemini 응답을 분석할 수 없습니다.', details: data });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
