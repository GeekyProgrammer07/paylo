import { Github } from "./Icons";

export function Footer() {
  return (
    <footer className="w-full py-4 text-center">
      <p className="text-sm font-medium flex items-center justify-center gap-2 text-black">
        made with ❤️ by Suman
        <a
          href="https://github.com/GeekyProgrammer07/paylo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center transition-all duration-200 hover:scale-110 text-black hover:text-[#001c64]"
        >
          <Github />
        </a>
      </p>
    </footer>
  );
}