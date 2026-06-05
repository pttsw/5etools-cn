function _getPatchedFields ({initialJson = null, finalJson = null} = {}) {
	if (!initialJson || !finalJson) return [];

	const keys = new Set([
		...Object.keys(initialJson),
		...Object.keys(finalJson),
	]);

	return [...keys]
		.filter(key => JSON.stringify(initialJson[key]) !== JSON.stringify(finalJson[key]))
		.sort();
}

export function generateReport (
	{
		input = {},
		entity = {},
		converter = {},
		validation = {},
		llm = null,
		finalJson = null,
	} = {},
) {
	const initialJson = converter.initialJson ?? entity.initialJson ?? null;
	const patchedFields = llm?.patchedFields?.length
		? [...llm.patchedFields]
		: _getPatchedFields({initialJson, finalJson});

	return {
		input: {
			source_file: input.source_file ?? null,
			format: input.format ?? null,
			extract_quality: input.meta?.extract_quality ?? null,
			block_count: input.meta?.block_count ?? null,
		},
		entity: {
			kind: entity.kind ?? converter.entityKind ?? validation.entityKind ?? null,
			title: entity.title ?? converter.entityTitle ?? null,
			mode: converter.mode ?? null,
			source: converter.source ?? null,
			page: converter.page ?? null,
			styleHint: converter.styleHint ?? null,
		},
		converter: {
			warningCount: converter.warnings?.length ?? 0,
			warnings: converter.warnings ?? [],
			hasInitialJson: !!initialJson,
			error: converter.error ?? null,
		},
		validation: {
			ok: !!validation.ok,
			needsLlm: !!validation.needsLlm,
			summary: validation.summary ?? {errorCount: 0, warnCount: 0, infoCount: 0},
			issues: validation.issues ?? [],
		},
		llm: {
			used: !!llm,
			confidence: llm?.confidence ?? null,
			patchedFields,
			manualReview: llm?.manualReview ?? llm?.manual_review ?? [],
		},
		output: {
			hasFinalJson: !!finalJson,
			name: finalJson?.name ?? initialJson?.name ?? null,
		},
	};
}

export function renderReportMarkdown (report) {
	const lines = [
		"# Conversion Report",
		"",
		`Input: ${report.input.source_file || "(inline input)"}`,
		`Format: ${report.input.format || "(unknown)"}`,
		`Entity kind: ${report.entity.kind || "(unknown)"}`,
		`Entity title: ${report.entity.title || "(untitled)"}`,
		`Converter mode: ${report.entity.mode || "(unknown)"}`,
		`Validation passed: ${report.validation.ok ? "yes" : "no"}`,
		`LLM fallback used: ${report.llm.used ? "yes" : "no"}`,
		"",
		"## Summary",
		`- Errors: ${report.validation.summary.errorCount}`,
		`- Warnings: ${report.validation.summary.warnCount}`,
		`- Infos: ${report.validation.summary.infoCount}`,
		`- Converter warnings: ${report.converter.warningCount}`,
	];

	if (report.converter.error?.message) {
		lines.push(`- Converter crash: ${report.converter.error.message}`);
	}

	if (report.validation.issues?.length) {
		lines.push("", "## Issues");
		report.validation.issues.forEach(issue => {
			const fieldPart = issue.field ? ` (${issue.field})` : "";
			lines.push(`- [${issue.severity}] ${issue.code}${fieldPart}: ${issue.message}`);
		});
	}

	if (report.llm.used) {
		lines.push("", "## LLM");
		lines.push(`- Confidence: ${report.llm.confidence ?? "(unknown)"}`);
		lines.push(`- Patched fields: ${report.llm.patchedFields?.length ? report.llm.patchedFields.join(", ") : "(none recorded)"}`);
	}

	if (report.llm.manualReview?.length) {
		lines.push("", "## Manual Review");
		report.llm.manualReview.forEach(note => lines.push(`- ${note}`));
	}

	return `${lines.join("\n")}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	throw new Error(`This script is a library wrapper. Import and call generateReport() from another script.`);
}
