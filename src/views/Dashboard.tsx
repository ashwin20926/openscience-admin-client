import { useState, useEffect } from "react";
import axiosInstance from '../auth/axiosInstance';

const Dashboard = () => {
  const [data, setDashboardData] = useState({category_count: 0, journal_count: 0});

  useEffect(() => {
    getDashboardData();
  }, [])

  const getDashboardData = async () =>  {
    const response = await axiosInstance.get(`getDashboardStats`);
    setDashboardData(response.data.data);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <b>Categories</b> ({data?.category_count}) <br/>
          <b>Journals</b> ({data.journal_count}) <br/>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
