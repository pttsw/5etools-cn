export async function onRequest (context) {
	const req = context.request;
	const url = new URL(req.url);

	const rawPath = context.params.default;
	const path = Array.isArray(rawPath)
		? rawPath.join("/")
		: rawPath || "";

	const headers = new Headers(req.headers);
	headers.delete("host");

	const init = {
		method: req.method,
		headers,
		redirect: "follow",
	};

	if (req.method !== "GET" && req.method !== "HEAD") init.body = req.body;

	const upstreamUrls = [
		`https://5e.tools/img/${path}${url.search}`,
		`https://82.157.116.166/img/${path}${url.search}`,
	];

	let res = null;
	for (const upstreamUrl of upstreamUrls) {
		try {
			res = await fetch(upstreamUrl, init);
			if (res.ok) break;
		} catch (e) {
			res = null;
		}
	}

	if (!res) {
		return new Response("Failed to load image from all upstreams.", {
			status: 502,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-store",
			},
		});
	}

	const outHeaders = new Headers(res.headers);
	outHeaders.set("Cache-Control", "public, max-age=31536000, immutable");

	return new Response(res.body, {
		status: res.status,
		statusText: res.statusText,
		headers: outHeaders,
	});
}
