import { GraphQLService } from './graphql.service';

export const MaterialService = {
  async getMaterialMasters(
    search: string | null = null,
    first: number = 10,
    page: number = 1,
    token?: string
  ): Promise<{ data: any[]; paginatorInfo: any }> {
    const query = `
      query MaterialMasters($search: String, $first: Int!, $page: Int) {
        materialMasters(search: $search, first: $first, page: $page) {
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
    }>(query, variables, token);
    
    return {
      data: data.materialMasters.data,
      paginatorInfo: data.materialMasters.paginatorInfo
    };
  },

  async createMaterialWithMeasurements(input: {
    name: string;
    img_url: string;
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
  }, token?: string): Promise<any> {
    const mutation = `
      mutation CreateMaterialWithMeasurements($input: CreateMaterialMasterInput!) {
        createMaterialWithMeasurements(input: $input) {
          id
          name
        }
      }
    `;
    const variables = { input };
    const data = await GraphQLService.query<{ createMaterialMaster: any }>(mutation, variables, token);
    return data.createMaterialMaster;
  },

  async updateMaterialWithMeasurements(id: string, input: {
    name?: string;
    img_url?: string;
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
  }, token?: string): Promise<any> {
    const mutation = `
      mutation UpdateMaterialWithMeasurements($id: ID!, $input: UpdateMaterialMasterInput!) {
        updateMaterialWithMeasurements(id: $id, input: $input) {
          id
          name
        }
      }
    `;
    const variables = { id, input };
    const data = await GraphQLService.query<{ updateMaterialMaster: any }>(mutation, variables, token);
    return data.updateMaterialMaster;
  },
};