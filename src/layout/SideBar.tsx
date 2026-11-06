import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthContext } from '../auth/AuthContext';
import { fetchUnreadEnquiryCounts } from '../store/enquiryCountsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

function SideBar() {
  const user = useAuthContext()?.user;
  const dispatch = useAppDispatch();
  const unreadCounts = useAppSelector((state) => state.enquiryCounts);

  useEffect(() => {
    dispatch(fetchUnreadEnquiryCounts());
  }, [dispatch]);

  return (
    <div className="sidebar">
      <div className="nav">
        <ul>
           <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/mainCategories">Main Categories</Link>
          </li>
          <li>
            <Link to="/journals">Journals</Link>
          </li>
          <li>
            <Link to="/journal-posts">Journal Posts</Link>
          </li>
          <li>
            <Link to="/archives">Archives</Link>
          </li>
          <li>
            <Link to="/fulltextarticles">Fulltext Articles</Link>
          </li>
          <li>
            <Link to="/latestArticles">Latest Articles</Link>
          </li>
          <li>
            <Link to="/ebMembers">EB Members</Link>
          </li>
          <li>
            <Link to="/supliTypes">Supli Types</Link>
          </li>          
          <li>
            <Link to="/uploadFilesToServer">Upload Files to Server</Link>
          </li>
           <li>
            <Link to="/siteMapTracking">Sitemap Tracking</Link>
          </li>        
          {user?.roleId === 1 && false && (
            <li className="nav-item">
              <Link to="/users">Users</Link>
            </li>
          )}
          <li className="nav-item has-submenu">
            <details open>
              <summary>
                <span>User Enquires</span>
                <span className="caret">▾</span>
              </summary>
              <ul className="submenu">
                <li>
                  <Link to="/submit-manuscript">
                    <span>Submit Manuscript</span>
                    {unreadCounts.submit_manuscripts > 0 && <span className="notification-count">{unreadCounts.submit_manuscripts}</span>}
                  </Link>
                </li>
                <li>
                  <Link to="/contact-enquiries">
                    <span>Contact Enquiries</span>
                    {unreadCounts.contact_enquiries > 0 && <span className="notification-count">{unreadCounts.contact_enquiries}</span>}
                  </Link>
                </li>              
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  )
}
export default SideBar;