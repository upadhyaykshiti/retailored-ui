import { GraphQLService } from './graphql.service';

export const AuthService = {
  async login(mobileNumber: string): Promise<{ otp: string }> {
    const mutation = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          otp
        }
      }
    `;
    const variables = { input: { mobileNumber } };
    const data = await GraphQLService.query<{ login: { otp: string } }>(mutation, variables);
    return data.login;
  },

  async otpVerify(
    mobileNumber: string,
    otp: string
  ): Promise<{
    token: string;
    user: {
      id: string;
      fname: string;
    };
  }> {
    const mutation = `
      mutation OtpVerify($input: TokenInput!) {
        otpVerify(input: $input) {
            token
            user {
            id
            fname
          }
        }
      }
    `;
    const variables = { input: { mobileNumber, otp } };
    const data = await GraphQLService.query<{
      otpVerify: {
        token: string;
        user: {
          id: string;
          fname: string;
        };
      };
    }>(mutation, variables);
    
    return data.otpVerify;
  },
};