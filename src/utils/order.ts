import { Order } from '@/context/AuthContext';
import { ProcessedOrder } from '@/components/dashboard/orderRow';

/**
 * Maps a raw API order onto the shape My Orders and the order detail page both render.
 *
 * Shared so the status-id mapping and recipient-info formatting live in exactly one
 * place — my-orders.tsx and the order detail page need the identical transform, and a
 * second copy is how the two pages would eventually disagree on what "pending" means.
 */
export function toProcessedOrder(order: Order): ProcessedOrder {
  let status: 'accepted' | 'rejected' | 'pending' = 'pending';
  if (order.statuses_id === 1) status = 'accepted';
  else if (order.statuses_id === 2) status = 'rejected';
  else if (order.statuses_id === 3) status = 'pending';

  const title = `${order.product_variation.product.name} | ${order.product_variation.name}`;
  const value = `$${parseFloat(order.total_price).toFixed(2)}`;

  let recipient_info = '';
  if (order.recipient_user) {
    recipient_info = `User ID: ${order.recipient_user}`;
  } else if (order.recipient_phone_number) {
    recipient_info = `Phone: ${order.recipient_phone_number}`;
  }

  return {
    id: order.id,
    status,
    title,
    value,
    date: order.created_at,
    quantity: order.quantity,
    recipient_info,
    Customer: {
      username: order.users.username,
      email: order.users.email,
      phone_number: order.users.phone_number,
      country: order.users.country,
      business_location: order.users.business_location,
      business_name: order.users.business_name,
    },
    code: order?.code,
  };
}
