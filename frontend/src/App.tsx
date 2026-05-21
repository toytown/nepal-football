import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AdminAuthProvider } from './hooks/AdminAuthContext';
import Header from './components/Header';
import NavTabs from './components/NavTabs';
import Overview from './views/Overview';
import TaskBoard from './views/TaskBoard';
import Teams from './views/Teams';
import PrepDay from './views/PrepDay';
import Timeline from './views/Timeline';
import Volunteers from './views/Volunteers';
import VolunteerRegister from './views/VolunteerRegister';

import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <AdminAuthProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <div className="app-header">
            <Header />
            <NavTabs />
          </div>
          <main className="main">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/tasks" element={<TaskBoard />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/prep" element={<PrepDay />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/register" element={<VolunteerRegister />} />
            </Routes>
          </main>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#161928',
                color: '#e8eaf0',
                border: '1px solid #232740',
              },
            }}
          />
        </HashRouter>
      </QueryClientProvider>
    </AdminAuthProvider>
  );
}
