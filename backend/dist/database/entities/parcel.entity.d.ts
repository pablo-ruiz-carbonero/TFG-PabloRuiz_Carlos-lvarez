import { User } from './user.entity';
import { Crop } from './crop.entity';
export declare class Parcel {
    id: number;
    nombre: string;
    ubicacion: string;
    usuario: User;
    crops: Crop[];
}
