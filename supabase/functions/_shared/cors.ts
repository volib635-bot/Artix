export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export function getCorsHeaders(req?: Request, allowedOrigins: string[] = []): Record<string, string> {
  const origin = req?.headers.get('origin') || '';
  const allowOrigin = (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) ? origin : (allowedOrigins[0] || '*');
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': allowOrigin,
  };
}
