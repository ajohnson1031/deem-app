let cachedPrice = null;
let lastUpdated = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd';

export default {
	async fetch(request) {
		const now = Date.now();

		// CORS Preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': '*',
				},
			});
		}

		// Return cached price if still fresh
		if (cachedPrice !== null && now - lastUpdated < CACHE_DURATION) {
			return jsonResponse(cachedPrice, false); // ✅ explicitly mark as fresh
		}

		try {
			const response = await fetch(COINGECKO_URL);
			const data = await response.json();

			const price = data?.ripple?.usd;

			if (typeof price !== 'number') {
				throw new Error('Invalid price from CoinGecko');
			}

			cachedPrice = price;
			lastUpdated = now;

			return jsonResponse(price, false);
		} catch (err) {
			console.warn('[CoinGecko Fallback]', err);

			const fallbackPrice = cachedPrice ?? 2.0;
			return jsonResponse(fallbackPrice, fallbackPrice === 2.0); // true only if no cache
		}
	},
};

function jsonResponse(price, isFallback = false) {
	const body = JSON.stringify({
		price,
		updatedAt: new Date().toISOString(),
		source: isFallback ? 'cache/fallback' : 'coingecko',
	});

	return new Response(body, {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
