import { useState, useEffect } from "react";
import axiosInstance from '../auth/axiosInstance';

const Dashboard = () => {
  const [data, setSiteMapInfo] = useState({created_at: ''});

  useEffect(() => {
    getSiteMapInfo();
  }, [])

  const getSiteMapInfo = async () =>  {
    const response = await axiosInstance.get(`getSiteMapTrackings`);
    setSiteMapInfo(response.data.data);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Sitemap Tracking</h1>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <b>Sitemap Generated On</b> ({data?.created_at}) <br/>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
