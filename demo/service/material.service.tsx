import { GraphQLService } from './graphql.service';

export const MaterialService = {
  async getMaterialMasters(
    search: string | null = null,
    first: number = 10,
    page: number = 1
  ): Promise<{ data: any[]; paginatorInfo: any }> {
    const query = `
      query MaterialMasters($search: String, $first: Int!, $page: Int) {
        materialMasters(search: $search, first: $first, page: $page) {
          paginatorInfo {
            count
            currentPage
            hasMorePages
            lastPage
            perPage
            total
          }
          data {
            id
            name
            image_url
            material_type
            isSaleable
            wsp
            mrp
            vendor_id
            measurements {
              id
              material_master_id
              measurement_name
              data_type
              seq
            }
            priceChart {
              id
              material_id
              job_or_sales
              price
              ext
              type {
                id
                type_name
              }
            }
            ext
          }
        }
      }
    `;

    const variables = { search, first, page };
    const data = await GraphQLService.query<{ 
      materialMasters: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables);
    
    return {
      data: data.materialMasters.data,
      paginatorInfo: data.materialMasters.paginatorInfo
    };
  },

  async getOrderTypes(
    first: number = 50,
    page: number = 1
  ): Promise<{ data: any[]; paginatorInfo: any }> {
    const query = `
      query OrderTypes($first: Int!, $page: Int) {
        orderTypes(first: $first, page: $page) {
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
            type_name
            job_or_sales
            ext
            created_at
            updated_at
          }
        }
      }
    `;

    const variables = { first, page };
    const data = await GraphQLService.query<{ 
      orderTypes: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables);
    
    return {
      data: data.orderTypes.data,
      paginatorInfo: data.orderTypes.paginatorInfo
    };
  },

  async createMaterialWithMeasurements(input: {
    name: string;
    image_url: string[];
    material_type: string;
    isSaleable: string;
    wsp: number;
    mrp: number;
    vendor_id: number;
    ext: string;
    measurements: {
      measurement_name: string;
      data_type: string;
      seq: number;
    }[];
    priceChart: {
      type_id: number;
      job_or_sales: string;
      price: number;
    }[];
  }): Promise<any> {
    const mutation = `
      mutation CreateMaterialWithMeasurements($input: CreateMaterialMasterInput!) {
        createMaterialWithMeasurements(input: $input) {
          id
          name
        }
      }
    `;
    const variables = { input };
    const data = await GraphQLService.query<{ createMaterialMaster: any }>(mutation, variables);
    return data.createMaterialMaster;
  },

  async updateMaterialWithMeasurements(id: string, input: {
    name?: string;
    image_url?: string[];
    material_type?: string;
    isSaleable?: string;
    wsp?: number;
    mrp?: number;
    vendor_id?: number;
    ext?: string;
    measurements?: {
      id?: number;
      measurement_name?: string;
      data_type?: string;
      seq?: number;
    }[];
    priceChart?: {
      id?: number;
      type_id: number;
      job_or_sales: string;
      price: number;
    }[];
  }): Promise<any> {
    const mutation = `
      mutation UpdateMaterialWithMeasurements($id: ID!, $input: UpdateMaterialMasterInput!) {
        updateMaterialWithMeasurements(id: $id, input: $input) {
          id
          name
        }
      }
    `;
    const variables = { id, input };
    const data = await GraphQLService.query<{ updateMaterialMaster: any }>(mutation, variables);
    return data.updateMaterialMaster;
  },

  async updateMaterialStatus(id: string, input: {
    ext: string;
  }): Promise<any> {
    const mutation = `
      mutation UpdateMaterialMaster($id: ID!, $input: UpdateMaterialMasterInput!) {
        updateMaterialMaster(id: $id, input: $input) {
          id
        }
      }
    `;
    const variables = { id, input };
    const data = await GraphQLService.query<{ updateMaterialMaster: any }>(mutation, variables);
    return data.updateMaterialMaster;
  }
};