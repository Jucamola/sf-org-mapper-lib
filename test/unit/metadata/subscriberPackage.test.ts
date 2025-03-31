import { Connection } from '@salesforce/core';
import { instantiateContext, MockTestOrgData, restoreContext, stubContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { querySubscriberPackages } from '../../../src/metadata/subscriberPackage';
import { SubscriberPackage } from '../../../src/types/sObjects';

describe('subscriberPackage', () => {
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

  it('should query and map subscriber packages correctly', async () => {
    const package2MembersRecords = [
      {
        Id: 'package2MemberId1',
        CreatedDate: '2023-01-01T00:00:00.000Z',
        LastModifiedDate: '2023-01-02T00:00:00.000Z',
        SubscriberPackageId: 'subscriberPackageId1',
        SubjectId: 'subjectId1',
        SubjectManageableState: 'released',
      },
      {
        Id: 'package2MemberId2',
        CreatedDate: '2023-01-03T00:00:00.000Z',
        LastModifiedDate: '2023-01-04T00:00:00.000Z',
        SubscriberPackageId: 'subscriberPackageId1',
        SubjectId: 'subjectId2',
        SubjectManageableState: 'released',
      },
      {
        Id: 'package2MemberId3',
        CreatedDate: '2023-02-01T00:00:00.000Z',
        LastModifiedDate: '2023-02-02T00:00:00.000Z',
        SubscriberPackageId: 'subscriberPackageId2',
        SubjectId: 'subjectId3',
        SubjectManageableState: 'released',
      },
    ];

    const subscriberPackagesRecords = [
      {
        Id: 'subscriberPackageId1',
        Name: 'Test Package 1',
        NamespacePrefix: 'test1',
      },
      {
        Id: 'subscriberPackageId2',
        Name: 'Test Package 2',
        NamespacePrefix: 'test2',
      },
    ];

    queryStub.onFirstCall().resolves({
      done: true,
      totalSize: 3,
      records: package2MembersRecords,
    });
    queryStub.onSecondCall().resolves({
      done: true,
      totalSize: 1,
      records: [subscriberPackagesRecords[0]],
    });
    queryStub.onThirdCall().resolves({
      done: true,
      totalSize: 1,
      records: [subscriberPackagesRecords[1]],
    });

    const result = await querySubscriberPackages(conn);

    expect(result.size).to.equal(2);

    const package1 = result.get('subscriberPackageId1') as SubscriberPackage;
    expect(package1.Name).to.equal('Test Package 1');
    expect(package1.NamespacePrefix).to.equal('test1');
    expect(package1.Type).to.equal('SubscriberPackage');
    expect(package1.CreatedDate.toISOString()).to.equal('2023-01-03T00:00:00.000Z');
    expect(package1.LastModifiedDate.toISOString()).to.equal('2023-01-04T00:00:00.000Z');
    expect(package1.Package2Members).to.deep.equal([{ SubjectId: 'subjectId1' }, { SubjectId: 'subjectId2' }]);

    const package2 = result.get('subscriberPackageId2') as SubscriberPackage;
    expect(package2.Name).to.equal('Test Package 2');
    expect(package2.NamespacePrefix).to.equal('test2');
    expect(package2.Type).to.equal('SubscriberPackage');
    expect(package2.CreatedDate.toISOString()).to.equal('2023-02-01T00:00:00.000Z');
    expect(package2.LastModifiedDate.toISOString()).to.equal('2023-02-02T00:00:00.000Z');
    expect(package2.Package2Members).to.deep.equal([{ SubjectId: 'subjectId3' }]);

    expect(queryStub.callCount).to.equal(3);
    expect(queryStub.getCall(0).args[0]).to.contain('Package2Member');
    expect(queryStub.getCall(1).args[0]).to.contain('SubscriberPackage');
    expect(queryStub.getCall(2).args[0]).to.contain('SubscriberPackage');
  });

  it('should handle empty Package2Member records', async () => {
    queryStub.resolves({
      done: true,
      totalSize: 0,
      records: [],
    });

    const result = await querySubscriberPackages(conn);
    expect(result.size).to.equal(0);
    expect(queryStub.callCount).to.equal(1);
  });
});
