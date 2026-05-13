import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function signOut() {
  "use server";

  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function CrmLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <header>
        <nav>
          <strong>Autovalet CRM</strong>
          <div className="nav-links">
            <Link href="/crm">Dashboard</Link>
            <Link href="/crm/enquiries">Enquiries</Link>
            <Link href="/crm/active-projects">Active Projects</Link>
            <form action={signOut}>
              <button type="submit">Sign out</button>
            </form>
          </div>
        </nav>
      </header>
      {children}
    </>
  );
}
