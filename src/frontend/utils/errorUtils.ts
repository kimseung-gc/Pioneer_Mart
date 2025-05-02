// Error message mapping utility
export const getErrorMessage = (error: any) => {
  // Network connectivity issues
  if (!error.response) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  // Server returned an error response
  const status = error.response.status;

  switch (status) {
    case 400:
      return "There was a problem with your request. Please check your information and try again.";
    case 401:
      // Authentication error that wasn't handled by token refresh
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You don't have permission to access this resource.";
    case 404:
      return "The requested information could not be found.";
    case 422:
      // Validation errors
      const fieldErrors = error.response.data?.errors;
      if (fieldErrors) {
        // Return specific field validation errors if available
        return (
          Object.values(fieldErrors)[0] ||
          "Please check your information and try again."
        );
      }
      return "Please check your information and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "We're experiencing technical difficulties. Please try again later.";
    default:
      return "Something went wrong. Please try again later.";
  }
};
