// Short forms of Lucide's metadata markers, see https://github.com/lucide-icons/lucide/pull/4360 and /pull/5037

/**
 * Shorten the $extends: and $group: markers of a Lucide .json list to e: and g:.
 * @param {string[]} [values] - values from a Lucide .json list
 * @returns {string[]} Values with short markers
 */
export function shortenMarkers(values) {
	return (values || []).map((value) => value.replace(/^\$extends:/, "e:").replace(/^\$group:/, "g:"));
}
