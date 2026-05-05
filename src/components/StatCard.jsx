import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable stat card component for admin dashboard.
 * Displays a label, value, and icon with gradient background.
 * @param {{ title: string, value: string|number, icon: string, color: 'blue'|'green'|'purple'|'orange'|'red'|'indigo' }} props
 * @returns {JSX.Element}
 */
function StatCard({ title, value, icon, color }) {
  const gradientMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  const bgGradient = gradientMap[color] || gradientMap.blue;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${bgGradient} p-6 text-white shadow-lg transition-transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl opacity-80">
          <span role="img" aria-label={title}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'orange', 'red', 'indigo']),
};

StatCard.defaultProps = {
  color: 'blue',
};

export default StatCard;