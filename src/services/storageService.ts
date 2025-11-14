import { supabase } from '../lib/supabaseClient';

export const storageService = {
  /**
   * Upload avatar image to Supabase Storage
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 5MB.');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  /**
   * Delete old avatar from storage
   */
  async deleteAvatar(avatarUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(avatarUrl);
      const pathParts = url.pathname.split('/profiles/');
      if (pathParts.length < 2) return;

      const filePath = pathParts[1];

      await supabase.storage
        .from('profiles')
        .remove([filePath]);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      // Don't throw - deletion failure shouldn't block upload
    }
  },

  /**
   * Create a bucket for profile storage if it doesn't exist
   */
  async ensureProfileBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const profileBucket = buckets?.find(b => b.name === 'profiles');

      if (!profileBucket) {
        // Create bucket with public access
        await supabase.storage.createBucket('profiles', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        });
      }
    } catch (error) {
      console.error('Error ensuring profile bucket:', error);
    }
  }
};
