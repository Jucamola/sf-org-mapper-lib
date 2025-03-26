/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap, ProcessType } from '../types/sObjects';

export async function queryFlows(conn: Connection): Promise<OrgMetadataMap> {
  const flows = await conn.tooling.query(
    'SELECT Id, Definition.DeveloperName, ManageableState, VersionNumber, Status, ProcessType, CreatedDate, LastModifiedDate, ApiVersion FROM Flow',
    {
      autoFetch: true,
    }
  );

  return new Map(
    flows.records.map((record) => [
      record.Id as string,
      {
        Label: (record.Definition as { DeveloperName: string }).DeveloperName,
        Type: 'Flow',
        DeveloperName: (record.Definition as { DeveloperName: string }).DeveloperName,
        ManageableState: record.ManageableState as ManageableState,
        NamespacePrefix: record.NamespacePrefix as string,
        CreatedDate: new Date(record.CreatedDate as string),
        LastModifiedDate: new Date(record.LastModifiedDate as string),
        ApiVersion: Number(record.ApiVersion),
        VersionNumber: Number(record.VersionNumber),
        Status: record.Status as string,
        ProcessType: record.ProcessType as ProcessType,
      },
    ])
  );
}
