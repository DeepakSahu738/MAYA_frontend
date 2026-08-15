// Helper to get auth headers based on whether creator is demo or real

export function getAuthHeaders(selectedCreator) {
  const token = sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };

  // Real creators (non-demo) require auth
  if (selectedCreator && !selectedCreator.isDemo && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export function getAxiosConfig(selectedCreator) {
  const token = sessionStorage.getItem("token");

  if (selectedCreator && !selectedCreator.isDemo && token) {
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  return {};
}
