import { Link } from "react-router-dom";

export default function DashboardCard({ title, children, icon, linkTo, linkText }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
      <div className="flex items-center mb-4">
        {icon && <div className="mr-3 text-3xl">{icon}</div>}
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="flex-grow space-y-4">
        {children}
      </div>
      {linkTo && linkText && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link to={linkTo} className="text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-300 flex items-center">
            {linkText} →
          </Link>
        </div>
      )}
    </div>
  );
}