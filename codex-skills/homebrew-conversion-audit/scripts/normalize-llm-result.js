export function normalizeLlmResult (
	{
		rawResult,
	} = {},
) {
	if (rawResult == null) return null;

	const parsed = typeof rawResult === "string"
		? JSON.parse(rawResult)
		: rawResult;

	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new Error(`LLM result must be an object or a JSON string containing an object`);
	}

	const patch = parsed.patch ?? parsed.result ?? parsed.output ?? null;
	if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
		throw new Error(`LLM result must contain an object "patch"`);
	}

	return {
		patch,
		confidence: parsed.confidence ?? null,
		manualReview: parsed.manualReview ?? parsed.manual_review ?? [],
		raw: parsed,
	};
}

if (import.meta.url === `file://${process.argv[1]}`) {
	throw new Error(`This script is a library wrapper. Import and call normalizeLlmResult() from another script.`);
}
