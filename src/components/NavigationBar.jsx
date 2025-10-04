import React from "react";

const NavigationBar = () => {
  return (
    <nav className="flex items-center justify-between bg-white text-gray-800 shadow-md py-4 px-4 sm:px-8 md:px-16 sticky top-0 z-40">
      {/* 1. Logo/Main Title */}
      <a
        href="/"
        className="text-2xl font-bold text-blue-700 hover:text-blue-800 transition duration-150 ease-in-out"
      >
        BioNER
      </a>

      {/* 2. Secondary Title/Context (Right Side) */}
      <div className="hidden sm:block">
        <span className="text-lg font-medium text-gray-600">
          Space Biology Knowledge Engine
        </span>
      </div>
    </nav>
  );
};

export default NavigationBar;
