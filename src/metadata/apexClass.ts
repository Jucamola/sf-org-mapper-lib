/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { ManageableState, OrgMetadataMap, Status } from '../types/sObjects';

type SymbolTable = {
  interfaces?: string[];
  tableDeclaration?: {
    annotations?: Array<{ name: string }>;
  };
};

export async function queryApexClasses(conn: Connection): Promise<OrgMetadataMap> {
  const apexClasses = await conn.tooling.query(
    `SELECT  Id, NamespacePrefix, Name, ApiVersion, Status, IsValid, LengthWithoutComments, CreatedDate ,LastModifiedDate, ManageableState, SymbolTable 
      FROM ApexClass`,
    {
      autoFetch: true,
    }
  );

  return new Map(
    apexClasses.records.map((record) => {
      const symbolTable = record.SymbolTable as SymbolTable | undefined;
      return [
        record.Id as string,
        {
          Label: record.Name as string,
          Type: 'ApexClass',
          ApiVersion: Number(record.ApiVersion),
          IsTest:
            (symbolTable?.tableDeclaration?.annotations?.some(
              (annotation: { name: string }) => annotation.name === 'IsTest'
            ) as boolean) ?? false,
          IsValid: record.IsValid as boolean,
          LengthWithoutComments: Number(record.LengthWithoutComments),
          ManageableState: record.ManageableState as ManageableState,
          Name: record.Name as string,
          Status: record.Status as Status,
          NamespacePrefix: record.NamespacePrefix as string,
          CreatedDate: new Date(record.CreatedDate as string),
          LastModifiedDate: new Date(record.LastModifiedDate as string),
          IsQueueable: symbolTable?.interfaces?.includes('System.Queueable') ?? false,
          IsBatchable: symbolTable?.interfaces?.includes('Database.Batchable') ?? false,
          IsCallable: symbolTable?.interfaces?.includes('System.Callable') ?? false,
          IsSchedulable: symbolTable?.interfaces?.includes('System.Schedulable') ?? false,
        },
      ];
    })
  );
}
