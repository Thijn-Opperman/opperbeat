import { parseFile } from 'music-metadata'
import sharp from 'sharp'

export interface ExtractedArtwork {
  buffer: Buffer
  mimeType: string
  width?: number
  height?: number
}

/**
 * Extraheer album artwork uit audio bestand
 */
export async function extractArtwork(filePath: string): Promise<ExtractedArtwork | null> {
  try {
    const metadata = await parseFile(filePath)
    
    // Zoek naar picture in metadata
    const pictures = metadata.common.picture || []
    
    if (pictures.length === 0) {
      return null
    }
    
    // Neem de eerste (meestal de grootste) picture
    const picture = pictures[0]
    
    if (!picture.data) {
      return null
    }
    
    // Converteer naar buffer
    const buffer = Buffer.from(picture.data)
    
    // Optioneel: resize en optimaliseer met sharp
    let optimized: Buffer
    let width: number | undefined
    let height: number | undefined
    
    try {
      optimized = await sharp(buffer)
        .resize(1000, 1000, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer()
      
      // Haal dimensies op
      const metadata_img = await sharp(optimized).metadata()
      width = metadata_img.width
      height = metadata_img.height
    } catch (sharpError) {
      // Als sharp faalt (bijv. corrupte image), gebruik origineel
      console.warn('Sharp processing failed, using original artwork:', sharpError)
      optimized = buffer
    }
    
    return {
      buffer: optimized,
      mimeType: picture.format || 'image/jpeg',
      width,
      height
    }
  } catch (error) {
    console.error('Error extracting artwork:', error)
    return null
  }
}

/**
 * Valideer en optimaliseer artwork buffer
 */
export async function processArtwork(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(1000, 1000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer()
  } catch (error) {
    console.warn('Artwork processing failed:', error)
    return buffer
  }
}



