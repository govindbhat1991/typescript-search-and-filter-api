import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'threat_levels' })
export class ThreatLevel {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ length: 50 }) name!: string;
}
