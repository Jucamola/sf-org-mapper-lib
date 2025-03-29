/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { Record } from '@jsforce/jsforce-node';
import { ManageableState, OrgMetadataMap } from '../types/sObjects';

export async function queryStandardEntities(conn: Connection): Promise<OrgMetadataMap> {
  let offset = 0;
  let entityDefinitionRecords: Record[] = [];
  let limitedEntityDefinitionRecords;
  do {
    // eslint-disable-next-line no-await-in-loop
    limitedEntityDefinitionRecords = await conn.tooling.query(
      `SELECT Id, DurableId, QualifiedApiName, NamespacePrefix
         FROM EntityDefinition 
         WHERE PublisherId = 'System'
         LIMIT 2000
         OFFSET ${offset}`
    );
    offset += 2000;
    entityDefinitionRecords = [...entityDefinitionRecords, ...limitedEntityDefinitionRecords.records];
  } while (limitedEntityDefinitionRecords.records.length === 2000);

  return new Map(
    entityDefinitionRecords.map((record) => [
      record.DurableId as string,
      {
        Label: record.QualifiedApiName as string,
        QualifiedApiName: record.QualifiedApiName as string,
        Type: 'StandardEntity',
        ManageableState: 'standardEntity' as ManageableState,
        NamespacePrefix: record.NamespacePrefix as string,
        DurableId: record.DurableId as string,
        CreatedDate: new Date('1999-03-08'),
        LastModifiedDate: new Date('1999-03-08'),
      },
    ])
  );
}
