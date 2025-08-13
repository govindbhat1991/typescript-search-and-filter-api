import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AddressType } from './address-type.entity';
import { Country } from './country.entity';
import { ThreatLevel } from './threat-level.entity';
import { UsageType } from './usage-type.entity';

@Entity({ name: 'records' })
export class Record {
  @PrimaryGeneratedColumn() id!: number;

  @Column({ name: 'address_ip' }) addressIp!: string;

  @ManyToOne(() => AddressType)
  @JoinColumn({ name: 'address_type_id' })
  addressType!: AddressType;

  @Column({ nullable: true }) organization?: string;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'country_id' })
  country?: Country | null;

  @ManyToOne(() => UsageType)
  @JoinColumn({ name: 'usage_type_id' })
  usageType!: UsageType;

  @ManyToOne(() => ThreatLevel)
  @JoinColumn({ name: 'threat_level_id' })
  threatLevel!: ThreatLevel;

  @Column({ name: 'threat_details', type: 'text', nullable: true })
  threatDetails?: string | null;

  @Column({ name: 'first_seen', type: 'timestamp', nullable: true })
  firstSeen?: Date;
  @Column({ name: 'last_seen', type: 'timestamp', nullable: true })
  lastSeen?: Date;
}
