
import { ThemeToggle } from "./ui/theme-toggle";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="h-16 container flex items-center justify-between">
        <span className="font-bold">SocialVid</span>
        <ThemeToggle />
      </div>
    </nav>
  );
}
