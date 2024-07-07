import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/monitoring(.*)",
  "/api/(.*)", // "allowing" api routes since we want the API to return errors rather than redirecting to sign-in
  "/users/test(.*)",
]);

export default clerkMiddleware((auth, req) => {
  console.log("🚀 ~ clerkMiddleware ~ req.nextUrl:", req.nextUrl);
  console.log("🚀 ~ clerkMiddleware ~ req.nextUrl:", req.nextUrl.searchParams);
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
