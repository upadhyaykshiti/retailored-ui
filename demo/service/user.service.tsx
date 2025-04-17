import { GraphQLService } from './graphql.service';
import { Demo } from '@/types';

export const UserService = {
  async getUsers(token?: string): Promise<Demo.User[]> {
    const query = `
      query findUsers {
        users {
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
    `;
  
    const data = await GraphQLService.query<{ users: Demo.User[] }>(query, {}, token);
    return data.users;
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