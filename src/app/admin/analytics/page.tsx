import dynamic from 'next/dynamic';

// Dynamically import the component with SSR disabled
const AnalyticsContent = dynamic(
  () => import('./AnalyticsContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}