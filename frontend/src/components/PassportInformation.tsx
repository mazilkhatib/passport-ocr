import {Label} from "@/components/ui/label.tsx";
import {PassportData} from "@/types/passportData.ts";

interface PassportInformationProps {
    passportData: PassportData;
}

export const PassportInformation = ({passportData}:PassportInformationProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
            { label: "Passport Number", value: passportData?.passport_number },
            { label: "Full Name", value: passportData?.full_name },
            { label: "Date of Birth", value: passportData?.date_of_birth },
            { label: "Nationality", value: passportData?.nationality },
            { label: "Gender", value: passportData?.gender },
            { label: "Date of Issue", value: passportData?.date_of_issue },
            { label: "Date of Expiry", value: passportData?.date_of_expiry }
        ].map((field, index) => (
            <div key={index}>
                <Label>{field.label}</Label>
                <div className="font-medium">{field.value}</div>
            </div>
        ))}
    </div>
);