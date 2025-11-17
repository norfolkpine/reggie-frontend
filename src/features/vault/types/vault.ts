import { VaultFile as BaseVaultFile } from "@/types/api";

// Extended VaultFile interface with additional properties from the API response
export interface VaultFile extends BaseVaultFile {
  filename?: string;
  original_filename?: string;
  size?: number;
  file_type?: string; // This is derived from the filename extension or MIME type for filtering
}
