
import { FormatTableContainer } from "@/components/format/FormatTableContainer";

const Formats = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Formats</h1>
        <p className="text-gray-600">Manage your print formats and specifications</p>
      </div>

      <FormatTableContainer />
    </div>
  );
};

export default Formats;
