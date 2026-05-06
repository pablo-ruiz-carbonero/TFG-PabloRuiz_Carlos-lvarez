import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Crop } from './crop.entity';

@Entity('tareas')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['siembra', 'riego', 'fertilizacion', 'cosecha']
  })
  tipo: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time', nullable: true })
  hora: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cantidad: number;

  @Column({ length: 20, nullable: true })
  unidad: string;

  @Column({ length: 20, default: 'pendiente' })
  status: string;

  @ManyToOne('Crop')
  @JoinColumn({ name: 'cultivo_id' })
  cultivo: Crop;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;
}