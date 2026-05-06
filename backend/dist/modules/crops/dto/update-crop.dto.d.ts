export declare class UpdateCropDto {
    name?: string;
    variety?: string;
    cropType?: string;
    parcelId?: string;
    surfaceArea?: number;
    seedDate?: string;
    currentPhase?: string;
    expectedHarvest?: string;
    notes?: string;
    status?: 'active' | 'completed' | 'archived';
}
