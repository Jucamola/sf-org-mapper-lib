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
import { queryApexTriggers } from '../../../src/metadata/apexTrigger';

describe('apexTrigger', () => {
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

  it('should query ApexTriggers and return an OrgMetadataMap', async () => {
    const mockApexTriggers = {
      records: [
        {
          Id: '01p000000000001AAA',
          NamespacePrefix: 'ns1',
          Name: 'MyTrigger1',
          ApiVersion: 55.0,
          Status: 'Active',
          IsValid: true,
          LengthWithoutComments: 100,
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
        },
        {
          Id: '01p000000000002AAA',
          NamespacePrefix: null,
          Name: 'MyTrigger2',
          ApiVersion: 56.0,
          Status: 'Inactive',
          IsValid: true,
          LengthWithoutComments: 200,
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ManageableState: 'installed',
        },
        {
          Id: '01p000000000003AAA',
          NamespacePrefix: null,
          Name: 'MyTrigger3',
          ApiVersion: 57.0,
          Status: 'Deleted',
          IsValid: false,
          LengthWithoutComments: 300,
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ManageableState: 'released',
        },
      ],
      done: true,
      totalSize: 3,
    };
    queryStub.resolves(mockApexTriggers);

    const result: OrgMetadataMap = await queryApexTriggers(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(3);

    const trigger1 = result.get('01p000000000001AAA');
    expect(trigger1).to.deep.equal({
      Label: 'MyTrigger1',
      Type: 'ApexTrigger',
      ApiVersion: 55.0,
      ManageableState: 'unmanaged',
      Name: 'MyTrigger1',
      NamespacePrefix: 'ns1',
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
      IsValid: true,
      LengthWithoutComments: 100,
      Status: 'Active',
    });

    const trigger2 = result.get('01p000000000002AAA');
    expect(trigger2).to.deep.equal({
      Label: 'MyTrigger2',
      Type: 'ApexTrigger',
      ApiVersion: 56.0,
      ManageableState: 'installed',
      Name: 'MyTrigger2',
      NamespacePrefix: null,
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
      IsValid: true,
      LengthWithoutComments: 200,
      Status: 'Inactive',
    });

    const trigger3 = result.get('01p000000000003AAA');
    expect(trigger3).to.deep.equal({
      Label: 'MyTrigger3',
      Type: 'ApexTrigger',
      ApiVersion: 57.0,
      ManageableState: 'released',
      Name: 'MyTrigger3',
      NamespacePrefix: null,
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
      IsValid: false,
      LengthWithoutComments: 300,
      Status: 'Deleted',
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryApexTriggers(conn);
      expect.fail('Expected queryApexTriggers to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryApexTriggers(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
