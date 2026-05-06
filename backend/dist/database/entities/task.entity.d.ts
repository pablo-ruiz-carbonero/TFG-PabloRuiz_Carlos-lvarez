import { Crop } from './crop.entity';
export declare class Task {
    id: number;
    tipo: string;
    fecha: Date;
    hora: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    status: string;
    cultivo: Crop;
    fechaCreacion: Date;
}
