import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usage_types' })
export class UsageType {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ length: 50 }) name!: string;
}
