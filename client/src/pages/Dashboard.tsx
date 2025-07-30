import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreatePropertyModal from "../components/PropertyModal";
import { trpc } from "../utils/trpc";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem("authToken")) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/");
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    refetch();
    setIsModalOpen(false);
  };

  const {
    data: properties,
    isLoading,
    error,
    refetch,
  } = trpc.property.getUserProperties.useQuery({}, { enabled: false });

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-800">
            Welcome to your Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <p className="mt-4 text-lg text-gray-600">
          Manage your properties and tenants
        </p>

        {isLoading ? (
          <p>Loading your properties...</p>
        ) : error ? (
          <p className="text-red-500">Error fetching properties</p>
        ) : properties?.length === 0 ? (
          <p>No properties available. Add a new property to get started.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {properties?.map((property) => (
              <div
                key={property.id}
                className="border p-4 rounded-md shadow-md"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {property.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Location: {property.location}
                </p>
                <p className="text-sm text-gray-600">Units: {property.units}</p>
                <p className="text-sm text-gray-600">
                  Additional Info: {property.additionalInfo || "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={openModal}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add New Property
          </button>

          <CreatePropertyModal
            isOpen={isModalOpen}
            closeModal={closeModal}
            refetch={refetch}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
