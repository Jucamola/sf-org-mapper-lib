/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { buildGraph } from '../../../src/graph/index';
import { OrgMetadata, OrgMetadataMap, MetadataComponentDependency } from '../../../src/types/sObjects';

describe('buildGraph', () => {
  it('should create an empty graph when no metadata is provided', () => {
    const orgMetadata: OrgMetadata = new Map();
    const metadataComponentDependencies: MetadataComponentDependency[] = [];

    const graph = buildGraph(orgMetadata, metadataComponentDependencies);

    expect(graph.nodes().length).to.equal(0);
    expect(graph.edges().length).to.equal(0);
  });

  it('should add nodes to the graph based on orgMetadata', () => {
    const orgMetadata: OrgMetadata = new Map();
    const apexClassMap: OrgMetadataMap = new Map();
    apexClassMap.set('01p000000000001AAA', {
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
      LastModifiedDate: new Date(),
    });
    apexClassMap.set('01p000000000002AAA', {
      Label: 'MyClass2',
      Type: 'ApexClass',
      ApiVersion: 56.0,
      IsTest: false,
      IsValid: true,
      LengthWithoutComments: 200,
      ManageableState: 'installed',
      Name: 'MyClass2',
      Status: 'Active',
      NamespacePrefix: '',
      LastModifiedDate: new Date(),
    });
    orgMetadata.set('ApexClass', apexClassMap);

    const metadataComponentDependencies: MetadataComponentDependency[] = [];

    const graph = buildGraph(orgMetadata, metadataComponentDependencies);

    expect(graph.nodes().length).to.equal(2);
    expect(graph.edges().length).to.equal(0);

    const node1 = graph.getElementById('01p000000000001AAA');
    expect(node1.data('Label')).to.equal('MyClass1');
    expect(node1.data('Type')).to.equal('ApexClass');
    expect(node1.data('isTest')).to.equal(true);

    const node2 = graph.getElementById('01p000000000002AAA');
    expect(node2.data('Label')).to.equal('MyClass2');
    expect(node2.data('Type')).to.equal('ApexClass');
    expect(node2.data('isTest')).to.equal(false);
  });

  it('should add edges to the graph based on metadataComponentDependencies', () => {
    const orgMetadata: OrgMetadata = new Map();
    const apexClassMap: OrgMetadataMap = new Map();
    apexClassMap.set('01p000000000001AAA', {
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
      LastModifiedDate: new Date(),
    });
    apexClassMap.set('01p000000000002AAA', {
      Label: 'MyClass2',
      Type: 'ApexClass',
      ApiVersion: 56.0,
      IsTest: false,
      IsValid: true,
      LengthWithoutComments: 200,
      ManageableState: 'installed',
      Name: 'MyClass2',
      Status: 'Active',
      NamespacePrefix: '',
      LastModifiedDate: new Date(),
    });
    orgMetadata.set('ApexClass', apexClassMap);

    const metadataComponentDependencies: MetadataComponentDependency[] = [
      {
        MetadataComponentId: '01p000000000001AAA',
        RefMetadataComponentId: '01p000000000002AAA',
        MetadataComponentNamespace: 'ns1',
        MetadataComponentName: 'MyClass1',
        MetadataComponentType: 'ApexClass',
        RefMetadataComponentNamespace: '',
        RefMetadataComponentName: 'MyClass2',
        RefMetadataComponentType: 'ApexClass',
      },
    ];

    const graph = buildGraph(orgMetadata, metadataComponentDependencies);

    expect(graph.nodes().length).to.equal(2);
    expect(graph.edges().length).to.equal(1);

    const edge = graph.edges()[0];
    expect(edge.data('source')).to.equal('01p000000000001AAA');
    expect(edge.data('target')).to.equal('01p000000000002AAA');
  });
});
