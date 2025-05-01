const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export const GraphQLService = {
  async query<T = any>(query: string, variables?: Record<string, any>, token?: string): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`GraphQL query failed: ${response.statusText}. Details: ${errorDetails}`);
      }

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors.map((e: any) => e.message).join('\n'));
      }

      return data;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  },

  async mutation<T = any>(mutation: string, variables?: Record<string, any>, token?: string): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`GraphQL mutation failed: ${response.statusText}. Details: ${errorDetails}`);
      }

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors.map((e: any) => e.message).join('\n'));
      }

      return data;
    } catch (error) {
      console.error('GraphQL mutation error:', error);
      throw error;
    }
  },
};