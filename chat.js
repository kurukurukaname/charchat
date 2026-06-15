// Cloudflare Pages Functions
// このファイルは /api/chat というエンドポイントになります。
// APIキーはブラウザに渡さず、ここ(サーバー側)でのみ使用します。
// Cloudflare Pagesの管理画面 > Settings > Environment variables で
// 変数名 "ANTHROPIC_API_KEY" にあなたのAPIキーを設定してください。

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { model, system, messages } = body;

  if (!model || !messages) {
    return new Response(JSON.stringify({ error: "missing_fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "server_api_key_not_configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system,
      messages
    })
  });

  const text = await upstream.text();

  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" }
  });
}
