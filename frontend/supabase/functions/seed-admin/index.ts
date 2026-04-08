import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adminEmail = "admin@gmail.com";
  const adminPassword = "admin@123";

  // Check if admin already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const adminExists = existingUsers?.users?.find((u) => u.email === adminEmail);

  if (adminExists) {
    // Ensure admin role exists
    const { data: roleCheck } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", adminExists.id)
      .eq("role", "admin")
      .single();

    if (!roleCheck) {
      // Update existing role to admin or insert
      await supabase
        .from("user_roles")
        .upsert({ user_id: adminExists.id, role: "admin" }, { onConflict: "user_id,role" });
    }

    return new Response(JSON.stringify({ message: "Admin already exists", id: adminExists.id }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create admin user
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: "Admin" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Set role to admin (the trigger creates 'tenant' by default, so update it)
  await supabase
    .from("user_roles")
    .update({ role: "admin" })
    .eq("user_id", newUser.user.id);

  return new Response(JSON.stringify({ message: "Admin created", id: newUser.user.id }), {
    headers: { "Content-Type": "application/json" },
  });
});
