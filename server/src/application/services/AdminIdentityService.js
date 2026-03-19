function normalizeAdminPhone(phone) {
  return String(phone || '').replace(/\D/g, '').trim();
}

function buildInternalAdminEmail(phone) {
  const normalizedPhone = normalizeAdminPhone(phone);
  return `admin-${normalizedPhone || 'unknown'}@internal.etk`;
}

module.exports = {
  normalizeAdminPhone,
  buildInternalAdminEmail,
};
