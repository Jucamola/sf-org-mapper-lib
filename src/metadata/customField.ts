/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap } from '../types/sObjects';

type EntityDefinition = {
  QualifiedApiName: string;
};

export async function queryCustomFields(conn: Connection): Promise<OrgMetadataMap> {
  const customFields = await conn.tooling.query(
    'SELECT Id, TableEnumOrId, DeveloperName, ManageableState, EntityDefinitionId, EntityDefinition.QualifiedApiName, NamespacePrefix, CreatedDate, LastModifiedDate FROM CustomField',
    {
      autoFetch: true,
    }
  );

  return new Map(
    customFields.records.map((record) => {
      const entityDefinition = record.EntityDefinition as EntityDefinition;
      const qualifiedApiName = entityDefinition?.QualifiedApiName ? `${entityDefinition.QualifiedApiName}.` : '';
      return [
        record.Id as string,
        {
          Label: `${qualifiedApiName}${record.DeveloperName}__c`,
          Type: 'CustomField',
          DeveloperName: `${qualifiedApiName}${record.DeveloperName}__c`,
          TableEnumOrId: record.TableEnumOrId as string,
          EntityDefinitionName: qualifiedApiName,
          ManageableState: record.ManageableState as ManageableState,
          NamespacePrefix: record.NamespacePrefix as string,
          CreatedDate: new Date(record.CreatedDate as string),
          LastModifiedDate: new Date(record.LastModifiedDate as string),
        },
      ];
    })
  );
}
