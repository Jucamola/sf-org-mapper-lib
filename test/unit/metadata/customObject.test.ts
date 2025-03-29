/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, SfError } from '@salesforce/core';
import { expect } from 'chai';
import { instantiateContext, MockTestOrgData, restoreContext, stubContext } from '@salesforce/core/lib/testSetup';
import * as sinon from 'sinon';
import { OrgMetadataMap } from '../../../src/types/sObjects';
import { queryCustomObjects } from '../../../src/metadata/customObject';
import 'mocha';

describe('customObject', () => {
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

  it('should query CustomObjects and return an OrgMetadataMap', async () => {
    const mockCustomObjects = {
      records: [
        {
          Id: '01Ixx0000000001AAA',
          DeveloperName: 'MyCustomObject1__c',
          ManageableState: 'unmanaged',
          NamespacePrefix: 'ns1',
          CreatedDate: '2023-01-01T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
        },
        {
          Id: '01Ixx0000000002BBB',
          DeveloperName: 'MyCustomObject2__c',
          ManageableState: 'installed',
          NamespacePrefix: null,
          CreatedDate: '2023-02-01T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
        },
        {
          Id: '01Ixx0000000003CCC',
          DeveloperName: 'MyCustomObject3__c',
          ManageableState: 'released',
          NamespacePrefix: 'ns2',
          CreatedDate: '2023-03-01T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
        },
      ],
      done: true,
      totalSize: 3,
    };
    queryStub.resolves(mockCustomObjects);

    const result: OrgMetadataMap = await queryCustomObjects(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(queryStub.firstCall.args[0]).to.equal(
      'SELECT Id, DeveloperName, NamespacePrefix, ManageableState, CreatedDate, LastModifiedDate FROM CustomObject'
    );
    expect(result.size).to.equal(3);

    const customObject1 = result.get('01Ixx0000000001AAA');
    expect(customObject1).to.deep.equal({
      Label: 'MyCustomObject1__c',
      Type: 'CustomObject',
      DeveloperName: 'MyCustomObject1__c',
      ManageableState: 'unmanaged',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });

    const customObject2 = result.get('01Ixx0000000002BBB');
    expect(customObject2).to.deep.equal({
      Label: 'MyCustomObject2__c',
      Type: 'CustomObject',
      DeveloperName: 'MyCustomObject2__c',
      ManageableState: 'installed',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-02-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
    });

    const customObject3 = result.get('01Ixx0000000003CCC');
    expect(customObject3).to.deep.equal({
      Label: 'MyCustomObject3__c',
      Type: 'CustomObject',
      DeveloperName: 'MyCustomObject3__c',
      ManageableState: 'released',
      NamespacePrefix: 'ns2',
      CreatedDate: new Date('2023-03-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query error'));

    try {
      await queryCustomObjects(conn);
      expect.fail('Expected queryCustomObjects to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query error');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryCustomObjects(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
