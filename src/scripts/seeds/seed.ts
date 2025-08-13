import "reflect-metadata";
import fs from "fs";
import path from "path";
import { AddressType } from "../../modules/records/entities/address-type.entity";
import { Continent } from "../../modules/records/entities/continent.entity";
import { Country } from "../../modules/records/entities/country.entity";
import { UsageType } from "../../modules/records/entities/usage-type.entity";
import { ThreatLevel } from "../../modules/records/entities/threat-level.entity";
import { Record as RecordEntity } from "../../modules/records/entities/record.entity";
import { AppDataSource } from "../../common/config/ormconfig";

interface DatasetItem {
  addressIP: string;
  addressType: string;
  organization: string;
  country?: string;
  countryCode: string;
  continentCode: string;
  usageType: string;
  threatLevel: string;
  firstSeen?: string;
  lastSeen?: string;
}

async function seed() {
  const dataSource = AppDataSource;
  
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const atRepo = dataSource.getRepository(AddressType);
  const contRepo = dataSource.getRepository(Continent);
  const countryRepo = dataSource.getRepository(Country);
  const utRepo = dataSource.getRepository(UsageType);
  const tlRepo = dataSource.getRepository(ThreatLevel);
  const recordRepo = dataSource.getRepository(RecordEntity);

  await dataSource.query('TRUNCATE TABLE records, countries, address_types, usage_types, threat_levels, continents CASCADE');

  const filePath = path.join(__dirname, "./data.json");
  const rawData = fs.readFileSync(filePath, "utf8");
  const dataset: DatasetItem[] = JSON.parse(rawData);

  const uniqueBy = <T extends Record<string, any>>(arr: T[], key: keyof T): T[] =>
    [...new Map(arr.filter(Boolean).map((item) => [item[key], item])).values()];

  const addressTypes = await atRepo.save(
    uniqueBy(dataset.map((d: DatasetItem) => ({ name: d.addressType })), "name")
  );

  const continents = await contRepo.save(
    uniqueBy(dataset.map((d: DatasetItem) => ({ code: d.continentCode, name: d.continentCode })), "code")
      .filter((c): c is { code: string; name: string } => Boolean(c.code))
  );

  const countries = await countryRepo.save(
    uniqueBy(dataset.map((d: DatasetItem) => ({
      name: d.country || d.countryCode,
      code: d.countryCode,
      continent: continents.find(c => c.code === d.continentCode),
    })), "code")
      .filter((c): c is { name: string; code: string; continent: Continent | undefined } => Boolean(c.code))
  );

  const usageTypes = await utRepo.save(
    uniqueBy(dataset.map((d: DatasetItem) => ({ name: d.usageType })), "name")
      .filter((u): u is { name: string } => Boolean(u.name))
  );

  const threatLevels = await tlRepo.save(
    uniqueBy(dataset.map((d: DatasetItem) => ({ name: d.threatLevel })), "name")
      .filter((t): t is { name: string } => Boolean(t.name))
  );

  const records = dataset.map((d: DatasetItem) => ({
    addressIp: d.addressIP,
    addressType: addressTypes.find(a => a.name === d.addressType),
    organization: d.organization,
    country: countries.find(c => c.code === d.countryCode),
    usageType: usageTypes.find(u => u.name === d.usageType),
    threatLevel: threatLevels.find(t => t.name === d.threatLevel),
    firstSeen: d.firstSeen ? new Date(d.firstSeen) : undefined,
    lastSeen: d.lastSeen ? new Date(d.lastSeen) : undefined,
  }));

  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await recordRepo.save(batch as any);
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
  }

  console.log(`Seed complete: ${records.length} records inserted`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
