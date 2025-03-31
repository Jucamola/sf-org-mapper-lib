/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import {
  OrgMetadata,
  OrgMetadataTypeNames,
  OrgMetadataMap,
  OrgUtilsMetadata,
  UtilsMetadataTypesNames,
  UtilsMedataMap,
} from '../types/sObjects';
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
import { queryFlexiPages } from './flexiPage';
import { queryFlows } from './flow';
import { queryHomePageComponents } from './homePageComponent';
import { queryLayouts } from './layout';
import { queryLightningComponentBundles } from './lightningComponentBundle';
import { queryCustomFields } from './customField';
import { queryCustomObjects } from './customObject';
import { queryStandardEntities } from './standardEntity';
import { querySubscriberPackages } from './subscriberPackage';

type QueryFunction = (conn: Connection) => Promise<OrgMetadataMap>;

const queryFunctions: { [key in OrgMetadataTypeNames]: QueryFunction } = {
  ApexClass: queryApexClasses,
  ApexComponent: queryApexComponents,
  ApexPage: queryApexPages,
  ApexTrigger: queryApexTriggers,
  CustomApplication: queryCustomApplications,
  AuraDefinitionBundle: queryAuraDefinitionBundles,
  CustomLabel: queryCustomLabels,
  CustomTab: queryCustomTabs,
  EmailTemplate: queryEmailTemplates,
  FieldSet: queryFieldSets,
  FlexiPage: queryFlexiPages,
  Flow: queryFlows,
  HomePageComponent: queryHomePageComponents,
  Layout: queryLayouts,
  LightningComponentBundle: queryLightningComponentBundles,
  CustomField: queryCustomFields,
  CustomObject: queryCustomObjects,
  StandardEntity: queryStandardEntities,
};

export async function queryMetadatas(
  conn: Connection,
  options?: { include?: OrgMetadataTypeNames[]; exclude?: OrgMetadataTypeNames[] }
): Promise<OrgMetadata> {
  const orgMetadata = new Map<OrgMetadataTypeNames, OrgMetadataMap>();
  const typesToQuery: OrgMetadataTypeNames[] = [];

  if (options?.include) {
    typesToQuery.push(...options.include);
  } else {
    for (const key in queryFunctions) {
      if (!Object.prototype.hasOwnProperty.call(queryFunctions, key)) continue;
      typesToQuery.push(key as OrgMetadataTypeNames);
    }
  }

  if (options?.exclude) {
    for (const type of options.exclude) {
      const index = typesToQuery.indexOf(type);
      if (index > -1) {
        typesToQuery.splice(index, 1);
      }
    }
  }

  const promises: Array<Promise<OrgMetadataMap>> = [];
  const types: OrgMetadataTypeNames[] = [];

  for (const type of typesToQuery) {
    const queryFunction = queryFunctions[type];
    if (queryFunction) {
      promises.push(queryFunction(conn));
      types.push(type);
    }
  }

  const results = await Promise.all(promises);

  for (let i = 0; i < results.length; i++) {
    orgMetadata.set(types[i], results[i]);
  }

  return orgMetadata;
}

export async function queryUtilsMetadata(conn: Connection): Promise<OrgUtilsMetadata> {
  const orgUtilsMetadata = new Map<UtilsMetadataTypesNames, UtilsMedataMap>();
  const subscriberPackages = await querySubscriberPackages(conn);
  orgUtilsMetadata.set('SubscriberPackage', subscriberPackages);
  return orgUtilsMetadata;
}
