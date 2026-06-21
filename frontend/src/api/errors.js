export function getErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.errors?.length) return data.errors.join(', ');
  if (data?.message) return data.message;
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
}
