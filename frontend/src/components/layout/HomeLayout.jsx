import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "../common/Loading";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";

function HomeLayout() {
  const isLoading = useSelector((state) => state.loading.isLoading);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {isLoading && <Loading />}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default HomeLayout;
