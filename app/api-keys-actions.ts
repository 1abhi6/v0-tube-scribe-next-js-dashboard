"use server";

import { createClient } from "@/lib/supabase/server";

export interface ApiKeys {
  hashnode_token?: string;
  hashnode_publication_id?: string;
  medium_token?: string;
  openai_key?: string;
  supadata_key?: string;
}

export interface ApiKeysResult {
  success: boolean;
  data?: ApiKeys;
  error?: string;
}

/**
 * Get API keys for the current user
 */
export async function getApiKeys(): Promise<ApiKeysResult> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const { data, error } = await supabase
      .from("user_api_keys")
      .select("hashnode_token, hashnode_publication_id, medium_token, openai_key, supadata_key")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // No record found is not an error - user just hasn't saved keys yet
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: {},
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || {},
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Save or update API keys for the current user
 */
export async function saveApiKeys(keys: ApiKeys): Promise<ApiKeysResult> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Use upsert to insert or update
    const { error } = await supabase
      .from("user_api_keys")
      .upsert(
        {
          user_id: user.id,
          hashnode_token: keys.hashnode_token || null,
          hashnode_publication_id: keys.hashnode_publication_id || null,
          medium_token: keys.medium_token || null,
          openai_key: keys.openai_key || null,
          supadata_key: keys.supadata_key || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: keys,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Delete all API keys for the current user
 */
export async function deleteApiKeys(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const { error } = await supabase
      .from("user_api_keys")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: msg,
    };
  }
}
