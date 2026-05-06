import { CropsService } from './crops.service';
import { CreateCropDto, UpdateCropDto } from './dto/create-crop.dto';
export declare class CropsController {
    private readonly cropsService;
    constructor(cropsService: CropsService);
    create(createCropDto: CreateCropDto, req: any): Promise<import("../../database/entities/crop.entity").Crop>;
    findAll(req: any): Promise<import("../../database/entities/crop.entity").Crop[]>;
    findOne(id: string, req: any): Promise<import("../../database/entities/crop.entity").Crop>;
    update(id: string, updateCropDto: UpdateCropDto, req: any): Promise<import("../../database/entities/crop.entity").Crop>;
    remove(id: string, req: any): Promise<void>;
    getParcels(req: any): Promise<{
        id: number;
        nombre: string;
        ubicacion: string;
        tamano: number;
    }[]>;
}
