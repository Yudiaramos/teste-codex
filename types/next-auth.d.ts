import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: string;
      tenantSlug?: string;
    };
  }

  interface User {
    role?: string;
    tenantSlug?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    tenantSlug?: string;
  }
}
