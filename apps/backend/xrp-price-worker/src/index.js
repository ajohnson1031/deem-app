let cachedPrice = 2.15;
let lastFetched = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

export default {
	async fetch(request, env, ctx) {
		const now = Date.now();
		const isStale = now - lastFetched > CACHE_DURATION;

		if (isStale) {
			try {
				const result = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd');
				const data = await result.json();
				cachedPrice = data?.ripple?.usd ?? cachedPrice;
				lastFetched = now;
			} catch (err) {
				console.error('Failed to fetch XRP price:', err);
			}
		}

		return new Response(JSON.stringify({ price: cachedPrice }), {
			headers: { 'Content-Type': 'application/json' },
		});
	},
};
