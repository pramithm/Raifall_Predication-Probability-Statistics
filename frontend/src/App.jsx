import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewPage from './pages/OverviewPage';
import AnalysisPage from './pages/AnalysisPage';
import ProbabilityPage from './pages/ProbabilityPage';
import SeasonalPage from './pages/SeasonalPage';
import ExtremePage from './pages/ExtremePage';
import DataManagementPage from './pages/DataManagementPage';
import AboutPage from './pages/AboutPage';

import {
  fetchDatasetInfo,
  fetchSummaryStatistics,
  fetchRiskAssessment,
  fetchAnomalies
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [summary, setSummary] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  const loadData = async () => {
    setIsRefreshing(true);
    setErrorBanner(null);
    try {
      const [metaRes, sumRes, riskRes, anomRes] = await Promise.all([
        fetchDatasetInfo(),
        fetchSummaryStatistics(),
        fetchRiskAssessment(),
        fetchAnomalies(95.0, 3.0, 'percentile')
      ]);

      if (metaRes.success) {
        setMetadata(metaRes.metadata);
      }
      setSummary(sumRes);
      setRiskAssessment(riskRes);
      setAnomalies(anomRes);
    } catch (err) {
      console.error('Error loading dataset:', err);
      setErrorBanner(
        'Unable to communicate with the RainRisk backend service. Please verify that the FastAPI backend server is running on http://127.0.0.1:8000.'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-slate-50 text-slate-800">
      {/* Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metadata={metadata}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          metadata={metadata}
          riskAssessment={riskAssessment}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {errorBanner && (
          <div className="m-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <span>{errorBanner}</span>
            <button
              onClick={loadData}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <OverviewPage
              summary={summary}
              metadata={metadata}
              riskAssessment={riskAssessment}
              anomalies={anomalies}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisPage
              summary={summary}
              onSummaryUpdate={(newSum) => setSummary(newSum)}
            />
          )}

          {activeTab === 'probability' && (
            <ProbabilityPage metadata={metadata} />
          )}

          {activeTab === 'seasonal' && <SeasonalPage />}

          {activeTab === 'extreme' && (
            <ExtremePage
              summary={summary}
              riskAssessment={riskAssessment}
            />
          )}

          {activeTab === 'data' && (
            <DataManagementPage
              metadata={metadata}
              onDatasetUpdated={loadData}
            />
          )}

          {activeTab === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
}
