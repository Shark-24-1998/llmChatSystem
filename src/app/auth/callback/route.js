import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(request){

  const supabase = await createSupabaseServer();

  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");

  if(code){
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/chat", request.url));
}