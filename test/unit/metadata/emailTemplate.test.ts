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
import { queryEmailTemplates } from '../../../src/metadata/emailTemplate';

describe('emailTemplate', () => {
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

  it('should query EmailTemplates and return an OrgMetadataMap', async () => {
    const mockEmailTemplates = {
      records: [
        {
          Id: '01p000000000001AAA',
          NamespacePrefix: 'ns1',
          Name: 'MyTemplate1',
          ApiVersion: 55.0,
          CreatedDate: '2023-01-02T00:00:00.000Z',
          LastModifiedDate: '2023-01-02T00:00:00.000Z',
          ManageableState: 'unmanaged',
        },
        {
          Id: '01p000000000002AAA',
          NamespacePrefix: null,
          Name: 'MyTemplate2',
          ApiVersion: 56.0,
          CreatedDate: '2023-02-02T00:00:00.000Z',
          LastModifiedDate: '2023-02-02T00:00:00.000Z',
          ManageableState: 'installed',
        },
        {
          Id: '01p000000000003AAA',
          NamespacePrefix: null,
          Name: 'MyTemplate3',
          ApiVersion: 57.0,
          CreatedDate: '2023-03-02T00:00:00.000Z',
          LastModifiedDate: '2023-03-02T00:00:00.000Z',
          ManageableState: 'released',
        },
      ],
      done: true,
      totalSize: 3,
    };
    queryStub.resolves(mockEmailTemplates);

    const result: OrgMetadataMap = await queryEmailTemplates(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(3);

    const template1 = result.get('01p000000000001AAA');
    expect(template1).to.deep.equal({
      Label: 'MyTemplate1',
      Type: 'EmailTemplate',
      ApiVersion: 55.0,
      ManageableState: 'unmanaged',
      Name: 'MyTemplate1',
      NamespacePrefix: 'ns1',
      CreatedDate: new Date('2023-01-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-01-02T00:00:00.000Z'),
    });

    const template2 = result.get('01p000000000002AAA');
    expect(template2).to.deep.equal({
      Label: 'MyTemplate2',
      Type: 'EmailTemplate',
      ApiVersion: 56.0,
      ManageableState: 'installed',
      Name: 'MyTemplate2',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-02-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-02-02T00:00:00.000Z'),
    });

    const template3 = result.get('01p000000000003AAA');
    expect(template3).to.deep.equal({
      Label: 'MyTemplate3',
      Type: 'EmailTemplate',
      ApiVersion: 57.0,
      ManageableState: 'released',
      Name: 'MyTemplate3',
      NamespacePrefix: null,
      CreatedDate: new Date('2023-03-02T00:00:00.000Z'),
      LastModifiedDate: new Date('2023-03-02T00:00:00.000Z'),
    });
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryEmailTemplates(conn);
      expect.fail('Expected queryEmailTemplates to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });

  it('should handle empty query results', async () => {
    queryStub.resolves({ records: [], done: true, totalSize: 0 });

    const result: OrgMetadataMap = await queryEmailTemplates(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });
});
