import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://fkzpgisxhluwxtzgyamm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrenBnaXN4aGx1d3h0emd5YW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjA4NzEsImV4cCI6MjA4NzYzNjg3MX0.vqmBIh8n4pvz4vudGaaawEu0ZcjgJFbBxcp5yzi_Ulg'
);

async function uploadPleiaLaTete() {
  const file = 'plein-la-tete.jpg';
  const buffer = fs.readFileSync('/tmp/plein-la-tete.jpg');
  
  console.log(`Uploading ${file}...`);
  const { error } = await supabase.storage.from('paintings').upload(file, buffer, {
    contentType: 'image/jpeg',
    upsert: true
  });
  
  if (error) {
    console.error(`Failed to upload ${file}:`, error.message);
  } else {
    const { data: { publicUrl } } = supabase.storage.from('paintings').getPublicUrl(file);
    console.log(`Uploaded: ${file} -> ${publicUrl}`);
    
    // Update DB row for plein-la-tete
    const { error: dbErr } = await supabase
      .from('paintings')
      .update({ image: publicUrl })
      .eq('id', 'plein-la-tete');
    
    if (dbErr) console.error(`DB update failed for ${file}:`, dbErr.message);
    else console.log(`DB updated for ${file}`);
  }
}

uploadPleiaLaTete().catch(console.error);
