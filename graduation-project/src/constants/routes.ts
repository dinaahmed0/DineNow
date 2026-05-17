export const APP_ROUTES = {
  home: '/',
  login: '/login',
  logout: '/logout',
  signup: '/signup',
  forgotPassword: '/forgotPassword',
  resetPassword: '/resetPassword',
  changePassword: '/change-password',
  confirmEmail: '/confirm-email',
  search: '/search',
  restaurantDetails: '/restaurant',
  restaurants: '/restaurants',
  restaurantAdmin: '/admin/restaurants',
  reserve: '/reserve',
  reservationConfirmed: '/reservationConfirmed',
  myReservations: '/my-reservations',
  favorites: '/favorites',
  profile: '/profile',
  spots: '/spots',
  about: '/about',
  cafes: '/cafes',
} as const;

/** Routes accessible without authentication */
export const PUBLIC_ROUTES: readonly string[] = [
  APP_ROUTES.home,
  APP_ROUTES.login,
  APP_ROUTES.signup,
  APP_ROUTES.forgotPassword,
  APP_ROUTES.resetPassword,
  APP_ROUTES.changePassword,
  APP_ROUTES.confirmEmail,
];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

