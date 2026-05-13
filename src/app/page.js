import Link from "next/link";

export default function HomePage() {
  return (
    <main className="stack">
      <h1>Project Enquiry & Active Project Management</h1>
      <p className="muted">
        Production CRM data is stored in Supabase. Code deployments through
        GitHub and Vercel do not overwrite CRM records.
      </p>
      <Link className="button primary" href="/crm">
        Open CRM
      </Link>
    </main>
  );
}
