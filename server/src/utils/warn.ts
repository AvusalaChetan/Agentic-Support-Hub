export const warn = (
  CLIENT_URL: string,
  GROQ_API: string|undefined,
  MONGODB_URI: string|undefined,
): void => {
  if (!CLIENT_URL)
    console.warn(
      "CLIENT_URL not set. Defaulting to http://localhost:5173. Set CLIENT_URL in .env to change this.",
      CLIENT_URL
    );
  if (!GROQ_API)
    console.warn(
      "GROQ_API_KEY not set. Grok API calls will fail. Set GROQ_API_KEY in .env to enable Grok features.",
    );
  if (!MONGODB_URI)
    console.warn(
      "MONGODB_URI not set. Database features will be disabled. Set MONGODB_URI in .env to enable database connection.",
    );
};
