// functions/api/drops.js
export async function onRequestGet() {
  const query = `
    query DropsPageQuery {
      drops(first: 20) {
        edges {
          node {
            id
            name
            slug
            chain
            bannerImageUrl
            imageUrl
            contractAddress
            mintStages {
              edges {
                node {
                  id
                  name
                  stageType
                  startTime
                  endTime
                  price {
                    unit
                    symbol
                  }
                  perWalletLimit
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.opensea.io/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      body: JSON.stringify({ query })
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=60" // هر ۶۰ ثانیه یک‌بار کش تازه می‌شود
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
