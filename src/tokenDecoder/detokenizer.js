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
