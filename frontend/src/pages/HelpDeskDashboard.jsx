import React from "react";

const HelpDeskDashboard = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Help Desk Dashboard</h1>
        <p className="text-gray-600">Welcome to the Help Desk Dashboard. Here you can view and manage support tickets, assign tasks, and assist users.</p>
        {/* Add dashboard widgets, tables, and actions here */}
      </div>
    </div>
  );
};

export default HelpDeskDashboard;
