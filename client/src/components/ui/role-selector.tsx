import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Store, Factory, Lightbulb } from "lucide-react";

interface Role {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  hoverColor: string;
}

interface RoleSelectorProps {
  onRoleSelect: (role: string) => void;
  selectedRole: string | null;
}

const RoleSelector = ({ onRoleSelect, selectedRole }: RoleSelectorProps) => {
  const roles: Role[] = [
    {
      id: "vendor",
      title: "Vendor",
      description: "Manage waste collection & sales",
      icon: <Store className="text-xl" />,
      color: "border-neutral-200 hover:border-green-700",
      hoverColor: "bg-green-700",
    },
    {
      id: "factory",
      title: "Factory Owner",
      description: "Process waste & create products",
      icon: <Factory className="text-xl" />,
      color: "border-neutral-200 hover:border-blue-700",
      hoverColor: "bg-blue-700",
    },
    {
      id: "entrepreneur",
      title: "Entrepreneur",
      description: "Discover opportunities & solutions",
      icon: <Lightbulb className="text-xl" />,
      color: "border-neutral-200 hover:border-teal-700",
      hoverColor: "bg-teal-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      {roles.map((role) => (
        <Card
          key={role.id}
          className={`relative overflow-hidden group border ${
            selectedRole === role.id
              ? role.id === "vendor"
                ? "border-green-700"
                : role.id === "factory"
                ? "border-blue-700"
                : "border-teal-700"
              : role.color
          } rounded-lg p-0 cursor-pointer transition-all duration-300`}
          onClick={() => onRoleSelect(role.id)}
        >
          <CardContent className="p-4 flex items-center">
            <div
              className={`w-12 h-12 rounded-full ${
                role.id === "vendor"
                  ? "bg-green-100"
                  : role.id === "factory"
                  ? "bg-blue-100"
                  : "bg-teal-100"
              } flex items-center justify-center mr-4`}
            >
              <div
                className={
                  role.id === "vendor"
                    ? "text-green-700"
                    : role.id === "factory"
                    ? "text-blue-700"
                    : "text-teal-700"
                }
              >
                {role.icon}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg">{role.title}</h3>
              <p className="text-sm text-gray-600">{role.description}</p>
            </div>
            <div
              className={`absolute bottom-0 left-0 h-1 ${role.hoverColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${
                selectedRole === role.id ? "scale-x-100" : ""
              }`}
            ></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RoleSelector;
