const crypto = require("crypto");

/**
 * Verifies that a webhook request really came from GitHub by
 * recalculating the signature using our shared secret and comparing.
 */
function verifyGithubSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;

  const expectedSignature =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  // timingSafeEqual prevents a timing-attack way of guessing the secret
  const signatureBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

module.exports = { verifyGithubSignature };