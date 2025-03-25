/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, SfError } from '@salesforce/core';
import { expect } from 'chai';
import { instantiateContext, MockTestOrgData, restoreContext, stubContext } from '@salesforce/core/lib/testSetup';
import { OrgMetadataMap } from '../../../src/types/sObjects';
import { queryCustomApplications } from '../../../src/metadata/customApplication';

describe('customApplication', () => {
  const testOrg = new MockTestOrgData();
  const $$ = instantiateContext();
  let conn: Connection;
  let queryStub: sinon.SinonStub;

  beforeEach(async () => {
    stubContext($$);
    await $$.stubAuths(testOrg);
    conn = await testOrg.getConnection();
    queryStub = $$.SANDBOX.stub(conn.tooling, 'query');
  });

  afterEach(() => {
    restoreContext($$);
  });

  it('should query CustomApplications and return an OrgMetadataMap', async () => {
    const mockCustomApplications = {
      records: [
        {
          Id: '01p000000000001AAA',
          NamespacePrefix: 'ns1',
          DeveloperName: 'MyApp1',
          Label: 'My Application 1',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
        },
        {
          Id: '01p000000000002AAA',
          NamespacePrefix: null,
          DeveloperName: 'MyApp2',
          Label: 'My Application 2',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ManageableState: 'installed',
        },
        {
          Id: '01p000000000003AAA',
          NamespacePrefix: null,
          DeveloperName: 'MyApp3',
          Label: 'My Application 3',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ManageableState: 'released',
        },
      ],
      done: true,
      totalSize: 3,
    };
    queryStub.resolves(mockCustomApplications);

    const result: OrgMetadataMap = await queryCustomApplications(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(3);

    const app1 = result.get('01p000000000001AAA');
    expect(app1).to.deep.equal({
      Label: 'MyApp1',
      Type: 'CustomApplication',
      ApiVersion: NaN,
      ManageableState: 'unmanaged',
      DeveloperName: 'MyApp1',
      NamespacePrefix: 'ns1',
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });

    const app2 = result.get('01p000000000002AAA');
    expect(app2).to.deep.equal({
      Label: 'MyApp2',
      Type: 'CustomApplication',
      ApiVersion: NaN,
      ManageableState: 'installed',
      DeveloperName: 'MyApp2',
      NamespacePrefix: null,
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
    });

    const app3 = result.get('01p000000000003AAA');
    expect(app3).to.deep.equal({
      Label: 'MyApp3',
      Type: 'CustomApplication',
      ApiVersion: NaN,
      ManageableState: 'released',
      DeveloperName: 'MyApp3',
      NamespacePrefix: null,
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryCustomApplications(conn);
      expect.fail('Expected queryCustomApplications to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });
});
