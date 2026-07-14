import { lazy, Suspense } from 'react';
import type { Artifact } from '@/types';

const QueueEditor = lazy(() => import('@/features/queues/QueueEditor'));
const QueueList = lazy(() => import('@/features/queues/QueueList'));
const IVRBuilder = lazy(() => import('@/features/ivr/IVRBuilder'));
const ContactTable = lazy(() => import('@/features/contacts/ContactTable'));
const ManagerTable = lazy(() => import('@/features/contacts/ManagerTable'));
const DashboardArtifact = lazy(() => import('@/features/dashboard/DashboardArtifact'));
const ReportArtifact = lazy(() => import('@/features/reports/ReportArtifact'));
const AnalyticsArtifact = lazy(() => import('@/features/reports/AnalyticsArtifact'));
const EditableDocument = lazy(() => import('@/features/documents/EditableDocument'));
const RecordingsArtifact = lazy(() => import('@/features/recordings/RecordingsArtifact'));
const ConfirmationDialog = lazy(() => import('@/features/artifacts/ConfirmationDialog'));
const EmptyState = lazy(() => import('@/features/artifacts/EmptyState'));
const CampaignBuilder = lazy(() => import('@/features/campaigns/CampaignBuilder'));
const ApprovalSheet = lazy(() => import('@/features/approvals/ApprovalSheet'));
const TimelineArtifact = lazy(() => import('@/features/timeline/TimelineArtifact'));
const SearchResults = lazy(() => import('@/features/search/SearchResults'));

function SkeletonLoader() {
  return (
    <div className="p-5 space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="shimmer rounded-lg h-10" style={{ opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  );
}

interface ArtifactRendererProps {
  artifact: Artifact;
}

export function ArtifactRenderer({ artifact }: ArtifactRendererProps) {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      {(() => {
        switch (artifact.type) {
          case 'queue-editor':
            return <QueueEditor artifact={artifact} />;
          case 'queue-list':
            return <QueueList artifact={artifact} />;
          case 'ivr-builder':
            return <IVRBuilder artifact={artifact} />;
          case 'contact-table':
            return <ContactTable artifact={artifact} />;
          case 'manager-table':
            return <ManagerTable artifact={artifact} />;
          case 'dashboard':
            return <DashboardArtifact artifact={artifact} />;
          case 'report':
            return <ReportArtifact artifact={artifact} />;
          case 'analytics':
            return <AnalyticsArtifact artifact={artifact} />;
          case 'editable-document':
            return <EditableDocument artifact={artifact} />;
          case 'recordings':
            return <RecordingsArtifact artifact={artifact} />;
          case 'campaign-builder':
            return <CampaignBuilder artifact={artifact} />;
          case 'approval-sheet':
            return <ApprovalSheet />
          case 'timeline':
            return <TimelineArtifact />
          case 'search-results':
            return <SearchResults artifact={artifact} />
          default:
            return (
              <div className="p-8 text-center text-[#52525b]">
                <p>Unknown artifact type: {artifact.type}</p>
              </div>
            );
        }
      })()}
    </Suspense>
  );
}
