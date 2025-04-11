import React from 'react';
import Link from 'next/link';

// Simple Breadcrumb component
export default function Breadcrumbs({ crumbs = [] }) {
  if (!crumbs || crumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mt-2">
      <ol className="flex items-center space-x-1.5 text-sm text-gray-600">
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-1 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
               </svg>
            )}
            {crumb.href ? (
              <Link href={crumb.href}>
                <span className="hover:text-blue-700 hover:underline cursor-pointer">
                  {crumb.name}
                </span>
              </Link>
            ) : (
              <span className="font-medium text-gray-800">{crumb.name}</span> // Last crumb is not a link
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 