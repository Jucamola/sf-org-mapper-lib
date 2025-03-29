/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, SfError } from '@salesforce/core';
import { expect } from 'chai';
import { instantiateContext, MockTestOrgData, restoreContext, stubContext } from '@salesforce/core/testSetup';
import * as sinon from 'sinon';
import { OrgMetadataMap } from '../../../src/types/sObjects';
import { queryLightningComponentBundles } from '../../../src/metadata/lightningComponentBundle';
import 'mocha';

describe('lightningComponentBundle', () => {
  const testOrg = new MockTestOrgData();
  const $$ = instantiateContext();
  let conn: Connection;
  let queryStub: sinon.SinonStub;

  beforeEach(async () => {
    stubContext($$);
    await $$.stubAuths(testOrg);
    conn = await testOrg.getConnection();
    queryStub = sinon.stub(conn.tooling, 'query');
  });

  afterEach(() => {
    restoreContext($$);
    sinon.restore();
  });

  it('should query LightningComponentBundles and return an OrgMetadataMap', async () => {
    const mockLightningComponentBundles = {
      records: [
        {
          Id: '0Rbxx0000000001AAA',
          DeveloperName: 'MyLightningComponent1',
          NamespacePrefix: 'ns1',
          ManageableState: 'unmanaged',
          CreatedDate: '2023-01-01T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ApiVersion: '57.0',
          IsExposed: true,
          TargetConfigs: 'target1,target2',
        },
        {
          Id: '0Rbxx0000000002BBB',
          DeveloperName: 'MyLightningComponent2',
          NamespacePrefix: null,
          ManageableState: 'installed',
          CreatedDate: '2023-02-01T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ApiVersion: '58.0',
          IsExposed: false,
          TargetConfigs: 'target3',
        },
      ],
      done: true,
      totalSize: 2,
    };
    queryStub.resolves(mockLightningComponentBundles);

    const result: OrgMetadataMap = await queryLightningComponentBundles(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(queryStub.firstCall.args[0]).to.equal(
      'SELECT Id, DeveloperName, NamespacePrefix, ManageableState, CreatedDate, LastModifiedDate, ApiVersion, IsExposed, TargetConfigs FROM LightningComponentBundle'
    );
    expect(result.size).to.equal(2);

    const component1 = result.get('0Rbxx0000000001AAA');
    expect(component1).to.deep.equal({
      Label: 'MyLightningComponent1',
      Type: 'LightningComponentBundle',
      ApiVersion: 57.0,
      ManageableState: 'unmanaged',
      DeveloperName: 'MyLightningComponent1',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
      IsExposed: true,
      TargetConfigs: 'target1,target2',
    });

    const component2 = result.get('0Rbxx0000000002BBB');
    expect(component2).to.deep.equal({
      Label: 'MyLightningComponent2',
      Type: 'LightningComponentBundle',
      ApiVersion: 58.0,
      ManageableState: 'installed',
      DeveloperName: 'MyLightningComponent2',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-02-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
      IsExposed: false,
      TargetConfigs: 'target3',
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query error'));

    try {
      await queryLightningComponentBundles(conn);
      expect.fail('Expected queryLightningComponentBundles to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query error');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryLightningComponentBundles(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
