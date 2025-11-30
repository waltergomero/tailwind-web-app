"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

import {FaBox, FaAd, FaCalendar, FaUser, FaWpforms, FaTable, FaPage4, FaChartPie, FaPlug, FaChevronDown, FaCube} from "react-icons/fa";
import { BiDotsHorizontal } from "react-icons/bi";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <FaBox />,
    name: "Dashboard",
    subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  },
  {
    icon: <FaCalendar />,
    name: "Calendar",
    path: "/calendar",
  },
   {
    icon: <FaUser />,
    name: "Users",
    path: "/admin/users",
  },
  {
    icon: <FaAd />,
    name: "Status",
    path: "/admin/status",
  },

  {
    name: "Forms",
    icon: <FaWpforms />,
    subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    name: "Tables",
    icon: <FaTable />,
    subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
  },
  {
    name: "Pages",
    icon: <FaPage4 />,
    subItems: [
      { name: "Blank Page", path: "/blank", pro: false },
      { name: "404 Error", path: "/error-404", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <FaChartPie />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <FaCube />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <FaPlug />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-brand-500/10 text-brand-500"
                  : "text-gray-300 hover:bg-gray-800"
              } ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`shrink-0 w-5 h-5 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-brand-500"
                    : "text-gray-400"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="font-medium text-sm">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <FaChevronDown
                  className={`ml-auto w-3 h-3 transition-transform duration-200 shrink-0 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(nav.path) 
                    ? "bg-brand-500/10 text-brand-500" 
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span
                  className={`shrink-0 w-5 h-5 ${
                    isActive(nav.path)
                      ? "text-brand-500"
                      : "text-gray-400"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="font-medium text-sm">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className={`overflow-hidden transition-all duration-300 ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "max-h-screen"
                  : "max-h-0"
              }`}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        isActive(subItem.path)
                          ? "text-brand-500 bg-brand-500/5 font-medium"
                          : "text-gray-400 hover:bg-gray-800/50"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                              isActive(subItem.path)
                                ? "bg-brand-500/20 text-brand-400"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                              isActive(subItem.path)
                                ? "bg-brand-500/20 text-brand-400"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched: { type: "main" | "others"; index: number } | null = null;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              submenuMatched = {
                type: menuType as "main" | "others",
                index,
              };
            }
          });
        }
      });
    });

    // Only update state if it actually changed
    setOpenSubmenu((prevOpenSubmenu) => {
      const prevKey = prevOpenSubmenu ? `${prevOpenSubmenu.type}-${prevOpenSubmenu.index}` : null;
      const newKey = submenuMatched ? `${submenuMatched.type}-${submenuMatched.index}` : null;
      if (prevKey !== newKey) {
        return submenuMatched;
      }
      return prevOpenSubmenu;
    });
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu?.type === menuType &&
        prevOpenSubmenu?.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const getSidebarWidth = () => {
    if (isExpanded || isMobileOpen) {
      return "w-[290px]";
    }
    if (isHovered) {
      return "w-[290px]";
    }
    return "w-[90px]";
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-gray-900 border-gray-800 text-white h-screen transition-all duration-300 ease-in-out z-50 border-r 
        ${getSidebarWidth()}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <Image
              src="/images/logo/logo-dark.svg"
              alt="Logo"
              width={150}
              height={40}
            />
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <BiDotsHorizontal />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <BiDotsHorizontal />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
