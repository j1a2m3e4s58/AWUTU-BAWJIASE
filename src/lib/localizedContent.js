export function getLocalizedField(record, field, lang = 'en') {
  if (!record) return '';
  if (lang === 'twi' && record[`${field}_twi`]) {
    return record[`${field}_twi`];
  }
  return record[field] || '';
}

export function getLocalizedArray(record, field, lang = 'en') {
  if (!record) return [];
  if (lang === 'twi' && Array.isArray(record[`${field}_twi`]) && record[`${field}_twi`].length > 0) {
    return record[`${field}_twi`];
  }
  return Array.isArray(record[field]) ? record[field] : [];
}
