import { NavLink } from "@remix-run/react";
import { 
  HomeIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Home", to: "/", icon: HomeIcon },
  { name: "Applications", to: "/applications", icon: BriefcaseIcon },
  { name: "Documents", to: "/documents", icon: DocumentTextIcon },
  { name: "Resume Analysis", to: "/resume-analysis", icon: DocumentMagnifyingGlassIcon },
  { name: "AI Chat", to: "/chat", icon: ChatBubbleLeftRightIcon },
  { name: "Voice Notes", to: "/voice-notes", icon: MicrophoneIcon },
];

export default function Navigation() {
  return (
    <nav className="flex space-x-4 px-4 py-3 bg-white shadow-sm">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <item.icon className="h-5 w-5 mr-2" aria-hidden="true" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
}
