/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'node:fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import cytoscape from 'cytoscape';
import { writeGexf } from '../../../src/gexf';
import { OrgMetadata } from '../../../src/types/sObjects';

describe('gexf/index', () => {
  let writeFileSyncStub: sinon.SinonStub;

  beforeEach(() => {
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
  });

  afterEach(() => {
    writeFileSyncStub.restore();
  });

  it('should call buildGraph, gexf.save, and fs.writeFileSync', () => {
    const cy = cytoscape();
    const orgMetadata: OrgMetadata = new Map();
    const fileName = 'test';

    writeGexf(cy.collection(), fileName, orgMetadata);

    expect(writeFileSyncStub.calledOnce).to.be.true;
  });
});
