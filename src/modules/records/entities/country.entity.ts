import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'countries' })
export class Country {
  @PrimaryGeneratedColumn() id!: number;

  @Column() name!: string;
  @Column({ length: 5 }) code!: string;

  @ManyToOne('Continent', 'countries')
  @JoinColumn({ name: 'continent_id' })
  continent!: any;
}
