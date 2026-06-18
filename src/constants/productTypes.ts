// Product type ids mirror the backend `product_type` table and drive the
// purchase form on the single product page.
export const PRODUCT_TYPE_USER_ID = 1; // Direct Recharge — requires a player/user ID
export const PRODUCT_TYPE_CODE = 2; // Recharge By Code — plain quantity
export const PRODUCT_TYPE_PHONE = 3; // Telecommunication Charge — requires a phone number
export const PRODUCT_TYPE_COIN = 4; // Coin Recharge — coin counter (by block) + player ID
