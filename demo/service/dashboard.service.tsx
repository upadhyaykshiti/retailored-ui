import { GraphQLService } from "./graphql.service";

export const DashboardService = {
  async getDashboardStats(): Promise<{
    jobOrderCount: number;
    pendingJobOrderCount: number;
    salesOrderCount: number;
    ordersThisWeek: number;
    pendingSalesOrderCount: number;
    monthlyCounts: {
      month: string;
      order_count: number;
      job_order_count: number;
    }[];
    orderDetailsThisWeek: {
      admsite_code: string;
      sitename: string;
      count: number;
    }[];
    jobOrderDetailsThisWeek: {
      admsite_code: string;
      sitename: string;
      count: number;
    }[];
  }> {
    const query = `
      query GetDashboardStats {
        getDashboardStats {
          jobOrderCount
          pendingJobOrderCount
          salesOrderCount
          ordersThisWeek
          pendingSalesOrderCount
          monthlyCounts {
            month
            order_count
            job_order_count
          }
          orderDetailsThisWeek {
            admsite_code
            sitename
            count
          }
          jobOrderDetailsThisWeek {
            admsite_code
            sitename
            count
          }
        }
      }
    `;

    const response = await GraphQLService.query<{ getDashboardStats: any }>(query);
    
    return response.getDashboardStats;
  },
};