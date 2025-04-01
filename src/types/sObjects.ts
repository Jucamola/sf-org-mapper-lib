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

type Metadata = {
  Type: OrgMetadataTypeNames;
};

type NodeData = Metadata & {
  Label: string;
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

export type UnversionedMetadata = NodeData & {
  ManageableState: ManageableState;
  NamespacePrefix: string;
  CreatedDate: Date;
  LastModifiedDate: Date;
};

export type VersionedMetadata = UnversionedMetadata & {
  ApiVersion: number;
};

type ApexCode = VersionedMetadata & {
  Name: string;
  IsValid: boolean;
  LengthWithoutComments: number;
  Status: Status;
};

export type ApexClass = ApexCode & {
  Type: 'ApexClass';
  IsTest: boolean;
  IsQueueable: boolean;
  IsBatchable: boolean;
  IsCallable: boolean;
  IsSchedulable: boolean;
};

export type ApexTrigger = ApexCode & {
  Type: 'ApexTrigger';
};

export type ApexComponent = VersionedMetadata & {
  Type: 'ApexComponent';
};

export type ApexPage = VersionedMetadata & {
  Type: 'ApexPage';
};

export type CustomApplication = UnversionedMetadata & {
  DeveloperName: string;
  Type: 'CustomApplication';
};

export type AuraDefinitionBundle = VersionedMetadata & {
  DeveloperName: string;
  Type: 'AuraDefinitionBundle';
};

export type LightningComponentBundle = VersionedMetadata & {
  DeveloperName: string;
  Type: 'LightningComponentBundle';
  IsExposed: boolean;
  TargetConfigs: string;
};

export type CustomLabel = UnversionedMetadata & {
  Name: string;
  Type: 'CustomLabel';
};

export type CustomTab = UnversionedMetadata & {
  DeveloperName: string;
  Type: 'CustomTab';
};

export type EmailTemplate = VersionedMetadata & {
  Name: string;
  Type: 'EmailTemplate';
};

export type FieldSet = UnversionedMetadata & {
  DeveloperName: string;
  Type: 'FieldSet';
};

export type FlexiPage = UnversionedMetadata & {
  DeveloperName: string;
  Type: 'FlexiPage';
};

export type CustomField = UnversionedMetadata & {
  DeveloperName: string;
  Type: 'CustomField';
  TableEnumOrId: string;
};

export type StandardEntity = UnversionedMetadata & {
  QualifiedApiName: string;
  Type: 'StandardEntity';
  DurableId: string;
};

export type ProcessType =
  | 'Appointments'
  | 'ApprovalWorkflow'
  | 'AutoLaunchedFlow'
  | 'CheckoutFlow'
  | 'ContactRequestFlow'
  | 'CustomerLifecycle'
  | 'CustomEvent'
  | 'FieldServiceMobile'
  | 'FieldServiceWeb'
  | 'Flow'
  | 'FSCLending'
  | 'IndicatorResultFlow'
  | 'InvocableProcess'
  | 'LoyaltyManagementFlow'
  | 'PromptFlow'
  | 'RoutingFlow'
  | 'Survey'
  | 'SurveyEnrich'
  | 'Workflow';

export type Flow = VersionedMetadata & {
  DeveloperName: string;
  Type: 'Flow';
  VersionNumber: number;
  Status: string;
  ProcessType: ProcessType;
};

export type HomePageComponent = UnversionedMetadata & {
  Name: string;
  Type: 'HomePageComponent';
};

export type Layout = UnversionedMetadata & {
  Name: string;
  Type: 'Layout';
};

export type CustomObject = UnversionedMetadata & {
  DeveloperName: string;
  Type: 'CustomObject';
};

export type Id = string;

export type OrgMetadataTypes =
  | ApexClass
  | ApexComponent
  | ApexPage
  | ApexTrigger
  | CustomApplication
  | AuraDefinitionBundle
  | CustomLabel
  | CustomTab
  | EmailTemplate
  | FieldSet
  | FlexiPage
  | Flow
  | HomePageComponent
  | Layout
  | LightningComponentBundle
  | CustomObject
  | CustomField
  | StandardEntity;

export type OrgMetadataTypeNames =
  | 'ApexClass'
  | 'ApexComponent'
  | 'ApexPage'
  | 'ApexTrigger'
  | 'CustomApplication'
  | 'AuraDefinitionBundle'
  | 'CustomLabel'
  | 'CustomTab'
  | 'EmailTemplate'
  | 'FieldSet'
  | 'FlexiPage'
  | 'Flow'
  | 'HomePageComponent'
  | 'Layout'
  | 'LightningComponentBundle'
  | 'CustomObject'
  | 'CustomField'
  | 'StandardEntity';

export type OrgMetadataMap = Map<Id, OrgMetadataTypes>;

export type OrgMetadata = Map<OrgMetadataTypeNames, OrgMetadataMap>;

export type Package2MembersMap = Map<Id, string>;

export type NodeReference =
  | Id
  | {
      Label: string;
      Type: OrgMetadataTypeNames;
    };
