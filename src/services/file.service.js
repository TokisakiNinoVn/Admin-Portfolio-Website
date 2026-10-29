// src/services/file.service.js
import { getSupabase } from '@/lib/supabase';

function formatPath(path) {
  if (!path) return path;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path.split('/').pop();
  }

  return path;
}

class FileService {
  async upload(bucket, file) {
    const extension = file.name.split('.').pop();

    const fileName = `${Date.now()}-avatarcv.${extension}`;

    const { data, error } = await getSupabase().storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    return {
      path: data.path,
      fileName,
    };
  }

  async publicUrl(bucket, path) {
    const { data } = getSupabase().storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async delete(bucket, path) {
    const formattedPath = formatPath(path);

    const { data, error } = await getSupabase().storage
      .from(bucket)
      .remove([formattedPath]);

    if (error) throw error;

    return data;
  }
}

const fileService = new FileService();

export default fileService;
