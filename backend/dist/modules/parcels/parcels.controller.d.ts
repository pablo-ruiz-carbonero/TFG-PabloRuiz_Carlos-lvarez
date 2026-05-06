import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
export declare class ParcelsController {
    private readonly parcelsService;
    constructor(parcelsService: ParcelsService);
    findAll(usuarioId?: string): any;
    findOne(id: string): any;
    create(dto: CreateParcelDto): any;
    update(id: string, dto: UpdateParcelDto): any;
    remove(id: string): any;
}
