// functions/api/mint.js
// POST /api/mint   body: { slug, minter, quantity }
//
// این تابع کلید API را روی سرور نگه می‌دارد و از OpenSea داده‌ی آماده‌ی
// تراکنش (target/calldata/value) را می‌گیرد؛ یعنی دیگر لازم نیست خودمان
// حدس بزنیم قرارداد از SeaDrop استفاده می‌کند یا نه، یا feeRecipient چیست.
// OpenSea خودش calldata درست را برای هر نوع قرارداد می‌سازد.

export async function onRequestPost({ request, env }) {
  if (!env.OPENSEA_API_KEY) {
    return json({ error: "OPENSEA_API_KEY روی سرور تنظیم نشده است" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "بدنه‌ی درخواست JSON معتبر نیست" }, 400);
  }

  const { slug, minter, quantity } = body || {};

  if (!slug || !minter || !quantity) {
    return json({ error: "slug، minter و quantity الزامی هستند" }, 400);
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(minter)) {
    return json({ error: "آدرس کیف پول (minter) نامعتبر است" }, 400);
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    return json({ error: "quantity باید عدد صحیح بین ۱ تا ۵۰ باشد" }, 400);
  }

  try {
    const res = await fetch(
      `https://api.opensea.io/api/v2/drops/${encodeURIComponent(slug)}/mint`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": env.OPENSEA_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({ minter, quantity }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return json(
        { error: data?.errors?.[0] || data?.error || "ساخت تراکنش مینت ناموفق بود" },
        res.status
      );
    }

    return json(data, 200);
  } catch (err) {
    return json({ error: "خطا در ارتباط با OpenSea: " + err.message }, 502);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
