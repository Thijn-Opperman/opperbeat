import { supabaseAdmin } from './supabase'
import { randomUUID } from 'crypto'

export interface UploadResult {
  url: string
  publicUrl?: string
  path: string
}

/**
 * Upload audio bestand naar Supabase Storage
 */
export async function uploadAudioFile(
  userId: string | null,
  fileId: string,
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  // Gebruik 'anonymous' folder als userId null is
  const userFolder = userId || 'anonymous'
  const path = `${userFolder}/${fileId}/${filename}`
  
  const { data, error } = await supabaseAdmin.storage
    .from('audio-files')
    .upload(path, file, {
      contentType: mimeType,
      upsert: false
    })
  
  if (error) {
    console.error('Error uploading audio file:', error)
    throw error
  }
  
  // Genereer signed URL (geldig voor 1 jaar)
  const { data: urlData, error: urlError } = await supabaseAdmin.storage
    .from('audio-files')
    .createSignedUrl(path, 31536000) // 1 jaar
  
  if (urlError) {
    console.error('Error generating signed URL:', urlError)
    // Ga door zonder signed URL
  }
  
  return {
    url: path,
    publicUrl: urlData?.signedUrl,
    path
  }
}

/**
 * Upload artwork naar Supabase Storage
 */
export async function uploadArtwork(
  userId: string | null,
  fileId: string,
  artwork: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<UploadResult | null> {
  if (!artwork || artwork.length === 0) {
    return null
  }
  
  // Gebruik 'anonymous' folder als userId null is
  const userFolder = userId || 'anonymous'
  // Genereer bestandsnaam met extensie
  const extension = mimeType === 'image/png' ? 'png' : 'jpg'
  const filename = `artwork.${extension}`
  const path = `${userFolder}/${fileId}/${filename}`
  
  const { data, error } = await supabaseAdmin.storage
    .from('album-artwork')
    .upload(path, artwork, {
      contentType: mimeType,
      upsert: false
    })
  
  if (error) {
    console.error('Error uploading artwork:', error)
    throw error
  }
  
  // Voor public bucket is publicUrl direct beschikbaar
  const { data: publicUrlData } = supabaseAdmin.storage
    .from('album-artwork')
    .getPublicUrl(path)
  
  return {
    url: path,
    publicUrl: publicUrlData.publicUrl,
    path
  }
}

/**
 * Verwijder bestanden uit storage (bij verwijderen van analyse)
 */
export async function deleteAnalysisFiles(
  userId: string | null,
  fileId: string,
  audioFileName?: string,
  hasArtwork: boolean = false
): Promise<void> {
  const errors: Error[] = []
  
  // Gebruik 'anonymous' folder als userId null is
  const userFolder = userId || 'anonymous'
  
  // Verwijder audio bestand
  if (audioFileName) {
    const audioPath = `${userFolder}/${fileId}/${audioFileName}`
    const { error: audioError } = await supabaseAdmin.storage
      .from('audio-files')
      .remove([audioPath])
    
    if (audioError) {
      console.error('Error deleting audio file:', audioError)
      errors.push(new Error(`Audio delete failed: ${audioError.message}`))
    }
  }
  
  // Verwijder artwork
  if (hasArtwork) {
    // Probeer beide extensies
    const artworkPaths = [
      `${userFolder}/${fileId}/artwork.jpg`,
      `${userFolder}/${fileId}/artwork.png`
    ]
    
    const { error: artworkError } = await supabaseAdmin.storage
      .from('album-artwork')
      .remove(artworkPaths)
    
    if (artworkError) {
      console.error('Error deleting artwork:', artworkError)
      // Niet fatal, artwork kan al verwijderd zijn
    }
  }
  
  // Gooi error als audio verwijderen faalt
  if (errors.length > 0) {
    throw new Error(`Failed to delete files: ${errors.map(e => e.message).join(', ')}`)
  }
}

