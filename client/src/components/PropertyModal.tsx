import React, { useState } from "react";
import { trpc } from "../utils/trpc";
import { z } from "zod";
import GoogleMapImage from "./GoogleMapImage";

const propertySchema = z.object({
  name: z.string().min(1, "Property name is required."),
  location: z.string().min(1, "Location is required."),
  units: z.number().min(1, "At least one unit is required."),
  additionalInfo: z.string().optional(),
});

const CreatePropertyModal = ({
  isOpen,
  closeModal,
  refetch,
}: {
  isOpen: boolean;
  closeModal: () => void;
  refetch: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    units: 1,
    additionalInfo: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const resetStates = () => {
    setFormData({ name: "", location: "", units: 1, additionalInfo: "" });
    setIsSubmitting(false);
    setImageUrl(null);
    setImageLoaded(false);
    setErrors({});
  };

  const mutation = trpc.property.create.useMutation({
    onSuccess: () => {
      resetStates();
      closeModal();
      refetch();
    },
    onError: () => {
      setErrors({ general: "Failed to create property. Please try again." });
      setIsSubmitting(false);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "units")
      setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
    else setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageLoaded) {
      setErrors({ general: "Please wait for the map to load." });
      return;
    }

    setErrors({});
    const validation = propertySchema.safeParse(formData);

    if (!validation.success) {
      const newErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
      onClick={() => {
        resetStates();
        return closeModal();
      }}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-2xl font-semibold text-gray-800">
          Create Property
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-600"
            >
              Property Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-600"
            >
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {formData.location && (
            <GoogleMapImage
              location={formData.location}
              imageURL={imageUrl}
              setImageUrl={setImageUrl}
              setImageLoaded={setImageLoaded}
            />
          )}

          <div>
            <label
              htmlFor="units"
              className="block text-sm font-medium text-gray-600"
            >
              Number of Units
            </label>
            <input
              type="number"
              name="units"
              id="units"
              min={1}
              value={formData.units}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
            {errors.units && (
              <p className="text-red-500 text-sm mt-1">{errors.units}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="additionalInfo"
              className="block text-sm font-medium text-gray-600"
            >
              Additional Information (Optional)
            </label>
            <input
              type="text"
              name="additionalInfo"
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {errors.general && (
            <p className="text-red-500 text-sm mt-1">{errors.general}</p>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
            disabled={isSubmitting || !imageLoaded}
          >
            {isSubmitting ? "Submitting..." : "Create Property"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePropertyModal;
