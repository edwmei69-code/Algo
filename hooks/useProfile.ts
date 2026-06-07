"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  const updateProfile = async (updates: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (data) setProfile(data);
  };

  return { profile, loading, updateProfile };
}
