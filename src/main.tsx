import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './views/Login.tsx';
import MainCategories from './views/MainCategories.tsx';
import Dashboard from './views/Dashboard.tsx';
import Journals from './views/Journals.tsx';
import "bootstrap-icons/font/bootstrap-icons.css";
import Users from './views/Users.tsx';
import SubmitManuscript from './views/SubmitManuscript.tsx';
import ContactEnquiries from './views/ContactEnquiries.tsx';
import ProtectedRoute from './auth/ProtectedRoute.tsx';
import Archives from './views/Archives.tsx';
import FulltextArticles from './views/FulltextArticles.tsx';
import LatestArticles from './views/LatestArticles.tsx';
import UploadFilesToServer from './views/UploadFilesToServer.tsx';
import EbMembers from './views/EbMembers.tsx';
import SiteMapTracking from './views/SiteMapTracking.tsx';
import SupliTypes from './views/SupliTypes.tsx';
import JournalPosts from './views/JournalPosts.tsx';
import Testimonials from './views/Testimonials.tsx';
import { Provider } from 'react-redux';
import { store } from './store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <Router basename="">
      <Routes>
      <Route path="/" element={<App />}>
        <Route path="login" element={<Login />} />
        <Route path="mainCategories" element={<MainCategories />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="journals" element={<Journals />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="submit-manuscript" element={<SubmitManuscript />} />
        <Route path="contact-enquiries" element={<ContactEnquiries />} />
        <Route path="journal-posts" element={<JournalPosts />} />
        <Route path="archives" element={<Archives />} />
        <Route path="fulltextarticles" element={<FulltextArticles />} />
        <Route path="latestarticles" element={<LatestArticles />} />
        <Route path="uploadFilesToServer" element={<UploadFilesToServer />} />
        <Route path="siteMapTracking" element={<SiteMapTracking />} />
        <Route path="ebMembers" element={<EbMembers />} />
        <Route path="supliTypes" element={<SupliTypes />} />
        <Route 
          path="users" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>
      </Routes>
    </Router>
  </Provider>,
)
