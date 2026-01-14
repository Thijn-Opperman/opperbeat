/**
 * Local storage helpers for playlist folders
 * This is a proof of concept - stores everything locally without Supabase
 */

export interface PlaylistFolder {
  id: string;
  name: string;
  createdAt: string;
}

export interface FolderData {
  folders: PlaylistFolder[];
  playlistFolderMap: Record<string, string>; // playlistId -> folderId
  expandedFolders: string[];
}

const STORAGE_KEY = 'opperbeat_playlist_folders';

/**
 * Get all folder data from local storage
 */
export function getFolderData(): FolderData {
  if (typeof window === 'undefined') {
    return {
      folders: [],
      playlistFolderMap: {},
      expandedFolders: [],
    };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      folders: [],
      playlistFolderMap: {},
      expandedFolders: [],
    };
  } catch (error) {
    console.error('Error reading folder data from localStorage:', error);
    return {
      folders: [],
      playlistFolderMap: {},
      expandedFolders: [],
    };
  }
}

/**
 * Save folder data to local storage
 */
export function saveFolderData(data: FolderData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving folder data to localStorage:', error);
  }
}

/**
 * Get all folders
 */
export function getFolders(): PlaylistFolder[] {
  return getFolderData().folders;
}

/**
 * Add a new folder
 */
export function addFolder(name: string): PlaylistFolder {
  const data = getFolderData();
  const newFolder: PlaylistFolder = {
    id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  
  data.folders.push(newFolder);
  saveFolderData(data);
  return newFolder;
}

/**
 * Update a folder
 */
export function updateFolder(folderId: string, name: string): void {
  const data = getFolderData();
  const folder = data.folders.find(f => f.id === folderId);
  if (folder) {
    folder.name = name.trim();
    saveFolderData(data);
  }
}

/**
 * Delete a folder
 */
export function deleteFolder(folderId: string): void {
  const data = getFolderData();
  data.folders = data.folders.filter(f => f.id !== folderId);
  // Remove all playlist mappings for this folder
  Object.keys(data.playlistFolderMap).forEach(playlistId => {
    if (data.playlistFolderMap[playlistId] === folderId) {
      delete data.playlistFolderMap[playlistId];
    }
  });
  // Remove from expanded folders
  data.expandedFolders = data.expandedFolders.filter(id => id !== folderId);
  saveFolderData(data);
}

/**
 * Get playlist to folder mapping
 */
export function getPlaylistFolderMap(): Record<string, string> {
  return getFolderData().playlistFolderMap;
}

/**
 * Set playlist folder mapping
 */
export function setPlaylistFolder(playlistId: string, folderId: string | null): void {
  const data = getFolderData();
  if (folderId === null) {
    delete data.playlistFolderMap[playlistId];
  } else {
    data.playlistFolderMap[playlistId] = folderId;
  }
  saveFolderData(data);
}

/**
 * Get expanded folders
 */
export function getExpandedFolders(): string[] {
  return getFolderData().expandedFolders;
}

/**
 * Set expanded folders
 */
export function setExpandedFolders(folderIds: string[]): void {
  const data = getFolderData();
  data.expandedFolders = folderIds;
  saveFolderData(data);
}

/**
 * Clear all folder data (for testing/reset)
 */
export function clearAllFolders(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
