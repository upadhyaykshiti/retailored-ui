import { GraphQLService } from './graphql.service';

export const VendorService = {
  async getVendors(
    first: number = 5,
    page: number = 1
  ): Promise<{ data: any[]; paginatorInfo: any }> {
    const query = `
      query VendorPaginateList($first: Int!, $page: Int) {
        vendorPaginateList(first: $first, page: $page) {
          data {
            code
            sitename
            site_type
            ext
            cmpcode
            mobileNumber
            email
          }
          paginatorInfo {
            count
            currentPage
            hasMorePages
            lastPage
            perPage
            total
          }
        }
      }
    `;

    const variables = { first, page };
    const data = await GraphQLService.query<{ 
      vendorPaginateList: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables);
    
    return {
      data: data.vendorPaginateList.data,
      paginatorInfo: data.vendorPaginateList.paginatorInfo
    };
  },

  async createVendor(
    input: {
      sitename?: string | null;
      site_type?: string | null;
      ext?: string | null;
      cmpcode?: string | null;
      mobileNumber?: string | null;
      email?: string | null;
    }
  ): Promise<{ code: string }> {
    const mutation = `
      mutation CreateVendor($input: AdminSiteInput!) {
        createVendor(input: $input) {
          code
          sitename
        }
      }
    `;

    const variables = { input };
    const data = await GraphQLService.query<{ 
      createVendor: {
        code: string;
        sitename: string;
      } 
    }>(mutation, variables);
    
    return data.createVendor;
  },

  async updateVendor(
    id: string,
    input: {
      sitename?: string | null;
      site_type?: string | null;
      ext?: string | null;
      cmpcode?: string | null;
      mobileNumber?: string | null;
      email?: string | null;
    }
  ): Promise<{ code: string }> {
    const mutation = `
      mutation UpdateVendor($id: ID!, $input: UpdateAdminSiteInput!) {
        updateVendor(id: $id, input: $input) {
          code
          sitename
        }
      }
    `;

    const variables = { id, input };
    const data = await GraphQLService.query<{ 
      updateVendor: {
        code: string;
        sitename: string;
      } 
    }>(mutation, variables);
    
    return data.updateVendor;
  },
};