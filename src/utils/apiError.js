// Turns a backend error into text to show the user. Validation errors come
// back as { message: ["Product name is required", "Costing is required"] },
// other errors as { message: "..." }. Multiple messages are joined one per line.

const formatMessage = (message) =>
  Array.isArray(message) ? message.join("\n") : message;

// For fetch(): call with the non-ok Response
export async function getFetchErrorMessage(res, fallback = "Something went wrong") {
  try {
    const data = await res.json();
    return formatMessage(data?.message) || fallback;
  } catch {
    return fallback;
  }
}

// For axios: call with the caught error
export function getAxiosErrorMessage(err, fallback = "Something went wrong") {
  return formatMessage(err?.response?.data?.message) || err?.message || fallback;
}
