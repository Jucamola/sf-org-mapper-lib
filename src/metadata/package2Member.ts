/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import * as _ from 'lodash';
import { Id } from '../types/sObjects';

type SubscriberPackageRecords = {
  Id: string;
  Name: string;
  NamespacePrefix: string;
};

export async function queryPackage2Members(conn: Connection): Promise<Map<Id, string>> {
  const package2Members = await conn.tooling.query('SELECT Id, SubscriberPackageId, SubjectId FROM Package2Member', {
    autoFetch: true,
  });

  const package2MembersGroupBySubscriberPackageId = _.groupBy(package2Members.records, 'SubscriberPackageId');
  const subscriberPackageIds = Object.keys(package2MembersGroupBySubscriberPackageId);
  const subscriberPackages = await Promise.all(
    subscriberPackageIds.map(async (subscriberPackageId) => {
      const subscriberPackagesRecords = await conn.tooling.query<SubscriberPackageRecords>(
        `SELECT Id, Name from SubscriberPackage where Id = '${subscriberPackageId}'`
      );
      const subscriberPackage = subscriberPackagesRecords.records[0];
      return { subscriberPackageId, name: subscriberPackage.Name };
    })
  );

  const result = new Map<Id, string>();
  package2Members.records.forEach((package2Member) => {
    const subscriberPackageName = subscriberPackages.find(
      (subscriberPackage) => subscriberPackage.subscriberPackageId === package2Member.SubscriberPackageId
    )?.name;
    if (subscriberPackageName) {
      result.set(package2Member.SubjectId as Id, subscriberPackageName);
    }
  });
  return result;
}
