function normalizePhone(rawPhone) {
  let digits = String(rawPhone || '').replace(/[^\d]/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0') && digits.length === 10) {
    digits = `213${digits.slice(1)}`;
  } else if (digits.length === 9) {
    digits = `213${digits}`;
  }

  return digits;
}

const referenceCache = {
  wilayas: null,
  communesByWilayaId: new Map(),
};

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['`’_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(a, b) {
  const source = normalizeName(a);
  const target = normalizeName(b);
  const matrix = Array.from({ length: source.length + 1 }, () => new Array(target.length + 1).fill(0));

  for (let i = 0; i <= source.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= target.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= source.length; i += 1) {
    for (let j = 1; j <= target.length; j += 1) {
      const cost = source[i - 1] === target[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[source.length][target.length];
}

function findBestNameMatch(inputName, candidates) {
  const normalizedInput = normalizeName(inputName);
  if (!normalizedInput) return null;

  const exactMatch = candidates.find((candidate) => normalizeName(candidate.name) === normalizedInput);
  if (exactMatch) return exactMatch;

  const scored = candidates
    .map((candidate) => {
      const normalizedCandidate = normalizeName(candidate.name);
      const distance = levenshteinDistance(normalizedInput, normalizedCandidate);
      const maxLen = Math.max(normalizedInput.length, normalizedCandidate.length, 1);
      const ratio = 1 - distance / maxLen;

      return {
        candidate,
        ratio,
        distance,
      };
    })
    .sort((a, b) => b.ratio - a.ratio || a.distance - b.distance);

  const best = scored[0];
  if (!best) return null;

  if (best.ratio >= 0.72 || best.distance <= 3) {
    return best.candidate;
  }

  return null;
}

function splitCustomerName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return { firstname: 'زبون', familyname: 'المتجر' };
  }

  if (parts.length === 1) {
    return { firstname: parts[0], familyname: parts[0] };
  }

  return {
    firstname: parts[0],
    familyname: parts.slice(1).join(' '),
  };
}

async function fetchYalidineJson({ apiBaseUrl, path, apiId, apiToken, providerLabel = 'Yalidine' }) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-ID': apiId,
      'X-API-TOKEN': apiToken,
    },
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = extractApiErrorMessage(responseData) || `فشل جلب مرجع ${providerLabel}`;
    const error = new Error(message);
    error.status = response.status || 502;
    error.details = responseData;
    throw error;
  }

  return responseData;
}

async function getYalidineWilayas({ apiBaseUrl, apiId, apiToken, providerLabel = 'Yalidine' }) {
  if (referenceCache.wilayas) {
    return referenceCache.wilayas;
  }

  const responseData = await fetchYalidineJson({
    apiBaseUrl,
    path: '/wilayas',
    apiId,
    apiToken,
    providerLabel,
  });

  referenceCache.wilayas = Array.isArray(responseData.data) ? responseData.data : [];
  return referenceCache.wilayas;
}

async function getYalidineCommunesByWilayaId({ apiBaseUrl, apiId, apiToken, wilayaId, providerLabel = 'Yalidine' }) {
  if (referenceCache.communesByWilayaId.has(wilayaId)) {
    return referenceCache.communesByWilayaId.get(wilayaId);
  }

  const responseData = await fetchYalidineJson({
    apiBaseUrl,
    path: `/communes?wilaya_id=${wilayaId}`,
    apiId,
    apiToken,
    providerLabel,
  });

  const communes = Array.isArray(responseData.data) ? responseData.data : [];
  referenceCache.communesByWilayaId.set(wilayaId, communes);
  return communes;
}

async function getYalidineCentersByWilayaId({ apiBaseUrl, apiId, apiToken, wilayaId, providerLabel = 'Yalidine' }) {
  const cacheKey = `centers:${wilayaId}`;
  if (referenceCache.communesByWilayaId.has(cacheKey)) {
    return referenceCache.communesByWilayaId.get(cacheKey);
  }

  const responseData = await fetchYalidineJson({
    apiBaseUrl,
    path: `/centers?wilaya_id=${wilayaId}`,
    apiId,
    apiToken,
    providerLabel,
  });

  const centers = Array.isArray(responseData.data) ? responseData.data : [];
  referenceCache.communesByWilayaId.set(cacheKey, centers);
  return centers;
}

function summarizeItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const options = item.selected_options && typeof item.selected_options === 'object' && !Array.isArray(item.selected_options)
        ? Object.entries(item.selected_options)
            .map(([key, value]) => `${key}: ${value}`)
            .join('، ')
        : '';

      return `${item.product_name}${options ? ` (${options})` : ''} × ${item.quantity}`;
    })
    .join(' | ');
}

function compactObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

function extractTrackingNumber(responseData) {
  if (!responseData || typeof responseData !== 'object') return null;

  const candidates = [
    responseData.tracking,
    responseData.tracking_number,
    responseData.trackingNumber,
    responseData.parcel_tracking,
    responseData.parcel_tracking_number,
    responseData.import_id,
    responseData.order_id,
    responseData.data?.tracking,
    responseData.data?.tracking_number,
    responseData.data?.trackingNumber,
    responseData.data?.parcel_tracking,
    responseData.data?.parcel_tracking_number,
    responseData.data?.import_id,
    responseData.data?.order_id,
  ];

  const match = candidates.find((value) => typeof value === 'string' || typeof value === 'number');
  if (match) return String(match);

  const nestedEntries = extractResultEntries(responseData);
  const nestedMatch = nestedEntries
    .flatMap((entry) => [
      entry.tracking,
      entry.tracking_number,
      entry.trackingNumber,
      entry.parcel_tracking,
      entry.parcel_tracking_number,
      entry.import_id,
      entry.order_id,
    ])
    .find((value) => typeof value === 'string' || typeof value === 'number');

  return nestedMatch ? String(nestedMatch) : null;
}

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

function extractShippingLabelUrl(responseData) {
  if (!responseData || typeof responseData !== 'object') return null;

  const candidates = [
    responseData.label,
    responseData.label_url,
    responseData.labelUrl,
    responseData.bordereau_url,
    responseData.bordereauUrl,
    responseData.slip_url,
    responseData.slipUrl,
    responseData.pdf_url,
    responseData.pdfUrl,
    responseData.ticket_url,
    responseData.ticketUrl,
    responseData.data?.label,
    responseData.data?.label_url,
    responseData.data?.labelUrl,
    responseData.data?.bordereau_url,
    responseData.data?.bordereauUrl,
    responseData.data?.slip_url,
    responseData.data?.slipUrl,
    responseData.data?.pdf_url,
    responseData.data?.pdfUrl,
    responseData.data?.ticket_url,
    responseData.data?.ticketUrl,
  ];

  const directMatch = candidates.find(isHttpUrl);
  if (directMatch) return directMatch.trim();

  const nestedEntries = extractResultEntries(responseData);
  const nestedMatch = nestedEntries
    .flatMap((entry) => [
      entry.label,
      entry.label_url,
      entry.labelUrl,
      entry.bordereau_url,
      entry.bordereauUrl,
      entry.slip_url,
      entry.slipUrl,
      entry.pdf_url,
      entry.pdfUrl,
      entry.ticket_url,
      entry.ticketUrl,
    ])
    .find(isHttpUrl);

  return nestedMatch ? nestedMatch.trim() : null;
}

async function fetchParcelDetailsByTracking({ apiBaseUrl, apiId, apiToken, trackingNumber, providerLabel = 'Yalidine' }) {
  if (!trackingNumber) return null;

  return fetchYalidineJson({
    apiBaseUrl,
    path: `/parcels/${encodeURIComponent(trackingNumber)}`,
    apiId,
    apiToken,
    providerLabel,
  });
}

function stringifyApiErrorPart(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    return value.map(stringifyApiErrorPart).filter(Boolean).join(' | ');
  }
  if (typeof value === 'object') {
    const preferred = [
      value.message,
      value.error,
      value.detail,
      value.description,
      value.msg,
    ]
      .map(stringifyApiErrorPart)
      .find(Boolean);

    if (preferred) return preferred;

    return Object.entries(value)
      .map(([key, nestedValue]) => {
        const text = stringifyApiErrorPart(nestedValue);
        return text ? `${key}: ${text}` : '';
      })
      .filter(Boolean)
      .join(' | ');
  }

  return '';
}

function extractApiErrorMessage(responseData) {
  return (
    stringifyApiErrorPart(responseData?.message) ||
    stringifyApiErrorPart(responseData?.error) ||
    stringifyApiErrorPart(responseData?.errors) ||
    stringifyApiErrorPart(responseData?.detail) ||
    stringifyApiErrorPart(responseData)
  );
}

function extractResultEntries(responseData) {
  if (Array.isArray(responseData)) {
    return responseData.filter((entry) => entry && typeof entry === 'object');
  }

  if (responseData && typeof responseData === 'object') {
    return Object.values(responseData).filter((entry) => entry && typeof entry === 'object');
  }

  return [];
}

async function resolveYalidineAddress({ apiBaseUrl, apiId, apiToken, wilayaName, communeName, fieldLabel, providerLabel = 'Yalidine' }) {
  const wilayas = await getYalidineWilayas({ apiBaseUrl, apiId, apiToken, providerLabel });
  const matchedWilaya = findBestNameMatch(wilayaName, wilayas);

  if (!matchedWilaya) {
    const error = new Error(`تعذر مطابقة ${fieldLabel} الولاية مع مرجع ${providerLabel}`);
    error.status = 400;
    throw error;
  }

  const communes = await getYalidineCommunesByWilayaId({
    apiBaseUrl,
    apiId,
    apiToken,
    wilayaId: matchedWilaya.id,
    providerLabel,
  });

  const matchedCommune = communeName ? findBestNameMatch(communeName, communes) : null;

  if (communeName && !matchedCommune) {
    const error = new Error(`تعذر مطابقة ${fieldLabel} البلدية مع مرجع ${providerLabel}`);
    error.status = 400;
    throw error;
  }

  return {
    wilayaId: matchedWilaya.id,
    wilayaName: matchedWilaya.name,
    communeName: matchedCommune?.name || '',
  };
}

async function resolveYalidineStopDesk({ apiBaseUrl, apiId, apiToken, destination, manualStopDeskId, providerLabel = 'Yalidine' }) {
  const centers = await getYalidineCentersByWilayaId({
    apiBaseUrl,
    apiId,
    apiToken,
    wilayaId: destination.wilayaId,
    providerLabel,
  });

  if (centers.length === 0) {
    const error = new Error(`لا يوجد أي مركز Desk متاح في ولاية الوجهة داخل ${providerLabel}`);
    error.status = 400;
    throw error;
  }

  const manualCenter = manualStopDeskId
    ? centers.find((center) => String(center.center_id) === String(manualStopDeskId).trim())
    : null;

  if (manualCenter) {
    return manualCenter;
  }

  const exactCommuneCenter = centers.find(
    (center) => normalizeName(center.commune_name) === normalizeName(destination.communeName)
  );

  if (exactCommuneCenter) {
    return exactCommuneCenter;
  }

  const bestCommuneCenter = findBestNameMatch(destination.communeName, centers.map((center) => ({ name: center.commune_name, center })));
  if (bestCommuneCenter?.center) {
    return bestCommuneCenter.center;
  }

  return centers[0];
}

async function buildYalidinePayload(order, items, settings, apiContext) {
  const providerLabel = apiContext.providerLabel || 'Yalidine';
  const { firstname, familyname } = splitCustomerName(order.customer_name);
  const productSummary = settings.default_product_name || summarizeItems(items);
  const normalizedCustomerPhone = normalizePhone(order.customer_phone);
  const normalizedShipperPhone = normalizePhone(settings.shipper_phone);

  if (!normalizedCustomerPhone) {
    const error = new Error(`رقم هاتف الزبون غير صالح للإرسال إلى ${providerLabel}`);
    error.status = 400;
    throw error;
  }

  if (!normalizedShipperPhone) {
    const error = new Error(`رقم هاتف المرسل في إعدادات ${providerLabel} غير صالح`);
    error.status = 400;
    throw error;
  }

  if (!settings.from_wilaya_name) {
    const error = new Error(`يرجى تحديد ولاية الإرسال في إعدادات ${providerLabel}`);
    error.status = 400;
    throw error;
  }

  if (!order.wilaya || !order.commune) {
    const error = new Error('الطلب لا يحتوي على ولاية وبلدية صالحين لرفع الشحنة');
    error.status = 400;
    throw error;
  }

  const destination = await resolveYalidineAddress({
    ...apiContext,
    wilayaName: order.wilaya,
    communeName: order.commune,
    fieldLabel: 'وجهة',
  });

  const origin = await resolveYalidineAddress({
    ...apiContext,
    wilayaName: settings.from_wilaya_name,
    communeName: settings.from_commune_name || '',
    fieldLabel: 'مرسل',
  });

  const stopDesk = order.delivery_type === 'desk'
    ? await resolveYalidineStopDesk({
        ...apiContext,
      destination,
      manualStopDeskId: settings.stopdesk_id,
      providerLabel,
    })
    : null;

  const finalDestinationCommuneName =
    order.delivery_type === 'desk' && stopDesk?.commune_name
      ? stopDesk.commune_name
      : destination.communeName;

  return compactObject({
    order_id: String(order.order_number),
    firstname,
    familyname,
    contact_phone: normalizedCustomerPhone,
    address: order.address || `${order.commune}، ${order.wilaya}`,
    to_wilaya_name: destination.wilayaName,
    to_commune_name: finalDestinationCommuneName,
    product_list: productSummary,
    price: Number(order.total) || 0,
    do_insurance: false,
    declared_value: Number(order.total) || 0,
    height: 1,
    width: 1,
    length: 1,
    weight: 1,
    freeshipping: false,
    is_stopdesk: order.delivery_type === 'desk',
    stopdesk_id: order.delivery_type === 'desk' ? stopDesk?.center_id : undefined,
    has_exchange: false,
    from_wilaya_name: origin.wilayaName,
    from_commune_name: origin.communeName || undefined,
    sender_name: settings.shipper_name,
    sender_phone: normalizedShipperPhone,
  });
}

async function createPartnerShipment({ order, items, settings, providerKey = 'yalidine', providerLabel = 'Yalidine' }) {
  const apiBaseUrl = String(settings.api_base_url || '').trim().replace(/\/+$/, '');
  const apiId = String(settings.api_id || '').trim();
  const apiToken = String(settings.api_token || '').trim();

  if (!settings.enabled) {
    const error = new Error(`تكامل ${providerLabel} غير مفعل من إعدادات الشحن`);
    error.status = 400;
    throw error;
  }

  if (!apiBaseUrl || !apiId || !apiToken) {
    const error = new Error(`بيانات ربط ${providerLabel} غير مكتملة`);
    error.status = 400;
    throw error;
  }

  const payload = await buildYalidinePayload(order, items, settings, {
    apiBaseUrl,
    apiId,
    apiToken,
    providerLabel,
  });
  const response = await fetch(`${apiBaseUrl}/parcels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-ID': apiId,
      'X-API-TOKEN': apiToken,
    },
    body: JSON.stringify([payload]),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = extractApiErrorMessage(responseData) || `فشل رفع الطلب إلى ${providerLabel}`;
    const error = new Error(message);
    error.status = response.status || 502;
    error.details = responseData;
    throw error;
  }

  const resultEntries = extractResultEntries(responseData);
  if (resultEntries.length > 0) {
    const failedEntries = resultEntries.filter((entry) => entry.success === false);
    if (failedEntries.length > 0) {
      const message = failedEntries
        .map((entry) => stringifyApiErrorPart(entry.message) || stringifyApiErrorPart(entry.error))
        .filter(Boolean)
        .join(' | ') || `فشل رفع الطلب إلى ${providerLabel}`;

      const error = new Error(message);
      error.status = 400;
      error.details = responseData;
      throw error;
    }
  }

  const trackingNumber = extractTrackingNumber(responseData);
  let shippingLabelUrl = extractShippingLabelUrl(responseData);
  let detailsResponse = null;

  if (trackingNumber && !shippingLabelUrl) {
    detailsResponse = await fetchParcelDetailsByTracking({
      apiBaseUrl,
      apiId,
      apiToken,
      trackingNumber,
      providerLabel,
    }).catch(() => null);

    if (detailsResponse) {
      shippingLabelUrl = extractShippingLabelUrl(detailsResponse);
    }
  }

  return {
    provider: providerKey,
    payload,
    response: detailsResponse || responseData,
    tracking_number: trackingNumber,
    shipping_label_url: shippingLabelUrl,
  };
}

async function createYalidineShipment({ order, items, settings }) {
  return createPartnerShipment({
    order,
    items,
    settings,
    providerKey: 'yalidine',
    providerLabel: 'Yalidine',
  });
}

async function createGuepexShipment({ order, items, settings }) {
  return createPartnerShipment({
    order,
    items,
    settings,
    providerKey: 'guepex',
    providerLabel: 'Guepex',
  });
}

module.exports = {
  createPartnerShipment,
  createYalidineShipment,
  createGuepexShipment,
};
