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
  if (!error.response?.data) {
    return {
      hasFieldErrors: false,
      message: 'An unexpected error occurred'
    }
  }

  const errorData = error.response.data
  
  // Handle non-field errors first
  if (errorData.non_field_errors?.length) {
    return {
      hasFieldErrors: false,
      message: errorData.non_field_errors[0]
    }
  }

  // Handle field-specific errors
  const fieldErrors = Object.entries(errorData)
    .filter(([key]) => key !== 'non_field_errors')

  if (setFormError) {
    fieldErrors.forEach(([field, errors]) => {
      if (Array.isArray(errors) && errors.length > 0) {
        // Map specific field names if needed
        setFormError(field, { message: errors[0] })
      }
    })
  }

  const firstFieldError = fieldErrors.find(
    ([_, errors]) => Array.isArray(errors) && errors.length > 0
  )

  return {
    hasFieldErrors: fieldErrors.length > 0,
    message: firstFieldError && firstFieldError[1]
      ? `${firstFieldError[0]}: ${Array.isArray(firstFieldError[1]) ? firstFieldError[1][0] : ''}`
      : 'An unexpected error occurred'
  }
}