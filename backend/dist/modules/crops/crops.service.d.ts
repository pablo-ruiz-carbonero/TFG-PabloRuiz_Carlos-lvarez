import { Repository } from 'typeorm';
import { Crop } from '../../database/entities/crop.entity';
import { CreateCropDto, UpdateCropDto } from './dto/create-crop.dto';
export declare class CropsService {
    private readonly cropRepository;
    constructor(cropRepository: Repository<Crop>);
    findAll(userId: number): Promise<Crop[]>;
    findOne(id: number, userId: number): Promise<Crop>;
    create(createCropDto: CreateCropDto, userId: number): Promise<Crop>;
    update(id: number, updateCropDto: UpdateCropDto, userId: number): Promise<Crop>;
    remove(id: number, userId: number): Promise<void>;
    getParcels(userId: number): Promise<{
        id: number;
        nombre: string;
        ubicacion: string;
        tamano: number;
    }[]>;
}
