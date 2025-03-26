/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap } from '../types/sObjects';

export async function queryFieldSets(conn: Connection): Promise<OrgMetadataMap> {
  const fieldSets = await conn.tooling.query(
    'SELECT Id, ManageableState, CreatedDate LastModifiedDate DeveloperName, NamespacePrefix FROM FieldSet',
    {
      autoFetch: true,
    }
  );

  return new Map(
    fieldSets.records.map((record) => [
      record.Id as string,
      {
        Label: record.DeveloperName as string,
        Type: 'FieldSet',
        DeveloperName: record.DeveloperName as string,
        ManageableState: record.ManageableState as ManageableState,
        NamespacePrefix: record.NamespacePrefix as string,
        CreatedDate: new Date(record.CreatedDate as string),
        LastModifiedDate: new Date(record.LastModifiedDate as string),
      },
    ])
  );
}
