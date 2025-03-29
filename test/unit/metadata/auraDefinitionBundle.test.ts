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
import { queryAuraDefinitionBundles } from '../../../src/metadata/auraDefinitionBundle';

describe('auraDefinitionBundle', () => {
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

  it('should query AuraDefinitionBundles and return an OrgMetadataMap', async () => {
    const mockAuraDefinitionBundles = {
      records: [
        {
          Id: '01p000000000001AAA',
          NamespacePrefix: 'ns1',
          DeveloperName: 'MyBundle1',
          ApiVersion: 55.0,
          CreatedDate: '2023-01-02T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
        },
        {
          Id: '01p000000000002AAA',
          NamespacePrefix: null,
          DeveloperName: 'MyBundle2',
          ApiVersion: 56.0,
          CreatedDate: '2023-02-02T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ManageableState: 'installed',
        },
        {
          Id: '01p000000000003AAA',
          NamespacePrefix: null,
          DeveloperName: 'MyBundle3',
          ApiVersion: 57.0,
          CreatedDate: '2023-03-02T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ManageableState: 'released',
        },
      ],
      done: true,
      totalSize: 3,
    };
    queryStub.resolves(mockAuraDefinitionBundles);

    const result: OrgMetadataMap = await queryAuraDefinitionBundles(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(3);

    const bundle1 = result.get('01p000000000001AAA');
    expect(bundle1).to.deep.equal({
      Label: 'MyBundle1',
      Type: 'AuraDefinitionBundle',
      ApiVersion: 55.0,
      ManageableState: 'unmanaged',
      DeveloperName: 'MyBundle1',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });

    const bundle2 = result.get('01p000000000002AAA');
    expect(bundle2).to.deep.equal({
      Label: 'MyBundle2',
      Type: 'AuraDefinitionBundle',
      ApiVersion: 56.0,
      ManageableState: 'installed',
      DeveloperName: 'MyBundle2',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-02-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
    });

    const bundle3 = result.get('01p000000000003AAA');
    expect(bundle3).to.deep.equal({
      Label: 'MyBundle3',
      Type: 'AuraDefinitionBundle',
      ApiVersion: 57.0,
      ManageableState: 'released',
      DeveloperName: 'MyBundle3',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-03-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryAuraDefinitionBundles(conn);
      expect.fail('Expected queryAuraDefinitionBundles to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryAuraDefinitionBundles(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
