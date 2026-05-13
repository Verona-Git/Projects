import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import CrmRealtimeRefresh from "../CrmRealtimeRefresh";

async function createProject(formData) {
  "use server";

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("active_projects").insert({
    project_client: formData.get("project_client"),
    conveyor_type: formData.get("conveyor_type"),
    conveyor_quantity: Number(formData.get("conveyor_quantity") || 0),
    total_slot: Number(formData.get("total_slot") || 0),
    total_contract: Number(formData.get("total_contract") || 0),
    expect_installation: formData.get("expect_installation"),
    shipment_status: formData.get("shipment_status") || "Not Started",
    overall_status: formData.get("overall_status") || "In Progress",
    created_by: user?.id,
    updated_by: user?.id
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm/active-projects");
}

export default async function ActiveProjectsPage() {
  const supabase = createClient();
  const { data: projects = [] } = await supabase
    .from("active_projects")
    .select("id, project_client, conveyor_type, total_contract, shipment_status, overall_status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="stack">
      <CrmRealtimeRefresh />
      <h1>Active Projects</h1>
      <section className="panel">
        <div className="panel-heading">
          <h2>New project</h2>
        </div>
        <form className="form-grid" action={createProject}>
          <label>
            Project client
            <input name="project_client" required />
          </label>
          <label>
            Conveyor type
            <input name="conveyor_type" />
          </label>
          <label>
            Conveyor quantity
            <input type="number" name="conveyor_quantity" min="0" />
          </label>
          <label>
            Total slot
            <input type="number" name="total_slot" min="0" />
          </label>
          <label>
            Contract value
            <input type="number" name="total_contract" min="0" step="0.01" />
          </label>
          <label>
            Expected installation
            <input name="expect_installation" />
          </label>
          <label>
            Shipment status
            <input name="shipment_status" defaultValue="Not Started" />
          </label>
          <label>
            Overall status
            <input name="overall_status" defaultValue="In Progress" />
          </label>
          <button className="primary" type="submit">
            Save project
          </button>
        </form>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Saved projects</h2>
          <span className="muted">{projects.length} records</span>
        </div>
        {projects.map((project) => (
          <article className="row" key={project.id}>
            <strong>{project.project_client}</strong>
            <p className="muted">
              {[
                project.conveyor_type,
                project.total_contract && `USD ${project.total_contract}`,
                project.shipment_status,
                project.overall_status
              ]
                .filter(Boolean)
                .join(" | ")}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
