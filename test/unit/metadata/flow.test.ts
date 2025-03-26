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
import { queryFlows } from '../../../src/metadata/flow';

describe('flow', () => {
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

  it('should query Flows and return an OrgMetadataMap', async () => {
    const mockFlows = {
      records: [
        {
          Id: '01p000000000001AAA',
          Definition: { DeveloperName: 'MyFlow1' },
          ManageableState: 'unmanaged',
          VersionNumber: 1,
          Status: 'Active',
          ProcessType: 'Workflow',
          CreatedDate: '2023-01-02T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ApiVersion: 55.0,
          NamespacePrefix: 'ns1',
        },
        {
          Id: '01p000000000002AAA',
          Definition: { DeveloperName: 'MyFlow2' },
          ManageableState: 'installed',
          VersionNumber: 2,
          Status: 'Inactive',
          ProcessType: 'AutoLaunchedFlow',
          CreatedDate: '2023-02-02T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ApiVersion: 56.0,
          NamespacePrefix: null,
        },
        {
          Id: '01p000000000003AAA',
          Definition: { DeveloperName: 'MyFlow3' },
          ManageableState: 'released',
          VersionNumber: 3,
          Status: 'Active',
          ProcessType: 'Flow',
          CreatedDate: '2023-03-02T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ApiVersion: 57.0,
          NamespacePrefix: null,
        },
      ],
      done: true,
      totalSize: 3,
    };
    queryStub.resolves(mockFlows);

    const result: OrgMetadataMap = await queryFlows(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(3);

    const flow1 = result.get('01p000000000001AAA');
    expect(flow1).to.deep.equal({
      Label: 'MyFlow1',
      Type: 'Flow',
      DeveloperName: 'MyFlow1',
      ManageableState: 'unmanaged',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
      ApiVersion: 55.0,
      VersionNumber: 1,
      Status: 'Active',
      ProcessType: 'Workflow',
    });

    const flow2 = result.get('01p000000000002AAA');
    expect(flow2).to.deep.equal({
      Label: 'MyFlow2',
      Type: 'Flow',
      DeveloperName: 'MyFlow2',
      ManageableState: 'installed',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-02-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
      ApiVersion: 56.0,
      VersionNumber: 2,
      Status: 'Inactive',
      ProcessType: 'AutoLaunchedFlow',
    });

    const flow3 = result.get('01p000000000003AAA');
    expect(flow3).to.deep.equal({
      Label: 'MyFlow3',
      Type: 'Flow',
      DeveloperName: 'MyFlow3',
      ManageableState: 'released',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-03-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
      ApiVersion: 57.0,
      VersionNumber: 3,
      Status: 'Active',
      ProcessType: 'Flow',
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryFlows(conn);
      expect.fail('Expected queryFlows to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryFlows(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
