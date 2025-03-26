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
import { queryCustomApplications } from './customApplication';
import { queryAuraDefinitionBundles } from './auraDefinitionBundle';
import { queryCustomLabels } from './customLabel';
import { queryCustomTabs } from './customTab';
import { queryEmailTemplates } from './emailTemplate';
import { queryFieldSets } from './fieldSet';

export async function queryMetadatas(conn: Connection): Promise<OrgMetadata> {
  const orgMetadata = new Map();
  const [
    apexClasses,
    apexComponents,
    apexPages,
    apexTriggers,
    customApplications,
    auraDefinitionBundles,
    customLabels,
    customTabs,
    emailTemplates,
    fieldSets,
  ] = await Promise.all([
    queryApexClasses(conn),
    queryApexComponents(conn),
    queryApexPages(conn),
    queryApexTriggers(conn),
    queryCustomApplications(conn),
    queryAuraDefinitionBundles(conn),
    queryCustomLabels(conn),
    queryCustomTabs(conn),
    queryEmailTemplates(conn),
    queryFieldSets(conn),
  ]);
  orgMetadata.set('ApexClass', apexClasses);
  orgMetadata.set('ApexComponent', apexComponents);
  orgMetadata.set('ApexPage', apexPages);
  orgMetadata.set('ApexTrigger', apexTriggers);
  orgMetadata.set('CustomApplication', customApplications);
  orgMetadata.set('AuraDefinitionBundle', auraDefinitionBundles);
  orgMetadata.set('CustomLabel', customLabels);
  orgMetadata.set('CustomTabs', customTabs);
  orgMetadata.set('EmailTemplate', emailTemplates);
  orgMetadata.set('FieldSet', fieldSets);
  return orgMetadata;
}
