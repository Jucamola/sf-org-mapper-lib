/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, SfError } from '@salesforce/core';
import { expect } from 'chai';
import { instantiateContext, MockTestOrgData, restoreContext, stubContext } from '@salesforce/core/testSetup';
import { Record } from '@jsforce/jsforce-node';
import { OrgMetadataMap } from '../../../src/types/sObjects';
import { queryCustomTabs } from '../../../src/metadata/customTab';

describe('customTab', () => {
  const testOrg = new MockTestOrgData();
  const $$ = instantiateContext();
  let conn: Connection;
  let queryStub: sinon.SinonStub;
  let metadataListStub: sinon.SinonStub;

  beforeEach(async () => {
    stubContext($$);
    await $$.stubAuths(testOrg);
    conn = await testOrg.getConnection();
    queryStub = $$.SANDBOX.stub(conn.tooling, 'query');
    metadataListStub = $$.SANDBOX.stub(conn.metadata, 'list');
  });

  afterEach(() => {
    restoreContext($$);
  });

  it('should query CustomTabs and return an OrgMetadataMap', async () => {
    const mockCustomTabs: { records: Record[]; done: boolean; totalSize: number } = {
      records: [
        {
          Id: '01t000000000001AAA',
          NamespacePrefix: 'ns1',
          DeveloperName: 'MyTab1',
          Type: 'CustomObject',
          CreatedDate: '2023-01-02T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
        },
        {
          Id: '01t000000000002AAA',
          NamespacePrefix: null,
          DeveloperName: 'MyTab2',
          Type: 'CustomObject',
          CreatedDate: '2023-02-02T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ManageableState: 'installed',
        },
        {
          Id: '01t000000000003AAA',
          NamespacePrefix: null,
          DeveloperName: 'MyTab3',
          Type: 'CustomObject',
          CreatedDate: '2023-03-02T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ManageableState: 'released',
        },
        {
          Id: '01t000000000004AAA',
          NamespacePrefix: null,
          DeveloperName: 'MyTab4',
          Type: 'Visualforce',
          CreatedDate: '2023-03-02T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ManageableState: 'released',
        },
      ],
      done: true,
      totalSize: 4,
    };
    const mockMetadataList: Record[] = [
      { id: '01t000000000001AAA', fullName: 'MyTab1' },
      { id: '01t000000000002AAA', fullName: 'MyTab2' },
      { id: '01t000000000003AAA', fullName: 'MyTab3' },
    ];
    queryStub.resolves(mockCustomTabs);
    metadataListStub.resolves(mockMetadataList);

    const result: OrgMetadataMap = await queryCustomTabs(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(metadataListStub.calledOnce).to.be.true;
    expect(result.size).to.equal(4);

    const tab1 = result.get('01t000000000001AAA');
    expect(tab1).to.deep.equal({
      Label: 'MyTab1',
      Type: 'CustomTab',
      ManageableState: 'unmanaged',
      DeveloperName: 'MyTab1',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });

    const tab2 = result.get('01t000000000002AAA');
    expect(tab2).to.deep.equal({
      Label: 'MyTab2',
      Type: 'CustomTab',
      ManageableState: 'installed',
      DeveloperName: 'MyTab2',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-02-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
    });

    const tab3 = result.get('01t000000000003AAA');
    expect(tab3).to.deep.equal({
      Label: 'MyTab3',
      Type: 'CustomTab',
      ManageableState: 'released',
      DeveloperName: 'MyTab3',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-03-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });
    const tab4 = result.get('01t000000000004AAA');
    expect(tab4).to.deep.equal({
      Label: 'MyTab4',
      Type: 'CustomTab',
      ManageableState: 'released',
      DeveloperName: 'MyTab4',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-03-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryCustomTabs(conn);
      expect.fail('Expected queryCustomTabs to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });
    metadataListStub.resolves([]);

    const result: OrgMetadataMap = await queryCustomTabs(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(metadataListStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
  it('should handle empty metadata list results', async () => {
    const mockCustomTabs: { records: Record[]; done: boolean; totalSize: number } = {
      records: [
        {
          Id: '01t000000000001AAA',
          NamespacePrefix: 'ns1',
          DeveloperName: '',
          Type: 'customObject',
          CreatedDate: '2023-01-02T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
        },
      ],
      done: true,
      totalSize: 1,
    };
    const mockMetadataList: Record[] = [];
    queryStub.resolves(mockCustomTabs);
    metadataListStub.resolves(mockMetadataList);

    const result: OrgMetadataMap = await queryCustomTabs(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(metadataListStub.calledOnce).to.be.true;
    expect(result.size).to.equal(1);

    const tab1 = result.get('01t000000000001AAA');
    expect(tab1).to.deep.equal({
      Label: '01t000000000001AAA',
      Type: 'CustomTab',
      ManageableState: 'unmanaged',
      DeveloperName: '01t000000000001AAA',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });
  });
});
