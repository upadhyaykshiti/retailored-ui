const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  }
};

const graphqlFetch = async <T = any>(
  query: string, 
  variables?: Record<string, any>,
  isMutation: boolean = false
): Promise<T> => {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(
        `GraphQL ${isMutation ? 'mutation' : 'query'} failed: ${response.statusText}. Details: ${errorDetails}`
      );
    }

    const { data, errors } = await response.json();

    if (errors) {
      throw new Error(errors.map((e: any) => e.message).join('\n'));
    }

    return data;
  } catch (error) {
    console.error(`GraphQL ${isMutation ? 'mutation' : 'query'} error:`, error);
    throw error;
  }
};

export const GraphQLService = {
  async query<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    return graphqlFetch<T>(query, variables, false);
  },

  async mutation<T = any>(mutation: string, variables?: Record<string, any>): Promise<T> {
    return graphqlFetch<T>(mutation, variables, true);
  },

  getAuthToken,
  handleUnauthorized
};