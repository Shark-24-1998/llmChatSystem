  import { createServerClient } from "@supabase/ssr";

  export const createSupabaseServer = (req) => {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            if (!req || !req.headers) return [];

            const cookieHeader = req.headers.get("cookie") || "";

            if (!cookieHeader) return [];

            return cookieHeader.split(";").map((cookie) => {
              const [name, ...rest] = cookie.trim().split("=");
              return {
                name,
                value: rest.join("="),
              };
            });
          },
          setAll() {},
        },
      } 
    );
  };