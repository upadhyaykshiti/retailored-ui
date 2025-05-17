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
      query OrderMains($first: Int!, $page: Int!, $search: String) {
        orderMains(first: $first, page: $page, search: $search) {
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
            docno
            orderDetails {
              id
              material {
                id
                name
              }
            }
            user {
              id
              fname
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
      orderMains: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables, token);

    return {
      data: data.orderMains.data,
      pagination: data.orderMains.paginatorInfo,
    };
  },

  async getOrderDetails(
    orderId: string,
    token?: string
  ): Promise<any> {
    const query = `
      query OrderDetail($id: ID!) {
        orderDetail(id: $id) {
          id
          image_url
          measurement_main_id
          material_master_id
          admsite_code
          trial_date
          delivery_date
          ord_qty
          item_ref
          material {
            name
          }
          measurementMain {
            id
            measurementDetails {
              id
              measurement_val
            }
            user {
              id
              fname
            }
          }
        }
      }
    `;

    const variables = {
      id: orderId
    };

    const data = await GraphQLService.query<{ orderDetail: any }>(query, variables, token);
    return data.orderDetail;
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
            admsite_code
            trial_date
            delivery_date
            item_amt
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
  },

  async getPaymentModes(token?: string): Promise<any> {
    const query = `
      query PaymentModes {
        paymentModes {
          id
          mode_name
        }
      }
    `;

    const data = await GraphQLService.query<any>(
      query,
      undefined,
      token
    );

    return data.paymentModes;
  },

  async createPaymentMain(
    input: {      
      user_id: number | null,
      order_id?: number,
      job_order_id?: number,
      admsite_code: number,
      payment_date: string;
      payment_mode: string;
      payment_ref?: string | null;
      payment_amt: number;
    },
    token?: string
  ): Promise<{ id: string }> {
    const mutation = `
      mutation CreatePaymentMain($input: CreatePaymentMainInput!) {
        createPaymentMain(input: $input) {
          id
        }
      }
    `;

    const inputData: any = {
      user_id: input.user_id,
      admsite_code: input.admsite_code,
      payment_date: input.payment_date,
      payment_mode: input.payment_mode,
      payment_amt: input.payment_amt
    };

    if (input.order_id !== undefined && input.order_id !== null) {
      inputData.order_id = input.order_id;
    }

    if (input.job_order_id !== undefined && input.job_order_id !== null) {
      inputData.job_order_id = input.job_order_id;
    }

    if (input.payment_ref !== undefined) {
      inputData.payment_ref = input.payment_ref;
    }

    const variables = {
      input: inputData
    };

    const data = await GraphQLService.mutation<{ 
      createPaymentMain: { id: string } 
    }>(mutation, variables, token);

    return data.createPaymentMain;
  },
  
  async markJobOrderDelivered(
    id: string,
    delivered_qty: number,
    token?: string
  ): Promise<{ id: string }> {
    const mutation = `
      mutation MarkOrderDelivered($input: MarkOrderDeliveredInput!, $id: ID!) {
        markOrderDelivered(input: $input, id: $id) {
          id
        }
      }
    `;

    const variables = {
      id: id,
      input: {
        delivered_qty: delivered_qty
      }
    };

    const data = await GraphQLService.mutation<{ 
      markOrderDelivered: { id: string } 
    }>(mutation, variables, token);

    return data.markOrderDelivered;
  },

  async markJobOrderCancelled(
    id: string,
    cancelled_qty: number,
    token?: string
  ): Promise<{ id: string }> {
    const mutation = `
      mutation MarkJobOrderCancelled($input: MarkJobOrderCancelledInput!, $id: ID!) {
        markJobOrderCancelled(input: $input, id: $id) {
          id
        }
      }
    `;

    const variables = {
      id: id,
      input: {
        cancelled_qty: cancelled_qty
      }
    };

    const data = await GraphQLService.mutation<{ 
      markJobOrderCancelled: { id: string } 
    }>(mutation, variables, token);

    return data.markJobOrderCancelled;
  },
  
  async createJobOrderwithInput(
    input: {
      job_date?: string | null;
      status_id?: string | null;
      docno?: string | null;
      job_details: Array<{
        admsite_code?: number | null;
        order_details_id?: string | null;
        material_master_id: string;
        measurement_main_id?: string;
        image_url?: string[] | null;
        item_amt?: number | null;
        ord_qty: number;
        trial_date: string | null;
        delivery_date: string | null;
      }>;
    },
    token?: string
  ): Promise<{ id: string }> {
    const mutation = `
      mutation CreateJobOrderwithInput($input: CreateJobWithDetailsInput!) {
        createJobOrderwithInput(input: $input) {
          id
        }
      }
    `;

    const variables = {
      input: {
        job_date: input.job_date || null,
        status_id: input.status_id || null,
        docno: input.docno || null,
        job_details: input.job_details.map(detail => ({
          admsite_code: detail.admsite_code || null,
          order_details_id: detail.order_details_id || null,
          material_master_id: detail.material_master_id,
          measurement_main_id: detail.measurement_main_id || null,
          image_url: detail.image_url || null,
          item_amt: detail.item_amt || null, 
          ord_qty: detail.ord_qty,
          trial_date: detail.trial_date,
          delivery_date: detail.delivery_date,
        }))
      }
    };

    const data = await GraphQLService.mutation<{ 
      createJobOrderwithInput: { id: string } 
    }>(mutation, variables, token);

    return data.createJobOrderwithInput;
  }
};