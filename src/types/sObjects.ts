/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export type MetadataComponentDependency = {
  MetadataComponentId: string;
  MetadataComponentNamespace: string;
  MetadataComponentName: string;
  MetadataComponentType: string;
  RefMetadataComponentId: string;
  RefMetadataComponentNamespace: string;
  RefMetadataComponentName: string;
  RefMetadataComponentType: string;
};

type NodeData = {
  Label: string;
  Type: OrgMetadataTypeNames;
};

export type ManageableState =
  | 'beta'
  | 'deleted'
  | 'deprecated'
  | 'deprecatedEditable'
  | 'installed'
  | 'installedEditable'
  | 'released'
  | 'unmanaged'
  | 'standardEntity';

export type Status = 'Active' | 'Deleted' | 'Inactive';

export type Metadata = NodeData & {
  ApiVersion: number;
  ManageableState: ManageableState;
  NamespacePrefix: string;
  LastModifiedDate: Date;
};

type ApexCode = Metadata & {
  Name: string;
  IsValid: boolean;
  LengthWithoutComments: number;
  Status: Status;
};

export type ApexClass = ApexCode & {
  Type: 'ApexClass';
  IsTest: boolean;
};

export type ApexTrigger = ApexCode & {
  Type: 'ApexTrigger';
};

export type ApexComponent = Metadata & {
  Type: 'ApexComponent';
};

export type ApexPage = Metadata & {
  Type: 'ApexPage';
};

export type CustomApplication = Metadata & {
  DeveloperName: string;
  Type: 'CustomApplication';
};

type Id = string;

export type OrgMetadataTypeNames =
  | 'ApexClass'
  | 'ApexComponent'
  | 'ApexPage'
  | 'ApexTrigger'
  | 'CustomApplication'
  | 'Unknown';

export type OrgMetadataTypes = ApexClass | ApexComponent | ApexPage | ApexTrigger | CustomApplication;
export type OrgMetadataMap = Map<Id, OrgMetadataTypes>;

export type OrgMetadata = Map<OrgMetadataTypeNames, OrgMetadataMap>;
