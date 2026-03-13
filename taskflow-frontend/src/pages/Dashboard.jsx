import Navbar from "../components/Navbar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="p-6">

        <h2 className="text-2xl font-bold mb-4">
          Dashboard
        </h2>

        <p className="text-gray-600">
          Welcome to TaskFlow Pro
        </p>

      </div>

    </div>
  );
};

export default Dashboard;