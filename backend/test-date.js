const normalizeDateStr = (dStr) => {
  if (!dStr) return '';
  const cleanStr = dStr.split('T')[0];
  const parts = cleanStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length <= 2 && parts[2].length === 4 && !isNaN(Number(parts[1]))) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    if (parts[0].length === 4 && !isNaN(Number(parts[1]))) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  try {
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  } catch(e) {}
  return cleanStr;
};

console.log(normalizeDateStr("2026-06-01"));
console.log(normalizeDateStr("2026-6-1"));
console.log(normalizeDateStr("01-06-2026"));
console.log(normalizeDateStr("01/06/2026"));
