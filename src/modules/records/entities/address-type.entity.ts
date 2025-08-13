import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'address_types' })
export class AddressType {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ length: 50 }) name!: string;
}
