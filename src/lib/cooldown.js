const lastUsed = new Map();

/**
 * Returns 0 if the action is allowed now (and records it),
 * otherwise the number of whole seconds left to wait.
 */
function check(key, windowMs) {
  const now = Date.now();
  const previous = lastUsed.get(key) || 0;
  const elapsed = now - previous;

  if (elapsed < windowMs) {
    return Math.ceil((windowMs - elapsed) / 1000);
  }

  lastUsed.set(key, now);

  // Keep the map from growing forever
  if (lastUsed.size > 5000) {
    for (const [k, t] of lastUsed) {
      if (now - t > windowMs * 10) lastUsed.delete(k);
    }
  }
  return 0;
}

module.exports = { check };
