import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import CrmRealtimeRefresh from "../CrmRealtimeRefresh";

async function createEnquiry(formData) {
  "use server";

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("enquiries").insert({
    client: formData.get("client"),
    contact_person: formData.get("contact_person"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    project_category: formData.get("project_category"),
    project_type: formData.get("project_type"),
    status: formData.get("status") || "New",
    notes: formData.get("notes"),
    created_by: user?.id,
    updated_by: user?.id
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm/enquiries");
}

export default async function EnquiriesPage() {
  const supabase = createClient();
  const { data: enquiries = [] } = await supabase
    .from("enquiries")
    .select("id, client, contact_person, email, country, project_type, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="stack">
      <CrmRealtimeRefresh />
      <h1>Enquiries</h1>
      <section className="panel">
        <div className="panel-heading">
          <h2>New enquiry</h2>
        </div>
        <form className="form-grid" action={createEnquiry}>
          <label>
            Client
            <input name="client" required />
          </label>
          <label>
            Contact person
            <input name="contact_person" />
          </label>
          <label>
            Email
            <input type="email" name="email" />
          </label>
          <label>
            Phone
            <input name="phone" />
          </label>
          <label>
            Country
            <input name="country" />
          </label>
          <label>
            Project category
            <input name="project_category" />
          </label>
          <label>
            Project type
            <input name="project_type" />
          </label>
          <label>
            Status
            <input name="status" defaultValue="New" />
          </label>
          <label className="span-2">
            Notes
            <textarea name="notes" />
          </label>
          <button className="primary" type="submit">
            Save enquiry
          </button>
        </form>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Saved enquiries</h2>
          <span className="muted">{enquiries.length} records</span>
        </div>
        {enquiries.map((enquiry) => (
          <article className="row" key={enquiry.id}>
            <strong>{enquiry.client}</strong>
            <p className="muted">
              {[enquiry.contact_person, enquiry.email, enquiry.country, enquiry.project_type, enquiry.status]
                .filter(Boolean)
                .join(" | ")}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
