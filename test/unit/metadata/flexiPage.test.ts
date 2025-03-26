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
import { queryFlexiPages } from '../../../src/metadata/flexiPage';

describe('flexiPage', () => {
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

  it('should query FlexiPages and return an OrgMetadataMap', async () => {
    const mockFlexiPages = {
      records: [
        {
          Id: '01p000000000001AAA',
          DeveloperName: 'MyFlexiPage1',
          NamespacePrefix: 'ns1',
          CreatedDate: '2023-01-02T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
        },
        {
          Id: '01p000000000002AAA',
          DeveloperName: 'MyFlexiPage2',
          NamespacePrefix: null,
          CreatedDate: '2023-02-02T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ManageableState: 'installed',
        },
        {
          Id: '01p000000000003AAA',
          DeveloperName: 'MyFlexiPage3',
          NamespacePrefix: null,
          CreatedDate: '2023-03-02T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ManageableState: 'released',
        },
      ],
      done: true,
      totalSize: 3,
    };
    queryStub.resolves(mockFlexiPages);

    const result: OrgMetadataMap = await queryFlexiPages(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(3);

    const flexiPage1 = result.get('01p000000000001AAA');
    expect(flexiPage1).to.deep.equal({
      Label: 'MyFlexiPage1',
      Type: 'FieldSet',
      DeveloperName: 'MyFlexiPage1',
      ManageableState: 'unmanaged',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });

    const flexiPage2 = result.get('01p000000000002AAA');
    expect(flexiPage2).to.deep.equal({
      Label: 'MyFlexiPage2',
      Type: 'FieldSet',
      DeveloperName: 'MyFlexiPage2',
      ManageableState: 'installed',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-02-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
    });

    const flexiPage3 = result.get('01p000000000003AAA');
    expect(flexiPage3).to.deep.equal({
      Label: 'MyFlexiPage3',
      Type: 'FieldSet',
      DeveloperName: 'MyFlexiPage3',
      ManageableState: 'released',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-03-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryFlexiPages(conn);
      expect.fail('Expected queryFlexiPages to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryFlexiPages(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
