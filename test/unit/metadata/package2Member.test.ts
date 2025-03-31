import { Connection } from '@salesforce/core';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { queryPackage2Members } from '../../../src/metadata/package2Member';
import 'mocha';

describe('package2Member', () => {
  describe('queryPackage2Members', () => {
    let queryStub: sinon.SinonStub;
    let mockConnection: Connection;

    beforeEach(() => {
      queryStub = sinon.stub();
      mockConnection = {
        tooling: {
          query: queryStub,
        },
      } as unknown as Connection;
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a map of SubjectId to SubscriberPackageName', async () => {
      queryStub.withArgs(sinon.match(/Package2Member/)).resolves({
        records: [
          { Id: 'p2m1', SubscriberPackageId: 'sp1', SubjectId: 's1' },
          { Id: 'p2m2', SubscriberPackageId: 'sp1', SubjectId: 's2' },
          { Id: 'p2m3', SubscriberPackageId: 'sp2', SubjectId: 's3' },
        ],
      });
      queryStub.withArgs(sinon.match(/SubscriberPackage.*sp1/)).resolves({
        records: [{ Id: 'sp1', Name: 'Package1' }],
      });
      queryStub.withArgs(sinon.match(/SubscriberPackage.*sp2/)).resolves({
        records: [{ Id: 'sp2', Name: 'Package2' }],
      });

      const result = await queryPackage2Members(mockConnection);

      expect(result.size).to.equal(3);
      expect(result.get('s1')).to.equal('Package1');
      expect(result.get('s2')).to.equal('Package1');
      expect(result.get('s3')).to.equal('Package2');
      expect(queryStub.callCount).to.equal(3);
    });

    it('should return an empty map if no Package2Members are found', async () => {
      queryStub.withArgs(sinon.match(/Package2Member/)).resolves({ records: [] });

      const result = await queryPackage2Members(mockConnection);

      expect(result.size).to.equal(0);
      expect(queryStub.callCount).to.equal(1);
    });
  });
});
