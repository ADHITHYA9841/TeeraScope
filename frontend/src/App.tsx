import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { NewAssessmentPage } from './pages/NewAssessmentPage';
import { AssessmentResultsPage } from './pages/AssessmentResultsPage';
import { AssessmentHistoryPage } from './pages/AssessmentHistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [activePage, setActivePage] = useState<string>('landing');
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);

  const handleNavigate = (page: string, assessmentId?: string) => {
    setActivePage(page);
    if (assessmentId) {
      setActiveAssessmentId(assessmentId);
    }
  };

  const isWorkspace = activePage !== 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      {!isWorkspace ? (
        <LandingPage onNavigate={handleNavigate} />
      ) : (
        <div className="flex-1 flex max-w-full">
          <Sidebar activePage={activePage} onNavigate={handleNavigate} />

          <main className="flex-1 p-6 overflow-y-auto">
            {activePage === 'dashboard' && (
              <DashboardOverviewPage onNavigate={handleNavigate} />
            )}

            {activePage === 'new-assessment' && (
              <NewAssessmentPage onNavigate={handleNavigate} />
            )}

            {activePage === 'results' && activeAssessmentId && (
              <AssessmentResultsPage
                assessmentId={activeAssessmentId}
                onNavigate={handleNavigate}
              />
            )}

            {activePage === 'history' && (
              <AssessmentHistoryPage onNavigate={handleNavigate} />
            )}

            {activePage === 'reports' && (
              <ReportsPage />
            )}

            {activePage === 'model-info' && (
              <ModelInfoPage />
            )}

            {activePage === 'settings' && (
              <SettingsPage />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
