export class AlignmentUtil {
	static tryGetConvertedAlignment (align, {cbMan = null} = {}) {
		if (!(align || "").trim()) return {};

		let alignmentPrefix;

		// region Support WBtW and onwards formatting
		align = align.trim().replace(/^typically\s+/, () => {
			alignmentPrefix = "typically ";
			return "";
		});
		// endregion

		const orParts = (align || "").split(/ or /g).map(it => it.trim().replace(/[.,;，。；、]$/g, "").trim());
		const out = [];

		orParts.forEach(part => {
			Object.values(AlignmentUtil.ALIGNMENTS).forEach(it => {
				if (it.regex.test(part)) return out.push({alignment: it.output});

				const mChange = it.regexChance.exec(part);
				if (mChange) out.push({alignment: it.output, chance: Number(mChange[1])});
			});
		});

		if (out.length === 1) return {alignmentPrefix, alignment: out[0].alignment};
		if (out.length) return {alignmentPrefix, alignment: out};

		if (cbMan) cbMan(align);

		return {alignmentPrefix, alignment: align};
	}
}
// These are arranged in order of preferred precedence
AlignmentUtil.ALIGNMENTS_RAW = {
	"lawful good": ["L", "G"],
	"neutral good": ["N", "G"],
	"chaotic good": ["C", "G"],
	"chaotic neutral": ["C", "N"],
	"lawful evil": ["L", "E"],
	"lawful neutral": ["L", "N"],
	"neutral evil": ["N", "E"],
	"chaotic evil": ["C", "E"],

	"(?:any )?non-?good( alignment)?": ["L", "NX", "C", "NY", "E"],
	"(?:any )?non-?lawful( alignment)?": ["NX", "C", "G", "NY", "E"],
	"(?:any )?non-?evil( alignment)?": ["L", "NX", "C", "NY", "G"],
	"(?:any )?non-?chaotic( alignment)?": ["NX", "L", "G", "NY", "E"],

	"(?:any )?chaotic( alignment)?": ["C", "G", "NY", "E"],
	"(?:any )?evil( alignment)?": ["L", "NX", "C", "E"],
	"(?:any )?lawful( alignment)?": ["L", "G", "NY", "E"],
	"(?:any )?good( alignment)?": ["L", "NX", "C", "G"],

	"good": ["G"],
	"lawful": ["L"],
	"neutral": ["N"],
	"chaotic": ["C"],
	"evil": ["E"],

	"any neutral( alignment)?": ["NX", "NY", "N"],

	"unaligned": ["U"],

	"any alignment": ["A"],

	"守序善良": ["L", "G"],
	"中立善良": ["N", "G"],
	"混乱善良": ["C", "G"],
	"混乱中立": ["C", "N"],
	"守序邪恶": ["L", "E"],
	"守序中立": ["L", "N"],
	"中立邪恶": ["N", "E"],
	"混乱邪恶": ["C", "E"],

	"(?:任意)?非-?善良(阵营)?": ["L", "NX", "C", "NY", "E"],
	"(?:任意)?非-?守序(阵营)?": ["NX", "C", "G", "NY", "E"],
	"(?:任意)?非-?邪恶(阵营)?": ["L", "NX", "C", "NY", "G"],
	"(?:任意)?非-?混乱(阵营)?": ["NX", "L", "G", "NY", "E"],

	"(?:任意)?混乱(阵营)?": ["C", "G", "NY", "E"],
	"(?:任意)?邪恶(阵营)?": ["L", "NX", "C", "E"],
	"(?:任意)?守序(阵营)?": ["L", "G", "NY", "E"],
	"(?:任意)?善良(阵营)?": ["L", "NX", "C", "G"],

	"善良": ["G"],
	"守序": ["L"],
	"中立": ["N"],
	"混乱": ["C"],
	"邪恶": ["E"],

	"任意中立(阵营)?": ["NX", "NY", "N"],

	"无阵营": ["U"],

	"任意阵营": ["A"],
};
AlignmentUtil.ALIGNMENTS = {};
Object.entries(AlignmentUtil.ALIGNMENTS_RAW).forEach(([k, v]) => {
	AlignmentUtil.ALIGNMENTS[k] = {
		output: v,
		regex: RegExp(`^${k}$`, "i"),
		regexChance: RegExp(`^${k}\\s*\\((\\d+)\\s*%\\)$`, "i"),
		regexWeak: RegExp(k, "i"),
	};
});
