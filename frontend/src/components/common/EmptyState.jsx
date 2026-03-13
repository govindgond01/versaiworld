// src/components/common/EmptyState.jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * EmptyState Component - Shows when there's no data to display
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Title text
 * @param {string} props.message - Description message
 * @param {string} props.actionText - Text for action button
 * @param {Function} props.onAction - Action button click handler
 * @param {boolean} props.compact - Compact version for smaller spaces
 * @param {string} props.type - Type of empty state: 'default', 'error', 'success', 'warning'
 */
const EmptyState = ({
  icon,
  title,
  message,
  actionText,
  onAction,
  compact = false,
  type = 'default',
  children
}) => {
  // Color schemes based on type
  const typeConfig = {
    default: {
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      titleColor: 'text-gray-900',
      messageColor: 'text-gray-600'
    },
    error: {
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      titleColor: 'text-red-800',
      messageColor: 'text-red-600'
    },
    success: {
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      titleColor: 'text-green-800',
      messageColor: 'text-green-600'
    },
    warning: {
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-100',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-600'
    },
    info: {
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-600'
    }
  };

  const config = typeConfig[type];

  if (compact) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${config.bgColor} rounded-lg border ${config.borderColor}`}>
        {icon && <div className="mb-2">{React.cloneElement(icon, { className: `${icon.props.className || ''} ${config.iconColor}` })}</div>}
        {title && <h3 className={`text-sm font-medium ${config.titleColor} mb-1 text-center`}>{title}</h3>}
        {message && <p className={`text-xs ${config.messageColor} text-center`}>{message}</p>}
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors duration-200"
          >
            {actionText}
          </button>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`max-w-md w-full p-8 ${config.bgColor} rounded-xl border ${config.borderColor} text-center`}>
        {icon && (
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${config.bgColor} border ${config.borderColor}`}>
              {React.cloneElement(icon, { 
                className: `${icon.props.className || ''} ${config.iconColor} w-8 h-8` 
              })}
            </div>
          </div>
        )}
        
        {title && (
          <h3 className={`text-lg font-semibold ${config.titleColor} mb-2`}>
            {title}
          </h3>
        )}
        
        {message && (
          <p className={`text-sm ${config.messageColor} mb-6 leading-relaxed`}>
            {message}
          </p>
        )}
        
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {actionText}
          </button>
        )}
        
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.element,
  title: PropTypes.string,
  message: PropTypes.string,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  compact: PropTypes.bool,
  type: PropTypes.oneOf(['default', 'error', 'success', 'warning', 'info']),
  children: PropTypes.node
};

export default EmptyState;