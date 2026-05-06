import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('cultivos')
export class Crop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  variedad: string;

  @Column({ length: 50 })
  tipo_cultivo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  superficie: number;

  @Column({ type: 'date' })
  fecha_siembra: Date;

  @Column({ length: 50, nullable: true })
  fase_actual: string;

  @Column({ type: 'date', nullable: true })
  fecha_cosecha_esperada: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  produccion_esperada: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'date', nullable: true })
  ultimo_riego: Date;

  @Column({ type: 'date', nullable: true })
  ultima_fertilizacion: Date;

  @Column({ type: 'int', nullable: true })
  dias_riego: number;

  @Column({ type: 'int', nullable: true })
  dias_fertilizacion: number;

  @Column({ length: 20, default: 'active' })
  status: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'parcela_id', nullable: true })
  parcelaId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}