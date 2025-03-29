import { Connection, SfError } from '@salesforce/core';
import { expect } from 'chai';
import { instantiateContext, MockTestOrgData, restoreContext, stubContext } from '@salesforce/core/testSetup';
import * as sinon from 'sinon';
import { OrgMetadataMap } from '../../../src/types/sObjects';
import { queryStandardEntities } from '../../../src/metadata/standardEntity';
import 'mocha';

describe('queryStandardEntities', () => {
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

  it('should query standard entities and return a map', async () => {
    const mockRecords = {
      records: [
        {
          Id: '000000000000001AAA',
          DurableId: 'StandardEntity1',
          QualifiedApiName: 'StandardEntity1',
          NamespacePrefix: null,
        },
        {
          Id: '000000000000002AAA',
          DurableId: 'StandardEntity2',
          QualifiedApiName: 'StandardEntity2',
          NamespacePrefix: 'ns',
        },
      ],
      done: true,
      totalSize: 2,
    };

    queryStub.resolves(mockRecords);

    const result: OrgMetadataMap = await queryStandardEntities(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(queryStub.firstCall.args[0]).to.include('SELECT Id, DurableId, QualifiedApiName, NamespacePrefix');
    expect(queryStub.firstCall.args[0]).to.include("WHERE PublisherId = 'System'");
    expect(queryStub.firstCall.args[0]).to.include('LIMIT 2000');
    expect(queryStub.firstCall.args[0]).to.include('OFFSET 0');

    expect(result.size).to.equal(2);
    expect(result.get('StandardEntity1')).to.deep.equal({
      Label: 'StandardEntity1',
      QualifiedApiName: 'StandardEntity1',
      Type: 'StandardEntity',
      ManageableState: 'standardEntity',
      NamespacePrefix: null,
      DurableId: 'StandardEntity1',
      CreatedDate: new Date('1999-03-08'),
      LastModifiedDate: new Date('1999-03-08'),
    });
    expect(result.get('StandardEntity2')).to.deep.equal({
      Label: 'StandardEntity2',
      QualifiedApiName: 'StandardEntity2',
      Type: 'StandardEntity',
      ManageableState: 'standardEntity',
      NamespacePrefix: 'ns',
      DurableId: 'StandardEntity2',
      CreatedDate: new Date('1999-03-08'),
      LastModifiedDate: new Date('1999-03-08'),
    });
  });

  it('should handle pagination when more than 2000 records are returned', async () => {
    const mockRecords1 = {
      records: Array.from({ length: 2000 }, (_, i) => ({
        Id: `00000000000000${(i + 1).toString().padStart(3, '0')}AAA`,
        DurableId: `StandardEntity${i + 1}`,
        QualifiedApiName: `StandardEntity${i + 1}`,
        NamespacePrefix: null,
      })),
      done: false,
      totalSize: 2000,
    };
    const mockRecords2 = {
      records: [
        {
          Id: '0000000000002001AAA',
          DurableId: 'StandardEntity2001',
          QualifiedApiName: 'StandardEntity2001',
          NamespacePrefix: null,
        },
      ],
      done: true,
      totalSize: 1,
    };

    queryStub.onFirstCall().resolves(mockRecords1);
    queryStub.onSecondCall().resolves(mockRecords2);

    const result: OrgMetadataMap = await queryStandardEntities(conn);

    expect(queryStub.calledTwice).to.be.true;
    expect(queryStub.firstCall.args[0]).to.include('OFFSET 0');
    expect(queryStub.secondCall.args[0]).to.include('OFFSET 2000');
    expect(result.size).to.equal(2001);
    expect(result.get('StandardEntity2001')).to.deep.equal({
      Label: 'StandardEntity2001',
      QualifiedApiName: 'StandardEntity2001',
      Type: 'StandardEntity',
      ManageableState: 'standardEntity',
      NamespacePrefix: null,
      DurableId: 'StandardEntity2001',
      CreatedDate: new Date('1999-03-08'),
      LastModifiedDate: new Date('1999-03-08'),
    });
  });

  it('should handle empty result', async () => {
    queryStub.resolves({
      records: [],
      done: true,
      totalSize: 0,
    });

    const result: OrgMetadataMap = await queryStandardEntities(conn);

    expect(queryStub.calledOnce).to.be.true;
    expect(result.size).to.equal(0);
  });

  it('should handle query errors', async () => {
    queryStub.rejects(new SfError('Query failed'));

    try {
      await queryStandardEntities(conn);
      expect.fail('Expected queryStandardEntities to throw an error');
    } catch (error) {
      expect((error as Error).message).to.equal('Query failed');
    }
  });
  it('should handle pagination when exactly 2000 records are returned', async () => {
    const mockRecords1 = {
      records: Array.from({ length: 2000 }, (_, i) => ({
        Id: `00000000000000${(i + 1).toString().padStart(3, '0')}AAA`,
        DurableId: `StandardEntity${i + 1}`,
        QualifiedApiName: `StandardEntity${i + 1}`,
        NamespacePrefix: null,
      })),
      done: true,
      totalSize: 2000,
    };

    const mockRecords2 = {
      records: [],
      done: true,
      totalSize: 0,
    };

    queryStub.onFirstCall().resolves(mockRecords1);
    queryStub.onSecondCall().resolves(mockRecords2);

    const result: OrgMetadataMap = await queryStandardEntities(conn);

    expect(queryStub.calledTwice).to.be.true;
    expect(queryStub.firstCall.args[0]).to.include('OFFSET 0');
    expect(result.size).to.equal(2000);
    expect(result.get('StandardEntity1')).to.deep.equal({
      Label: 'StandardEntity1',
      QualifiedApiName: 'StandardEntity1',
      Type: 'StandardEntity',
      ManageableState: 'standardEntity',
      NamespacePrefix: null,
      DurableId: 'StandardEntity1',
      CreatedDate: new Date('1999-03-08'),
      LastModifiedDate: new Date('1999-03-08'),
    });
    expect(result.get('StandardEntity2000')).to.deep.equal({
      Label: 'StandardEntity2000',
      QualifiedApiName: 'StandardEntity2000',
      Type: 'StandardEntity',
      ManageableState: 'standardEntity',
      NamespacePrefix: null,
      DurableId: 'StandardEntity2000',
      CreatedDate: new Date('1999-03-08'),
      LastModifiedDate: new Date('1999-03-08'),
    });
  });
});
