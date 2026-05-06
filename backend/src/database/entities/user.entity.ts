import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  nombre: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @ManyToOne('Role')
  @JoinColumn({ name: 'rol_id' })
  role: any;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;
}