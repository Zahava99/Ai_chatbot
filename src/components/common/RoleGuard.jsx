import { Outlet, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "@/stores/useAuthStore";

/**
 * Normalises a role value (string | string[] | null) into a lowercase array.
 */
function toRoleArray(roles) {
  if (!roles) return [];
  return (Array.isArray(roles) ? roles : [roles]).map((r) => r.toLowerCase());
}

/**
 * Returns true when the user holds at least one of the required roles.
 * Passing an empty `allowed` array means "any authenticated user".
 *
 * Accepts both `user.roles` (array from /me API) and legacy `user.role`.
 */
export function hasRole(userRoles, allowed) {
  if (!allowed || allowed.length === 0) return true;
  const roles = toRoleArray(userRoles);
  return allowed.some((r) => roles.includes(r.toLowerCase()));
}

/**
 * Route guard — wraps a <Route> element.
 *
 * Props:
 *  - allowed  : string[]  roles that may access this route (omit = any authed user)
 *  - redirect : string    where to send unauthorised users (default "/")
 *
 * Usage:
 *  <Route element={<RoleGuard allowed={["admin", "lecturer"]} />}>
 *    <Route path="/admin" element={<AdminPage />} />
 *  </Route>
 */
export default function RoleGuard({ allowed = [], redirect = "/" }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Support both `roles` (array from /me API) and legacy `role` field
  const userRoles = user.roles ?? user.role;

  if (!hasRole(userRoles, allowed)) {
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
