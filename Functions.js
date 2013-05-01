var constants = {
	'canvasMargin':	100,
	'nodeSize':		100,
	'messageSize':	20
}

/** Returns 1 if the value is > 0, -1 if the value is < 0, or 0 if the value is exactly 0 */
var sign = function(value) {
	return (value > 0 ? 1 : (value < 0 ? -1 : 0));
}

/** Returns a random integer in the range [0, value) */
var randIntUnder = function(value) {
	return Math.floor(Math.random()*value);
}

/** Returns a random integer in the range [value1, value2] */
var randIntIn = function(value1, value2) {
	return value1 + randIntUnder(value2 + 1 - value1);
}

/** Given a dictionary and a value, find the first key that maps to that value */
var getKeyFromValue = function(dict, value) {
	for (var key in dict) {
		if (dict[key] == value)
			return key;
	}
	return null;
}

/** Turn a simple dictionary (i.e. height = 1) into a string */
var dumbStringify = function(dict) {
	if (!dict) return '(null)';
	var s = '{';
	for (var key in dict) {
		s += key + ': ' + dict[key] + '; ';
	}
	s += '}';
	return s;
}