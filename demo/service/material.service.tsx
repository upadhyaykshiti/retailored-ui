import { GraphQLService } from './graphql.service';
import { Demo } from '@/types';

export const MaterialService = {
  async getMaterialMasters(token?: string): Promise<Demo.MaterialMaster[]> {
    const query = `
      query MaterialMasters {
        materialMasters {
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
    `;
    const data = await GraphQLService.query<{ materialMasters: Demo.MaterialMaster[] }>(query, {}, token);
    return data.materialMasters;
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