
const ALLOWED_ORIGIN =
  "https://miyamoriyuna.github.io";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");

    const headers = {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (origin !== ALLOWED_ORIGIN) {
      return Response.json(
        { error: "アクセスが許可されていません。" },
        { status: 403 }
      );
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "POSTのみ対応しています。" },
        { status: 405, headers }
      );
    }

    try {
      const body = await request.json();

      const { question, answer, category, difficulty } = body;

      if (
        typeof question !== "string" ||
        typeof answer !== "string" ||
        !answer.trim()
      ) {
        return Response.json(
          { error: "問題文と解答を入力してください。" },
          { status: 400, headers }
        );
      }

      const aiResponse = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            input: [
              {
                role: "system",
                content: `あなたは高校生向けの英作文添削教師です。
日本語の問題文に対して、英作文が意味として適切か確認してください。
正しい別表現は誤りにしないでください。
説明は日本語で行ってください。
次のJSON形式だけで回答してください。

{
  "overallComment": "全体講評",
  "correctedAnswer": "修正後の英文",
  "spellingErrors": [],
  "grammarErrors": [],
  "structureErrors": [],
  "alternatives": []
}

誤りの項目は次の形式にしてください。
{
  "original": "元の表現",
  "corrected": "修正後の表現",
  "explanation": "日本語での説明"
}

alternativesは次の形式にしてください。
{
  "sentence": "別の表現",
  "explanation": "その表現の説明"
}

誤りがない項目は空配列にしてください。`
              },
              {
                role: "user",
                content: `問題文：${question}
問題の系統：${category}
難易度：${difficulty}
解答：${answer}`
              }
            ],
            text: {
              format: { type: "json_object" }
            }
          })
        }
      );

      const aiData = await aiResponse.json();

      if (!aiResponse.ok) {
        return Response.json(
          { error: "AI添削に失敗しました。設定を確認してください。" },
          { status: 502, headers }
        );
      }

      const resultText = aiData.output
        ?.flatMap(item => item.content || [])
        .find(item => item.type === "output_text")?.text;

      if (!resultText) {
        throw new Error("AIの回答を取得できませんでした。");
      }

      return Response.json(JSON.parse(resultText), { headers });

    } catch (error) {
      return Response.json(
        { error: "添削中にエラーが発生しました。" },
        { status: 500, headers }
      );
    }
  }
};
