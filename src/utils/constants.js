/**
 * Constants for BPMN Analyzer Pro
 * Application-wide constants and configuration values
 */

// BPMN Element Types
export const BPMN_ELEMENT_TYPES = {
    EVENTS: [
        'StartEvent',
        'EndEvent',
        'IntermediateThrowEvent',
        'IntermediateCatchEvent',
        'BoundaryEvent'
    ],
    TASKS: [
        'Task',
        'UserTask',
        'ServiceTask',
        'ScriptTask',
        'BusinessRuleTask',
        'ManualTask',
        'SendTask',
        'ReceiveTask',
        'CallActivity'
    ],
    GATEWAYS: [
        'ExclusiveGateway',
        'ParallelGateway',
        'InclusiveGateway',
        'EventBasedGateway',
        'ComplexGateway'
    ],
    ARTIFACTS: [
        'DataObject',
        'DataStore',
        'Group',
        'TextAnnotation'
    ]
};

// ISO 9001 Requirements
export const ISO_9001_REQUIREMENTS = {
    '4.4.1': 'Prozesse und deren Wechselwirkungen bestimmen',
    '5.3': 'Verantwortlichkeiten und Befugnisse',
    '6.1': 'Risiken und Chancen',
    '7.1.6': 'Organisationales Wissen',
    '8.1': 'Betriebliche Planung und Steuerung',
    '8.6': 'Freigabe von Produkten und Dienstleistungen',
    '9.1.3': 'Analyse und Bewertung',
    '10.2': 'Nichtkonformität und Korrekturmaßnahmen'
};

// Supported Formats
export const SUPPORTED_FORMATS = [
    'application/xml',
    'text/xml',
    '.bpmn',
    '.bpmn2',
    '.bpmn20.xml',
    '.bpm'
];

// Vendor Namespaces
export const VENDOR_NAMESPACES = {
    camunda: 'http://camunda.org/schema/1.0/bpmn',
    activiti: 'http://activiti.org/bpmn',
    flowable: 'http://flowable.org/bpmn',
    signavio: 'http://www.signavio.com/schema/bpmn20'
};

// Color Schemes
export const COLOR_SCHEMES = {
    light: {
        primary: '#1f3a5f',
        secondary: '#4f6d7a',
        accent: '#e5533d',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        background: '#f5f7fa',
        card: '#ffffff',
        text: '#1a1a1a'
    },
    dark: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        accent: '#f97316',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        background: '#111827',
        card: '#1f2937',
        text: '#f9fafb'
    },
    corporate: {
        primary: '#1e40af',
        secondary: '#4b5563',
        accent: '#dc2626',
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626',
        background: '#f8fafc',
        card: '#ffffff',
        text: '#1e293b'
    }
};

// Default Settings
export const DEFAULT_SETTINGS = {
    theme: 'light',
    autoValidate: true,
    extractDocumentation: true,
    enableAI: false,
    defaultExportFormat: 'json',
    showTutorial: true,
    language: 'de'
};

// Event Types
export const EVENT_TYPES = {
  NONE: 'bpmn:NoneEvent',
  MESSAGE: 'bpmn:MessageEventDefinition',
  TIMER: 'bpmn:TimerEventDefinition',
  ERROR: 'bpmn:ErrorEventDefinition',
  CANCEL: 'bpmn:CancelEventDefinition',
  COMPENSATION: 'bpmn:CompensateEventDefinition',
  CONDITIONAL: 'bpmn:ConditionalEventDefinition',
  LINK: 'bpmn:LinkEventDefinition',
  SIGNAL: 'bpmn:SignalEventDefinition',
  TERMINATE: 'bpmn:TerminateEventDefinition',
  ESCALATION: 'bpmn:EscalationEventDefinition',
  MULTIPLE: 'bpmn:MultipleEventDefinition',
  PARALLEL_MULTIPLE: 'bpmn:ParallelMultipleEventDefinition'
};

// Validation Severity Levels
export const VALIDATION_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Analysis Types
export const ANALYSIS_TYPES = {
  COMPLEXITY: 'complexity',
  PERFORMANCE: 'performance',
  COMPLIANCE: 'compliance',
  OPTIMIZATION: 'optimization',
  BOTTLENECKS: 'bottlenecks',
  METRICS: 'metrics'
};

// Export Formats
export const EXPORT_FORMATS = {
  PNG: 'png',
  SVG: 'svg',
  PDF: 'pdf',
  JSON: 'json',
  XML: 'xml',
  BPMN: 'bpmn',
  CSV: 'csv',
  HTML: 'html'
};

// MIME Types
export const MIME_TYPES = {
  PNG: 'image/png',
  SVG: 'image/svg+xml',
  PDF: 'application/pdf',
  JSON: 'application/json',
  XML: 'application/xml',
  BPMN: 'application/xml',
  CSV: 'text/csv',
  HTML: 'text/html'
};

// UI Constants
export const UI_CONSTANTS = {
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
  },
  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  MODAL_SIZES: {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    FULLSCREEN: 'fullscreen'
  }
};

// Layout Options
export const LAYOUT_OPTIONS = {
  dagre: {
    rankdir: 'LR',
    nodesep: 50,
    ranksep: 50,
    marginx: 20,
    marginy: 20
  },
  hierarchical: {
    direction: 'TB',
    spacing: 100
  },
  force: {
    iterations: 1000,
    alpha: 0.1
  }
};

// Graph Constants
export const GRAPH_CONSTANTS = {
  NODE_SIZES: {
    TASK: { width: 100, height: 80 },
    GATEWAY: { width: 60, height: 60 },
    EVENT: { width: 50, height: 50 },
    SUB_PROCESS: { width: 120, height: 100 }
  },
  COLORS: {
    PRIMARY: '#667eea',
    SECONDARY: '#764ba2',
    SUCCESS: '#48bb78',
    WARNING: '#f6ad55',
    ERROR: '#fc8181',
    INFO: '#4299e1'
  },
  LAYOUT: {
    HORIZONTAL_SPACING: 150,
    VERTICAL_SPACING: 100,
    MARGIN: 50
  }
};

// File Constants
export const FILE_CONSTANTS = {
  SUPPORTED_EXTENSIONS: ['.bpmn', '.xml', '.json'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  DEFAULT_ENCODING: 'UTF-8'
};

// Performance Constants
export const PERFORMANCE_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  LOADING_TIMEOUT: 30000
};

// Error Messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size (10MB)',
  INVALID_FORMAT: 'Invalid file format. Supported formats: BPMN, XML, JSON',
  PARSE_ERROR: 'Failed to parse BPMN file',
  NETWORK_ERROR: 'Network error occurred',
  VALIDATION_ERROR: 'Validation failed',
  EXPORT_ERROR: 'Export failed',
  UNKNOWN_ERROR: 'An unknown error occurred'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  FILE_LOADED: 'BPMN file loaded successfully',
  ANALYSIS_COMPLETED: 'Analysis completed successfully',
  VALIDATION_PASSED: 'Validation passed successfully',
  EXPORT_COMPLETED: 'Export completed successfully',
  SAVED: 'Changes saved successfully'
};

// Validation Rules
export const VALIDATION_RULES = {
  REQUIRED_START_EVENT: 'required_start_event',
  REQUIRED_END_EVENT: 'required_end_event',
  NO_ORPHANED_ELEMENTS: 'no_orphaned_elements',
  VALID_CONNECTIONS: 'valid_connections',
  UNIQUE_IDS: 'unique_ids',
  VALID_NAMES: 'valid_names',
  COMPLIANCE_BPMN_2_0: 'compliance_bpmn_2_0'
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  OPEN_FILE: 'Ctrl+O',
  SAVE_FILE: 'Ctrl+S',
  EXPORT: 'Ctrl+E',
  ANALYZE: 'Ctrl+A',
  VALIDATE: 'Ctrl+V',
  ZOOM_IN: 'Ctrl+=',
  ZOOM_OUT: 'Ctrl+-',
  RESET_ZOOM: 'Ctrl+0',
  FIT_TO_VIEW: 'Ctrl+F',
  TOGGLE_SIDEBAR: 'Ctrl+B',
  SEARCH: 'Ctrl+F',
  HELP: 'F1'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'bpmn-analyzer-theme',
  LANGUAGE: 'bpmn-analyzer-language',
  RECENT_FILES: 'bpmn-analyzer-recent-files',
  USER_PREFERENCES: 'bpmn-analyzer-preferences',
  WINDOW_STATE: 'bpmn-analyzer-window-state'
};

// API Endpoints (if applicable)
export const API_ENDPOINTS = {
  VALIDATE: '/api/validate',
  ANALYZE: '/api/analyze',
  EXPORT: '/api/export',
  TEMPLATES: '/api/templates',
  EXAMPLES: '/api/examples'
};

// Default Configuration
export const DEFAULT_CONFIG = {
  theme: UI_CONSTANTS.THEMES.LIGHT,
  language: 'en',
  autoSave: true,
  showGrid: false,
  snapToGrid: false,
  animationEnabled: true,
  validationEnabled: true,
  autoAnalyze: false,
  exportFormat: EXPORT_FORMATS.PNG,
  recentFilesLimit: 10,
  maxUndoSteps: 50
};

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  BPMN_ID: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  FILENAME: /^[^\\/:*?"<>|]+$/,
  VERSION: /^\d+\.\d+\.\d+$/,
  SEMVER: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
};

// Time Constants
export const TIME_CONSTANTS = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  WEEKS_PER_MONTH: 4,
  MONTHS_PER_YEAR: 12
};

// Unit Conversion
export const UNITS = {
  BYTES_PER_KB: 1024,
  BYTES_PER_MB: 1024 * 1024,
  BYTES_PER_GB: 1024 * 1024 * 1024
};
