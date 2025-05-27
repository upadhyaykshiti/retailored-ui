import { GraphQLService } from "./graphql.service";

export const PendingPaymentsService = {
  async getPendingReceipts(
    first: number = 5,
    page: number = 1,
    search: string | null = null
  ): Promise<{ data: any[]; pagination: any }> {
    const query = `
      query GetPendingReceipts($first: Int!, $page: Int!, $search: String) {
        getPendingReceipts(first: $first, page: $page, search: $search) {
          paginatorInfo {
            count
            currentPage
            firstItem
            hasMorePages
            lastItem
            lastPage
            perPage
            total
          }
          data {
            id
            amt_paid
            amt_due
            user {
              id
              fname
              admsite_code
            }
          }
        }
      }
    `;
  
    const variables = {
      first: first,
      page: page,
      search: search
    };
  
    const response = await GraphQLService.query<{ 
      getPendingReceipts: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables);
  
    return {
      data: response.getPendingReceipts.data,
      pagination: response.getPendingReceipts.paginatorInfo,
    };
  },

  async getPendingPayments(
    first: number = 5,
    page: number = 1,
    search: string | null = null
  ): Promise<{ data: any[]; pagination: any }> {
    const query = `
      query GetPendingPayments($first: Int!, $page: Int!, $search: String) {
        getPendingPayments(first: $first, page: $page, search: $search) {
          paginatorInfo {
            count
            currentPage
            firstItem
            hasMorePages
            lastItem
            lastPage
            perPage
            total
          }
          data {
            id
            amt_paid
            amt_due
            jobOrderDetails {
              adminSite {
                sitename
                code
              }
            }
          }
        }
      }
    `;
  
    const variables = {
      first: first,
      page: page,
      search: search
    };
  
    const response = await GraphQLService.query<{ 
      getPendingPayments: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables);
  
    return {
      data: response.getPendingPayments.data,
      pagination: response.getPendingPayments.paginatorInfo,
    };
  }
};