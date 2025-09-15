export interface BMadProject {
  id: string;                     // Unique identifier from project path
  name: string;                   // Project name from directory name
  path: string;                   // Absolute path to project directory
  lastAccessed: Date;             // When project was last opened
  agents: BMadAgent[];            // Available agents (empty for this story)
  isActive: boolean;              // Selection state
}

export interface BMadAgent {
  id: string;
  name: string;
  type: string;
}

export interface ProjectScanRequest {
  paths?: string[];               // Optional custom scan paths
}

export interface ProjectScanResponse {
  projects: BMadProject[];
  success: boolean;
  error?: string;
}