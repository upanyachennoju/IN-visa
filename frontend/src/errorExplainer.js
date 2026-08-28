const explanationCache = new Map();

/**
 * Fetches plain-language error explanation from backend with in-memory caching.
 * On API failure or timeout, returns the raw error string as fallback.
 */
export async function getPlainLanguageError(field, rawError, context = '') {
  if (!rawError) return '';
  const cacheKey = `${field}:${rawError}:${context}`;
  if (explanationCache.has(cacheKey)) {
    return explanationCache.get(cacheKey);
  }

  try {
    const res = await fetch('http://localhost:3000/api/explain-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, error: rawError, context }),
    });
    if (!res.ok) {
      return rawError;
    }
    const data = await res.json();
    const explanation = data.message || rawError;
    explanationCache.set(cacheKey, explanation);
    return explanation;
  } catch {
    return rawError;
  }
}

/**
 * Enhances a dictionary of raw field errors { fieldName: rawErrorStr }
 * by converting each error string to its plain-language explanation.
 */
export async function explainFieldErrors(sectionName, rawErrors) {
  const explained = {};
  const entries = Object.entries(rawErrors);
  await Promise.all(
    entries.map(async ([field, rawError]) => {
      if (rawError) {
        explained[field] = await getPlainLanguageError(field, rawError, sectionName);
      }
    })
  );
  return explained;
}
