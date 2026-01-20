// nextjs-reactjs-practice-2026/src/app/(privateroutes)/dashboard/day20/[adpath]/layout.jsx
import PrivateNavbar from "@/components/PrivateNavbar";

export default function Day20LabLayout({ children }) {
  return (
    <div>
      {/* <PrivateNavbar /> */}
      {children}
    </div>
  );
}