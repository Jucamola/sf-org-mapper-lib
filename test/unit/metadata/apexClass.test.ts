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
import { queryApexClasses } from '../../../src/metadata/apexClass';

describe('apexClass', () => {
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

  it('should query ApexClasses and return an OrgMetadataMap', async () => {
    const mockApexClasses = {
      records: [
        {
          Id: '01p000000000001AAA',
          NamespacePrefix: 'ns1',
          Name: 'MyClass1',
          ApiVersion: 55.0,
          Status: 'Active',
          IsValid: true,
          LengthWithoutComments: 100,
          CreatedDate: '2023-01-01T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
          SymbolTable: {
            tableDeclaration: {
              annotations: [{ name: 'IsTest' }],
            },
          },
        },
        {
          Id: '01p000000000002AAA',
          NamespacePrefix: null,
          Name: 'MyClass2',
          ApiVersion: 56.0,
          Status: 'Active',
          IsValid: true,
          LengthWithoutComments: 200,
          CreatedDate: '2023-02-01T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ManageableState: 'installed',
          SymbolTable: {
            tableDeclaration: {
              annotations: [{ name: 'OtherAnnotation' }],
            },
          },
        },
        {
          Id: '01p000000000003AAA',
          NamespacePrefix: null,
          Name: 'MyClass3',
          ApiVersion: 57.0,
          Status: 'Deleted',
          IsValid: false,
          LengthWithoutComments: 300,
          CreatedDate: '2023-03-01T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ManageableState: 'released',
          SymbolTable: undefined,
        },
        {
          Id: '01p000000000004AAA',
          NamespacePrefix: 'ns2',
          Name: 'MyClass4',
          ApiVersion: 58.0,
          Status: 'Active',
          IsValid: true,
          LengthWithoutComments: 400,
          CreatedDate: '2023-04-01T00:00:00.000Z',
          LastModifiedDate: '2023-04-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
          SymbolTable: {
            interfaces: ['System.Queueable', 'Database.Batchable', 'System.Callable', 'System.Schedulable'],
          },
        },
      ],
      done: true,
      totalSize: 4,
    };
    queryStub.resolves(mockApexClasses);

    const result: OrgMetadataMap = await queryApexClasses(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(4);

    const class1 = result.get('01p000000000001AAA');
    expect(class1).to.deep.equal({
      Label: 'MyClass1',
      Type: 'ApexClass',
      ApiVersion: 55.0,
      IsTest: true,
      IsValid: true,
      LengthWithoutComments: 100,
      ManageableState: 'unmanaged',
      Name: 'MyClass1',
      Status: 'Active',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
      IsQueueable: false,
      IsBatchable: false,
      IsCallable: false,
      IsSchedulable: false,
    });

    const class2 = result.get('01p000000000002AAA');
    expect(class2).to.deep.equal({
      Label: 'MyClass2',
      Type: 'ApexClass',
      ApiVersion: 56.0,
      IsTest: false,
      IsValid: true,
      LengthWithoutComments: 200,
      ManageableState: 'installed',
      Name: 'MyClass2',
      Status: 'Active',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-02-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
      IsQueueable: false,
      IsBatchable: false,
      IsCallable: false,
      IsSchedulable: false,
    });

    const class3 = result.get('01p000000000003AAA');
    expect(class3).to.deep.equal({
      Label: 'MyClass3',
      Type: 'ApexClass',
      ApiVersion: 57.0,
      IsTest: false,
      IsValid: false,
      LengthWithoutComments: 300,
      ManageableState: 'released',
      Name: 'MyClass3',
      Status: 'Deleted',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-03-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
      IsQueueable: false,
      IsBatchable: false,
      IsCallable: false,
      IsSchedulable: false,
    });

    const class4 = result.get('01p000000000004AAA');
    expect(class4).to.deep.equal({
      Label: 'MyClass4',
      Type: 'ApexClass',
      ApiVersion: 58.0,
      IsTest: false,
      IsValid: true,
      LengthWithoutComments: 400,
      ManageableState: 'unmanaged',
      Name: 'MyClass4',
      Status: 'Active',
      NamespacePrefix: 'ns2',
      CreatedDate: new Date('2023-04-01T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-04-02T00:00:00.000Z'),
      IsQueueable: true,
      IsBatchable: true,
      IsCallable: true,
      IsSchedulable: true,
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryApexClasses(conn);
      expect.fail('Expected queryApexClasses to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryApexClasses(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
