import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'continents' })
export class Continent {
  @PrimaryGeneratedColumn() id!: number;

  @Column({ length: 5 }) code!: string;
  @Column() name!: string;

  @OneToMany('Country', 'continent')
  countries?: any[];
}
