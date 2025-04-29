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

  async getOrdersList(
    page: number = 1,
    perPage: number = 10,
    search: string | null = null,
    token?: string
  ): Promise<{ data: any[]; pagination: any }> {
    const query = `
      query OrderDetails($first: Int!, $page: Int!, $search: String) {
        orderDetails(first: $first, page: $page, search: $search) {
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
            order_id
            orderMain {
              docno
              user {
                id
                fname
              }
              orderDetails {
                material {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `;
  
    const variables = {
      first: perPage,
      page: page,
      search: search
    };
  
    const data = await GraphQLService.query<{ 
      orderDetails: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables, token);
  
    return {
      data: data.orderDetails.data,
      pagination: data.orderDetails.paginatorInfo,
    };
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
  },
  
  async getJobOrdersDetails(jobOrderId: string, token?: string): Promise<any> {
    const query = `
      query JobOrderMain($id: ID!) {
        jobOrderMain(id: $id) {
          jobOrderDetails {
            image_url
            trial_date
            delivery_date
            item_cost
            item_discount
            ord_qty
            delivered_qty
            cancelled_qty
            desc1
            orderDetail {
              material {
                name
                id
              }
              measurementMain {
                id
                docno
                user {
                  fname
                }
                measurementDetails {
                  measurement_master_id
                  measurement_val
                  measurementMaster {
                    id
                    measurement_name
                  }
                }
              }
            }
          }
        }
      }
    `;
  
    const variables = {
      id: jobOrderId
    };
  
    const data = await GraphQLService.query<any>(query, variables, token);
    return {
      jobOrderDetails: data.jobOrderMain.jobOrderDetails
    };
  }
};