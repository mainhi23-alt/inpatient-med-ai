export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contents, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên Vercel' });
  }

  const models = [
    'gemini-3.8-flash',
    'gemini-2.5-flash-lite'
  ];

  let lastError = 'Lỗi kết nối tới Gemini API';

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, systemInstruction }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return res.status(200).json(data);
      }

      lastError = data.error?.message || `Lỗi từ model ${model}`;
    } catch (error) {
      lastError = error.message || 'Lỗi mạng khi gọi Gemini API';
    }
  }

  return res.status(503).json({ error: lastError });
}
