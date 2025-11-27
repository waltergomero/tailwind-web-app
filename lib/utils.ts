// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error:any) {
  if (error.name === 'ZodError') {
    // Handle Zod error
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );

    return fieldErrors.join('. ');
  } else {
    // Handle other errors
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message);
  }
}

// Convert prisma object into a regular JS object
export function convertToPlainObject(value: unknown) {
  return structuredClone(value);
}
