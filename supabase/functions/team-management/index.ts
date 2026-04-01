import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller identity
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client for privileged operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { action } = body;

    // ── ACTIVATE (self-service, no admin check needed) ──
    if (action === "activate") {
      await adminClient.from("profiles").update({ status: "active" }).eq("user_id", caller.id);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is super_admin or admin
    const { data: isSuperAdmin } = await adminClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "super_admin",
    });
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isSuperAdmin && !isAdmin) {
      return new Response(JSON.stringify({ error: "Only admins can manage team" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── INVITE ──
    if (action === "invite") {
      const { email, full_name, role } = body;
      if (!email || !full_name || !role) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate role
      const validRoles = ["admin", "team_supervisor", "team_member"];
      if (!validRoles.includes(role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const appUrl = "https://sankash-new-website.lovable.app";
      const redirectTo = `${appUrl}/ops/accept-invite`;

      // Create user via admin API with invite
      // First check if user already exists
      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;

        // Ensure role row exists
        await adminClient.from("user_roles").upsert({ user_id: userId, role }, { onConflict: "user_id,role" });

        // Ensure profile exists and is set to invited
        const { data: existingProfile } = await adminClient.from("profiles").select("id").eq("user_id", userId).maybeSingle();
        if (!existingProfile) {
          await adminClient.from("profiles").insert({ user_id: userId, full_name, status: "invited" });
        } else {
          await adminClient.from("profiles").update({ status: "invited" }).eq("user_id", userId);
        }

        // Unban user if previously disabled, so they can accept the invite
        await adminClient.auth.admin.updateUserById(userId, { ban_duration: "none" });

        // Use recovery link — longer-lived token (default 24h vs 5min for magiclink)
        // and compatible with the accept-invite password-set flow
        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo },
        });

        if (linkError) {
          return new Response(JSON.stringify({ error: linkError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const actionLink = linkData?.properties?.action_link;
        return new Response(JSON.stringify({ success: true, user_id: userId, action_link: actionLink }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        // New user — send invite email
        const { data: userData, error: createError } = await adminClient.auth.admin.inviteUserByEmail(email, {
          data: { full_name },
          redirectTo,
        });
        if (createError) {
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        userId = userData.user.id;

        // Assign role
        await adminClient.from("user_roles").insert({ user_id: userId, role });

        // Create profile
        await adminClient.from("profiles").insert({
          user_id: userId,
          full_name,
          status: "invited",
        });

        return new Response(JSON.stringify({ success: true, user_id: userId }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── UPDATE ROLE ──
    if (action === "update_role") {
      const { user_id, new_role } = body;
      if (!user_id || !new_role) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prevent changing super_admin role
      const { data: targetIsSuperAdmin } = await adminClient.rpc("has_role", {
        _user_id: user_id,
        _role: "super_admin",
      });
      if (targetIsSuperAdmin) {
        return new Response(JSON.stringify({ error: "Cannot change super_admin role" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Cannot assign super_admin
      if (new_role === "super_admin") {
        return new Response(JSON.stringify({ error: "Cannot assign super_admin role" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await adminClient.from("user_roles").update({ role: new_role }).eq("user_id", user_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DISABLE USER ──
    if (action === "disable") {
      const { user_id } = body;

      // Prevent disabling self or super_admin
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Cannot disable yourself" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: targetIsSuperAdmin } = await adminClient.rpc("has_role", {
        _user_id: user_id,
        _role: "super_admin",
      });
      if (targetIsSuperAdmin) {
        return new Response(JSON.stringify({ error: "Cannot disable super_admin" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Ban user in auth
      await adminClient.auth.admin.updateUserById(user_id, { ban_duration: "876000h" });

      // Update profile status
      await adminClient.from("profiles").update({ status: "disabled" }).eq("user_id", user_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── REACTIVATE USER ──
    if (action === "reactivate") {
      const { user_id } = body;

      // Unban user
      await adminClient.auth.admin.updateUserById(user_id, { ban_duration: "none" });

      // Update profile status
      await adminClient.from("profiles").update({ status: "active" }).eq("user_id", user_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── RE-INVITE (resend invite email) ──
    if (action === "reinvite") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "Missing user_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get user email
      const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(user_id);
      if (getUserError || !userData?.user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const appUrl = "https://sankash-new-website.lovable.app";
      const redirectTo = `${appUrl}/ops/accept-invite`;

      // Unban user if previously disabled
      await adminClient.auth.admin.updateUserById(user_id, { ban_duration: "none" });

      // Reset profile to invited so accept-invite flow works
      await adminClient.from("profiles").update({ status: "invited" }).eq("user_id", user_id);

      // Use recovery link — longer-lived token (24h vs 5min for magiclink)
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email: userData.user.email!,
        options: {
          redirectTo,
        },
      });
      if (linkError) {
        return new Response(JSON.stringify({ error: linkError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const actionLink = linkData?.properties?.action_link;
      if (!actionLink) {
        return new Response(JSON.stringify({ error: "Failed to generate invite link" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, action_link: actionLink }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
