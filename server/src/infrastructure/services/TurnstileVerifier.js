const axios = require('axios');

class TurnstileVerifier {
  async verify({ token, secretKey, remoteIp }) {
    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      success: Boolean(response.data?.success),
      errorCodes: Array.isArray(response.data?.['error-codes'])
        ? response.data['error-codes']
        : [],
    };
  }
}

module.exports = {
  TurnstileVerifier,
};
