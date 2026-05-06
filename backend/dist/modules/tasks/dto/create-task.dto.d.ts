export declare class CreateTaskDto {
    cultivo_id: number;
    tipo: string;
    fecha: string;
    hora?: string;
    descripcion?: string;
    cantidad?: number;
    unidad?: string;
}
export declare class UpdateTaskDto {
    tipo?: string;
    fecha?: string;
    hora?: string;
    descripcion?: string;
    cantidad?: number;
    unidad?: string;
    status?: string;
}
