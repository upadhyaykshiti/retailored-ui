import { GraphQLService } from './graphql.service';

export const SalesOrderService = {
  async getSalesOrders( page: number = 1, perPage: number = 2, token?: string): Promise<{ data: any[]; pagination: any }> {
    const query = `
      query OrderMains($first: Int!, $page: Int!) {
        orderMains(first: $first, page: $page) {
          paginatorInfo {
            count
            currentPage
            firstItem
            lastItem
            lastPage
            perPage
            total
            hasMorePages
          }
          data {
            id
            user_id
            docno
            order_date
            amt_paid
            amt_due
            cancelled_qty
            tentitive_delivery_date
            delivered_qty
            ord_amt
            desc1
            user {
              id
              fname
            }
            orderStatus {
              id
              status_name
            }
          }
        }
      }
    `;
    
    const variables = {
      first: perPage,
      page: page
    };

    const data = await GraphQLService.query<{ 
      orderMains: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables, token);

    return {
      data: data.orderMains.data,
      pagination: data.orderMains.paginatorInfo
    };
  },

  async getActiveCustomers(
    page: number = 1,
    perPage: number = 2,
    search: string | null = null,
    token?: string
  ): Promise<{ data: any[]; pagination: any }> {
    const query = `
      query Users($first: Int!, $page: Int!, $search: String) {
        users(first: $first, page: $page, search: $search) {
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
            fname
            lname
            email
            mobileNumber
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
      users: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables, token);

    return {
      data: data.users.data,
      pagination: data.users.paginatorInfo
    };
  },

  async getActiveMaterials(
    page: number = 1,
    perPage: number = 10,
    search: string | null = null,
    token?: string
  ): Promise<{ data: any[]; pagination: any }> {
    const query = `
      query MaterialMasters($first: Int!, $page: Int, $search: String) {
        materialMasters(first: $first, page: $page, search: $search) {
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
            name
            img_url
            wsp
            mrp
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
      materialMasters: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables, token);

    return {
      data: data.materialMasters.data,
      pagination: data.materialMasters.paginatorInfo
    };
  },

  async getMeasurementData(user_id: string, material_master_id: string, token?: string): Promise<any> {
    const query = `
      query GetMeasurementData($user_id: ID!, $material_master_id: ID!) {
        getMeasurementData(user_id: $user_id, material_master_id: $material_master_id) {
          masters {
            id
            measurement_name
            data_type
            seq
            measurementDetail {
              id
              measurement_main_id
              measurement_master_id
              measurement_val
            }
          }
        }
      }
    `;
  
    const variables = { 
      user_id, 
      material_master_id 
    };
    
    const data = await GraphQLService.query<{ 
      getMeasurementData: { 
        masters: any[] 
      } 
    }>(query, variables, token);
    
    return data.getMeasurementData.masters;
  },

  async getSalesOrderById(id: string, token?: string): Promise<any> {
    const query = `
      query OrderMain($id: ID!) {
        orderMain(id: $id) {
          id
          user_id
          docno
          order_date
          ord_amt
          amt_paid
          amt_due
          ord_qty
          delivered_qty
          cancelled_qty
          tentitive_delivery_date
          delivery_date
          desc1
          ext
          orderStatus {
            id
            status_name
          }
          orderDetails {
            id
            order_id
            measurement_main_id
            image_url
            material_master_id
            trial_date
            delivery_date
            item_amt
            ord_qty
            delivered_qty
            cancelled_qty
            desc1
            ext
          }
        }
      }
    `;
    const variables = { id };
    const data = await GraphQLService.query<{ orderMain: any }>(query, variables, token);
    return data.orderMain;
  },

  async createOrderWithDetails(
    input: {
      user_id: number;
      docno: string;
      order_date: string;
      type_id: number;
      order_details: Array<{
        material_master_id: number;
        image_url: string;
        item_amt: number;
        item_discount: number;
        ord_qty: number;
        trial_date: string;
        delivery_date: string;
        status_id: number;
        measurement_main: Array<{
          user_id: number;
          docno: string;
          material_master_id: number;
          measurement_date: string;
          details: Array<{
            measurement_master_id: number;
            measurement_val: string;
          }>;
        }>;
      }>;
    },
    token?: string
  ): Promise<{ id: number }> {
    const mutation = `
      mutation CreateOrderWithDetails($input: CreateOrderWithDetailsInput!) {
        createOrderWithDetails(input: $input) {
          id
        }
      }
    `;
  
    const variables = { input };
    
    try {
      const data = await GraphQLService.query<{ 
        createOrderWithDetails: { id: number } 
      }>(mutation, variables, token);
      
      return data.createOrderWithDetails;
    } catch (error) {
      console.error('Error creating order with details:', error);
      throw new Error('Failed to create order with details');
    }
  },
};