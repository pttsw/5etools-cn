export async function onRequest (context) {
	const req = context.request;
	const url = new URL(req.url);

	const rawPath = context.params.default;
	const path = Array.isArray(rawPath)
		? rawPath.join("/")
		: rawPath || "";

	const upstreamUrl = `https://82.157.116.166/img/${path}${url.search}`;
	const headers = new Headers(req.headers);
	headers.delete("host");

	const init = {
		method: req.method,
		headers,
		redirect: "follow",
	};

	if (req.method !== "GET" && req.method !== "HEAD") init.body = req.body;

	const res = await fetch(upstreamUrl, init);

	const outHeaders = new Headers(res.headers);
	outHeaders.set("Cache-Control", "public, max-age=31536000, immutable");

	return new Response(res.body, {
		status: res.status,
		statusText: res.statusText,
		headers: outHeaders,
	});
}
