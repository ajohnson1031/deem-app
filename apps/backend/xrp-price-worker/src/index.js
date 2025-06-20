export default {
	async fetch(request) {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': '*',
		};

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		}

		// Your mock response (or fetch from real API)
		const price = 2.16;
		const body = JSON.stringify({
			price,
			updatedAt: new Date().toISOString(),
		});

		return new Response(body, {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	},
};
