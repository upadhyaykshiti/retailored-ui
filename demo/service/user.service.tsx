import { GraphQLService } from './graphql.service';
import { Demo } from '@/types';

export const UserService = {
  async getUsers(
    search: string | null = null,
    first: number = 10,
    page: number = 1,
    token?: string
  ): Promise<{ data: any[]; paginatorInfo: any }> {
    const query = `
      query Users($search: String, $first: Int!, $page: Int) {
        users(search: $search, first: $first, page: $page) {
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
            username
            alternateContact
            dob
            sex
            anniversary
            isCustomer
            active
          }
        }
      }
    `;
  
    const variables = { search, first, page };
    const data = await GraphQLService.query<{ 
      users: {
        paginatorInfo: any;
        data: any[];
      } 
    }>(query, variables, token);
    
    return {
      data: data.users.data,
      paginatorInfo: data.users.paginatorInfo
    };
  },
  
  async createUser(input: Demo.CreateUserInput, token?: string): Promise<Demo.User> {
    const mutation = `
      mutation CreateCustomer($input: CreateCustomerInput!) {
        createCustomer(input: $input) {
          id
          fname
          lname
          email
          mobileNumber
          username
          alternateContact
          dob
          sex
          anniversary
          isCustomer
          active
          rlcode
          cmpcode
          admsite_code
          user_type
          ext
        }
      }
    `;

    const data = await GraphQLService.query<{ createCustomer: Demo.User }>(mutation, { input }, token);
    return data.createCustomer;
  },

  async updateUser(id: string, input: Demo.UpdateUserInput, token?: string): Promise<Demo.User> {
    const mutation = `
      mutation UpdateCustomer($id: ID!, $input: UpdateUserInput!) {
        updateCustomer(id: $id, input: $input) {
          id
          fname
          lname
          email
          mobileNumber
          username
          alternateContact
          dob
          sex
          anniversary
          isCustomer
          active
          rlcode
          cmpcode
          admsite_code
          user_type
          ext
        }
      }
    `;

    const data = await GraphQLService.query<{ updateCustomer: Demo.User }>(
      mutation,
      { id, input },
      token
    );
    return data.updateCustomer;
  },
};