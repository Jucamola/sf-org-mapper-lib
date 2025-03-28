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
import { queryCustomFields } from '../../../src/metadata/customField';
import 'mocha';

describe('customField', () => {
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

  it('should query CustomFields and return an OrgMetadataMap', async () => {
    const mockCustomFields = {
      records: [
        {
          Id: '00Nxx0000000001AAA',
          TableEnumOrId: 'Account',
          DeveloperName: 'MyCustomField1',
          ManageableState: 'unmanaged',
          EntityDefinitionId: '01Ixx0000000001AAA',
          EntityDefinition: {
            QualifiedApiName: 'Account',
          },
          NamespacePrefix: 'ns1',
          CreatedDate: '2023-01-01T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
        },
        {
          Id: '00Nxx0000000002BBB',
          TableEnumOrId: 'Contact',
          DeveloperName: 'MyCustomField2',
          ManageableState: 'installed',
          EntityDefinitionId: '01Ixx0000000002BBB',
          EntityDefinition: {
            QualifiedApiName: 'Contact',
          },
          NamespacePrefix: null,
          CreatedDate: '2023-02-01T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
        },
        {
          Id: '00Nxx0000000003CCC',
          TableEnumOrId: 'Lead',
          DeveloperName: 'MyCustomField3',
          ManageableState: 'released',
          EntityDefinitionId: '01Ixx0000000003CCC',
          EntityDefinition: {
            QualifiedApiName: 'Lead',
          },
          NamespacePrefix: null,
          CreatedDate: '2023-03-01T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
        },
        {
          Id: '00Nxx0000000004DDD',
          TableEnumOrId: 'MyCustomObject__c',
          DeveloperName: 'MyCustomField4',
          ManageableState: 'unmanaged',
          EntityDefinitionId: '01Ixx0000000004DDD',
          EntityDefinition: {
            QualifiedApiName: 'MyCustomObject__c',
          },
          NamespacePrefix: 'ns2',
          CreatedDate: '2023-04-01T00:00:00.000Z',
          LastModifiedDate: '2023-04-02T00:00:00.000Z',
        },
        {
          Id: '00Nxx0000000005EEE',
          TableEnumOrId: 'MyCustomObject2__c',
          DeveloperName: 'MyCustomField5',
          ManageableState: 'unmanaged',
          EntityDefinitionId: '01Ixx0000000005EEE',
          EntityDefinition: null,
          NamespacePrefix: 'ns3',
          CreatedDate: '2023-05-01T00:00:00.000Z',
          LastModifiedDate: '2023-05-02T00:00:00.000Z',
        },
      ],
      done: true,
      totalSize: 5,
    };
    queryStub.resolves(mockCustomFields);

    const result: OrgMetadataMap = await queryCustomFields(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(queryStub.firstCall.args[0]).to.equal(
      'SELECT Id, TableEnumOrId, DeveloperName, ManageableState, EntityDefinitionId, EntityDefinition.QualifiedApiName, NamespacePrefix, CreatedDate, LastModifiedDate FROM CustomField'
    );
    expect(result.size).to.equal(5);

    const customField1 = result.get('00Nxx0000000001AAA');
    expect(customField1).to.deep.equal({
      Label: 'Account.MyCustomField1__c',
      Type: 'CustomField',
      DeveloperName: 'Account.MyCustomField1__c',
      TableEnumOrId: 'Account',
      EntityDefinitionName: 'Account.',
      ManageableState: 'unmanaged',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });

    const customField2 = result.get('00Nxx0000000002BBB');
    expect(customField2).to.deep.equal({
      Label: 'Contact.MyCustomField2__c',
      Type: 'CustomField',
      DeveloperName: 'Contact.MyCustomField2__c',
      TableEnumOrId: 'Contact',
      EntityDefinitionName: 'Contact.',
      ManageableState: 'installed',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-02-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
    });

    const customField3 = result.get('00Nxx0000000003CCC');
    expect(customField3).to.deep.equal({
      Label: 'Lead.MyCustomField3__c',
      Type: 'CustomField',
      DeveloperName: 'Lead.MyCustomField3__c',
      TableEnumOrId: 'Lead',
      EntityDefinitionName: 'Lead.',
      ManageableState: 'released',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-03-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });

    const customField4 = result.get('00Nxx0000000004DDD');
    expect(customField4).to.deep.equal({
      Label: 'MyCustomObject__c.MyCustomField4__c',
      Type: 'CustomField',
      DeveloperName: 'MyCustomObject__c.MyCustomField4__c',
      TableEnumOrId: 'MyCustomObject__c',
      EntityDefinitionName: 'MyCustomObject__c.',
      ManageableState: 'unmanaged',
      NamespacePrefix: 'ns2',
      CreatedDate: new Date('2023-04-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-04-02T00:00:00.000Z'),
    });

    const customField5 = result.get('00Nxx0000000005EEE');
    expect(customField5).to.deep.equal({
      Label: 'MyCustomField5__c',
      Type: 'CustomField',
      DeveloperName: 'MyCustomField5__c',
      TableEnumOrId: 'MyCustomObject2__c',
      EntityDefinitionName: '',
      ManageableState: 'unmanaged',
      NamespacePrefix: 'ns3',
      CreatedDate: new Date('2023-05-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-05-02T00:00:00.000Z'),
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query error'));

    try {
      await queryCustomFields(conn);
      expect.fail('Expected queryCustomFields to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query error');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryCustomFields(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
