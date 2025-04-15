import { GraphQLService } from './graphql.service';
import { Demo } from '@/types';

export const UserService = {
  async getUsers(): Promise<Demo.User[]> {
    const query = `
      query findUsers {
        users {
          id
          fname
          email
          mobileNumber
          dob
          sex
          isCustomer
          status
        }
      }
    `;

    const data = await GraphQLService.query<{ users: Demo.User[] }>(query);
    return data.users;
  },

  async createUser(input: Demo.CreateUserInput, token?: string): Promise<Demo.User> {
    const mutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          fname
          email
          mobileNumber
          dob
          sex
          isCustomer
          user_type
          rlcode
          cmpcode
          admsite_code
          status
        }
      }
    `;

    const data = await GraphQLService.query<{ createUser: Demo.User }>(mutation, { input });
    return data.createUser;
  },

  async updateUser(id: string, input: Demo.UpdateUserInput, token?: string): Promise<Demo.User> {
    const mutation = `
      mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          id
          fname
          email
          mobileNumber
          dob
          sex
          status
        }
      }
    `;

    const data = await GraphQLService.query<{ updateUser: Demo.User }>(
      mutation,
      { id, input },
      token
    );
    return data.updateUser;
  },
};