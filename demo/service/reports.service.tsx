import salesOrderReport from '../../public/demo/data/salesOrderReport.json';
import jobOrderReport from '../../public/demo/data/jobOrderReport.json';

export const ReportsService = {
  async getPendingSalesOrders(
    page: number = 1,
    perPage: number = 20,
    search: string | null = null
  ): Promise<{
    orders: any[];
    pagination: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasMorePages: boolean;
    };
  }> {
    const allOrders = salesOrderReport.orders;

    const filtered = search
      ? allOrders.filter((order) =>
          order.customerName.toLowerCase().includes(search.toLowerCase()) ||
          order.productName.toLowerCase().includes(search.toLowerCase())
        )
      : allOrders;

    const total = filtered.length;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);
    const lastPage = Math.ceil(total / perPage);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orders: paginated,
          pagination: {
            total,
            perPage,
            currentPage: page,
            lastPage,
            hasMorePages: page < lastPage
          }
        });
      }, 500);
    });
  },

  async getPendingJobOrders(
    page: number = 1,
    perPage: number = 20,
    search: string | null = null,
    statusFilter: string | null = null
  ): Promise<{
    jobOrders: any[];
    pagination: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasMorePages: boolean;
    };
  }> {
    const allJobOrders = jobOrderReport.jobOrders;

    const filtered = allJobOrders.filter((order) => {
      const matchesSearch = search
        ? order.customerName.toLowerCase().includes(search.toLowerCase()) ||
          order.product_name.toLowerCase().includes(search.toLowerCase()) ||
          order.reference.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesStatus = statusFilter
        ? order.status.toLowerCase() === statusFilter.toLowerCase()
        : true;

      return matchesSearch && matchesStatus;
    });

    const total = filtered.length;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);
    const lastPage = Math.ceil(total / perPage);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          jobOrders: paginated,
          pagination: {
            total,
            perPage,
            currentPage: page,
            lastPage,
            hasMorePages: page < lastPage
          }
        });
      }, 500);
    });
  }
};