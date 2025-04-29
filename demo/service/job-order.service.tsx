import { GraphQLService } from "./graphql.service";

export const JobOrderService = {
  async getJobberList(token?: string): Promise<any[]> {
    const query = `
      query JobberList {
        jobberList {
          code
          sitename
          site_type
          cmpcode
        }
      }
    `;

    const data = await GraphQLService.query<{ jobberList: any[] }>(query, undefined, token);

    return data.jobberList;
  },

  async getJobOrderMains(
    page: number = 1,
    perPage: number = 10,
    search: string | null = null,
    token?: string
  ): Promise<{ data: any[]; pagination: any }> {
    const query = `
      query JobOrderMains($first: Int!, $page: Int!, $search: String) {
        jobOrderMains(first: $first, page: $page, search: $search) {
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
            job_date
            status_id
            docno
            ord_qty
            delivered_qty
            cancelled_qty
            desc1
            status {
              id
              status_name
            }
          }
        }
      }
    `;
  
    const variables = {
      first: perPage,
      page: page,
      search: search,
    };
  
    const data = await GraphQLService.query<{ 
      jobOrderMains: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables, token);
  
    return {
      data: data.jobOrderMains.data,
      pagination: data.jobOrderMains.paginatorInfo,
    };
  }  
};