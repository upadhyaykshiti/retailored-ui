import { GraphQLService } from './graphql.service';

export const JobberService = {
  async getJobbers(
    first: number = 5,
    page: number = 1,
    search?: string
  ): Promise<{ data: any[]; paginatorInfo: any }> {
    const query = `
      query JobberPaginateList($first: Int!, $page: Int) {
        jobberPaginateList(first: $first, page: $page) {
          data {
            code
            cmpcode
            sitename
            site_type
            ext
            mobileNumber
            email
            siteadd
          }
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
        }
      }
    `;

    const variables = { first, page, search };
    const data = await GraphQLService.query<{ 
      jobberPaginateList: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables);
    
    return {
      data: data.jobberPaginateList.data,
      paginatorInfo: data.jobberPaginateList.paginatorInfo
    };
  },

  async createJobber(
    input: {
      sitename: string;
      site_type: string;
      ext: string;
      mobileNumber?: string;
      email?: string;
      siteadd?: string;
      cmpcode?: number;
    }
  ): Promise<{ code: string }> {
    const mutation = `
      mutation CreateJobber($input: AdminSiteInput!) {
        createJobber(input: $input) {
          code
          sitename
        }
      }
    `;

    const variables = { input };
    const data = await GraphQLService.query<{ 
      createJobber: {
        code: string;
        sitename: string;
      } 
    }>(mutation, variables);
    
    return data.createJobber;
  },

  async updateJobber(
    id: string,
    input: {
      sitename?: string;
      ext?: string;
      site_type?: string;
      mobileNumber?: string;
      email?: string;
      siteadd?: string;
      cmpcode?: number;
    }
  ): Promise<{ code: string }> {
    const mutation = `
      mutation UpdateJobber($id: ID!, $input: UpdateAdminSiteInput!) {
        updateJobber(id: $id, input: $input) {
          code
          sitename
        }
      }
    `;

    const variables = { id, input };
    const data = await GraphQLService.query<{
      updateJobber: {
        code: string;
        sitename: string;
      }
    }>(mutation, variables);

    return data.updateJobber;
  }
};