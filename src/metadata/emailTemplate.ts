/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap } from '../types/sObjects';

export async function queryEmailTemplates(conn: Connection): Promise<OrgMetadataMap> {
  const emailTemplates = await conn.tooling.query(
    'SELECT Id, Name, NamespacePrefix, ManageableState, CreatedDate, LastModifiedDate, ApiVersion FROM EmailTemplate',
    {
      autoFetch: true,
    }
  );

  return new Map(
    emailTemplates.records.map((record) => [
      record.Id as string,
      {
        Label: record.Name as string,
        Type: 'EmailTemplate',
        Name: record.Name as string,
        ApiVersion: Number(record.ApiVersion),
        ManageableState: record.ManageableState as ManageableState,
        NamespacePrefix: record.NamespacePrefix as string,
        CreatedDate: new Date(record.CreatedDate as string),
        LastModifiedDate: new Date(record.LastModifiedDate as string),
      },
    ])
  );
}
