import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function signIn(formData) {
  "use server";

  const email = formData.get("email");
  const redirectTo = formData.get("redirectTo") || "/crm";
  const origin = headers().get("origin");
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
    }
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login/check-email");
}

export default function LoginPage({ searchParams }) {
  const redirectedFrom = searchParams?.redirectedFrom || "/crm";

  return (
    <main className="stack">
      <h1>Login</h1>
      <p className="muted">Use your approved email address to access CRM pages.</p>
      <form className="panel form-grid" action={signIn}>
        <input type="hidden" name="redirectTo" value={redirectedFrom} />
        <label className="span-2">
          Email
          <input type="email" name="email" required />
        </label>
        <button className="primary" type="submit">
          Send login link
        </button>
      </form>
    </main>
  );
}
