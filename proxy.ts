import { authEdge } from '@/auth-edge'
 
export default authEdge
 
export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/proxy#matcher
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/user/:path*',
    '/order/:path*',
    '/shipping-address',
    '/payment-method',
    '/place-order'
  ],
}