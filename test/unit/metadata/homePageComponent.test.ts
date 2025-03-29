/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, SfError } from '@salesforce/core';
import { expect } from 'chai';
import { instantiateContext, MockTestOrgData, restoreContext, stubContext } from '@salesforce/core/testSetup';
import { OrgMetadataMap } from '../../../src/types/sObjects';
import { queryHomePageComponents } from '../../../src/metadata/homePageComponent';

describe('homePageComponent', () => {
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

  it('should query HomePageComponents and return an OrgMetadataMap', async () => {
    const mockHomePageComponents = {
      records: [
        {
          Id: '01p000000000001AAA',
          NamespacePrefix: 'ns1',
          Name: 'MyComponent1',
          CreatedDate: '2023-01-02T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
        },
        {
          Id: '01p000000000002AAA',
          NamespacePrefix: null,
          Name: 'MyComponent2',
          CreatedDate: '2023-02-02T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ManageableState: 'installed',
        },
        {
          Id: '01p000000000003AAA',
          NamespacePrefix: null,
          Name: 'MyComponent3',
          CreatedDate: '2023-03-02T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ManageableState: 'released',
        },
      ],
      done: true,
      totalSize: 3,
    };
    queryStub.resolves(mockHomePageComponents);

    const result: OrgMetadataMap = await queryHomePageComponents(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(3);

    const component1 = result.get('01p000000000001AAA');
    expect(component1).to.deep.equal({
      Label: 'MyComponent1',
      Type: 'HomePageComponent',
      ManageableState: 'unmanaged',
      Name: 'MyComponent1',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });

    const component2 = result.get('01p000000000002AAA');
    expect(component2).to.deep.equal({
      Label: 'MyComponent2',
      Type: 'HomePageComponent',
      ManageableState: 'installed',
      Name: 'MyComponent2',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-02-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
    });

    const component3 = result.get('01p000000000003AAA');
    expect(component3).to.deep.equal({
      Label: 'MyComponent3',
      Type: 'HomePageComponent',
      ManageableState: 'released',
      Name: 'MyComponent3',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-03-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryHomePageComponents(conn);
      expect.fail('Expected queryHomePageComponents to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryHomePageComponents(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
