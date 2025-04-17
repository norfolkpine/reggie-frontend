import { Project } from "@/types/api"


export type ProjectFormData = Omit<Project, 'id' | 'created_at' | 'updated_at'>