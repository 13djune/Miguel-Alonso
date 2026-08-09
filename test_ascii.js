const LEFT_CENTER = 27;
const RIGHT_CENTER = 79;
const TOP_CENTER = 53;

// Left Box
// Center 27, Width 26 (1+24+1)
// Starts at 27 - 13 = 14
// Ends at 14 + 26 = 40
const leftBoxStarts = 14;

// Right Box
// Center 79, Width 26
// Starts at 79 - 13 = 66
// Ends at 66 + 26 = 92
const rightBoxStarts = 66;

const spaceBetweenBoxes = rightBoxStarts - (leftBoxStarts + 26);
console.log("space between boxes:", spaceBetweenBoxes); // 66 - 40 = 26

// Branches:
// ┌───────────┬──────┴─────┬───────────┐
// center = 27.
// ┴ is at 27.
// Left inner ┬: 27 - 1 - 6 = 20.
// Right inner ┬: 27 + 1 + 6 = 34.
// Left outer ┌: 20 - 1 - 11 = 8.
// Right outer ┐: 34 + 1 + 11 = 46.
// Left targets: 8, 20, 34, 46.

// Right Branches:
// center = 79.
// ┴ is at 79.
// Left inner ┬: 79 - 1 - 6 = 72.
// Right inner ┬: 79 + 1 + 6 = 86.
// Left outer ┌: 72 - 1 - 11 = 60.
// Right outer ┐: 86 + 1 + 11 = 98.
// Right targets: 60, 72, 86, 98.

// Check overlaps:
// Left max item (center 46) starts at 41, ends at 51.
// Right min item (center 60) starts at 55, ends at 65.
console.log("Distance between item groups:", 55 - 51); // 4 spaces!

console.log("Top block:");
// Center = 53
// Width of top block is 25 (╔═══════════════════════╗)
// Center of top block = 53. Starts at 53 - 12 = 41.
console.log("Top block starts at 41.");
