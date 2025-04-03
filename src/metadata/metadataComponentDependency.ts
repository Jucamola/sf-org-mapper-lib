/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { QueryResult, Record } from '@jsforce/jsforce-node';
import { MetadataComponentDependency } from '../types/sObjects';

const types = [
  null,
  'ApexClass',
  'ApexComponent',
  'ApexPage',
  'ApexTrigger',
  'CustomApplication',
  'AuraDefinitionBundle',
  'CustomLabel',
  'CustomTab',
  'EmailTemplate',
  'FieldSet',
  'FlexiPage',
  'Flow',
  'HomePageComponent',
  'Layout',
  'LightningComponentBundle',
  'CustomField',
  'CustomObject',
];

export async function queryMetadataComponentDependencies(conn: Connection): Promise<MetadataComponentDependency[]> {
  const promises: Array<Promise<QueryResult<Record>>> = [];
  const result: Record[][] = [];
  for (const MetadataComponentType of types) {
    for (const RefMetadataComponentType of types) {
      promises.push(query(conn, MetadataComponentType, RefMetadataComponentType));
    }
    // eslint-disable-next-line no-await-in-loop
    const queryResults = await Promise.all(promises);
    const flatQueryResults = queryResults.flatMap((r) => r.records);
    result.push(flatQueryResults);
  }

  const allResults = result.flat();

  return allResults.map((record) => ({
    Id: record.Id as string,
    MetadataComponentId: record.MetadataComponentId as string,
    MetadataComponentNamespace: record.MetadataComponentNamespace as string,
    MetadataComponentName: record.MetadataComponentName as string,
    MetadataComponentType: record.MetadataComponentType as string,
    RefMetadataComponentId: record.RefMetadataComponentId as string,
    RefMetadataComponentNamespace: record.RefMetadataComponentNamespace as string,
    RefMetadataComponentName: record.RefMetadataComponentName as string,
    RefMetadataComponentType: record.RefMetadataComponentType as string,
  }));
}

async function query(
  conn: Connection,
  metadataComponentType: string | null,
  refMetadataComponentType: string | null
): Promise<QueryResult<Record>> {
  let whereString = metadataComponentType ?? refMetadataComponentType ? 'WHERE ' : '';
  if (metadataComponentType) {
    whereString += `MetadataComponentType = '${metadataComponentType}'`;
  }
  if (metadataComponentType && refMetadataComponentType) {
    whereString += ' AND ';
  }
  if (refMetadataComponentType) {
    whereString += `RefMetadataComponentType = '${refMetadataComponentType}'`;
  }

  return conn.tooling.query(
    `SELECT Id, MetadataComponentId, MetadataComponentNamespace, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentNamespace, RefMetadataComponentName, RefMetadataComponentType 
        FROM MetadataComponentDependency ${whereString}`,
    {
      autoFetch: true,
    }
  );
}
