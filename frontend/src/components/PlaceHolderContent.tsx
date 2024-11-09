import {Scan} from "lucide-react";

export const PlaceholderContent = () => (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-500">
        <Scan className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Passport Scanned Yet</h3>
        <p className="max-w-sm">
            Click the button to use your camera or upload an image to extract passport information
        </p>
    </div>
);