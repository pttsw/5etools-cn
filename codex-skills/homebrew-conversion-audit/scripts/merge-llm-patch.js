export function mergeLlmPatch (
	{
		initialJson,
		patch,
	},
) {
	if (!initialJson || typeof initialJson !== "object" || Array.isArray(initialJson)) {
		throw new Error(`"initialJson" must be an object`);
	}

	if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
		throw new Error(`"patch" must be an object`);
	}

	return {
		mergedJson: {
			...initialJson,
			...patch,
		},
		patchedFields: Object.keys(patch),
	};
}

if (import.meta.url === `file://${process.argv[1]}`) {
	throw new Error(`This script is a library wrapper. Import and call mergeLlmPatch() from another script.`);
}
