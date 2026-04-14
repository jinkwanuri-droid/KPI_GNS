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
            return res.status(500).json({ 
                success: false, 
                error: 'Vercel 환경변수에 GEMINI_API_KEY가 없습니다.' 
            });
        }

        // 요청하신 모델명 'gemini-3-flash-preview' 적용
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        // Gemini API 호출
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // 1) 정상적으로 응답을 받은 경우
        if (data.candidates && data.candidates.length > 0) {
            const aiText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ success: true, text: aiText });
        } 
        // 2) 구글 API 쪽에서 명확한 에러를 뱉은 경우 (화면에 바로 원인 출력)
        else if (data.error) {
            return res.status(500).json({ 
                success: false, 
                error: `Google API 에러: ${data.error.message}` 
            });
        } 
        // 3) 그 외 알 수 없는 에러
        else {
            return res.status(500).json({ 
                success: false, 
                error: 'Gemini 응답을 분석할 수 없습니다.', 
                details: data 
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
