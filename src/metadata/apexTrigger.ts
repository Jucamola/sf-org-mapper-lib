/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap, Status } from '../types/sObjects';

export async function queryApexTriggers(conn: Connection): Promise<OrgMetadataMap> {
  const apexTriggers = await conn.tooling.query(
    'SELECT Id, NamespacePrefix, Name, ApiVersion, Status, IsValid, LengthWithoutComments, LastModifiedDate, ManageableState FROM ApexTrigger',
    {
      autoFetch: true,
    }
  );

  return new Map(
    apexTriggers.records.map((record) => [
      record.Id as string,
      {
        Label: record.Name as string,
        Type: 'ApexTrigger',
        ApiVersion: Number(record.ApiVersion),
        ManageableState: record.ManageableState as ManageableState,
        Name: record.Name as string,
        NamespacePrefix: record.NamespacePrefix as string,
        LastModifiedDate: new Date(record.LastModifiedDate as string),
        IsValid: record.IsValid as boolean,
        LengthWithoutComments: Number(record.LengthWithoutComments),
        Status: record.Status as Status,
      },
    ])
  );
}
