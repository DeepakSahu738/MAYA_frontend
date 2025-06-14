import { jwtDecode } from 'jwt-decode';

export function getUserIdFromToken(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.userID;  // or 'userId' or whatever key your payload uses
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}
export function getRoleFromToken(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.role;  // or 'role ' or whatever key your payload uses
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}
export function base64UrlDecode(str) {
    // Replace URL-safe chars with Base64 standard chars
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' to make length a multiple of 4
    while (str.length % 4) {
        str += '=';
    }
    return atob(str);
}

export function isJwtExpired(token) {
    try {
        const payloadPart = token.split('.')[1];
        const decodedPayload = base64UrlDecode(payloadPart);
        const payload = JSON.parse(decodedPayload);
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (e) {
        console.error('Invalid token:', e);
        return true; // Treat invalid token as expired
    }
}

