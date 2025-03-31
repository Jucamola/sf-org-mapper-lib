/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection } from '@salesforce/core';
import * as _ from 'lodash';
import { SubscriberPackage, Id, UtilsMedataMap } from '../types/sObjects';

type SubscriberPackageRecords = {
  Id: string;
  Name: string;
  NamespacePrefix: string;
};

export async function querySubscriberPackages(conn: Connection): Promise<UtilsMedataMap> {
  const package2Members = await conn.tooling.query(
    'SELECT Id, CreatedDate, LastModifiedDate, SubscriberPackageId, SubjectId, SubjectManageableState FROM Package2Member ',
    {
      autoFetch: true,
    }
  );

  const package2MembersGroupBySubscriberPackageId = _.groupBy(package2Members.records, 'SubscriberPackageId');
  const subscriberPackageIds = Object.keys(package2MembersGroupBySubscriberPackageId);
  const subscriberPackages = await Promise.all(
    subscriberPackageIds.map(async (subscriberPackageId) => {
      const subscriberPackagesRecords = await conn.tooling.query<SubscriberPackageRecords>(
        `SELECT Id, Name, NamespacePrefix from SubscriberPackage where Id = '${subscriberPackageId}'`
      );
      const subscriberPackage = subscriberPackagesRecords.records[0];

      const createdDates = package2MembersGroupBySubscriberPackageId[subscriberPackageId].map(
        (package2Member) => new Date(package2Member.CreatedDate as string)
      );
      const createdDate = new Date(Math.max(...createdDates.map((date) => date.getTime())));

      const lastModifiedDates = package2MembersGroupBySubscriberPackageId[subscriberPackageId].map(
        (package2Member) => new Date(package2Member.LastModifiedDate as string)
      );
      const lastModifiedDate = new Date(Math.max(...lastModifiedDates.map((date) => date.getTime())));

      return [
        subscriberPackageId,
        {
          Name: subscriberPackage.Name,
          Type: 'SubscriberPackage',
          NamespacePrefix: subscriberPackage.NamespacePrefix,
          CreatedDate: createdDate,
          LastModifiedDate: lastModifiedDate,
          Package2Members: package2MembersGroupBySubscriberPackageId[subscriberPackageId].map((package2Member) => ({
            SubjectId: package2Member.SubjectId as string,
          })),
        },
      ];
    })
  );

  return new Map(subscriberPackages as unknown as Map<Id, SubscriberPackage>);
}
