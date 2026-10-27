/** P1 仅展示层：积分 = 单价 × 张数；账本/退款移 P2 */
export function computeCredit(price: number, count: number): number {
  return price * count;
}
