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
import { queryCustomLabels } from '../../../src/metadata/customLabel';

describe('customLabel', () => {
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

  it('should query CustomLabels and return an OrgMetadataMap', async () => {
    const mockCustomLabels = {
      records: [
        {
          Id: '01p000000000001AAA',
          NamespacePrefix: 'ns1',
          Name: 'MyLabel1',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
        },
        {
          Id: '01p000000000002AAA',
          NamespacePrefix: null,
          Name: 'MyLabel2',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ManageableState: 'installed',
        },
        {
          Id: '01p000000000003AAA',
          NamespacePrefix: null,
          Name: 'MyLabel3',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ManageableState: 'released',
        },
      ],
      done: true,
      totalSize: 3,
    };
    queryStub.resolves(mockCustomLabels);

    const result: OrgMetadataMap = await queryCustomLabels(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(3);

    const label1 = result.get('01p000000000001AAA');
    expect(label1).to.deep.equal({
      Label: 'MyLabel1',
      Type: 'CustomLabel',
      ManageableState: 'unmanaged',
      Name: 'MyLabel1',
      NamespacePrefix: 'ns1',
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });

    const label2 = result.get('01p000000000002AAA');
    expect(label2).to.deep.equal({
      Label: 'MyLabel2',
      Type: 'CustomLabel',
      ManageableState: 'installed',
      Name: 'MyLabel2',
      NamespacePrefix: null,
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
    });

    const label3 = result.get('01p000000000003AAA');
    expect(label3).to.deep.equal({
      Label: 'MyLabel3',
      Type: 'CustomLabel',
      ManageableState: 'released',
      Name: 'MyLabel3',
      NamespacePrefix: null,
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryCustomLabels(conn);
      expect.fail('Expected queryCustomLabels to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryCustomLabels(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
