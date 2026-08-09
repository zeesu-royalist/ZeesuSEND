export type TransferStatus = 'active' | 'expired' | 'download_limit_reached';

export type ExpirationOption = '1h' | '6h' | '24h' | '3d' | '7d' | 'never';

export type DownloadLimitOption = 'unlimited' | '1' | '5' | '10';

export type TransferItemType = 'file' | 'image' | 'text';

export interface TransferItem {
  id: string;
  transfer_id: string;
  type: TransferItemType;
  file_name: string | null;
  file_path: string | null;
  mime_type: string | null;
  file_size: number | null;
  text_content: string | null;
  created_at: string;
  signed_url?: string;
}

export interface Transfer {
  id: string;
  transfer_key: string;
  status: TransferStatus;
  created_at: string;
  expires_at: string | null;
  download_limit: number | null;
  download_count: number;
  items?: TransferItem[];
}

export interface CreateTransferSettings {
  expiration: ExpirationOption;
  downloadLimit: DownloadLimitOption;
}

export interface TransferSuccessPayload {
  key: string;
  expiresAt: string | null;
  downloadLimit: number | null;
  itemCount: number;
}
