export const apiClient = async (endpoint, options = {}) => {
  const { method = 'GET', body, headers = {} } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Requests are sent to the Next.js App proxy routes,
  // which will forward the HTTPOnly session cookie to the backend.
  const response = await fetch(`/api${endpoint}`, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (err) {
      errorData = { detail: 'An unexpected error occurred' };
    }
    const error = new Error(errorData.detail || 'API request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // The backend might return 204 No Content for some endpoints (like DELETE or maybe updates without return data)
  if (response.status !== 204) {
    return response.json();
  }
};
