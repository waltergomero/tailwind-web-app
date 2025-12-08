import { authEdge } from '@/auth-edge'
 
export default authEdge
 
export const config = {
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
