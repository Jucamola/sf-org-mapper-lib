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
import { queryFieldSets } from '../../../src/metadata/fieldSet';

describe('fieldSet', () => {
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

  it('should query FieldSets and return an OrgMetadataMap', async () => {
    const mockFieldSets = {
      records: [
        {
          Id: '01p000000000001AAA',
          DeveloperName: 'FieldSet1',
          ManageableState: 'unmanaged',
          NamespacePrefix: null,
          CreatedDate: '2023-01-01T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
        },
        {
          Id: '01p000000000002AAA',
          DeveloperName: 'FieldSet2',
          ManageableState: 'installed',
          NamespacePrefix: 'ns1',
          CreatedDate: '2023-02-01T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
        },
        {
          Id: '01p000000000003AAA',
          DeveloperName: 'FieldSet3',
          ManageableState: 'released',
          NamespacePrefix: null,
          CreatedDate: '2023-03-01T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
        },
      ],
      done: true,
      totalSize: 3,
    };
    queryStub.resolves(mockFieldSets);

    const result: OrgMetadataMap = await queryFieldSets(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(3);

    const fieldSet1 = result.get('01p000000000001AAA');
    expect(fieldSet1).to.deep.equal({
      Label: 'FieldSet1',
      Type: 'FieldSet',
      DeveloperName: 'FieldSet1',
      ManageableState: 'unmanaged',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-01-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });

    const fieldSet2 = result.get('01p000000000002AAA');
    expect(fieldSet2).to.deep.equal({
      Label: 'FieldSet2',
      Type: 'FieldSet',
      DeveloperName: 'FieldSet2',
      ManageableState: 'installed',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-02-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
    });

    const fieldSet3 = result.get('01p000000000003AAA');
    expect(fieldSet3).to.deep.equal({
      Label: 'FieldSet3',
      Type: 'FieldSet',
      DeveloperName: 'FieldSet3',
      ManageableState: 'released',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-03-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryFieldSets(conn);
      expect.fail('Expected queryFieldSets to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryFieldSets(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
