
import { SupplierTableContainer } from "@/components/suppliers/SupplierTableContainer";

const Suppliers = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Suppliers</h1>
        <p className="text-gray-600">Manage your suppliers</p>
      </div>

      <SupplierTableContainer />
    </div>
  );
};

export default Suppliers;
