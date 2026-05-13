import { createClient } from "@/lib/supabase/server";
import CrmRealtimeRefresh from "./CrmRealtimeRefresh";

export default async function CrmPage() {
  const supabase = createClient();
  const [{ count: enquiryCount }, { count: projectCount }] = await Promise.all([
    supabase.from("enquiries").select("id", { count: "exact", head: true }),
    supabase.from("active_projects").select("id", { count: "exact", head: true })
  ]);

  return (
    <main className="stack">
      <CrmRealtimeRefresh />
      <h1>CRM Dashboard</h1>
      <div className="grid">
        <section className="panel row">
          <p className="muted">Enquiries</p>
          <h2>{enquiryCount ?? 0}</h2>
        </section>
        <section className="panel row">
          <p className="muted">Active Projects</p>
          <h2>{projectCount ?? 0}</h2>
        </section>
      </div>
    </main>
  );
}
