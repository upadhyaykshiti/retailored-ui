import { GraphQLService } from './graphql.service';

export const SalesOrderService = {
  async getSalesOrders(token?: string): Promise<any[]> {
    const query = `
      query OrderMains {
        orderMains {
          id
          user_id
          docno
          order_date
          delivered_qty
          cancelled_qty
          tentitive_delivery_date
          amt_due
          ord_amt
          desc1
          orderStatus {
            id
            status_name
          }
        }
      }
    `;
    const data = await GraphQLService.query<{ orderMains: any[] }>(query, {}, token);
    return data.orderMains;
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
};