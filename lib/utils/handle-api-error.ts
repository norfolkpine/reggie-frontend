import { UseFormSetError } from 'react-hook-form'

type ApiErrorResponse = {
  non_field_errors?: string[]
  [key: string]: string[] | undefined
}

type ErrorHandlingResult = {
  hasFieldErrors: boolean
  message: string
}

export function handleApiError(
  error: any,
  setFormError?: UseFormSetError<any>
): ErrorHandlingResult {
  let errorData: ApiErrorResponse;

  // Handle Next.js fetch API errors
  if (error instanceof Error) {
    if ('cause' in error && typeof error.cause === 'object' && error.cause !== null) {
      errorData = error.cause as ApiErrorResponse;
    } else {
      return {
        hasFieldErrors: false,
        message: error.message || 'An unexpected error occurred'
      };
    }
  } 
  // Handle Axios errors (legacy support)
  else if (error.response?.data) {
    errorData = error.response.data;
  } 
  else {
    return {
      hasFieldErrors: false,
      message: 'An unexpected error occurred'
    };
  }

  // Handle non-field errors first
  if (errorData.non_field_errors?.length) {
    return {
      hasFieldErrors: false,
      message: errorData.non_field_errors[0]
    };
  }

  // Handle field-specific errors
  const fieldErrors = Object.entries(errorData)
    .filter(([key]) => key !== 'non_field_errors');

  if (setFormError) {
    fieldErrors.forEach(([field, errors]) => {
      if (Array.isArray(errors) && errors.length > 0) {
        setFormError(field, { message: errors[0] });
      }
    });
  }

  const firstFieldError = fieldErrors.find(
    ([_, errors]) => Array.isArray(errors) && errors.length > 0
  );

  return {
    hasFieldErrors: fieldErrors.length > 0,
    message: firstFieldError && firstFieldError[1]
      ? `${firstFieldError[0]}: ${Array.isArray(firstFieldError[1]) ? firstFieldError[1][0] : ''}`
      : 'An unexpected error occurred'
  };
}