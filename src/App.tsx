import './App.scss'
import Header from './layout/Header'
import MainContent from './layout/MainContent'
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Login from './views/Login';
import { AllCommunityModule, ClientSideRowModelModule, ModuleRegistry, PaginationModule, QuickFilterModule } from 'ag-grid-community';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ConfirmDeleteProvider } from './common/ConfirmDeleteContext';
ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule, PaginationModule, QuickFilterModule]);

function App() {
  const location = useLocation();
  const { pathname } = location;
  return (
    <>
      <AuthProvider>
        <div className='App'>
          {['/', '/login'].includes(pathname) ? (
            <Login />
          ) : (
            <ConfirmDeleteProvider>
              <Header />
              <MainContent />
            </ConfirmDeleteProvider>
          )}
        </div>
      </AuthProvider>
    </>
  )
}

export default App
