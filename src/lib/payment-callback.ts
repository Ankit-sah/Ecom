/** Accept new path callbacks and recover older links with a second '?' from a gateway. */
export function paymentCallbackParams(rawUrl: string, pathOrderId?: string) {
  const url = new URL(rawUrl);
  // eSewa may append ?data= even when the configured return URL already has a query.
  url.search = url.search.replace(/\?(?=(?:data|pidx)=)/g, "&");
  if (pathOrderId) url.searchParams.set("order_id", pathOrderId);
  return url.searchParams;
}
