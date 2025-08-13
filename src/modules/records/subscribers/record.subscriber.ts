import { Injectable } from '@nestjs/common';

import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

import { SearchService } from '../../elasticsearch/search.service';
import { Record as RecordEntity } from '../entities/record.entity';
import { AppDataSource } from 'src/common/config/ormconfig';

@Injectable()
@EventSubscriber()
export class RecordSubscriber
  implements EntitySubscriberInterface<RecordEntity>
{
  constructor(private readonly search: SearchService) {
    // register this subscriber with DataSource
    AppDataSource.subscribers.push(this as any);
    // Note: This subscriber needs to be registered with the DataSource
    // You may need to register it in your app module or data source configuration
  }

  listenTo() {
    return RecordEntity;
  }

  private buildDoc(entity: RecordEntity) {
    return {
      id: entity.id,
      addressIp: entity.addressIp,
      addressType: entity.addressType
        ? { id: entity.addressType.id, name: entity.addressType.name }
        : null,
      organization: entity.organization,
      country: entity.country
        ? { id: entity.country.id, name: entity.country.name }
        : null,
      usageType: entity.usageType
        ? { id: entity.usageType.id, name: entity.usageType.name }
        : null,
      threatLevel: entity.threatLevel
        ? { id: entity.threatLevel.id, name: entity.threatLevel.name }
        : null,
      threatDetails: entity.threatDetails,
      firstSeen: entity.firstSeen,
      lastSeen: entity.lastSeen,
    };
  }

  async afterInsert(event: InsertEvent<RecordEntity>) {
    const doc = this.buildDoc(event.entity);
    await this.search.indexDocument('records_v1', String(doc.id), doc, true);
  }

  async afterUpdate(event: UpdateEvent<RecordEntity>) {
    // event.entity may be partial; fetch full
    const id = (event.entity as any)?.id ?? (event.databaseEntity as any)?.id;
    const repo = event.manager.getRepository(RecordEntity);
    const entity = await repo.findOne({ where: { id } });
    if (!entity) return;
    const doc = this.buildDoc(entity);
    await this.search.indexDocument('records_v1', String(doc.id), doc, true);
  }

  async afterRemove(event: RemoveEvent<RecordEntity>) {
    const id = (event.entityId as any) ?? (event.entity as any)?.id;
    if (!id) return;
    await this.search.deleteDocument('records_v1', String(id));
  }
}
