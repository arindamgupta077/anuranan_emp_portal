/**
 * Fetch with automatic retry logic for network failures
 * Helps handle intermittent connectivity issues
 */

interface FetchWithRetryOptions extends RequestInit {
  retries?: number
  retryDelay?: number
  timeout?: number
}

export async function fetchWithRetry(
  url: RequestInfo | URL,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    ...fetchOptions
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on the last attempt
      if (attempt < retries) {
        console.warn(
          `Fetch attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`,
          error
        )
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries')
}
