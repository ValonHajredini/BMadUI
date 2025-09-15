export interface BMadProject {
    id: string;
    name: string;
    path: string;
    lastAccessed: Date;
    agents: BMadAgent[];
    isActive: boolean;
}
export interface BMadAgent {
    id: string;
    name: string;
    type: string;
}
export interface ProjectScanRequest {
    paths?: string[];
}
export interface ProjectScanResponse {
    projects: BMadProject[];
    success: boolean;
    error?: string;
}
//# sourceMappingURL=project.interface.d.ts.map