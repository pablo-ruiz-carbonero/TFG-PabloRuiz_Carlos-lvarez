export declare class CreateCropDto {
    nombre: string;
    variedad: string;
    tipo_cultivo: string;
    parcela_id: number;
    superficie: number;
    fecha_siembra: string;
    fase_actual?: string;
    fecha_cosecha_esperada?: string;
    produccion_esperada?: number;
    notas?: string;
    dias_riego?: number;
    dias_fertilizacion?: number;
}
export declare class UpdateCropDto {
    nombre?: string;
    variedad?: string;
    tipo_cultivo?: string;
    parcela_id?: number;
    superficie?: number;
    fecha_siembra?: string;
    fase_actual?: string;
    fecha_cosecha_esperada?: string;
    produccion_esperada?: number;
    notas?: string;
    ultimo_riego?: string;
    ultima_fertilizacion?: string;
    dias_riego?: number;
    dias_fertilizacion?: number;
    status?: string;
}
