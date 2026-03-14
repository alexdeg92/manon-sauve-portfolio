import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  'https://fkzpgisxhluwxtzgyamm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrenBnaXN4aGx1d3h0emd5YW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjA4NzEsImV4cCI6MjA4NzYzNjg3MX0.vqmBIh8n4pvz4vudGaaawEu0ZcjgJFbBxcp5yzi_Ulg'
);

const PAINTINGS_DIR = '/home/alex/.openclaw/workspace/projects/manon-sauve/public/paintings';
const BUCKET = 'paintings';

async function uploadAll() {
  const files = fs.readdirSync(PAINTINGS_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp'));
  
  let uploadedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(PAINTINGS_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const contentType = 'image/jpeg';
    
    console.log(`Uploading ${file}...`);
    const { error } = await supabase.storage.from(BUCKET).upload(file, buffer, {
      contentType,
      upsert: true
    });
    
    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(file);
      console.log(`Uploaded: ${file} -> ${publicUrl}`);
      uploadedCount++;
      
      // Update DB row - match by image field containing the filename
      const { error: dbErr } = await supabase
        .from('paintings')
        .update({ image: publicUrl })
        .like('image', `%${file}%`);
      
      if (dbErr) console.error(`DB update failed for ${file}:`, dbErr.message);
      else console.log(`DB updated for ${file}`);
    }
  }
  
  console.log(`\nLocal files uploaded: ${uploadedCount}/15`);
  console.log('Downloading plein-la-tete from Vercel blob...');
}

uploadAll().catch(console.error);
