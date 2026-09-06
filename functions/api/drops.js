// functions/api/drop.js
// GET /api/drop?slug=chompnft
// این تابع روی سرور (Cloudflare Pages Functions) اجرا می‌شود، پس کلید API هرگز
// در مرورگر کاربر دیده نمی‌شود.
//
// نکته: کلید OPENSEA_API_KEY را باید در تنظیمات پروژه‌ی Cloudflare Pages
// (Settings → Environment variables) به‌عنوان یک متغیر Secret اضافه کنی.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return json({ error: "پارامتر slug الزامی است" }, 400);
  }

  if (!env.OPENSEA_API_KEY) {
    return json({ error: "OPENSEA_API_KEY روی سرور تنظیم نشده است" }, 500);
  }

  try {
    const res = await fetch(
      `https://api.opensea.io/api/v2/drops/${encodeURIComponent(slug)}`,
      { headers: { "X-API-KEY": env.OPENSEA_API_KEY } }
    );

    const data = await res.json();

    if (!res.ok) {
      return json(
        { error: data?.errors?.[0] || data?.error || "دراپ پیدا نشد یا اسلاگ اشتباه است" },
        res.status
      );
    }

    return json(data, 200, "public, max-age=20");
  } catch (err) {
    return json({ error: "خطا در ارتباط با OpenSea: " + err.message }, 502);
  }
}

function json(body, status = 200, cache) {
  const headers = { "content-type": "application/json" };
  if (cache) headers["cache-control"] = cache;
  return new Response(JSON.stringify(body), { status, headers });
}
