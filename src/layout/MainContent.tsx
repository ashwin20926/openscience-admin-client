import SideBar from "./SideBar";
import { Outlet, useLocation } from 'react-router-dom';

function MainContent() {
  const location = useLocation();
  const { pathname } = location;
    return (
      <div className="container-fluid">
        {pathname !== '/login' && <div className="row">
          <div className="col-sm-2">
            <SideBar></SideBar>
          </div>
          <div className="col-sm-10">
            <div className="row">
              <Outlet />
            </div>
          </div>
        </div>
        }
        {pathname === '/login' &&
          <div className="row">
            <div className="col-sm-4 offset-sm-4">
              <div className="row">
                <Outlet />
              </div>
            </div>
          </div>
        }        
      </div>
    )
}
export default MainContent;