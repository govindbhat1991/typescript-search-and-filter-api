import { Inject, Injectable } from '@nestjs/common';

import { Client } from '@elastic/elasticsearch';

@Injectable()
export class SearchService {
  constructor(@Inject('ELASTIC_CLIENT') private readonly es: Client) {}

  async createIndexIfNotExists(index: string, mapping: any) {
    const exists = await this.es.indices.exists({ index });
    if (!exists) {
      await this.es.indices.create({ index, body: mapping });
    }
  }

  async indexDocument(index: string, id: string, doc: any, refresh = false) {
    await this.es.index({
      index,
      id,
      body: doc,
      refresh: refresh ? 'true' : 'false',
    });
  }

  async bulk(index: string, actions: any[]) {
    const body: any[] = [];
    for (const a of actions) {
      body.push({ index: { _index: index, _id: a.id } });
      body.push(a.body);
    }
    return this.es.bulk({ refresh: true, body });
  }

  async deleteDocument(index: string, id: string) {
    try {
      await this.es.delete({ index, id });
    } catch {
      // ignore if not found
    }
  }

  async search(index: string, body: any) {
    const resp = await this.es.search({ index, body });
    return resp;
  }
}
