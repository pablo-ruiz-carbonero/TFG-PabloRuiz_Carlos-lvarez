import { User } from './user.entity';
export declare class Crop {
    id: number;
    nombre: string;
    variedad: string;
    tipo_cultivo: string;
    superficie: number;
    fecha_siembra: Date;
    fase_actual: string;
    fecha_cosecha_esperada: Date;
    produccion_esperada: number;
    notas: string;
    ultimo_riego: Date;
    ultima_fertilizacion: Date;
    dias_riego: number;
    dias_fertilizacion: number;
    status: string;
    usuario: User;
    parcelaId: number;
    fechaCreacion: Date;
    updatedAt: Date;
}
