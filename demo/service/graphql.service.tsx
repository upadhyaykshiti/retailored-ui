const API_BASE_URL = 'https://dbe4-49-36-232-74.ngrok-free.app/graphql';

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
};