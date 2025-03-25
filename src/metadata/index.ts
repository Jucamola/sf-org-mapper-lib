/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import { OrgMetadata } from '../types/sObjects';
import { queryApexClasses } from './apexClass';
import { queryApexComponents } from './apexComponent';
import { queryApexPages } from './apexPage';
import { queryApexTriggers } from './apexTrigger';

export async function queryMetadatas(conn: Connection): Promise<OrgMetadata> {
  const orgMetadata = new Map();
  const [apexClasses, apexComponents, apexPages, apexTriggers] = await Promise.all([
    queryApexClasses(conn),
    queryApexComponents(conn),
    queryApexPages(conn),
    queryApexTriggers(conn),
  ]);
  orgMetadata.set('ApexClass', apexClasses);
  orgMetadata.set('ApexComponent', apexComponents);
  orgMetadata.set('ApexPage', apexPages);
  orgMetadata.set('ApexTrigger', apexTriggers);
  return orgMetadata;
}
