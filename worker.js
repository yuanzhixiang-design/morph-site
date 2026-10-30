// morph-site Worker：静态站服务 + Decap CMS 的 GitHub OAuth 登录中转
// /auth     → 跳转 GitHub 授权页
// /callback → 用授权码换取令牌，带令牌回到后台
// 其余请求  → 正常返回静态文件（dist）

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 登录入口：后台点击 "登录" 时会打开这里
    if (url.pathname === "/auth") {
      if (!env.GITHUB_CLIENT_ID) {
        return new Response(
          JSON.stringify({ error: "尚未配置 GITHUB_CLIENT_ID（Cloudflare 后台 → 变量和机密）" }),
          { status: 500, headers: JSON_HEADERS }
        );
      }
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: "repo,user",
        state: crypto.randomUUID(),
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params.toString()}`,
        302
      );
    }

    // 2. GitHub 授权后的回调：换取访问令牌并送回后台
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("缺少授权码 code 参数", { status: 400 });
      }
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "morph-site-oauth",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${url.origin}/callback`,
        }),
      });
      const data = await tokenRes.json();
      if (data.access_token) {
        // 令牌放在 # 后面（不会发给服务器），后台页面自己读取
        return Response.redirect(
          `${url.origin}/admin/#access_token=${data.access_token}`,
          302
        );
      }
      return new Response(
        `<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;text-align:center;padding-top:80px">
         <h2>GitHub 授权失败</h2><p>${data.error_description || data.error || "未知错误"}</p>
         <p><a href="/admin/">返回后台重试</a></p></body>`,
        { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // 3. 其他请求一律返回静态站点
    return env.ASSETS.fetch(request);
  },
};
