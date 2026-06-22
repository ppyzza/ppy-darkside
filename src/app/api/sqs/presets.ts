export type SQSPreset = {
  name: string;
  eventName: string;
  description: string;
  payload: any;
};

export const SQS_PRESETS: SQSPreset[] = [
  {
    name: "Document History Trigger",
    eventName: "EmployeeDocumentEvent.documentHistoryTrigger",
    description: "Triggers history cleanup for employee documents.",
    payload: {}
  },
  {
    name: "Document ReEncrypt",
    eventName: "EmployeeDocumentEvent.DocumentReEncrypt",
    description: "Re-encrypts a specific document.",
    payload: {
      documentUuid: "123e4567-e89b-12d3-a456-426614174000",
      documentTypeCode: "DOC_TYPE_001",
      documentGroupCode: "DOC_GROUP_001",
      employmentUuid: "emp-uuid-1234",
      personUuid: "person-uuid-1234",
      employeeId: "EMP001",
      assetStore: {
        uuid: "asset-uuid-1234",
        name: "test-doc.pdf",
        originalName: "test-doc.pdf",
        storagePath: "/path/to/s3",
        mimeType: "application/pdf"
      }
    }
  },
  {
    name: "Document Download Zip",
    eventName: "EmployeeDocumentEvent.DocumentDownloadZip",
    description: "Requests a ZIP download of multiple documents.",
    payload: {
      uuid: "req-uuid-1234",
      employmentUuid: "emp-uuid-1234",
      employeeId: "EMP001",
      personUuid: "person-uuid-1234",
      auditLogTargetId: "audit-target",
      filename: "documents.zip",
      documentUuids: ["doc-uuid-1", "doc-uuid-2"],
      processDate: "2026-06-20T00:00:00Z",
      downloadedBy: "admin_user",
      isNonExisting: false
    }
  },
  {
    name: "Document Schedule (Purge/Keep)",
    eventName: "EmployeeDocumentEvent.DocumentSchedule",
    description: "Applies a retention schedule to documents.",
    payload: {
      schedules: [
        {
          uuid: "schedule-uuid-1",
          code: "SCH_001",
          documentGroupUuid: "group-uuid-1",
          documentTypeUuid: "type-uuid-1",
          daysToKeep: 30,
          deleteDateType: "RESIGNATION_DATE",
          storageDeleteFile: "HARD_DELETE",
          isActive: true,
          isDefault: true
        }
      ]
    }
  },
  {
    name: "Time Off Accrual (Cron Gen Quota)",
    eventName: "TimeOffInAppEvent.Accrual",
    description: "Generates time off quota accrual.",
    payload: {
      employmentUuid: "emp-uuid-1234",
      eventName: "Accrual",
      username: "admin_user",
      timeAccountTypeUuids: ["tat-uuid-1", "tat-uuid-2"],
      years: 2026
    }
  },
  {
    name: "Time Off Hire",
    eventName: "TimeOffInAppEvent.Hire",
    description: "Triggers time off rules generation upon hire.",
    payload: {
      employmentUuid: "emp-uuid-1234",
      eventName: "Hire",
      transactionUuid: "tx-uuid-1234"
    }
  },
  {
    name: "Time Off Period End Processing (PEP)",
    eventName: "TimeOffInAppEvent.PeriodEndProcessing",
    description: "Processes period end rules for time off.",
    payload: {
      employmentUuid: "emp-uuid-1234",
      eventName: "PeriodEndProcessing",
      timeAccountUuid: "ta-uuid-1234",
      timeAccountTypeUuid: "tat-uuid-1234"
    }
  },
  {
    name: "Schedule Task RunProcess",
    eventName: "ScheduleTaskEvent.RunProcess",
    description: "Runs pending active scheduled tasks.",
    payload: {}
  }
];
