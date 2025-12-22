import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Global function to handle 401 errors - will redirect to login
function handleUnauthorized() {
  // Clear auth storage
  localStorage.removeItem("auth-storage");

  // Clear all query cache
  queryClient.clear();

  // Redirect to login if not already there
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export async function apiRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
  } = {},
): Promise<any> {
  const { method = "GET", body } = options;

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Authentication required");
  }

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw" | "redirect";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      if (unauthorizedBehavior === "redirect") {
        handleUnauthorized();
        return null;
      }
      // "throw" behavior
      handleUnauthorized();
      throw new Error("Authentication required");
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "redirect" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if (error instanceof Error && error.message.includes("401")) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        // Handle 401 errors in mutations
        if (error instanceof Error && error.message.includes("401")) {
          handleUnauthorized();
        }
      },
    },
  },
});
