#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="homebrew-conversion-audit"
SOURCE_DIR="${SCRIPT_DIR}/${SKILL_NAME}"

if [[ ! -d "${SOURCE_DIR}" ]]; then
	echo "Skill source directory not found: ${SOURCE_DIR}" >&2
	exit 1
fi

CODEX_HOME_DIR="${CODEX_HOME:-${HOME}/.codex}"
SKILLS_DIR="${CODEX_HOME_DIR}/skills"
TARGET_DIR="${SKILLS_DIR}/${SKILL_NAME}"
MODE="copy"
FORCE=0

print_usage() {
	cat <<EOF
Usage:
  $(basename "$0") [--mode copy|link] [--codex-home PATH] [--force]

Options:
  --mode        Install mode. "copy" copies files; "link" creates a symlink.
                Default: copy
  --codex-home  Override the Codex home directory. Default:
                \$CODEX_HOME or ~/.codex
  --force       Remove an existing target before installing.
  -h, --help    Show this help.

Examples:
  $(basename "$0")
  $(basename "$0") --mode link
  $(basename "$0") --codex-home /path/to/codex-home --force
EOF
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		--mode)
			MODE="${2:-}"
			shift 2
			;;
		--codex-home)
			CODEX_HOME_DIR="${2:-}"
			SKILLS_DIR="${CODEX_HOME_DIR}/skills"
			TARGET_DIR="${SKILLS_DIR}/${SKILL_NAME}"
			shift 2
			;;
		--force)
			FORCE=1
			shift
			;;
		-h|--help)
			print_usage
			exit 0
			;;
		*)
			echo "Unknown argument: $1" >&2
			print_usage >&2
			exit 1
			;;
	esac
done

if [[ "${MODE}" != "copy" && "${MODE}" != "link" ]]; then
	echo "Invalid --mode: ${MODE}. Expected copy or link." >&2
	exit 1
fi

mkdir -p "${SKILLS_DIR}"

if [[ -e "${TARGET_DIR}" || -L "${TARGET_DIR}" ]]; then
	if [[ "${FORCE}" -eq 1 ]]; then
		rm -rf "${TARGET_DIR}"
	else
		echo "Target already exists: ${TARGET_DIR}" >&2
		echo "Re-run with --force to replace it." >&2
		exit 1
	fi
fi

if [[ "${MODE}" == "copy" ]]; then
	cp -R "${SOURCE_DIR}" "${TARGET_DIR}"
else
	ln -s "${SOURCE_DIR}" "${TARGET_DIR}"
fi

cat <<EOF
Installed skill:
  ${SKILL_NAME}

Source:
  ${SOURCE_DIR}

Target:
  ${TARGET_DIR}

Mode:
  ${MODE}

Next:
  Open a new Codex session, or use this skill in a prompt such as:
  "Use homebrew-conversion-audit to process this document."
EOF
