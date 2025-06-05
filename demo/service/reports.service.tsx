import { GraphQLService } from './graphql.service';

export const ReportsService = {
  async getPendingSalesOrders(
    page: number = 1,
    first: number = 10,
    search: string | null = null
  ): Promise<{ data: any[]; paginatorInfo: any }> {
    const query = `
      query GetPendingSalesOrder($first: Int!, $page: Int!) {
        getPendingSalesOrder(first: $first, page: $page) {
          paginatorInfo {
            total
            count
            perPage
            currentPage
            lastPage
            hasMorePages
          }
          data {
            id
            order_id
            productId
            productName
            productRef
            docno
            deliveryDate
            admsite_code
            customerName
            statusId
            status
            jobOrderStatus {
              id
              job_order_main_id
              status
              status_name
            }
          }
        }
      }
    `;

    const variables = { page, first, search };

    const data = await GraphQLService.query<{
      getPendingSalesOrder: {
        data: any[];
        paginatorInfo: any;
      };
    }>(query, variables);

    return {
      data: data.getPendingSalesOrder.data,
      paginatorInfo: data.getPendingSalesOrder.paginatorInfo
    };
  },

  async getPendingJobOrders(
    search: string | null = null,
    first: number = 10,
    page: number = 1
  ): Promise<{ data: any[]; paginatorInfo: any }> {
    const query = `
      query GetPendingJobOrder($first: Int!, $page: Int!) {
        getPendingJobOrder(first: $first, page: $page) {
          paginatorInfo {
            total
            count
            perPage
            currentPage
            lastPage
            hasMorePages
          }
          data {
            id
            job_order_id
            sales_order_id
            admsite_code
            jobberName
            productId
            productName
            docno
            productRef
            making_charges
            job_date
            statusId
            status
          }
        }
      }
    `;

    const variables = { search, page, first };

    const data = await GraphQLService.query<{
      getPendingJobOrder: {
        data: any[];
        paginatorInfo: any;
      };
    }>(query, variables);

    return {
      data: data.getPendingJobOrder.data,
      paginatorInfo: data.getPendingJobOrder.paginatorInfo
    };
  },

  async deleteSalesOrderItem(id: string): Promise<boolean> {
    const query = `
      mutation DeleteSalesOrderItem($id: ID!) {
        deleteSalesOrderItem(id: $id) {
        }
      }
    `;

    const variables = { id };

    const data = await GraphQLService.query<{
      deleteSalesOrderItem: {
        success: boolean;
        message: string;
      };
    }>(query, variables);

    return data.deleteSalesOrderItem.success;
  },
};